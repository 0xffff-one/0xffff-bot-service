import Koa from 'koa';
import { koaBody as KoaBody } from 'koa-body';
import camelcase from 'camelcase-keys';

const app = new Koa();

app.use(KoaBody({
  jsonLimit: '1mb',
}));

app.use(async (ctx, next) => {
  ctx.request.body = camelcase(ctx.request.body, { deep: true });
  return next();
});

function buildText(body) {
  const content = body.attachments[0];
  const { authorName, title, titleLink, text } = content;
  // the message will be like:
  // @0x0001 New post in `test title`
  // test content
  // https://example.com/d/1/2
  return `@${authorName} ${title}\n${text}\n${titleLink}`;
}

const X11User = 'bot';
const X11DisplayPort = ':0';
const InputboxPosX = 540;
const InputboxPosY = 600;

function buildCommand(text) {
  // switch to loggedIn user
  const loginCommands = `su ${X11User} -l -c`.split(' ');
  // activate the window focus by clicking inputbox
  const locationCommands = [
    // here we manual set the x11 display connection
    `export DISPLAY=${X11DisplayPort}`,
    `xdotool mousemove ${InputboxPosX} ${InputboxPosY}`,
    'xdotool click 1',
  ];
  // convert multiline text to a series of `xdotool type` command
  const typeCommands = [];
  text.split('\n').forEach((paragraph, index) => {
    if (index > 0) {
      // insert a new line
      typeCommands.push('xdotool key --clearmodifiers Shift+Return');
    }
    if (paragraph !== '') {
      // since the qemu agent cannot receive wide chars, it's a workaround that encode them into
      // \xAB form and just send the pure ASCII chars, then `printf` will convert them back
      const encodedParagraph = encodeURI(paragraph).replaceAll('%', '\\x');
      typeCommands.push(`printf '${encodedParagraph}' | xdotool type --clearmodifiers --file -`);
    }
  });
  // finally action to send the whole text
  const actionCommands = [
    // 'xdotool key Return',
  ];
  // combine the command list, all commands except the login commands should be in one line and
  // be executed serially in the switched subshell.
  return [
    ...loginCommands,
    [
      ...locationCommands,
      ...typeCommands,
      ...actionCommands,
    ].join(' && '),
  ];
}

const PveHost = '192.168.96.96:8006';
const PveNode = 'um780xtx';
const PveVmId = 903;
const PveExecApiEndpoint = `https://${PveHost}/api2/json/nodes/${PveNode}/qemu/${PveVmId}/agent/exec`;

async function sendBotMessage(text) {
  console.info('sending message:\n', text);
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const data = { command: buildCommand(text) };
  console.info('execute data: %o', data);
  try {
    const res = await fetch(PveExecApiEndpoint, {
      method: 'POST',
      headers: {
        Authorization: 'PVEAPIToken=root@pam!pve-http-automaton=efedb842-e99c-4dd4-b4d1-e7c576ae383a',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    console.info('send result: %o', res.statusText);
  } catch (error) {
    console.error('send error: ', error);
  }
}

app.use(async ctx => {
  console.info('recieved event: ', JSON.stringify(ctx.request.body, null, 4));
  const botMessage = buildText(ctx.request.body);
  await sendBotMessage(botMessage);
  ctx.body = { message: 'OK' };
  ctx.status = 200;
});

app.listen(3000);
