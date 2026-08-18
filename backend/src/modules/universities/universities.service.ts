import prisma from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export class UniversitiesService {
  async getAll() {
    return prisma.university.findMany({
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true },
        },
        listings: {
          select: { id: true, title: true, status: true },
        },
      },
    });
  }

  async getOne(id: string) {
    const university = await prisma.university.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!university) {
      throw new AppError('University not found', 404);
    }

    return university;
  }
}