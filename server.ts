import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  const DATA_DIR = path.resolve(__dirname, 'data');
  const DB_FILE = path.join(DATA_DIR, 'database.json');

  // Ensure data dir exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Helper to read DB from file base
  const readDB = () => {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading database file:', e);
    }
    return { submissions: [], days: [], participants: [] };
  };

  // Helper to write DB to file base
  const writeDB = (data: any) => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing database file:', e);
    }
  };

  // 1. Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 2. Get full database state
  app.get('/api/database', (req, res) => {
    const db = readDB();
    res.json(db);
  });

  // 3. Post a new submission
  app.post('/api/submissions', (req, res) => {
    try {
      const { submission, days, participants } = req.body;
      if (!submission || !submission.id) {
        return res.status(400).json({ error: 'Missing submission payload' });
      }

      const db = readDB();
      const existingIdx = db.submissions.findIndex((s: any) => s.id === submission.id);
      if (existingIdx >= 0) {
        db.submissions[existingIdx] = submission;
      } else {
        db.submissions.unshift(submission);
      }

      if (Array.isArray(days)) {
        db.days = days;
      }
      if (Array.isArray(participants)) {
        db.participants = participants;
      }

      writeDB(db);
      res.json({ success: true, count: db.submissions.length });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 4. Update days status
  app.post('/api/days', (req, res) => {
    try {
      const { days } = req.body;
      const db = readDB();
      if (Array.isArray(days)) {
        db.days = days;
        writeDB(db);
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 5. Reset database
  app.post('/api/database/reset', (req, res) => {
    const emptyDB = { submissions: [], days: [], participants: [] };
    writeDB(emptyDB);
    res.json({ success: true });
  });

  // 6. Export database file for download
  app.get('/api/database/export', (req, res) => {
    const db = readDB();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=AuditEval_Database_${new Date().toISOString().slice(0, 10)}.json`
    );
    res.send(JSON.stringify(db, null, 2));
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
