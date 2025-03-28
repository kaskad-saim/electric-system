const PREFIX = [0x2f, 0x3f]; // '/', '?'
const HEADER = [0x21, 0x01, 0x52, 0x31, 0x02]; // '!', SOH, 'R', '1', STX
const SUFFIX = [0x28, 0x29, 0x03]; // '(', ')', ETX

const COMMANDS = [
  { name: 'voltage', command: 'VOLTA', bcc: 0x5f },
  { name: 'amperage', command: 'CURRE', bcc: 0x5a },
  { name: 'powerActive', command: 'POWEP', bcc: 0x64 },
  { name: 'powerReactive', command: 'POWEQ', bcc: 0x65 },
];

function buildRequestBuffer(address, command, bcc) {
  const addressBuffer = Array.from(address).map((ch) => ch.charCodeAt(0));
  const commandBuffer = Array.from(command).map((ch) => ch.charCodeAt(0));
  const fullBuffer = [...PREFIX, ...addressBuffer, ...HEADER, ...commandBuffer, ...SUFFIX, bcc];
  return Buffer.from(fullBuffer);
}

export function buildRequestsForAddress(address) {
  return COMMANDS.map(({ name, command, bcc }) => ({
    name,
    buffer: buildRequestBuffer(address, command, bcc),
  }));
}
