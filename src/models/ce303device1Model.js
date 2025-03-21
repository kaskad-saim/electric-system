import mongoose from 'mongoose';

// Определение схемы данных
const ce303device1Schema = new mongoose.Schema({
  total: { type: Number, required: true },
  t1: { type: Number, required: true },
  t2: { type: Number, required: true },
  t3: { type: Number, required: true },
  t4: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }, // Добавляем временную метку
});

// Создаем модель
const ce303device1Model = mongoose.model('ce303device1', ce303device1Schema);

export default ce303device1Model;