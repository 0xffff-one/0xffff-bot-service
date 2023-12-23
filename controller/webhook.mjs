import { buildText } from '../service/bot/helper.mjs';
// import { sendBotMessage } from '../service/bot/execLocal.mjs';
import { sendBotMessage } from '../service/bot/execPve.mjs';

export const handleWebhookEvent = async ctx => {
  console.info('recieved event: ', JSON.stringify(ctx.request.body, null, 4));
  const botMessage = buildText(ctx.request.body);
  await sendBotMessage(botMessage);
  ctx.body = { message: 'OK' };
  ctx.status = 200;
};
