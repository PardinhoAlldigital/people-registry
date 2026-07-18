import { prisma } from './prisma.js';

/** Resolve the groupId for the current user.
 *  - ADMIN: groupId = user.id
 *  - MEMBER: groupId = user.adminId
 */
export async function resolveGroupId(userId: string, role: 'ADMIN' | 'MEMBER'): Promise<string> {
  if (role === 'ADMIN') return userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { adminId: true } });
  return user?.adminId ?? userId;
}
