import mongoose, { Schema, models } from 'mongoose';

const SharedMmsSchema = new Schema({
  assessmentId: { type: Schema.Types.ObjectId, required: true },
  doctorId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  patientId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  language: { type: String, enum: ['English', 'Urdu'], required: true },
  sharedAt: { type: Date, default: Date.now }
});

export default models.SharedMMSE || mongoose.model('SharedMMSE', SharedMmsSchema); 