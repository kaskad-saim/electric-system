import mongoose from 'mongoose';

const ce303device2Schema = new mongoose.Schema({
  voltageA: { type: Number},
  voltageB: { type: Number },
  voltageC: { type: Number },
  amperageA: { type: Number},
  amperageB: { type: Number },
  amperageC: { type: Number},
  powerActive: {type: Number},
  powerReactive: {type: Number},
  timestamp: { type: Date, default: Date.now, index: true },
});

const CE303device2Model = mongoose.model('ce303device2', ce303device2Schema);

export default CE303device2Model;