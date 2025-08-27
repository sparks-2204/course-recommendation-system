const Course = require('../models/Course');
const User = require('../models/User');

class AIRecommendationService {
  /**
   * Generate personalized course recommendations based on student's academic profile
   */
  static async getPersonalizedRecommendations(userId, limit = 5) {
    try {
      const student = await User.findById(userId).populate('enrolledCourses.courseId');
      if (!student || student.role !== 'student') {
        throw new Error('Student not found');
      }

      const allCourses = await Course.find({ isActive: true });
      const enrolledCourseIds = student.enrolledCourses
        .filter(enrollment => enrollment.status === 'enrolled')
        .map(enrollment => enrollment.courseId._id.toString());

      // Filter out already enrolled courses
      const availableCourses = allCourses.filter(
        course => !enrolledCourseIds.includes(course._id.toString())
      );

      // Calculate recommendation scores
      const scoredCourses = availableCourses.map(course => ({
        ...course.toObject(),
        score: this.calculateRecommendationScore(course, student),
        reasons: this.getRecommendationReasons(course, student)
      }));

      // Sort by score and return top recommendations
      return scoredCourses
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      throw error;
    }
  }

  /**
   * Calculate recommendation score based on multiple factors
   */
  static calculateRecommendationScore(course, student) {
    let score = 0;

    // Base score for all courses
    score += 50;

    // Major alignment (highest weight)
    if (course.department === student.major) {
      score += 40;
    } else if (this.isRelatedMajor(course.department, student.major)) {
      score += 20;
    }

    // GPA-based scoring
    const gpa = student.gpa || 0;
    if (gpa >= 3.5) {
      // High GPA students can handle advanced courses
      if (course.difficulty === 'Advanced' || course.courseCode.includes('3') || course.courseCode.includes('4')) {
        score += 25;
      }
    } else if (gpa >= 2.5) {
      // Average GPA students should focus on intermediate courses
      if (course.difficulty === 'Intermediate' || course.courseCode.includes('2')) {
        score += 20;
      }
    } else {
      // Lower GPA students should take foundational courses
      if (course.difficulty === 'Beginner' || course.courseCode.includes('1')) {
        score += 30;
      }
    }

    // Prerequisites satisfaction
    if (this.hasPrerequisites(course, student)) {
      score += 15;
    } else if (course.prerequisites && course.prerequisites.length > 0) {
      score -= 20; // Penalize if prerequisites not met
    }

    // Course popularity and success rate
    const enrollmentRatio = course.currentEnrollment / course.maxCapacity;
    if (enrollmentRatio > 0.3 && enrollmentRatio < 0.8) {
      score += 10; // Sweet spot for class size
    }

    // Year-based recommendations
    if (student.year === 'Freshman' && course.courseCode.includes('1')) {
      score += 15;
    } else if (student.year === 'Sophomore' && course.courseCode.includes('2')) {
      score += 15;
    } else if (student.year === 'Junior' && course.courseCode.includes('3')) {
      score += 15;
    } else if (student.year === 'Senior' && course.courseCode.includes('4')) {
      score += 15;
    }

    // Time preference (if available)
    if (student.preferences && student.preferences.timeSlots) {
      if (student.preferences.timeSlots.includes(course.schedule)) {
        score += 10;
      }
    }

    return Math.max(0, Math.min(100, score)); // Clamp between 0-100
  }

  /**
   * Generate human-readable reasons for recommendation
   */
  static getRecommendationReasons(course, student) {
    const reasons = [];

    if (course.department === student.major) {
      reasons.push(`Perfect match for your ${student.major} major`);
    }

    const gpa = student.gpa || 0;
    if (gpa >= 3.5 && (course.difficulty === 'Advanced' || course.courseCode.includes('3'))) {
      reasons.push(`Your strong GPA (${gpa}) makes you ready for this advanced course`);
    } else if (gpa < 2.5 && course.courseCode.includes('1')) {
      reasons.push('Foundational course to strengthen your academic base');
    }

    if (this.hasPrerequisites(course, student)) {
      reasons.push('You meet all prerequisites');
    }

    if (student.year === 'Freshman' && course.courseCode.includes('1')) {
      reasons.push('Ideal for first-year students');
    } else if (student.year === 'Senior' && course.courseCode.includes('4')) {
      reasons.push('Advanced course suitable for senior year');
    }

    const enrollmentRatio = course.currentEnrollment / course.maxCapacity;
    if (enrollmentRatio < 0.5) {
      reasons.push('Good availability - register soon!');
    } else if (enrollmentRatio > 0.8) {
      reasons.push('Popular course - limited seats remaining');
    }

    return reasons.length > 0 ? reasons : ['Recommended based on your academic profile'];
  }

  /**
   * Check if student has completed prerequisites
   */
  static hasPrerequisites(course, student) {
    if (!course.prerequisites || course.prerequisites.length === 0) {
      return true;
    }

    const completedCourses = student.enrolledCourses
      .filter(enrollment => enrollment.status === 'completed')
      .map(enrollment => enrollment.courseId.courseCode);

    return course.prerequisites.every(prereq => 
      completedCourses.includes(prereq) || 
      student.enrolledCourses.some(enrollment => 
        enrollment.courseId.courseCode === prereq && enrollment.status === 'enrolled'
      )
    );
  }

  /**
   * Check if departments are related
   */
  static isRelatedMajor(courseDept, studentMajor) {
    const relatedMajors = {
      'Computer Science': ['Mathematics', 'Engineering', 'Physics'],
      'Mathematics': ['Computer Science', 'Physics', 'Engineering'],
      'Engineering': ['Mathematics', 'Physics', 'Computer Science'],
      'Physics': ['Mathematics', 'Engineering', 'Computer Science'],
      'Business': ['Economics', 'Accounting', 'Marketing'],
      'Economics': ['Business', 'Mathematics', 'Statistics']
    };

    return relatedMajors[studentMajor]?.includes(courseDept) || false;
  }

  /**
   * Analyze schedule conflicts and suggest optimal timing
   */
  static async analyzeScheduleOptimization(userId, potentialCourses) {
    try {
      const student = await User.findById(userId).populate('enrolledCourses.courseId');
      const enrolledSchedules = student.enrolledCourses
        .filter(enrollment => enrollment.status === 'enrolled')
        .map(enrollment => enrollment.courseId.schedule)
        .filter(Boolean);

      const optimizedSuggestions = potentialCourses.map(course => {
        const conflicts = this.detectScheduleConflicts(course.schedule, enrolledSchedules);
        const workloadImpact = this.calculateWorkloadImpact(course, student);
        
        return {
          ...course,
          hasConflicts: conflicts.length > 0,
          conflicts,
          workloadImpact,
          optimizationScore: this.calculateOptimizationScore(course, student, conflicts, workloadImpact)
        };
      });

      return optimizedSuggestions.sort((a, b) => b.optimizationScore - a.optimizationScore);

    } catch (error) {
      console.error('Error analyzing schedule optimization:', error);
      throw error;
    }
  }

  /**
   * Detect time conflicts between courses
   */
  static detectScheduleConflicts(newSchedule, existingSchedules) {
    const conflicts = [];
    
    if (!newSchedule) return conflicts;

    existingSchedules.forEach(existing => {
      if (existing && this.hasTimeOverlap(newSchedule, existing)) {
        conflicts.push(existing);
      }
    });

    return conflicts;
  }

  /**
   * Check if two schedules overlap
   */
  static hasTimeOverlap(schedule1, schedule2) {
    // Simple overlap detection - can be enhanced with proper time parsing
    const days1 = this.extractDays(schedule1);
    const days2 = this.extractDays(schedule2);
    
    const commonDays = days1.filter(day => days2.includes(day));
    return commonDays.length > 0;
  }

  /**
   * Extract days from schedule string
   */
  static extractDays(schedule) {
    const dayMap = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return dayMap.filter(day => schedule.includes(day));
  }

  /**
   * Calculate workload impact of adding a course
   */
  static calculateWorkloadImpact(course, student) {
    const currentCredits = student.enrolledCourses
      .filter(enrollment => enrollment.status === 'enrolled')
      .reduce((sum, enrollment) => sum + (enrollment.courseId.credits || 3), 0);

    const newTotalCredits = currentCredits + (course.credits || 3);
    
    let impact = 'Low';
    if (newTotalCredits > 18) {
      impact = 'High';
    } else if (newTotalCredits > 15) {
      impact = 'Medium';
    }

    return {
      impact,
      currentCredits,
      newTotalCredits,
      recommendation: this.getWorkloadRecommendation(newTotalCredits, student.gpa)
    };
  }

  /**
   * Get workload recommendation based on credits and GPA
   */
  static getWorkloadRecommendation(totalCredits, gpa) {
    if (totalCredits > 18) {
      return gpa >= 3.5 ? 
        'Heavy load but manageable with your strong GPA' : 
        'Consider reducing course load for better academic performance';
    } else if (totalCredits > 15) {
      return 'Standard full-time course load';
    } else {
      return 'Light course load - consider adding another course';
    }
  }

  /**
   * Calculate optimization score for schedule suggestions
   */
  static calculateOptimizationScore(course, student, conflicts, workloadImpact) {
    let score = 100;

    // Penalize conflicts heavily
    score -= conflicts.length * 30;

    // Adjust for workload
    if (workloadImpact.impact === 'High') {
      score -= 20;
    } else if (workloadImpact.impact === 'Low') {
      score -= 5;
    }

    // Bonus for optimal credit hours (15-16)
    if (workloadImpact.newTotalCredits >= 15 && workloadImpact.newTotalCredits <= 16) {
      score += 10;
    }

    return Math.max(0, score);
  }
}

module.exports = AIRecommendationService;
