import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { serviceSchema } from '../lib/validation.js';
import { resolveGroupId } from '../lib/group.js';
import { ZodError } from 'zod';

const router = Router();

// Serviços padrão criados automaticamente para um grupo sem serviços cadastrados
const DEFAULT_SERVICES = [
  'Oculista',
  'Dentista',
  'Cabeleireiro',
  'Enfermagem',
  'Nutrição',
  'Esteticista',
  'Bioimpedância',
  'Psicólogo',
  'Outros',
];

// GET /api/services — lista os serviços do grupo (semeia os padrões na primeira vez)
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const groupId = await resolveGroupId(req.user!.userId, req.user!.role);

    let services = await prisma.service.findMany({
      where: { groupId },
      orderBy: { createdAt: 'asc' },
    });

    if (services.length === 0) {
      await prisma.service.createMany({
        data: DEFAULT_SERVICES.map((name) => ({ name, groupId })),
        skipDuplicates: true,
      });
      services = await prisma.service.findMany({
        where: { groupId },
        orderBy: { createdAt: 'asc' },
      });
    }

    res.json(services);
  } catch (err) {
    console.error('[GET /services]', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// POST /api/services — adiciona um novo serviço ao grupo
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = serviceSchema.parse(req.body);
    const groupId = await resolveGroupId(req.user!.userId, req.user!.role);

    const existing = await prisma.service.findUnique({
      where: { groupId_name: { groupId, name } },
    });
    if (existing) {
      res.status(409).json({ error: 'Serviço já cadastrado.' });
      return;
    }

    const service = await prisma.service.create({ data: { name, groupId } });
    res.status(201).json(service);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error('[POST /services]', err);
    res.status(500).json({ error: 'Erro ao adicionar serviço.' });
  }
});

// DELETE /api/services/:id — remove um serviço do grupo
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const groupId = await resolveGroupId(req.user!.userId, req.user!.role);

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service || service.groupId !== groupId) {
      res.status(404).json({ error: 'Serviço não encontrado.' });
      return;
    }

    await prisma.service.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /services/:id]', err);
    res.status(500).json({ error: 'Erro ao excluir serviço.' });
  }
});

export default router;
