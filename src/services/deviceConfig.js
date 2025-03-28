import { buildRequestsForAddress } from '../utils/buildRequests.js';

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
    requests: buildRequestsForAddress('190138453'),
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
    requests: buildRequestsForAddress('190138455'),
  },
};
