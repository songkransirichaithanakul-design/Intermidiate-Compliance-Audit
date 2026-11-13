import { EvaluationDay, EvaluationSubmission, ParticipantRecord, DayStatus } from '../types';
import { INITIAL_DAYS } from '../data/trainingData';

const LOCAL_STORAGE_KEY_SUBMISSIONS = 'auditeval_submissions_v5';
const LOCAL_STORAGE_KEY_DAYS = 'auditeval_days_v5';
const LOCAL_STORAGE_KEY_PARTICIPANTS = 'auditeval_participants_v5';
const LOCAL_STORAGE_KEY_USER_SUBMITTED = 'auditeval_user_submitted_v5';
const LOCAL_STORAGE_KEY_RESET_EPOCH = 'auditeval_reset_epoch_v1';
const LOCAL_STORAGE_KEY_ADMIN_TOKEN = 'auditeval_admin_token_v1';

// Real-time BroadcastChannel for cross-tab sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('auditeval_realtime_sync');
  }
} catch (e) {
  console.warn('BroadcastChannel not available', e);
}

export interface SyncDataResult {
  submissions: EvaluationSubmission[];
  days: EvaluationDay[];
  participants: ParticipantRecord[];
  resetEpoch?: number;
}

export interface SubmitResult {
  ok: boolean;
  error?: string;
  dayClosed?: boolean;
  days?: EvaluationDay[];
}

export interface AdminActionResult {
  success: boolean;
  unauthorized?: boolean;
  error?: string;
  days?: EvaluationDay[];
}

function getAdminHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY_ADMIN_TOKEN) : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const DataService = {
  getAdminToken(): string | null {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_ADMIN_TOKEN);
    } catch {
      return null;
    }
  },

  clearAdminToken() {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_ADMIN_TOKEN);
    } catch {}
  },

  // Read local cache first for instant UI response
  getLocalData(): SyncDataResult {
    try {
      const savedSubs = localStorage.getItem(LOCAL_STORAGE_KEY_SUBMISSIONS);
      const savedDays = localStorage.getItem(LOCAL_STORAGE_KEY_DAYS);
      const savedParts = localStorage.getItem(LOCAL_STORAGE_KEY_PARTICIPANTS);

      return {
        submissions: savedSubs ? JSON.parse(savedSubs) : [],
        days: savedDays ? JSON.parse(savedDays) : INITIAL_DAYS,
        participants: savedParts ? JSON.parse(savedParts) : [],
      };
    } catch (e) {
      console.error('Error reading localStorage:', e);
      return {
        submissions: [],
        days: INITIAL_DAYS,
        participants: [],
      };
    }
  },

  // Save to local cache (with quota protection so high submission volume never throws)
  saveLocalData(data: Partial<SyncDataResult>) {
    try {
      if (data.days !== undefined) {
        localStorage.setItem(LOCAL_STORAGE_KEY_DAYS, JSON.stringify(data.days));
      }
      if (data.participants !== undefined) {
        localStorage.setItem(LOCAL_STORAGE_KEY_PARTICIPANTS, JSON.stringify(data.participants));
      }
      if (data.submissions !== undefined) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_SUBMISSIONS, JSON.stringify(data.submissions));
        } catch {
          // If localStorage hits 5MB limit with 1000+ submissions, cache only latest 150 locally; server DB has all records
          try {
            localStorage.setItem(
              LOCAL_STORAGE_KEY_SUBMISSIONS,
              JSON.stringify(data.submissions.slice(0, 150))
            );
          } catch {}
        }
      }
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  },

  // Fetch from server file-base / database (Server is ALWAYS authoritative for days & resetEpoch)
  async fetchServerData(): Promise<SyncDataResult | null> {
    try {
      const res = await fetch('/api/database', { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      if (data && Array.isArray(data.submissions)) {
        // Detect if server reset occurred since last visit -> clear stale user submission flags
        if (data.resetEpoch) {
          const prevEpoch = localStorage.getItem(LOCAL_STORAGE_KEY_RESET_EPOCH);
          if (prevEpoch && prevEpoch !== String(data.resetEpoch)) {
            localStorage.removeItem(LOCAL_STORAGE_KEY_USER_SUBMITTED);
          }
          localStorage.setItem(LOCAL_STORAGE_KEY_RESET_EPOCH, String(data.resetEpoch));
        }
        // Also if server has 0 submissions, ensure user submission receipt flags are cleared
        if (data.submissions.length === 0) {
          localStorage.removeItem(LOCAL_STORAGE_KEY_USER_SUBMITTED);
        }

        const days = data.days && data.days.length > 0 ? data.days : INITIAL_DAYS;
        const participants = data.participants || [];
        this.saveLocalData({
          submissions: data.submissions,
          days,
          participants,
        });
        return {
          submissions: data.submissions,
          days,
          participants,
          resetEpoch: data.resetEpoch,
        };
      }
    } catch (e) {
      console.warn('Server fetch failed, continuing with local cache:', e);
    }
    return null;
  },

  // Submit evaluation: Server validates day.status === 'open' BEFORE accepting!
  async submitEvaluation(
    submission: EvaluationSubmission,
    updatedDays: EvaluationDay[],
    updatedParticipants: ParticipantRecord[]
  ): Promise<SubmitResult> {
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission,
          participants: updatedParticipants,
        }),
      });

      const resData = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 403 || resData.dayClosed) {
          // Refresh authoritative days from server immediately
          await this.fetchServerData();
          return {
            ok: false,
            dayClosed: true,
            error: resData.error || 'แบบประเมินของวันนี้ปิดรับคำตอบแล้ว (ควบคุมโดยผู้ดูแลระบบ Admin)',
          };
        }
        return {
          ok: false,
          error: resData.error || 'ไม่สามารถส่งแบบประเมินได้ กรุณาลองใหม่อีกครั้ง',
        };
      }

      const authoritativeDays = Array.isArray(resData.days) && resData.days.length > 0 ? resData.days : updatedDays;

      // Save locally AFTER server confirmed acceptance
      const local = this.getLocalData();
      const existingIndex = local.submissions.findIndex((s) => s.id === submission.id);
      const newSubs = existingIndex >= 0
        ? local.submissions.map((s) => (s.id === submission.id ? submission : s))
        : [submission, ...local.submissions];

      this.saveLocalData({
        submissions: newSubs,
        days: authoritativeDays,
        participants: updatedParticipants,
      });

      try {
        const userSubs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_USER_SUBMITTED) || '{}');
        userSubs[submission.dayId] = true;
        localStorage.setItem(LOCAL_STORAGE_KEY_USER_SUBMITTED, JSON.stringify(userSubs));
      } catch (e) {
        console.error(e);
      }

      if (broadcastChannel) {
        broadcastChannel.postMessage({
          type: 'NEW_SUBMISSION',
          submission,
          days: authoritativeDays,
          participants: updatedParticipants,
        });
      }

      return { ok: true, days: authoritativeDays };
    } catch (e) {
      console.warn('Server persistence error:', e);
      return {
        ok: false,
        error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อบันทึกข้อมูลได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง',
      };
    }
  },

  // Admin Only: Set explicit status for a single day
  async setDayStatus(dayId: string, status: DayStatus): Promise<AdminActionResult> {
    try {
      const res = await fetch('/api/days', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ dayId, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        return { success: false, unauthorized: true, error: data.error };
      }
      if (!res.ok) {
        return { success: false, error: data.error || 'ปรับสถานะไม่สำเร็จ' };
      }
      if (Array.isArray(data.days)) {
        this.saveLocalData({ days: data.days });
        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'DAYS_UPDATED', days: data.days });
        }
      }
      return { success: true, days: data.days };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  // Admin Only: Close all open days immediately
  async closeAllDays(): Promise<AdminActionResult> {
    try {
      const res = await fetch('/api/days', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action: 'close_all' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        return { success: false, unauthorized: true, error: data.error };
      }
      if (!res.ok) {
        return { success: false, error: data.error || 'ปิดรับคำตอบทั้งหมดไม่สำเร็จ' };
      }
      if (Array.isArray(data.days)) {
        this.saveLocalData({ days: data.days });
        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'DAYS_UPDATED', days: data.days });
        }
      }
      return { success: true, days: data.days };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  // Update day status array (Admin Only)
  async updateDayStatus(days: EvaluationDay[]): Promise<AdminActionResult> {
    try {
      const res = await fetch('/api/days', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ days }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        return { success: false, unauthorized: true, error: data.error };
      }
      if (!res.ok) {
        return { success: false, error: data.error };
      }
      const nextDays = Array.isArray(data.days) ? data.days : days;
      this.saveLocalData({ days: nextDays });
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'DAYS_UPDATED', days: nextDays });
      }
      return { success: true, days: nextDays };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  // Reset database (Admin Only — preserves Admin's open/closed day statuses)
  async resetDatabase(): Promise<AdminActionResult> {
    try {
      const res = await fetch('/api/database/reset', {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        return { success: false, unauthorized: true, error: data.error };
      }
      if (!res.ok) {
        return { success: false, error: data.error };
      }

      localStorage.removeItem(LOCAL_STORAGE_KEY_SUBMISSIONS);
      localStorage.removeItem(LOCAL_STORAGE_KEY_PARTICIPANTS);
      localStorage.removeItem(LOCAL_STORAGE_KEY_USER_SUBMITTED);
      if (data.resetEpoch) {
        localStorage.setItem(LOCAL_STORAGE_KEY_RESET_EPOCH, String(data.resetEpoch));
      }
      if (Array.isArray(data.days)) {
        this.saveLocalData({ submissions: [], participants: [], days: data.days });
      }

      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'DATABASE_RESET', days: data.days });
      }
      return { success: true, days: data.days };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  // Admin Login via Server Auth Endpoint
  async adminLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        localStorage.setItem(LOCAL_STORAGE_KEY_ADMIN_TOKEN, data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'เข้าสู่ระบบไม่สำเร็จ' };
    } catch (e: any) {
      return { success: false, error: e.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' };
    }
  },

  async verifyAdminSession(): Promise<boolean> {
    const token = this.getAdminToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/admin/verify', {
        headers: getAdminHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async adminLogout(): Promise<void> {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: getAdminHeaders(),
      });
    } catch {}
    this.clearAdminToken();
  },

  // Delete a submission (Admin only)
  async deleteSubmission(submissionId: string): Promise<AdminActionResult> {
    try {
      const res = await fetch(`/api/submissions/${encodeURIComponent(submissionId)}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        return { success: false, unauthorized: true, error: data.error };
      }
      if (!res.ok) {
        return { success: false, error: data.error };
      }

      const local = this.getLocalData();
      const updatedSubs = local.submissions.filter((s) => s.id !== submissionId);
      this.saveLocalData({
        submissions: updatedSubs,
        days: Array.isArray(data.days) ? data.days : local.days,
      });

      if (broadcastChannel) {
        broadcastChannel.postMessage({
          type: 'SUBMISSION_DELETED',
          submissionId,
          days: data.days,
        });
      }
      return { success: true, days: data.days };
    } catch (e: any) {
      console.error('Error deleting submission:', e);
      return { success: false, error: e.message };
    }
  },

  // Fetch Server Health & Security Stats
  async fetchHealth(): Promise<any> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // Fetch Audit Log for Admin inspection (Admin only)
  async fetchAuditLog(): Promise<any[]> {
    try {
      const res = await fetch('/api/admin/audit-log', {
        headers: getAdminHeaders(),
      });
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  // Trigger Instant Snapshot Backup (Admin only)
  async createSnapshot(): Promise<{ success: boolean; fileName?: string; error?: string; unauthorized?: boolean }> {
    try {
      const res = await fetch('/api/database/snapshot', {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (res.status === 401) {
        return { success: false, unauthorized: true, error: data.error };
      }
      return data;
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  // Restore database from uploaded JSON (Admin only)
  async restoreDatabase(databaseData: any): Promise<boolean> {
    try {
      const res = await fetch('/api/database/restore', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ databaseData }),
      });
      if (res.ok) {
        this.saveLocalData({
          submissions: databaseData.submissions || [],
          days: databaseData.days || INITIAL_DAYS,
          participants: databaseData.participants || [],
        });
        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'DATABASE_RESTORED' });
        }
        return true;
      }
    } catch (e) {
      console.error('Error restoring database:', e);
    }
    return false;
  },

  // Check if current user submitted a day
  hasUserSubmitted(dayId: string): boolean {
    try {
      const userSubs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_USER_SUBMITTED) || '{}');
      return !!userSubs[dayId];
    } catch {
      return false;
    }
  },

  // Real-time listener for cross-tab / window sync
  onRealtimeUpdate(callback: (event: any) => void): () => void {
    if (!broadcastChannel) return () => {};
    const handler = (e: MessageEvent) => callback(e.data);
    broadcastChannel.addEventListener('message', handler);
    return () => broadcastChannel?.removeEventListener('message', handler);
  },
};
