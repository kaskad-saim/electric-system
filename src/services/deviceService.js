import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { devicesConfig } from './config.js';

// Выбираем устройство для опроса
const deviceConfig = devicesConfig.ce303device1;

// Настройка SerialPort
const port = new SerialPort(deviceConfig.portSettings);

console.log('Сформированный запрос (hex):', deviceConfig.requestBuffer);

let responseLines = [];
let lastProcessedIndex = 0;
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

parser.on('data', (line) => {
  const trimmed = line.trim();
  responseLines.push(trimmed);
});

port.on('error', (err) => {
  console.error('Ошибка:', err.message);
});

function processResponse() {
  if (lastProcessedIndex >= responseLines.length) {
    console.log('Нет новых ответов для обработки.');
    return null;
  }

  const newResponses = responseLines.slice(lastProcessedIndex);
  lastProcessedIndex = responseLines.length;
  const fullResponse = newResponses.join(' ');

  const regex = /\(([^)]+)\)/g;
  let match;
  const values = [];
  while ((match = regex.exec(fullResponse)) !== null) {
    const num = parseFloat(match[1]);
    values.push(num);
  }

  // Проверяем, что у нас есть все 5 значений
  if (values.length < 5) {
    console.error('Недостаточно данных для обработки.');
    return null;
  }

  // Создаем объект с осмысленными именами
  const result = {
    total: values[0],
    t1: values[1],
    t2: values[2],
    t3: values[3],
    t4: values[4],
  };

  console.log('Обработанные данные:', result);
  return result;
}

function pollDevice(callback) {
  port.write(deviceConfig.requestBuffer, (err) => {
    if (err) {
      console.error('Ошибка отправки запроса:', err.message);
      return;
    }
  });

  setTimeout(() => {
    const processedData = processResponse();
    if (processedData && callback) {
      callback(processedData);
    }
  }, 1000);
}

export function startDevicePolling(callback) {
  port.open((err) => {
    if (err) {
      return console.error('Ошибка открытия порта:', err.message);
    }
    console.log('Порт успешно открыт.');
    pollDevice(callback);
    setInterval(() => pollDevice(callback), 5000); // Опрашивать каждые 5 секунд
  });
}