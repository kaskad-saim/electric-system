import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { devicesConfig } from './deviceConfig.js';
import { parseResponse } from '../utils/responseParser.js';
import logger from '../logger.js';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class PortManager {
  constructor(portSettings, devices, modelsMap) {
    this.portSettings = portSettings;
    this.devices = devices;
    this.modelsMap = modelsMap;
    this.port = new SerialPort(portSettings);
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));
    this.responseLines = [];

    this.parser.on('data', (line) => {
      this.responseLines.push(line.trim());
    });

    this.port.on('error', (err) => {
      logger.error(`Ошибка работы с портом ${portSettings.path}: ${err.message}`);
    });

    // Статус каждого устройства: online или offline, а также время последней попытки
    this.deviceStatus = {};
    for (const { key } of devices) {
      this.deviceStatus[key] = {
        online: true,
        lastAttempt: 0,
      };
    }
  }

  async init() {
    this.port.open((err) => {
      if (err) {
        logger.error(`Ошибка открытия порта ${this.portSettings.path}: ${err.message}`);
        return;
      }
      console.log(`Порт ${this.portSettings.path} успешно открыт`);
    });
    await sleep(1000);
    void this.pollDevicesCycle();
  }

  // Извлекает числовые значения из накопленных ответов и очищает буфер
  processResponse() {
    const responses = this.responseLines.slice();
    this.responseLines = [];
    const fullResponse = responses.join(' ');
    const regex = /\(([^)]+)\)/g;
    let match;
    const values = [];
    while ((match = regex.exec(fullResponse)) !== null) {
      const num = parseFloat(match[1]);
      values.push(num);
    }
    return values;
  }

  // Опрос одного устройства: отправляем его запросы и собираем результаты.
  async pollDevice(deviceKey, deviceConfig) {
    const requests = deviceConfig.requests;
    const results = {};
    let anyData = false;
    const pollOptions = deviceConfig.pollOptions || {};
    const responseTimeout = pollOptions.responseTimeout || 500;
    const pollRetryAttempts = pollOptions.pollRetryAttempts || 3;

    for (const req of requests) {
      let attempt = 0;
      let responseData = [];
      while (attempt < pollRetryAttempts) {
        this.responseLines = [];
        await new Promise((resolve) => {
          this.port.write(req.buffer, (err) => {
            if (err) {
              logger.error(
                `Ошибка отправки запроса "${req.name}" для ${deviceKey}: ${err.message}`
              );
              return resolve();
            }
            setTimeout(() => {
              responseData = this.processResponse();
              resolve();
            }, responseTimeout);
          });
        });
        if (responseData && responseData.length > 0) {
          anyData = true;
          Object.assign(results, parseResponse(req.name, responseData));
          break;
        }
        attempt++;
      }
    }
    return anyData ? { success: true, results } : { success: false };
  }

  // Цикл последовательного опроса устройств на данном порту.
  async pollDevicesCycle() {
    const ONLINE_INTERVAL = 5 * 1000;
    const OFFLINE_INTERVAL = 1000;

    while (true) {
      for (const { key, config } of this.devices) {
        const status = this.deviceStatus[key];
        const RECONNECT_INTERVAL = 120 * 1000; // интервал для переподключения

        if (status.online) {
          const pollResult = await this.pollDevice(key, config);
          if (pollResult.success) {
            await this.saveData(key, pollResult.results);
            status.lastAttempt = Date.now();
            await sleep(ONLINE_INTERVAL);
          } else {
            console.warn(`Устройство ${key} не отвечает. Помечаем как offline.`);
            status.online = false;
            status.lastAttempt = Date.now();
            await sleep(OFFLINE_INTERVAL);
          }
        } else {
          // Устройство в offline-режиме. Проверяем, пора ли делать повторную попытку
          const now = Date.now();
          if (now - status.lastAttempt >= RECONNECT_INTERVAL) {
            console.log(`Пробуем переподключить устройство ${key}...`);
            const pollResult = await this.pollDevice(key, config);
            if (pollResult.success) {
              console.log(`Устройство ${key} снова online.`);
              status.online = true;
              status.lastAttempt = now;
              await this.saveData(key, pollResult.results);
            } else {
              console.warn(`Устройство ${key} все еще offline.`);
              status.lastAttempt = now;
            }
          }
          // Между проверками offline-устройства тоже ставим короткий интервал, чтобы часто не крутить цикл
          await sleep(OFFLINE_INTERVAL);
        }
      }
    }
  }

  // Сохраняет данные в БД через соответствующую Mongoose-модель
  async saveData(deviceKey, data) {
    if (!data) return;
    const model = this.modelsMap[deviceKey];
    if (!model) {
      logger.error(`Нет модели для устройства ${deviceKey}`);
      return;
    }
    try {
      const newData = new model(data);
      await newData.save();
      console.log(deviceKey, data); // Вывод данных в консоль
    } catch (err) {
      logger.error(`Ошибка сохранения данных для ${deviceKey}: ${err.message}`);
    }
  }
}

class UniversalDeviceManager {
  constructor(modelsMap) {
    this.modelsMap = modelsMap;
    this.portManagers = {};
  }

  async init() {
    const devicesByPort = {};
    for (const deviceKey in devicesConfig) {
      const device = devicesConfig[deviceKey];
      const portPath = device.portSettings.path;
      if (!devicesByPort[portPath]) {
        devicesByPort[portPath] = [];
      }
      devicesByPort[portPath].push({ key: deviceKey, config: device });
    }
    for (const portPath in devicesByPort) {
      const devices = devicesByPort[portPath];
      const portSettings = devices[0].config.portSettings;
      const portManager = new PortManager(portSettings, devices, this.modelsMap);
      this.portManagers[portPath] = portManager;
      await portManager.init();
    }
  }
}

export default UniversalDeviceManager;
