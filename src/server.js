import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import UniversalDeviceManager from './services/DeviceManager.js';
import { startDeviceSimulator } from './services/deviceSimulator.js';
import { connectDB, modelsMap } from './services/dataBaseConfig.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));

void connectDB();

const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'development') {
  console.log('Запуск в тестовой среде');
  startDeviceSimulator(modelsMap, (deviceKey, data) => {
    io.emit('deviceData', { deviceKey, data });
  });
} else if (NODE_ENV === 'production') {
  console.log('Запуск в рабочей среде');
  const deviceManager = new UniversalDeviceManager(modelsMap);
  void deviceManager.init();
}

io.on('connection', (socket) => {
  console.log('Клиент подключился');
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
