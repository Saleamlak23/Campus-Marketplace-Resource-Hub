import { NextFunction, Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { config } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { initializeChapaPayment, verifyChapaPayment, verifyChapaWebhook } from '../../lib/chapa';
import { chapaWebhookSchema, initiatePaymentSchema } from './payments.validation';

export async function initiatePaymentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const input = initiatePaymentSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { id: true, name: true, email: true } });
    if (!user) throw new AppError('User not found', 404);

    const transaction = await prisma.transaction.create({
      data: { userId: user.id, relatedType: input.relatedType, relatedId: input.relatedId, amount: input.amount },
    });
    const txRef = `cmp_${transaction.id}`;
    await prisma.transaction.update({ where: { id: transaction.id }, data: { chapaRef: txRef } });

    const [firstName, ...rest] = user.name.trim().split(/\s+/);
    const checkoutUrl = await initializeChapaPayment({
      amount: input.amount.toFixed(2), currency: 'ETB', email: user.email, first_name: firstName,
      last_name: rest.join(' ') || firstName, tx_ref: txRef, callback_url: `${config.frontendUrl}/payments/callback`,
      return_url: input.returnUrl || `${config.frontendUrl}/payments/complete`,
      customization: { title: 'Campus Marketplace', description: 'Campus Marketplace payment' },
    });
    res.status(201).json({ success: true, data: { transactionId: transaction.id, txRef, checkoutUrl } });
  } catch (error) { next(error); }
}

export async function chapaWebhookHandler(req: Request, res: Response, next: NextFunction) {
  try {
    verifyChapaWebhook(req.body, {
      chapaSignature: typeof req.headers['chapa-signature'] === 'string' ? req.headers['chapa-signature'] : undefined,
      xChapaSignature: typeof req.headers['x-chapa-signature'] === 'string' ? req.headers['x-chapa-signature'] : undefined,
    });
    const event = chapaWebhookSchema.parse(req.body);
    const transaction = await prisma.transaction.findFirst({ where: { chapaRef: event.tx_ref } });
    if (!transaction) throw new AppError('Transaction not found', 404);
    if (transaction.status === 'COMPLETED') return res.json({ success: true });

    const verified = await verifyChapaPayment(event.tx_ref);
    const data = verified.data;
    if (data?.status !== 'success' || data.tx_ref !== event.tx_ref || data.currency !== transaction.currency || Number(data.amount) !== transaction.amount) {
      await prisma.transaction.update({ where: { id: transaction.id }, data: { status: 'FAILED' } });
      throw new AppError('Chapa transaction verification failed', 400);
    }
    res.json({ success: true });
  } catch (error) { next(error); }
}

export async function getMyTransactionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const { status, page, pageSize } = req.query as { status?: string; page?: string; pageSize?: string };
    
    const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(pageSize || '20', 10) || 20));
    const skip = (pageNum - 1) * limit;

    const whereClause: any = { userId: req.user.userId };
    if (status) {
      whereClause.status = status;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        total,
        page: pageNum,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) { next(error); }
}

export async function getTransactionByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const { id } = req.params;
    if (typeof id !== 'string') throw new AppError('Invalid transaction ID', 400);

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!transaction) throw new AppError('Transaction not found', 404);
    if (transaction.userId !== req.user.userId && req.user.role !== 'SUPER_ADMIN') {
      throw new AppError('Cannot access transactions of other users', 403);
    }

    res.json({ success: true, data: transaction });
  } catch (error) { next(error); }
}
