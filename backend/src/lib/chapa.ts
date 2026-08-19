import crypto from 'crypto';
import { config } from '../config/env';
import { AppError } from '../middleware/errorHandler';

const CHAPA_API_URL = 'https://api.chapa.co/v1/transaction';

interface ChapaApiResponse {
  status: 'success' | 'failed';
  message?: string;
  data?: { checkout_url?: string; status?: string; tx_ref?: string; amount?: number | string; currency?: string };
}

function secretKey() {
  if (!config.chapa.secretKey) throw new AppError('Chapa payments are not configured', 503);
  return config.chapa.secretKey;
}

async function chapaRequest(path: string, options: RequestInit): Promise<ChapaApiResponse> {
  const response = await fetch(`${CHAPA_API_URL}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${secretKey()}`, 'Content-Type': 'application/json', ...options.headers },
  });
  const payload = await response.json() as ChapaApiResponse;
  if (!response.ok || payload.status !== 'success') throw new AppError(payload.message || 'Chapa request failed', 502);
  return payload;
}

export async function initializeChapaPayment(payload: Record<string, unknown>) {
  const response = await chapaRequest('/initialize', { method: 'POST', body: JSON.stringify(payload) });
  const checkoutUrl = response.data?.checkout_url;
  if (!checkoutUrl) throw new AppError('Chapa did not return a checkout URL', 502);
  return checkoutUrl;
}

export async function verifyChapaPayment(txRef: string) {
  return chapaRequest(`/verify/${encodeURIComponent(txRef)}`, { method: 'GET' });
}

export function verifyChapaWebhook(payload: unknown, headers: { chapaSignature?: string; xChapaSignature?: string }) {
  const secret = config.chapa.webhookSecret;
  if (!secret) throw new AppError('Chapa webhook secret is not configured', 503);
  const bodySignature = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
  const secretSignature = crypto.createHmac('sha256', secret).update(secret).digest('hex');
  const signatures = [headers.chapaSignature, headers.xChapaSignature].filter((value): value is string => Boolean(value));
  const isValid = signatures.some((signature) => signature === bodySignature || signature === secretSignature);
  if (!isValid) throw new AppError('Invalid Chapa webhook signature', 401);
}
