import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_DAYS = [
  {
    id: 'day-1',
    dayNumber: 1,
    dayLabel: 'วันที่ 1',
    title: 'ประเมินผลอบรมวันที่ 16 พ.ย. 2569',
    dateStr: '16 พ.ย. 2569',
    status: 'open',
    hasQuestionnaire: true,
    totalSubmitted: 0,
    averageScore: 0,
  },
  {
    id: 'day-2',
    dayNumber: 2,
    dayLabel: 'วันที่ 2',
    title: 'ประเมินผลอบรมวันที่ 17 พ.ย. 2569',
    dateStr: '17 พ.ย. 2569',
    status: 'closed',
    hasQuestionnaire: true,
    totalSubmitted: 0,
    averageScore: 0,
  },
  {
    id: 'day-3',
    dayNumber: 3,
    dayLabel: 'วันที่ 3',
    title: 'ประเมินผลอบรมวันที่ 18 พ.ย. 2569 · สรุปผลและเขียนรายงานฯ',
    dateStr: '18 พ.ย. 2569',
    status: 'closed',
    hasQuestionnaire: true,
    totalSubmitted: 0,
    averageScore: 0,
  },
  {
    id: 'day-4',
    dayNumber: 4,
    dayLabel: 'วันที่ 4',
    title: 'ประเมินผลอบรมวันที่ 19 พ.ย. 2569 · พยานหลักฐาน (ทุจริต/จงใจ)',
    dateStr: '19 พ.ย. 2569',
    status: 'closed',
    hasQuestionnaire: true,
    totalSubmitted: 0,
    averageScore: 0,
  },
  {
    id: 'day-5',
    dayNumber: 5,
    dayLabel: 'วันที่ 5',
    title: 'ประเมินผลอบรมวันที่ 20 พ.ย. 2569 · เส้นทางการเงิน & ควบคุมคุณภาพ',
    dateStr: '20 พ.ย. 2569',
    status: 'closed',
    hasQuestionnaire: true,
    totalSubmitted: 0,
    averageScore: 0,
  },
  {
    id: 'day-6',
    dayNumber: 6,
    dayLabel: 'วันที่ 6',
    title: 'ประเมินผลอบรมวันที่ 23 พ.ย. 2569 · วิเคราะห์ปัญหา & วินัยการเงินฯ',
    dateStr: '23 พ.ย. 2569',
    status: 'closed',
    hasQuestionnaire: true,
    totalSubmitted: 0,
    averageScore: 0,
  },
  {
    id: 'day-7',
    dayNumber: 7,
    dayLabel: 'วันที่ 7',
    title: 'ประเมินผลอบรมวันที่ 24 พ.ย. 2569 · การสื่อสารเชิงบวกในงานตรวจสอบ',
    dateStr: '24 พ.ย. 2569',
    status: 'closed',
    hasQuestionnaire: true,
    totalSubmitted: 0,
    averageScore: 0,
  },
  {
    id: 'day-8',
    dayNumber: 8,
    dayLabel: 'วันที่ 8',
    title: 'ประเมินผลอบรมวันที่ 25 พ.ย. 2569',
    dateStr: '25 พ.ย. 2569',
    status: 'waiting',
    hasQuestionnaire: false,
    totalSubmitted: 0,
    averageScore: 0,
  },
  {
    id: 'day-9',
    dayNumber: 9,
    dayLabel: 'วันที่ 9',
    title: 'ประเมินผลอบรมวันที่ 26 พ.ย. 2569 · เปิดเผยเอกสาร & จัดซื้อจัดจ้างก่อสร้าง',
    dateStr: '26 พ.ย. 2569',
    status: 'closed',
    hasQuestionnaire: true,
    totalSubmitted: 0,
    averageScore: 0,
  },
  {
    id: 'day-10',
    dayNumber: 10,
    dayLabel: 'วันที่ 10',
    title: 'ประเมินผลอบรมวันที่ 27 พ.ย. 2569 · แลกเปลี่ยนความรู้ & ภาพรวมโครงการ',
    dateStr: '27 พ.ย. 2569',
    status: 'closed',
    hasQuestionnaire: true,
    totalSubmitted: 0,
    averageScore: 0,
  },
  {
    id: 'day-special',
    dayNumber: 11,
    dayLabel: 'กิจกรรมพิเศษ',
    title: 'ประเมินผลการศึกษาดูงาน',
    dateStr: 'ยังไม่ได้กำหนดวันและสถานที่',
    status: 'waiting',
    hasQuestionnaire: false,
    totalSubmitted: 0,
    averageScore: 0,
    isSpecial: true,
  },
];

const cloneDefaultDays = () => DEFAULT_DAYS.map((d) => ({ ...d }));

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  // Directories & Files
  const DATA_DIR = path.resolve(__dirname, 'data');
  const DB_FILE = path.join(DATA_DIR, 'database.json');
  const BACKUP_DIR = path.join(DATA_DIR, 'backups');
  const AUTO_BACKUP_FILE = path.join(DATA_DIR, 'database.backup.json');
  const AUDIT_LOG_FILE = path.join(DATA_DIR, 'audit_log.json');
  const SESSIONS_FILE = path.join(DATA_DIR, 'admin_sessions.json');

  // Ensure directories exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // Admin Session Persistence
  interface AdminSession {
    token: string;
    email: string;
    createdAt: number;
    expiresAt: number;
  }

  const loadSessions = (): AdminSession[] => {
    try {
      if (fs.existsSync(SESSIONS_FILE)) {
        const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const now = Date.now();
          return list.filter((s) => s.expiresAt > now);
        }
      }
    } catch {}
    return [];
  };

  const saveSessions = (sessions: AdminSession[]) => {
    try {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving admin sessions:', e);
    }
  };

  let activeSessions: AdminSession[] = loadSessions();

  // Admin Auth Middleware
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const now = Date.now();
    activeSessions = activeSessions.filter((s) => s.expiresAt > now);
    const session = activeSessions.find((s) => s.token === token);
    if (!session) {
      return res.status(401).json({
        error: 'ไม่มีสิทธิ์เข้าถึง: การดำเนินการนี้สงวนไว้สำหรับผู้ดูแลระบบ (Admin) กรุณาเข้าสู่ระบบใหม่',
        unauthorized: true,
      });
    }
    (req as any).adminEmail = session.email;
    next();
  };

  // FIFO Mutex Queue for Race-Condition Free Concurrency
  let queuePromise = Promise.resolve();
  function enqueue<T>(task: () => Promise<T> | T): Promise<T> {
    const next = queuePromise.then(() => task(), () => task());
    queuePromise = next.then(() => {}, () => {});
    return next;
  }

  // Audit Logging
  interface AuditEvent {
    id: string;
    timestamp: string;
    type: string;
    description: string;
    details?: any;
  }

  const readAuditLog = (): AuditEvent[] => {
    try {
      if (fs.existsSync(AUDIT_LOG_FILE)) {
        const raw = fs.readFileSync(AUDIT_LOG_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading audit log:', e);
    }
    return [];
  };

  const logAuditEvent = (type: string, description: string, details?: any) => {
    try {
      const logs = readAuditLog();
      const newEvent: AuditEvent = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        type,
        description,
        details,
      };
      logs.unshift(newEvent);
      const trimmed = logs.slice(0, 250);
      fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to log audit event:', e);
    }
  };

  // Helper to recompute submission stats per day without altering Admin's day.status
  const recomputeDaysStats = (days: any[], submissions: any[]) => {
    return days.map((d) => {
      const daySubs = submissions.filter((s) => s.dayId === d.id);
      const totalSubmitted = daySubs.length;
      const averageScore =
        totalSubmitted > 0
          ? Number(
              (
                daySubs.reduce((sum, s) => sum + (Number(s.overallSatisfaction) || 0), 0) /
                totalSubmitted
              ).toFixed(2)
            )
          : 0;
      return {
        ...d,
        totalSubmitted,
        averageScore,
      };
    });
  };

  // Helper to safely write DB using Atomic Write + Auto Snapshot
  const writeDB = (data: any) => {
    try {
      const tmpFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substring(2)}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);

      try {
        fs.writeFileSync(AUTO_BACKUP_FILE, JSON.stringify(data, null, 2), 'utf-8');
      } catch (backupErr) {
        console.warn('Backup mirror warning:', backupErr);
      }
      return true;
    } catch (e) {
      console.error('Error in atomic writeDB:', e);
      throw e;
    }
  };

  // Helper to read DB with Auto-Recovery & Authoritative Days initialization
  const readDB = () => {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.submissions)) {
          let needsInitWrite = false;
          if (!Array.isArray(parsed.days) || parsed.days.length === 0) {
            parsed.days = cloneDefaultDays();
            needsInitWrite = true;
          } else {
            // Sync questionnaire metadata & titles cleanly while NEVER overriding Admin's 'open'/'closed' state
            parsed.days = parsed.days.map((d: any) => {
              const def = DEFAULT_DAYS.find((x) => x.id === d.id);
              if (!def) return d;
              const upgradedStatus =
                def.hasQuestionnaire && d.status === 'waiting' ? 'closed' : d.status;
              if (
                d.title !== def.title ||
                d.hasQuestionnaire !== def.hasQuestionnaire ||
                upgradedStatus !== d.status
              ) {
                needsInitWrite = true;
                return {
                  ...d,
                  title: def.title,
                  hasQuestionnaire: def.hasQuestionnaire,
                  status: upgradedStatus,
                };
              }
              return d;
            });
          }
          if (!Array.isArray(parsed.participants)) {
            parsed.participants = [];
            needsInitWrite = true;
          }
          if (!parsed.resetEpoch) {
            parsed.resetEpoch = Date.now();
            needsInitWrite = true;
          }
          if (needsInitWrite) {
            writeDB(parsed);
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('⚠️ Primary database.json read failed. Attempting auto-recovery...', e);
      try {
        if (fs.existsSync(AUTO_BACKUP_FILE)) {
          const backupRaw = fs.readFileSync(AUTO_BACKUP_FILE, 'utf-8');
          const backupParsed = JSON.parse(backupRaw);
          if (backupParsed && Array.isArray(backupParsed.submissions)) {
            if (!Array.isArray(backupParsed.days) || backupParsed.days.length === 0) {
              backupParsed.days = cloneDefaultDays();
            }
            console.log('✅ Successfully recovered database from database.backup.json');
            writeDB(backupParsed);
            logAuditEvent('AUTO_RECOVERY', 'กู้คืนฐานข้อมูลอัตโนมัติจากไฟล์สำรองสำเร็จ');
            return backupParsed;
          }
        }
      } catch (recoverErr) {
        console.error('Fatal: Backup recovery failed', recoverErr);
      }
    }

    const freshDB = {
      submissions: [],
      days: cloneDefaultDays(),
      participants: [],
      resetEpoch: Date.now(),
    };
    writeDB(freshDB);
    return freshDB;
  };

  // Create rolling snapshot
  const createSnapshotBackup = (reason: string = 'manual') => {
    try {
      const db = readDB();
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timeTag = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const snapFileName = `snapshot_${timeTag}_${reason}.json`;
      const snapPath = path.join(BACKUP_DIR, snapFileName);

      fs.writeFileSync(snapPath, JSON.stringify(db, null, 2), 'utf-8');

      const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.json')).sort();
      if (files.length > 15) {
        const toDelete = files.slice(0, files.length - 15);
        for (const f of toDelete) {
          try {
            fs.unlinkSync(path.join(BACKUP_DIR, f));
          } catch {}
        }
      }

      logAuditEvent('SNAPSHOT_CREATED', `สร้างจุดสำรองข้อมูล (${reason})`, { fileName: snapFileName });
      return { success: true, fileName: snapFileName };
    } catch (e: any) {
      console.error('Error creating snapshot backup:', e);
      return { success: false, error: e.message };
    }
  };

  // Periodic Auto-Snapshot every 30 minutes if data exists
  setInterval(() => {
    try {
      const db = readDB();
      if (db.submissions && db.submissions.length > 0) {
        createSnapshotBackup('auto_cron');
      }
    } catch (e) {
      console.error('Interval backup error:', e);
    }
  }, 30 * 60 * 1000);

  // Ensure DB is initialized on startup
  readDB();

  // -------------------------------------------------------------
  // API Endpoints
  // -------------------------------------------------------------

  // 0. API Documentation
  app.get('/api', (req, res) => {
    res.json({
      name: 'Audit Evaluation System Robust API',
      organization: 'State Audit Office of Thailand (สำนักงานการตรวจเงินแผ่นดิน)',
      version: '2.1.0',
      description: 'ระบบบริการข้อมูลแบบประเมินผลโครงการฝึกอบรม พร้อมระบบควบคุมสิทธิเปิด-ปิดแบบสอบถามโดยผู้ดูแลระบบ (Server-Authoritative Admin Control)',
      security: {
        atomicWrites: true,
        concurrencyQueue: true,
        autoRecovery: true,
        auditLog: true,
        rollingSnapshots: true,
        adminAuthoritativeDayControl: true,
      },
    });
  });

  // 1. Health & Security Status
  app.get('/api/health', (req, res) => {
    try {
      const stats = fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE) : null;
      const backupFiles = fs.existsSync(BACKUP_DIR)
        ? fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.json'))
        : [];

      res.json({
        status: 'ok',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        database: {
          exists: !!stats,
          sizeBytes: stats ? stats.size : 0,
          lastModified: stats ? stats.mtime : null,
          snapshotCount: backupFiles.length,
        },
      });
    } catch (e: any) {
      res.status(500).json({ status: 'error', error: e.message });
    }
  });

  // 2. Get full database
  app.get('/api/database', (req, res) => {
    const db = readDB();
    res.json(db);
  });

  // 3. Post a new submission (Server-Authoritative Day Status Check + Recompute Stats)
  app.post('/api/submissions', async (req, res) => {
    try {
      const { submission, participants } = req.body;
      if (
        !submission ||
        !submission.id ||
        !submission.dayId ||
        !submission.generalInfo ||
        !submission.generalInfo.workArea ||
        !submission.generalInfo.bureauName ||
        !submission.generalInfo.position ||
        (!submission.dailyData && !submission.day16Data && !submission.day17Data)
      ) {
        return res.status(400).json({ error: 'ข้อมูลแบบประเมินไม่ครบถ้วนหรือไม่ถูกต้องตามรูปแบบ' });
      }

      let rejectedReason: string | null = null;
      let updatedDbSnapshot: any = null;

      await enqueue(async () => {
        const db = readDB();
        const targetDay = db.days.find((d: any) => d.id === submission.dayId);

        // STRICT ADMIN CONTROL: Reject submissions if the day is not currently open on the server
        if (!targetDay || targetDay.status !== 'open') {
          const statusLabel =
            targetDay?.status === 'closed'
              ? 'ปิดรับคำตอบแล้ว'
              : targetDay?.status === 'waiting'
              ? 'ยังไม่เปิดรับคำตอบ'
              : 'ไม่พบวันประเมินที่ระบุ';
          rejectedReason = `แบบประเมิน "${targetDay?.title || submission.dayId}" ${statusLabel} (ควบคุมโดยผู้ดูแลระบบ Admin)`;
          logAuditEvent('SUBMISSION_REJECTED', `ปฏิเสธการส่งแบบประเมินเนื่องจากปิดรับคำตอบ: ${submission.dayId}`, {
            dayId: submission.dayId,
            currentStatus: targetDay?.status,
          });
          return;
        }

        const existingIdx = db.submissions.findIndex((s: any) => s.id === submission.id);
        if (existingIdx >= 0) {
          db.submissions[existingIdx] = submission;
        } else {
          db.submissions.unshift(submission);
        }

        if (Array.isArray(participants)) {
          db.participants = participants;
        }

        // Recompute day statistics strictly on server (NEVER overwrite Admin's day.status from client!)
        db.days = recomputeDaysStats(db.days, db.submissions);

        writeDB(db);
        updatedDbSnapshot = db;

        logAuditEvent(
          'SUBMISSION_RECORDED',
          `บันทึกแบบประเมินรหัส ${submission.referenceCode || submission.id} (${submission.dayTitle || submission.dayId})`,
          {
            dayId: submission.dayId,
            referenceCode: submission.referenceCode,
            score: submission.overallSatisfaction,
          }
        );
      });

      if (rejectedReason) {
        return res.status(403).json({ error: rejectedReason, dayClosed: true });
      }

      res.json({ success: true, days: updatedDbSnapshot?.days });
    } catch (e: any) {
      console.error('Error in /api/submissions:', e);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + e.message });
    }
  });

  // 4. Delete an erroneous submission (Admin only)
  app.delete('/api/submissions/:id', requireAdmin, async (req, res) => {
    try {
      const subId = req.params.id;
      let deletedRecord: any = null;
      let updatedDays: any[] = [];

      await enqueue(async () => {
        const db = readDB();
        const idx = db.submissions.findIndex((s: any) => s.id === subId);
        if (idx >= 0) {
          deletedRecord = db.submissions[idx];
          db.submissions.splice(idx, 1);
          db.days = recomputeDaysStats(db.days, db.submissions);
          updatedDays = db.days;
          writeDB(db);
          logAuditEvent('SUBMISSION_DELETED', `ลบแบบประเมินรหัส ${deletedRecord.referenceCode || subId}`, {
            id: subId,
            referenceCode: deletedRecord.referenceCode,
            admin: (req as any).adminEmail,
          });
        }
      });

      if (!deletedRecord) {
        return res.status(404).json({ error: 'ไม่พบแบบประเมินที่ระบุ' });
      }

      res.json({ success: true, message: 'ลบแบบประเมินเรียบร้อยแล้ว', days: updatedDays });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 5. Update days status (STRICTLY ADMIN ONLY)
  app.post('/api/days', requireAdmin, async (req, res) => {
    try {
      const { dayId, status, action, days: incomingDays } = req.body;
      const adminEmail = (req as any).adminEmail;
      const nowIso = new Date().toLocaleString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      let resultDays: any[] = [];

      await enqueue(async () => {
        const db = readDB();

        if (action === 'close_all') {
          db.days = db.days.map((d: any) => ({
            ...d,
            status: d.status === 'open' ? 'closed' : d.status,
            statusUpdatedAt: d.status === 'open' ? nowIso : d.statusUpdatedAt,
            statusUpdatedBy: d.status === 'open' ? adminEmail : d.statusUpdatedBy,
          }));
          logAuditEvent('DAYS_CLOSED_ALL', `ผู้ดูแลระบบสั่งปิดรับคำตอบทั้งหมด`, { admin: adminEmail });
        } else if (dayId && (status === 'open' || status === 'closed' || status === 'waiting')) {
          const target = db.days.find((d: any) => d.id === dayId);
          db.days = db.days.map((d: any) =>
            d.id === dayId
              ? {
                  ...d,
                  status,
                  statusUpdatedAt: nowIso,
                  statusUpdatedBy: adminEmail,
                }
              : d
          );
          logAuditEvent(
            'DAY_STATUS_CHANGED',
            `ผู้ดูแลระบบเปลี่ยนสถานะ "${target?.dateStr || dayId}" เป็น ${
              status === 'open' ? 'เปิดรับคำตอบ' : status === 'closed' ? 'ปิดรับคำตอบ' : 'รอข้อมูลแบบสอบถาม'
            }`,
            { dayId, status, admin: adminEmail }
          );
        } else if (Array.isArray(incomingDays)) {
          // Merge statuses cleanly while preserving authoritative stats
          db.days = db.days.map((existing: any) => {
            const match = incomingDays.find((x: any) => x.id === existing.id);
            if (match && match.status !== existing.status) {
              return {
                ...existing,
                status: match.status,
                statusUpdatedAt: nowIso,
                statusUpdatedBy: adminEmail,
              };
            }
            return existing;
          });
          logAuditEvent('DAYS_STATUS_UPDATED', 'ปรับปรุงสถานะเปิด-ปิดรับคำตอบรายวันโดย Admin', {
            admin: adminEmail,
            openDays: db.days.filter((d: any) => d.status === 'open').map((d: any) => d.dateStr),
            closedDays: db.days.filter((d: any) => d.status === 'closed').map((d: any) => d.dateStr),
          });
        } else {
          throw new Error('ข้อมูลคำสั่งปรับสถานะไม่ถูกต้อง');
        }

        db.days = recomputeDaysStats(db.days, db.submissions);
        writeDB(db);
        resultDays = db.days;
      });

      res.json({ success: true, days: resultDays });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // 6. Admin Authentication & Session Verification
  app.post('/api/admin/login', (req, res) => {
    try {
      const { email, password } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPw = (password || '').trim();

      if (
        cleanEmail === 'songkran.sirichaithanakul@gmail.com' &&
        cleanPw === 'songkran8192'
      ) {
        const token = crypto.randomBytes(32).toString('hex');
        const now = Date.now();
        const session: AdminSession = {
          token,
          email: cleanEmail,
          createdAt: now,
          expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days
        };
        activeSessions = activeSessions.filter((s) => s.expiresAt > now);
        activeSessions.push(session);
        saveSessions(activeSessions);

        logAuditEvent('ADMIN_LOGIN_SUCCESS', `ผู้ดูแลระบบเข้าสู่ระบบ: ${cleanEmail}`);
        res.json({
          success: true,
          token,
          email: cleanEmail,
          role: 'ADMINISTRATOR',
          authenticatedAt: new Date().toISOString(),
        });
      } else {
        logAuditEvent('ADMIN_LOGIN_FAILED', `พยายามเข้าสู่ระบบไม่สำเร็จ: ${cleanEmail}`);
        res.status(401).json({ error: 'รหัสผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/admin/verify', requireAdmin, (req, res) => {
    res.json({ valid: true, email: (req as any).adminEmail });
  });

  app.post('/api/admin/logout', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (token) {
      activeSessions = activeSessions.filter((s) => s.token !== token);
      saveSessions(activeSessions);
    }
    res.json({ success: true });
  });

  // 7. Get Audit Log (Admin only)
  app.get('/api/admin/audit-log', requireAdmin, (req, res) => {
    const logs = readAuditLog();
    res.json(logs);
  });

  // 8. Trigger Instant Manual Snapshot (Admin only)
  app.post('/api/database/snapshot', requireAdmin, (req, res) => {
    const result = createSnapshotBackup('admin_manual');
    res.json(result);
  });

  // 9. Restore Database from backup (Admin only)
  app.post('/api/database/restore', requireAdmin, async (req, res) => {
    try {
      const { databaseData } = req.body;
      if (!databaseData || !Array.isArray(databaseData.submissions)) {
        return res.status(400).json({ error: 'รูปแบบไฟล์ฐานข้อมูลไม่ถูกต้อง' });
      }

      await enqueue(async () => {
        createSnapshotBackup('pre_restore');
        const restoredDays =
          Array.isArray(databaseData.days) && databaseData.days.length > 0
            ? recomputeDaysStats(databaseData.days, databaseData.submissions)
            : recomputeDaysStats(cloneDefaultDays(), databaseData.submissions);

        const nextDb = {
          submissions: databaseData.submissions,
          days: restoredDays,
          participants: Array.isArray(databaseData.participants) ? databaseData.participants : [],
          resetEpoch: Date.now(),
        };
        writeDB(nextDb);
        logAuditEvent('DATABASE_RESTORED', 'กู้คืนฐานข้อมูลจากไฟล์สำรองสำเร็จ', {
          submissionsCount: databaseData.submissions.length,
          admin: (req as any).adminEmail,
        });
      });

      res.json({ success: true, count: databaseData.submissions.length });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 10. Reset Database (Admin only — Clears submissions/participants while PRESERVING Admin's open/closed day statuses)
  app.post('/api/database/reset', requireAdmin, async (req, res) => {
    try {
      let preservedDays: any[] = [];
      const nextResetEpoch = Date.now();

      await enqueue(async () => {
        const currentDb = readDB();
        if (currentDb.submissions && currentDb.submissions.length > 0) {
          createSnapshotBackup('pre_reset_backup');
        }

        // Preserve Admin's open/closed/waiting status for every day!
        preservedDays = currentDb.days.map((d: any) => ({
          ...d,
          totalSubmitted: 0,
          averageScore: 0,
        }));

        const cleanDB = {
          submissions: [],
          days: preservedDays,
          participants: [],
          resetEpoch: nextResetEpoch,
        };
        writeDB(cleanDB);
        logAuditEvent('DATABASE_RESET', 'ล้างข้อมูลแบบประเมินและรายชื่อผู้ตอบทั้งหมดแล้ว (คงสถานะเปิด-ปิดวันของ Admin ไว้ตามเดิม)', {
          admin: (req as any).adminEmail,
        });
      });

      res.json({ success: true, days: preservedDays, resetEpoch: nextResetEpoch });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 11. Export JSON File
  app.get('/api/database/export', (req, res) => {
    const db = readDB();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=AuditEval_Database_${new Date().toISOString().slice(0, 10)}.json`
    );
    res.send(JSON.stringify(db, null, 2));
  });

  // 12. Export Official CSV for Excel with UTF-8 BOM (Full Level 1-4 & Day 27 Overall columns)
  app.get('/api/database/export/csv', (req, res) => {
    try {
      const db = readDB();
      const subs = db.submissions || [];

      const headers = [
        'รหัสอ้างอิง (Reference Code)',
        'รอบการประเมิน',
        'วันเวลาที่ส่ง',
        'พื้นที่ปฏิบัติงาน',
        'สำนัก/กลุ่มงาน',
        'ระดับตำแหน่ง',
        'บทบาทหน้าที่หลัก',
        'Lv1 เนื้อหา-1 (สอดคล้องบทบาท)',
        'Lv1 เนื้อหา-2 (กฎหมาย/มาตรฐาน สตง.)',
        'Lv1 เนื้อหา-3 (ประยุกต์ใช้กำกับงาน)',
        'Lv1 วิทยากรทั้งวัน (ข้อ 4,5,6)',
        'Lv1 วิทยากรภาคเช้า (ข้อ 4,5,6)',
        'Lv1 วิทยากรภาคบ่าย (ข้อ 4,5,6)',
        'ความเห็นต่อวิทยากร',
        'ภาพรวมโครงการ-เนื้อหา (ข้อ 8-11)',
        'ภาพรวมโครงการ-บริหารจัดการ (ข้อ 12-15)',
        'Lv2 หัวข้อ1 ก่อนอบรม',
        'Lv2 หัวข้อ1 หลังอบรม',
        'Lv2 หัวข้อ2 ก่อนอบรม',
        'Lv2 หัวข้อ2 หลังอบรม',
        'Lv2 Readiness (ข้อ 1,2,3)',
        'Lv3-4 Baseline (ข้อ 1,2,3)',
        'คะแนนความพึงพอใจเฉลี่ย (เต็ม 5)',
        'ข้อเสนอแนะเพิ่มเติม',
      ];

      const escapeCSV = (val: any) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = subs.map((s: any) => {
        const posText =
          s.generalInfo?.position === 'senior_professional'
            ? 'ชำนาญการ'
            : s.generalInfo?.position === 'special_professional'
            ? 'ชำนาญการพิเศษ'
            : s.generalInfo?.position || '';
        const areaText = s.generalInfo?.workArea === 'central' ? 'ส่วนกลาง' : 'ส่วนภูมิภาค';
        const rolesText = (s.generalInfo?.roles || []).join(', ');

        const d = s.dailyData;
        const d16 = s.day16Data;
        const d17 = s.day17Data;

        const c1 = d?.contentScore1 ?? d16?.contentScore1 ?? d17?.contentScore1 ?? '';
        const c2 = d?.contentScore2 ?? d16?.contentScore2 ?? d17?.contentScore2 ?? '';
        const c3 = d?.contentScore3 ?? d16?.contentScore3 ?? d17?.contentScore3 ?? '';

        const fullLec = d?.lecturerScores?.full
          ? `${d.lecturerScores.full.q4}/${d.lecturerScores.full.q5}/${d.lecturerScores.full.q6}`
          : d17
          ? `${d17.lecturerFullDay1}/${d17.lecturerFullDay2}/${d17.lecturerFullDay3}`
          : '';
        const morningLec = d?.lecturerScores?.morning
          ? `${d.lecturerScores.morning.q4}/${d.lecturerScores.morning.q5}/${d.lecturerScores.morning.q6}`
          : d16
          ? `${d16.lecturerMorning1}/${d16.lecturerMorning2}/${d16.lecturerMorning3}`
          : '';
        const afternoonLec = d?.lecturerScores?.afternoon
          ? `${d.lecturerScores.afternoon.q4}/${d.lecturerScores.afternoon.q5}/${d.lecturerScores.afternoon.q6}`
          : d16
          ? `${d16.lecturerAfternoon1}/${d16.lecturerAfternoon2}/${d16.lecturerAfternoon3}`
          : '';

        const lecComment = d?.lecturerComment || d16?.lecturerComment || d17?.lecturerComment || '';

        const overallContent = d?.overallProject
          ? `${d.overallProject.q8}/${d.overallProject.q9}/${d.overallProject.q10}/${d.overallProject.q11}`
          : '';
        const overallMgmt = d?.overallProject
          ? `${d.overallProject.q12}/${d.overallProject.q13}/${d.overallProject.q14}/${d.overallProject.q15}`
          : '';

        const t1Pre = d?.learningTopics?.topic1?.pre ?? d16?.topic1Pre ?? d17?.topic1Pre ?? '';
        const t1Post = d?.learningTopics?.topic1?.post ?? d16?.topic1Post ?? d17?.topic1Post ?? '';
        const t2Pre = d?.learningTopics?.topic2?.pre ?? d16?.topic2Pre ?? '';
        const t2Post = d?.learningTopics?.topic2?.post ?? d16?.topic2Post ?? '';

        const readinessStr = d?.readiness
          ? `${d.readiness.r1}/${d.readiness.r2}/${d.readiness.r3}`
          : d17
          ? `${d17.readiness1}/${d17.readiness2}/${d17.readiness3}`
          : '';

        const baselineStr = d
          ? `${d.baseline1}/${d.baseline2}/${d.baseline3}`
          : d16
          ? `${d16.baseline1}/${d16.baseline2}/${d16.baseline3}`
          : d17
          ? `${d17.baseline1}/${d17.baseline2}/${d17.baseline3}`
          : '';

        const comments = s.suggestions || d?.suggestions || d16?.suggestions || d17?.suggestions || '';

        return [
          escapeCSV(s.referenceCode),
          escapeCSV(s.dayTitle),
          escapeCSV(s.timestamp),
          escapeCSV(areaText),
          escapeCSV(s.generalInfo?.bureauName || ''),
          escapeCSV(posText),
          escapeCSV(rolesText),
          escapeCSV(c1),
          escapeCSV(c2),
          escapeCSV(c3),
          escapeCSV(fullLec),
          escapeCSV(morningLec),
          escapeCSV(afternoonLec),
          escapeCSV(lecComment),
          escapeCSV(overallContent),
          escapeCSV(overallMgmt),
          escapeCSV(t1Pre),
          escapeCSV(t1Post),
          escapeCSV(t2Pre),
          escapeCSV(t2Post),
          escapeCSV(readinessStr),
          escapeCSV(baselineStr),
          escapeCSV(s.overallSatisfaction ? s.overallSatisfaction.toFixed(2) : '0.00'),
          escapeCSV(comments),
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=AuditEval_Report_${new Date().toISOString().slice(0, 10)}.csv`
      );
      res.send(csvContent);
    } catch (e: any) {
      res.status(500).send('Error generating CSV: ' + e.message);
    }
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
    logAuditEvent('SERVER_STARTED', `เซิร์ฟเวอร์เริ่มทำงานบนพอร์ต ${PORT}`);
  });
}

startServer();
