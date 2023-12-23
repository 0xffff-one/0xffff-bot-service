import Router from '@koa/router';

import { handleWebhookEvent } from './controller/webhook.mjs';

export const router = new Router();

router.post('/bot/webhook/event', handleWebhookEvent);
