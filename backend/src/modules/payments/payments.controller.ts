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
    await prisma.transaction.update({ where: { id: transaction.id }, data: { status: 'COMPLETED' } });
    res.json({ success: true });
  } catch (error) { next(error); }
}
