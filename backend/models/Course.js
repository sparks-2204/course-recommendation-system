const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  instructor: {
    type: String,
    required: true,
    trim: true
  },
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    room: {
      type: String,
      required: true
    }
  },
  semester: {
    type: String,
    required: true,
    enum: ['Fall', 'Spring', 'Summer']
  },
  year: {
    type: Number,
    required: true
  },
  maxCapacity: {
    type: Number,
    required: true,
    min: 1
  },
  currentEnrollment: {
    type: Number,
    default: 0
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['core', 'elective', 'major', 'general_education'],
    default: 'elective'
  },
  level: {
    type: String,
    enum: ['undergraduate', 'graduate'],
    default: 'undergraduate'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  enrolledStudents: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    }
  }],
  waitlist: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    waitlistedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient searching
courseSchema.index({ courseCode: 1, semester: 1, year: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ instructor: 1 });

// Check if course is full
courseSchema.methods.isFull = function() {
  return this.currentEnrollment >= this.maxCapacity;
};

// Check for schedule conflicts
courseSchema.methods.hasScheduleConflict = function(otherCourse) {
  // Check if days overlap
  const daysOverlap = this.schedule.days.some(day => 
    otherCourse.schedule.days.includes(day)
  );
  
  if (!daysOverlap) return false;
  
  // Check if times overlap
  const thisStart = this.schedule.startTime;
  const thisEnd = this.schedule.endTime;
  const otherStart = otherCourse.schedule.startTime;
  const otherEnd = otherCourse.schedule.endTime;
  
  return (thisStart < otherEnd && thisEnd > otherStart);
};

module.exports = mongoose.model('Course', courseSchema);
