import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import diagnoseRouter from './routes/diagnose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:4200'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'FarmAssist API' });
});

app.use('/api/diagnose', diagnoseRouter);

const server = app.listen(PORT, () => {
  console.log(`FarmAssist backend running on http://localhost:${PORT}`);
});

server.setTimeout(120000);

export default app;
