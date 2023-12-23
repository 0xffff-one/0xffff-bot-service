import Koa from 'koa';
import { koaBody as KoaBody } from 'koa-body';
import camelcase from 'camelcase-keys';

import { router } from './router.mjs';

const app = new Koa();

app
  .use(KoaBody({
    jsonLimit: '1mb',
  }))
  .use(async (ctx, next) => {
    ctx.request.body = camelcase(ctx.request.body, { deep: true });
    return next();
  })
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
