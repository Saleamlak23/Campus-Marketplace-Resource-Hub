import prisma from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export class UsersService {
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        universityId: true,
        isVerified: true,
        department: true,
        universityIdNumber: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateUser(id: string, data: { name?: string; department?: string; universityIdNumber?: string }) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        department: data.department,
        universityIdNumber: data.universityIdNumber,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        universityId: true,
        isVerified: true,
        department: true,
        universityIdNumber: true,
        createdAt: true,
      },
    });

    return user;
  }
}