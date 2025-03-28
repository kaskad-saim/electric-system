import { devicesConfig } from './deviceConfig.js';

function getRandomValue(min, max, decimals = 2) {
  return +(Math.random() * (max - min) + min).toFixed(decimals);
}

function generateSimulatedData() {
  return {
    voltageA: getRandomValue(210, 230),
    voltageB: getRandomValue(210, 230),
    voltageC: getRandomValue(210, 230),
    amperageA: getRandomValue(5, 10),
    amperageB: getRandomValue(5, 10),
    amperageC: getRandomValue(5, 10),
    powerActive: getRandomValue(1000, 2000),
    powerReactive: getRandomValue(500, 1000),
    timestamp: new Date(),
  };
}

export function startDeviceSimulator(modelsMap, callback) {
  const deviceKeys = Object.keys(devicesConfig);
  setInterval(async () => {
    for (const key of deviceKeys) {
      const data = generateSimulatedData();
      const model = modelsMap[key];
      if (model) {
        try {
          const newData = new model(data);
          await newData.save();
        } catch (err) {
          console.error(`Ошибка сохранения данных для ${key}: ${err.message}`);
        }
      } else {
        console.error(`Нет модели для устройства ${key}`);
      }
      callback(key, data);
    }
  }, 5000);
}
