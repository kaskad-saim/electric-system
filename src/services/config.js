// Настройки устройств
export const devicesConfig = {
  ce303device1: {
    portSettings: {
      path: 'COM4',
      baudRate: 9600,
      dataBits: 7,
      parity: 'even',
      stopBits: 1,
      autoOpen: false,
    },
    requestBuffer: Buffer.from([
      0x2f, // '/'
      0x3f, // '?'
      0x31, // '1' Адрес устройства
      0x21, // '!'
      0x01, // SOH
      0x52, // 'R'
      0x31, // '1'
      0x02, // STX
      0x45, // 'E'
      0x54, // 'T'
      0x30, // '0'
      0x50, // 'P'
      0x45, // 'E'
      0x28, // '('
      0x29, // ')'
      0x03, // ETX
      0x37, // BCC
    ]),
  },
};