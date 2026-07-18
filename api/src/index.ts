import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import peopleRouter from './routes/people.js';
import teamRouter from './routes/team.js';
import servicesRouter from './routes/services.js';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/people', peopleRouter);
app.use('/api/team', teamRouter);
app.use('/api/services', servicesRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 API rodando em http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

export default app;
