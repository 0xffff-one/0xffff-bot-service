const X11User = 'bot';
const X11DisplayPort = ':0';
const InputboxPosX = 540;
const InputboxPosY = 600;

export function buildText(body) {
  const content = body.attachments[0];
  const { authorName, title, titleLink, text } = content;
  // the message will be like:
  // @0x0001 New post in `test title`
  // test content
  // https://example.com/d/1/2
  return `@${authorName} ${title}\n${text}\n${titleLink}`;
}

export function buildCommand(text) {
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
    'xdotool key Return',
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
