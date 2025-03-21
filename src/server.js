import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { startDevicePolling } from './services/deviceService.js';

// Настройка Express.js
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware для обслуживания статических файлов из папки public
const __dirname = path.resolve(); // Получаем корневую директорию проекта
app.use(express.static(path.join(__dirname, 'public')));

// Запуск опроса устройства и отправка данных через Socket.IO
startDevicePolling((data) => {
  console.log('Полученные данные от устройства:');
  console.log(`Total: ${data.total}`);
  console.log(`T1: ${data.t1}`);
  console.log(`T2: ${data.t2}`);
  console.log(`T3: ${data.t3}`);
  console.log(`T4: ${data.t4}`);

  // Отправляем данные через Socket.IO
  io.emit('deviceData', data);
});

// Запуск сервера
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});