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
        avatarUrl: true,
        bio: true,
        createdAt: true,
        university: {
          select: {
            id: true,
            name: true,
            allowedEmailDomains: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      department?: string;
      universityIdNumber?: string;
      avatarUrl?: string;
      bio?: string;
    }
  ) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        department: data.department,
        universityIdNumber: data.universityIdNumber,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
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
        avatarUrl: true,
        bio: true,
        createdAt: true,
        university: {
          select: {
            id: true,
            name: true,
            allowedEmailDomains: true,
          },
        },
      },
    });

    return user;
  }
}