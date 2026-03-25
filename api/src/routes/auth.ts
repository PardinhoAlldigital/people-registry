import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { loginSchema, registerSchema } from '../lib/validation.js';
import { ZodError } from 'zod';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });
    if (existing) {
      res.status(409).json({ error: 'E-mail já cadastrado.' });
      return;
    }

    const hashed = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: { name: body.name, email: body.email.toLowerCase(), password: hashed, role: 'ADMIN' },
    });

    const token = signToken({ userId: user.id, email: user.email, name: user.name, role: user.role });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error('[POST /auth/register]', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user) {
      res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      return;
    }

    const valid = await bcrypt.compare(body.password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name, role: user.role });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error('[POST /auth/login]', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

export default router;
