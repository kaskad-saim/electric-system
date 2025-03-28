// Функция для формирования буфера запроса.
// Принимает:
// - address: строковое представление адреса (например, "190138453")
// - command: строку команды, например "VOLTA", "CURRE", "POWEP", "POWEQ"
// - bcc: числовое значение контрольной суммы
function buildRequestBuffer(address, command, bcc) {
  const prefix = [0x2f, 0x3f]; // '/', '?'
  const addressBuffer = Array.from(address).map((ch) => ch.charCodeAt(0));
  const header = [0x21, 0x01, 0x52, 0x31, 0x02]; // '!', SOH, 'R', '1', STX
  const commandBuffer = Array.from(command).map((ch) => ch.charCodeAt(0));
  const suffix = [0x28, 0x29, 0x03]; // '(', ')', ETX
  const fullBuffer = [...prefix, ...addressBuffer, ...header, ...commandBuffer, ...suffix, bcc];
  return Buffer.from(fullBuffer);
}

export const devicesConfig = {
  ce303device1: {
    portSettings: {
      path: 'COM30',
      baudRate: 9600,
      dataBits: 7,
      parity: 'even',
      stopBits: 1,
      autoOpen: false,
    },
    address: '190138453',
    pollOptions: {
      responseTimeout: 1000,
      pollRetryAttempts: 3,
    },
    requests: [
      {
        name: 'voltage',
        buffer: buildRequestBuffer('190138453', 'VOLTA', 0x5f),
      },
      {
        name: 'amperage',
        buffer: buildRequestBuffer('190138453', 'CURRE', 0x5a),
      },
      {
        name: 'powerActive',
        buffer: buildRequestBuffer('190138453', 'POWEP', 0x64),
      },
      {
        name: 'powerReactive',
        buffer: buildRequestBuffer('190138453', 'POWEQ', 0x65),
      },
    ],
  },
  ce303device2: {
    portSettings: {
      path: 'COM21',
      baudRate: 9600,
      dataBits: 7,
      parity: 'even',
      stopBits: 1,
      autoOpen: false,
    },
    address: '190138455',
    pollOptions: {
      responseTimeout: 500,
      pollRetryAttempts: 3,
    },
    requests: [
      {
        name: 'voltage',
        buffer: buildRequestBuffer('190138455', 'VOLTA', 0x5f),
      },
      {
        name: 'amperage',
        buffer: buildRequestBuffer('190138455', 'CURRE', 0x5a),
      },
      {
        name: 'powerActive',
        buffer: buildRequestBuffer('190138455', 'POWEP', 0x64),
      },
      {
        name: 'powerReactive',
        buffer: buildRequestBuffer('190138455', 'POWEQ', 0x65),
      },
    ],
  },
};
