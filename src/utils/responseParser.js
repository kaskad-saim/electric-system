export function parseResponse(requestName, responseData) {
  switch (requestName) {
    case 'voltage':
      return {
        voltageA: responseData[0],
        voltageB: responseData[1],
        voltageC: responseData[2],
      };
    case 'amperage':
      return {
        amperageA: responseData[0],
        amperageB: responseData[1],
        amperageC: responseData[2],
      };
    case 'powerActive':
      return { powerActive: responseData[0] };
    case 'powerReactive':
      return { powerReactive: responseData[0] };
    default:
      return {};
  }
}
