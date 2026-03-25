import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { personSchema } from '../lib/validation.js';
import { ZodError } from 'zod';

const router = Router();

/** Resolve the groupId for the current user.
 *  - ADMIN: groupId = user.id
 *  - MEMBER: groupId = user.adminId
 */
async function resolveGroupId(userId: string, role: 'ADMIN' | 'MEMBER'): Promise<string> {
  if (role === 'ADMIN') return userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { adminId: true } });
  return user?.adminId ?? userId;
}

// GET /api/people
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const groupId = await resolveGroupId(req.user!.userId, req.user!.role);
    const people = await prisma.person.findMany({
      where: { groupId },
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(people);
  } catch (err) {
    console.error('[GET /people]', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// POST /api/people
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = personSchema.parse(req.body);
    const groupId = await resolveGroupId(req.user!.userId, req.user!.role);

    const person = await prisma.person.create({
      data: {
        ...body,
        complement: body.complement ?? '',
        denomination: body.hasDenomination ? (body.denomination ?? null) : null,
        groupId,
        createdById: req.user!.userId,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });

    res.status(201).json(person);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.issues[0].message, details: err.issues });
      return;
    }
    console.error('[POST /people]', err);
    res.status(500).json({ error: 'Erro ao salvar cadastro.' });
  }
});

// DELETE /api/people/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const groupId = await resolveGroupId(req.user!.userId, req.user!.role);

    const person = await prisma.person.findUnique({ where: { id } });
    if (!person || person.groupId !== groupId) {
      res.status(404).json({ error: 'Cadastro não encontrado.' });
      return;
    }

    await prisma.person.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /people/:id]', err);
    res.status(500).json({ error: 'Erro ao excluir cadastro.' });
  }
});

export default router;
