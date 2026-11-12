import { EvaluationDay, EvaluationSubmission, ParticipantRecord } from '../types';
import { INITIAL_DAYS } from '../data/trainingData';

const LOCAL_STORAGE_KEY_SUBMISSIONS = 'auditeval_submissions_v5';
const LOCAL_STORAGE_KEY_DAYS = 'auditeval_days_v5';
const LOCAL_STORAGE_KEY_PARTICIPANTS = 'auditeval_participants_v5';
const LOCAL_STORAGE_KEY_USER_SUBMITTED = 'auditeval_user_submitted_v5';

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
}

export const DataService = {
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

  // Save to local cache
  saveLocalData(data: Partial<SyncDataResult>) {
    try {
      if (data.submissions) {
        localStorage.setItem(LOCAL_STORAGE_KEY_SUBMISSIONS, JSON.stringify(data.submissions));
      }
      if (data.days) {
        localStorage.setItem(LOCAL_STORAGE_KEY_DAYS, JSON.stringify(data.days));
      }
      if (data.participants) {
        localStorage.setItem(LOCAL_STORAGE_KEY_PARTICIPANTS, JSON.stringify(data.participants));
      }
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  },

  // Fetch from server file-base / database
  async fetchServerData(): Promise<SyncDataResult | null> {
    try {
      const res = await fetch('/api/database');
      if (!res.ok) return null;
      const data = await res.json();
      if (data && Array.isArray(data.submissions)) {
        // Update local cache
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
        };
      }
    } catch (e) {
      // Offline or network error - fallback to local storage
      console.warn('Server fetch failed, continuing with local cache:', e);
    }
    return null;
  },

  // Submit evaluation with dual-layer persistence (Server file base + Local storage)
  async submitEvaluation(
    submission: EvaluationSubmission,
    updatedDays: EvaluationDay[],
    updatedParticipants: ParticipantRecord[]
  ): Promise<boolean> {
    // 1. Save locally immediately (Zero data loss guarantee)
    const local = this.getLocalData();
    const existingIndex = local.submissions.findIndex((s) => s.id === submission.id);
    const newSubs = existingIndex >= 0
      ? local.submissions.map((s) => (s.id === submission.id ? submission : s))
      : [submission, ...local.submissions];

    this.saveLocalData({
      submissions: newSubs,
      days: updatedDays,
      participants: updatedParticipants,
    });

    // Mark as submitted for current user
    try {
      const userSubs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_USER_SUBMITTED) || '{}');
      userSubs[submission.dayId] = true;
      localStorage.setItem(LOCAL_STORAGE_KEY_USER_SUBMITTED, JSON.stringify(userSubs));
    } catch (e) {
      console.error(e);
    }

    // 2. Broadcast to other open tabs / windows in real-time
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'NEW_SUBMISSION',
        submission,
        days: updatedDays,
        participants: updatedParticipants,
      });
    }

    // 3. Persist to server file-base database
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission,
          days: updatedDays,
          participants: updatedParticipants,
        }),
      });
      if (res.ok) {
        return true;
      }
    } catch (e) {
      console.warn('Server persistence pending, saved to local store:', e);
    }
    return true;
  },

  // Update day status (Open / Closed) on server and locally
  async updateDayStatus(days: EvaluationDay[]): Promise<void> {
    this.saveLocalData({ days });

    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'DAYS_UPDATED',
        days,
      });
    }

    try {
      await fetch('/api/days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days }),
      });
    } catch (e) {
      console.warn('Server days update failed:', e);
    }
  },

  // Reset database
  async resetDatabase(): Promise<void> {
    localStorage.removeItem(LOCAL_STORAGE_KEY_SUBMISSIONS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_DAYS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_PARTICIPANTS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_USER_SUBMITTED);

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'DATABASE_RESET' });
    }

    try {
      await fetch('/api/database/reset', { method: 'POST' });
    } catch (e) {
      console.warn('Server reset failed:', e);
    }
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
