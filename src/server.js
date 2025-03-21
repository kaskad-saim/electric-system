import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import mongoose from 'mongoose';
import { startDevicePolling } from './services/deviceService.js';
import ce303device1Model from './models/ce303device1Model.js'; // Импортируем модель

// Настройка Express.js
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware для обслуживания статических файлов из папки public
const __dirname = path.resolve(); // Получаем корневую директорию проекта
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к MongoDB
const MONGO_URI = 'mongodb://localhost:27017/electric-system'; // Замените на ваш URI
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Подключено к MongoDB'))
  .catch((err) => console.error('Ошибка подключения к MongoDB:', err.message));

// Запуск опроса устройства и отправка данных через Socket.IO
startDevicePolling(async (data) => {
  console.log('Полученные данные от устройства:', data);

  // Сохраняем данные в MongoDB
  try {
    const newData = new ce303device1Model(data); // Используем новую модель
    await newData.save();
    console.log('Данные успешно сохранены в MongoDB');
  } catch (err) {
    console.error('Ошибка сохранения данных в MongoDB:', err.message);
  }

  // Отправляем данные через Socket.IO
  io.emit('deviceData', data);
});

// Запуск сервера
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
