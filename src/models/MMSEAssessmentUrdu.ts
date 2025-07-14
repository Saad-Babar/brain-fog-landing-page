import mongoose from 'mongoose';

const MMSEAssessmentUrduSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orientation: {
    yearAnswer: { type: String, default: '' },
    seasonAnswer: { type: String, default: '' },
    dateAnswer: { type: String, default: '' },
    dayAnswer: { type: String, default: '' },
    monthAnswer: { type: String, default: '' },
    stateAnswer: { type: String, default: '' },
    countryAnswer: { type: String, default: '' },
    hospitalAnswer: { type: String, default: '' },
    floorAnswer: { type: String, default: '' },
    cityAnswer: { type: String, default: '' },
    score: { type: Number, default: 0 }
  },
  registration: {
    wordsTyped: { type: String, default: '' },
    score: { type: Number, default: 0 }
  },
  attention: {
    useSubtraction: { type: Boolean, default: true },
    answers: [{ type: String, default: '' }],
    spellWorld: { type: String, default: '' },
    score: { type: Number, default: 0 }
  },
  recall: {
    word1: { type: String, default: '' },
    word2: { type: String, default: '' },
    word3: { type: String, default: '' },
    score: { type: Number, default: 0 }
  },
  language: {
    object1: {
      name: { type: String, default: '' },
      answer: { type: String, default: '' }
    },
    object2: {
      name: { type: String, default: '' },
      answer: { type: String, default: '' }
    },
    repetition: { type: String, default: '' },
    repetitionAudio: { type: String, default: '' }, // Base64 audio data
    command: { type: String, default: '' },
    reading: { type: String, default: '' },
    writing: { type: String, default: '' },
    copying: { type: String, default: '' },
    drawingImage: { type: String, default: '' }, // Base64 image data
    score: { type: Number, default: 0 }
  },
  totalScore: {
    type: Number,
    required: true,
    min: 0,
    max: 30
  },
  interpretation: {
    type: String,
    required: true,
    enum: ['نارمل', 'ذہنی کمزوری (مزید ٹیسٹ کی ضرورت)']
  },
  assessmentDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for efficient queries
MMSEAssessmentUrduSchema.index({ userId: 1, assessmentDate: -1 });

// Prevent duplicate model compilation
const MMSEAssessmentUrdu = mongoose.models.MMSEAssessmentUrdu || mongoose.model('MMSEAssessmentUrdu', MMSEAssessmentUrduSchema);

export default MMSEAssessmentUrdu; 