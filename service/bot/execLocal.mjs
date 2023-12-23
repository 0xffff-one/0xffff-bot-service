import { promisify } from 'node:util';
import { exec } from 'node:child_process';

import { buildLocalCommand } from './helper.mjs';

const execAsync = promisify(exec);

export async function sendBotMessage(text) {
  console.info('sending message:\n', text);
  const command = buildLocalCommand(text);
  console.info('execute command: %s', command);

  try {
    const { stdout, stderr } = await execAsync(command, {
      env: {
        DISPLAY: ':0',
      },
    });
    console.info('send result:\nstdout: %s\nstderr: %s', stdout, stderr);
  } catch (error) {
    console.error('send error: ', error);
  }
}
