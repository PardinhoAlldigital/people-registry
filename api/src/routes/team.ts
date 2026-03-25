import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { createMemberSchema } from '../lib/validation.js';
import { ZodError } from 'zod';

const router = Router();

// GET /api/team — list members of the admin's team
router.get('/', requireAuth, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const members = await prisma.user.findMany({
      where: { adminId: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { people: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(members);
  } catch (err) {
    console.error('[GET /team]', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// POST /api/team — create a new member under this admin
router.post('/', requireAuth, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = createMemberSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existing) {
      res.status(409).json({ error: 'E-mail já cadastrado.' });
      return;
    }

    const hashed = await bcrypt.hash(body.password, 12);
    const member = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email.toLowerCase(),
        password: hashed,
        role: 'MEMBER',
        adminId: req.user!.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { people: true } },
      },
    });

    res.status(201).json(member);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error('[POST /team]', err);
    res.status(500).json({ error: 'Erro ao criar membro.' });
  }
});

// DELETE /api/team/:id — remove a member from the team
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const member = await prisma.user.findUnique({ where: { id } });
    if (!member || member.adminId !== req.user!.userId) {
      res.status(404).json({ error: 'Membro não encontrado.' });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /team/:id]', err);
    res.status(500).json({ error: 'Erro ao remover membro.' });
  }
});

export default router;
