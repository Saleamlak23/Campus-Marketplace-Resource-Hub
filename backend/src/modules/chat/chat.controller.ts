import { NextFunction, Request, Response } from 'express';
import * as chatService from './chat.service';
import { createConversationSchema, createMessageSchema } from './chat.validation';
import { AppError } from '../../middleware/errorHandler';

function identity(req: Request) {
  if (!req.user) throw new AppError('Authenticated user missing', 401);
  return req.user;
}

function routeId(req: Request) {
  const { id } = req.params;
  if (typeof id !== 'string') throw new AppError('Invalid route identifier', 400);
  return id;
}

export async function getConversationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = identity(req);
    res.json({ success: true, data: await chatService.listConversations(user.userId, user.universityId) });
  } catch (error) {
    next(error);
  }
}

export async function createConversationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = identity(req);
    const data = createConversationSchema.parse(req.body);
    res.status(201).json({ success: true, data: await chatService.ensureConversation(user.userId, user.universityId, data.participantId) });
  } catch (error) {
    next(error);
  }
}

export async function getConversationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = identity(req);
    res.json({ success: true, data: await chatService.getConversation(user.userId, user.universityId, routeId(req)) });
  } catch (error) {
    next(error);
  }
}

export async function createMessageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = identity(req);
    const data = createMessageSchema.parse(req.body);
    res.status(201).json({ success: true, data: await chatService.createMessage(user.userId, user.universityId, routeId(req), data.content) });
  } catch (error) {
    next(error);
  }
}
