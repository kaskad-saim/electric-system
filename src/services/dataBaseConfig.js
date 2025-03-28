import mongoose from 'mongoose';
import CE303device1Model from '../models/ce303device1Model.js';
import CE303device2Model from '../models/ce303device2Model.js';

const mongoURI = 'mongodb://127.0.0.1:27017/electric-system';
export const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Подключено к MongoDB');
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
  }
};

export const modelsMap = {
  ce303device1: CE303device1Model,
  ce303device2: CE303device2Model,
};
