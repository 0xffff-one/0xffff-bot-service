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

function buildXdotoolCommand(text) {
  // activate the window focus by clicking inputbox
  const locationCommands = [
    `xdotool mousemove ${InputboxPosX} ${InputboxPosY}`,
    'xdotool click 1',
  ];

  // set the text to clipboard, then run xdotool c-v it onto the GUI
  const typeCommands = ['xsel -cb'];
  // since the qemu agent cannot receive wide chars, it's a workaround that encode them into \xAB
  // form and just send the pure ASCII chars, then `printf` will convert them back
  const encodedText = encodeURI(text).replaceAll('%', '\\x');
  typeCommands.push(`printf '${encodedText}' | xsel -b`);
  typeCommands.push('xdotool key --clearmodifiers ctrl+v');

  // finally action to send the whole text
  const actionCommands = [
    'xdotool key --clearmodifiers Return',
  ];

  return [
    ...locationCommands,
    ...typeCommands,
    ...actionCommands,
  ];
}

export function buildQemuCommand(text) {
  // switch to loggedIn user
  const loginCommands = `su ${X11User} -l -c`.split(' ');
  const envCommands = [
    // here we manual set the x11 display connection
    `export DISPLAY=${X11DisplayPort}`,
  ];

  // combine the command list, all commands except the login commands should be in one line and
  // be executed serially in the switched subshell.
  return [
    ...loginCommands,
    [
      ...envCommands,
      ...buildXdotoolCommand(text),
    ].join(' && '),
  ];
}

export function buildLocalCommand(text) {
  return buildXdotoolCommand(text).join(' && ');
}
