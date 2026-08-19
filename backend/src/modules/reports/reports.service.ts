import { ReportStatus, ReportTarget } from '@prisma/client';
import prisma from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export async function createReport(data: {
  reporterId: string;
  universityId: string;
  targetType: ReportTarget;
  targetId: string;
  reason: string;
}) {
  return prisma.report.create({
    data: {
      reporterId: data.reporterId,
      universityId: data.universityId,
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
      status: 'PENDING',
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
}

export async function getMyReports(reporterId: string) {
  return prisma.report.findMany({
    where: { reporterId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getReports(options: {
  universityId?: string;
  isSuperAdmin?: boolean;
  status?: ReportStatus;
  page?: number;
  pageSize?: number;
}) {
  const { universityId, isSuperAdmin, status, page = 1, pageSize = 20 } = options;
  const skip = (page - 1) * pageSize;

  const whereClause: any = {};
  if (!isSuperAdmin && universityId) {
    whereClause.universityId = universityId;
  }
  if (status) {
    whereClause.status = status;
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where: whereClause,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
        university: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.report.count({ where: whereClause }),
  ]);

  return {
    reports,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  adminUniversityId?: string,
  isSuperAdmin?: boolean
) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new AppError('Report not found', 404);

  if (!isSuperAdmin && report.universityId !== adminUniversityId) {
    throw new AppError('Cannot manage reports from other universities', 403);
  }

  return prisma.report.update({
    where: { id: reportId },
    data: { status },
  });
}
