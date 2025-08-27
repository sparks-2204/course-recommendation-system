const User = require('../models/User');
const Course = require('../models/Course');

class AnomalyDetectionService {
  
  /**
   * Detect various types of registration anomalies
   * @param {string} timeframe - 'daily', 'weekly', 'monthly'
   * @returns {Object} Anomaly detection results
   */
  static async detectRegistrationAnomalies(timeframe = 'weekly') {
    try {
      const timeRanges = this.getTimeRange(timeframe);
      
      const anomalies = {
        massRegistrations: await this.detectMassRegistrations(timeRanges),
        rapidDrops: await this.detectRapidDrops(timeRanges),
        unusualTimePatterns: await this.detectUnusualTimePatterns(timeRanges),
        capacityAnomalies: await this.detectCapacityAnomalies(),
        suspiciousUserBehavior: await this.detectSuspiciousUserBehavior(timeRanges),
        coursePopularitySpikes: await this.detectCoursePopularitySpikes(timeRanges)
      };

      return {
        success: true,
        timeframe,
        detectedAt: new Date(),
        summary: this.generateAnomalySummary(anomalies),
        anomalies
      };

    } catch (error) {
      console.error('Error detecting registration anomalies:', error);
      throw error;
    }
  }

  /**
   * Detect mass registrations (many students registering for same course quickly)
   */
  static async detectMassRegistrations(timeRanges) {
    try {
      const courses = await Course.find({
        'enrolledStudents.enrolledAt': {
          $gte: timeRanges.start,
          $lte: timeRanges.end
        }
      });

      const massRegistrations = [];

      for (const course of courses) {
        const recentEnrollments = course.enrolledStudents.filter(
          enrollment => enrollment.enrolledAt >= timeRanges.start && 
                       enrollment.enrolledAt <= timeRanges.end
        );

        // Flag if more than 10 students registered within 1 hour
        const hourlyGroups = this.groupByHour(recentEnrollments);
        
        for (const [hour, enrollments] of Object.entries(hourlyGroups)) {
          if (enrollments.length > 10) {
            massRegistrations.push({
              courseId: course._id,
              courseCode: course.courseCode,
              title: course.title,
              hour: new Date(parseInt(hour)),
              enrollmentCount: enrollments.length,
              severity: enrollments.length > 20 ? 'high' : 'medium',
              studentIds: enrollments.map(e => e.studentId)
            });
          }
        }
      }

      return {
        detected: massRegistrations.length > 0,
        count: massRegistrations.length,
        details: massRegistrations
      };

    } catch (error) {
      console.error('Error detecting mass registrations:', error);
      return { detected: false, count: 0, details: [], error: error.message };
    }
  }

  /**
   * Detect rapid course drops (students dropping courses shortly after registration)
   */
  static async detectRapidDrops(timeRanges) {
    try {
      const users = await User.find({
        role: 'student',
        'enrolledCourses.droppedAt': {
          $gte: timeRanges.start,
          $lte: timeRanges.end
        }
      });

      const rapidDrops = [];

      for (const user of users) {
        const recentDrops = user.enrolledCourses.filter(course => 
          course.droppedAt && 
          course.droppedAt >= timeRanges.start && 
          course.droppedAt <= timeRanges.end &&
          course.enrolledAt
        );

        for (const droppedCourse of recentDrops) {
          const timeDiff = droppedCourse.droppedAt - droppedCourse.enrolledAt;
          const hoursDiff = timeDiff / (1000 * 60 * 60);

          // Flag if dropped within 24 hours of registration
          if (hoursDiff < 24) {
            rapidDrops.push({
              studentId: user._id,
              studentName: user.name,
              courseId: droppedCourse.courseId,
              enrolledAt: droppedCourse.enrolledAt,
              droppedAt: droppedCourse.droppedAt,
              hoursHeld: Math.round(hoursDiff * 10) / 10,
              severity: hoursDiff < 1 ? 'high' : 'medium'
            });
          }
        }
      }

      return {
        detected: rapidDrops.length > 0,
        count: rapidDrops.length,
        details: rapidDrops
      };

    } catch (error) {
      console.error('Error detecting rapid drops:', error);
      return { detected: false, count: 0, details: [], error: error.message };
    }
  }

  /**
   * Detect unusual time patterns (registrations at odd hours)
   */
  static async detectUnusualTimePatterns(timeRanges) {
    try {
      const courses = await Course.find({
        'enrolledStudents.enrolledAt': {
          $gte: timeRanges.start,
          $lte: timeRanges.end
        }
      });

      const unusualPatterns = [];
      const hourlyStats = {};

      // Collect all enrollment times
      for (const course of courses) {
        const recentEnrollments = course.enrolledStudents.filter(
          enrollment => enrollment.enrolledAt >= timeRanges.start && 
                       enrollment.enrolledAt <= timeRanges.end
        );

        for (const enrollment of recentEnrollments) {
          const hour = enrollment.enrolledAt.getHours();
          hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
        }
      }

      // Flag unusual hours (midnight to 6 AM, assuming most registrations happen during day)
      const unusualHours = [0, 1, 2, 3, 4, 5];
      
      for (const hour of unusualHours) {
        if (hourlyStats[hour] && hourlyStats[hour] > 5) {
          unusualPatterns.push({
            hour,
            registrationCount: hourlyStats[hour],
            severity: hourlyStats[hour] > 15 ? 'high' : 'medium',
            description: `${hourlyStats[hour]} registrations between ${hour}:00-${hour + 1}:00`
          });
        }
      }

      return {
        detected: unusualPatterns.length > 0,
        count: unusualPatterns.length,
        hourlyDistribution: hourlyStats,
        details: unusualPatterns
      };

    } catch (error) {
      console.error('Error detecting unusual time patterns:', error);
      return { detected: false, count: 0, details: [], error: error.message };
    }
  }

  /**
   * Detect capacity anomalies (courses exceeding capacity or suspicious capacity changes)
   */
  static async detectCapacityAnomalies() {
    try {
      const courses = await Course.find({ isActive: true });
      const capacityAnomalies = [];

      for (const course of courses) {
        const enrolledCount = course.enrolledStudents.length;
        const capacity = course.capacity;

        // Over-enrollment
        if (enrolledCount > capacity) {
          capacityAnomalies.push({
            type: 'over_enrollment',
            courseId: course._id,
            courseCode: course.courseCode,
            title: course.title,
            capacity,
            enrolled: enrolledCount,
            overage: enrolledCount - capacity,
            severity: 'high'
          });
        }

        // Suspicious full enrollment (exactly at capacity, might indicate manipulation)
        if (enrolledCount === capacity && capacity > 50) {
          capacityAnomalies.push({
            type: 'suspicious_full_enrollment',
            courseId: course._id,
            courseCode: course.courseCode,
            title: course.title,
            capacity,
            enrolled: enrolledCount,
            severity: 'medium'
          });
        }
      }

      return {
        detected: capacityAnomalies.length > 0,
        count: capacityAnomalies.length,
        details: capacityAnomalies
      };

    } catch (error) {
      console.error('Error detecting capacity anomalies:', error);
      return { detected: false, count: 0, details: [], error: error.message };
    }
  }

  /**
   * Detect suspicious user behavior patterns
   */
  static async detectSuspiciousUserBehavior(timeRanges) {
    try {
      const users = await User.find({ role: 'student' });
      const suspiciousBehavior = [];

      for (const user of users) {
        const recentActivity = user.enrolledCourses.filter(course => 
          course.enrolledAt >= timeRanges.start && course.enrolledAt <= timeRanges.end
        );

        // Too many registrations in short time
        if (recentActivity.length > 10) {
          suspiciousBehavior.push({
            type: 'excessive_registrations',
            studentId: user._id,
            studentName: user.name,
            registrationCount: recentActivity.length,
            severity: recentActivity.length > 20 ? 'high' : 'medium'
          });
        }

        // Rapid registration/drop cycles
        const dropCount = recentActivity.filter(course => course.droppedAt).length;
        if (dropCount > 5) {
          suspiciousBehavior.push({
            type: 'excessive_drops',
            studentId: user._id,
            studentName: user.name,
            dropCount,
            registrationCount: recentActivity.length,
            severity: 'medium'
          });
        }
      }

      return {
        detected: suspiciousBehavior.length > 0,
        count: suspiciousBehavior.length,
        details: suspiciousBehavior
      };

    } catch (error) {
      console.error('Error detecting suspicious user behavior:', error);
      return { detected: false, count: 0, details: [], error: error.message };
    }
  }

  /**
   * Detect sudden spikes in course popularity
   */
  static async detectCoursePopularitySpikes(timeRanges) {
    try {
      const courses = await Course.find({ isActive: true });
      const popularitySpikes = [];

      for (const course of courses) {
        const recentEnrollments = course.enrolledStudents.filter(
          enrollment => enrollment.enrolledAt >= timeRanges.start && 
                       enrollment.enrolledAt <= timeRanges.end
        );

        const totalEnrollments = course.enrolledStudents.length;
        const recentCount = recentEnrollments.length;

        // If recent enrollments are more than 50% of total enrollments, it's a spike
        if (totalEnrollments > 0 && (recentCount / totalEnrollments) > 0.5 && recentCount > 5) {
          popularitySpikes.push({
            courseId: course._id,
            courseCode: course.courseCode,
            title: course.title,
            totalEnrollments,
            recentEnrollments: recentCount,
            spikePercentage: Math.round((recentCount / totalEnrollments) * 100),
            severity: (recentCount / totalEnrollments) > 0.8 ? 'high' : 'medium'
          });
        }
      }

      return {
        detected: popularitySpikes.length > 0,
        count: popularitySpikes.length,
        details: popularitySpikes
      };

    } catch (error) {
      console.error('Error detecting course popularity spikes:', error);
      return { detected: false, count: 0, details: [], error: error.message };
    }
  }

  /**
   * Helper method to get time range based on timeframe
   */
  static getTimeRange(timeframe) {
    const now = new Date();
    let start;

    switch (timeframe) {
      case 'daily':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return { start, end: now };
  }

  /**
   * Group enrollments by hour
   */
  static groupByHour(enrollments) {
    const groups = {};
    
    for (const enrollment of enrollments) {
      const hourKey = new Date(enrollment.enrolledAt.getFullYear(), 
                              enrollment.enrolledAt.getMonth(), 
                              enrollment.enrolledAt.getDate(), 
                              enrollment.enrolledAt.getHours()).getTime();
      
      if (!groups[hourKey]) {
        groups[hourKey] = [];
      }
      groups[hourKey].push(enrollment);
    }

    return groups;
  }

  /**
   * Generate summary of all detected anomalies
   */
  static generateAnomalySummary(anomalies) {
    const summary = {
      totalAnomalies: 0,
      highSeverity: 0,
      mediumSeverity: 0,
      categories: []
    };

    for (const [category, data] of Object.entries(anomalies)) {
      if (data.detected) {
        summary.totalAnomalies += data.count;
        summary.categories.push(category);

        // Count severity levels
        if (data.details) {
          for (const detail of data.details) {
            if (detail.severity === 'high') {
              summary.highSeverity++;
            } else if (detail.severity === 'medium') {
              summary.mediumSeverity++;
            }
          }
        }
      }
    }

    return summary;
  }
}

module.exports = AnomalyDetectionService;
