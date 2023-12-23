import { buildCommand } from './helper.mjs';

// resolve local self-signed certificate issue, or we can use custom CA later
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const PveHost = '192.168.96.96:8006';
const PveNode = 'um780xtx';
const PveVmId = 903;
const PveExecApiEndpoint = `https://${PveHost}/api2/json/nodes/${PveNode}/qemu/${PveVmId}/agent/exec`;

export async function sendBotMessage(text) {
  console.info('sending message:\n', text);
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
