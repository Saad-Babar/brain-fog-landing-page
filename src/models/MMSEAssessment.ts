import mongoose from 'mongoose';

const mmseAssessmentSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Assessment data
  orientation: {
    yearAnswer: String,
    seasonAnswer: String,
    dateAnswer: String,
    dayAnswer: String,
    monthAnswer: String,
    stateAnswer: String,
    countryAnswer: String,
    hospitalAnswer: String,
    floorAnswer: String,
    cityAnswer: String,
    score: {
      type: Number,
      default: 0
    }
  },
  
  registration: {
    wordsTyped: String,
    score: {
      type: Number,
      default: 0
    }
  },
  
  attention: {
    useSubtraction: {
      type: Boolean,
      default: true
    },
    answers: [String],
    spellWorld: String,
    score: {
      type: Number,
      default: 0
    }
  },
  
  recall: {
    word1: String,
    word2: String,
    word3: String,
    score: {
      type: Number,
      default: 0
    }
  },
  
  language: {
    pencil: String,
    watch: String,
    repetition: String,
    command: String,
    reading: String,
    writing: String,
    copying: String,
    drawingImage: String, // Base64 image data from drawing canvas
    score: {
      type: Number,
      default: 0
    }
  },
  
  // Calculated scores
  totalScore: {
    type: Number,
    required: true
  },
  
  interpretation: {
    type: String,
    enum: ['Normal', 'Cognitive impairment'],
    required: true
  },
  
  // Assessment metadata
  assessmentDate: {
    type: Date,
    default: Date.now
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
mmseAssessmentSchema.index({ userId: 1, assessmentDate: -1 });
mmseAssessmentSchema.index({ totalScore: 1 });
mmseAssessmentSchema.index({ interpretation: 1 });

// Pre-save middleware to update timestamps
mmseAssessmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const MMSEAssessment = mongoose.models.MMSEAssessment || mongoose.model('MMSEAssessment', mmseAssessmentSchema);

export default MMSEAssessment; 