const Course = require('../models/Course');
const User = require('../models/User');

class EnhancedChatbotService {
  /**
   * Process natural language queries about courses
   */
  static async processNaturalLanguageQuery(message, userId) {
    try {
      const user = await User.findById(userId).populate('enrolledCourses.courseId');
      const query = message.toLowerCase();

      // Intent detection
      const intent = this.detectIntent(query);
      
      switch (intent.type) {
        case 'course_search':
          return await this.handleCourseSearch(query, intent.params, user);
        case 'schedule_query':
          return await this.handleScheduleQuery(query, intent.params, user);
        case 'prerequisite_check':
          return await this.handlePrerequisiteCheck(query, intent.params, user);
        case 'availability_check':
          return await this.handleAvailabilityCheck(query, intent.params, user);
        case 'recommendation_request':
          return await this.handleRecommendationRequest(query, intent.params, user);
        case 'workload_query':
          return await this.handleWorkloadQuery(query, intent.params, user);
        default:
          return await this.handleGeneralQuery(query, user);
      }
    } catch (error) {
      console.error('Error processing natural language query:', error);
      return {
        response: "I'm sorry, I encountered an error processing your request. Please try again or contact support.",
        type: 'error'
      };
    }
  }

  /**
   * Detect user intent from natural language
   */
  static detectIntent(query) {
    const intents = [
      {
        type: 'course_search',
        patterns: [
          /find.*courses?.*(?:in|for|about)\s+(\w+)/i,
          /what.*courses?.*available.*(?:in|for)\s+(\w+)/i,
          /show.*(?:me\s+)?(?:all\s+)?courses?.*(?:in|for)\s+(\w+)/i,
          /courses?.*(?:in|for)\s+(\w+)/i
        ],
        extract: (match) => ({ department: match[1] })
      },
      {
        type: 'schedule_query',
        patterns: [
          /(?:what|which).*courses?.*(?:morning|afternoon|evening)/i,
          /courses?.*(?:before|after)\s+(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)/i,
          /(?:no\s+)?classes?.*(?:before|after)\s+(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)/i,
          /courses?.*(?:mon|tue|wed|thu|fri|sat|sun)/i
        ],
        extract: (match) => ({ timePreference: match[1] || 'general' })
      },
      {
        type: 'prerequisite_check',
        patterns: [
          /(?:what|which).*prerequisites?.*(?:for|of)\s+([A-Z]{2,4}\d{3})/i,
          /can\s+i\s+take\s+([A-Z]{2,4}\d{3})/i,
          /prerequisites?.*([A-Z]{2,4}\d{3})/i,
          /requirements?.*(?:for|of)\s+([A-Z]{2,4}\d{3})/i
        ],
        extract: (match) => ({ courseCode: match[1] })
      },
      {
        type: 'availability_check',
        patterns: [
          /(?:is|are)\s+([A-Z]{2,4}\d{3}).*(?:available|open|full)/i,
          /(?:how\s+many\s+)?seats?.*(?:left|available|remaining).*([A-Z]{2,4}\d{3})/i,
          /([A-Z]{2,4}\d{3}).*(?:full|available|seats?)/i
        ],
        extract: (match) => ({ courseCode: match[1] })
      },
      {
        type: 'recommendation_request',
        patterns: [
          /recommend.*courses?/i,
          /what.*should.*i.*take/i,
          /suggest.*courses?/i,
          /good.*courses?.*(?:for|to)\s+(\w+)/i
        ],
        extract: (match) => ({ context: match[1] || 'general' })
      },
      {
        type: 'workload_query',
        patterns: [
          /how\s+many\s+(?:courses?|credits?)/i,
          /(?:current|my)\s+(?:course\s+)?load/i,
          /(?:total|how\s+many)\s+credits?/i,
          /am\s+i\s+(?:taking\s+)?(?:too\s+many|overloaded)/i
        ],
        extract: () => ({})
      }
    ];

    for (const intent of intents) {
      for (const pattern of intent.patterns) {
        const match = query.match(pattern);
        if (match) {
          return {
            type: intent.type,
            params: intent.extract(match),
            confidence: 0.8
          };
        }
      }
    }

    return { type: 'general', params: {}, confidence: 0.3 };
  }

  /**
   * Handle course search queries
   */
  static async handleCourseSearch(query, params, user) {
    const { department } = params;
    
    let searchCriteria = { isActive: true };
    if (department) {
      searchCriteria.department = new RegExp(department, 'i');
    }

    // Extract additional filters from query
    if (query.includes('beginner') || query.includes('intro')) {
      searchCriteria.difficulty = 'Beginner';
    } else if (query.includes('advanced')) {
      searchCriteria.difficulty = 'Advanced';
    }

    if (query.includes('morning')) {
      searchCriteria.schedule = /morning|am|10:00|11:00/i;
    } else if (query.includes('afternoon')) {
      searchCriteria.schedule = /afternoon|pm|1:00|2:00|3:00/i;
    }

    const courses = await Course.find(searchCriteria).limit(5);

    if (courses.length === 0) {
      return {
        response: `I couldn't find any courses matching "${department || 'your criteria'}". Would you like me to show you all available courses instead?`,
        type: 'no_results',
        suggestions: ['Show all courses', 'Recommend courses for me']
      };
    }

    const courseList = courses.map(course => 
      `• **${course.courseCode}** - ${course.title}\n  📅 ${course.schedule} | 👨‍🏫 ${course.instructor} | 📚 ${course.credits} credits\n  ${course.currentEnrollment}/${course.maxCapacity} enrolled`
    ).join('\n\n');

    return {
      response: `Here are the ${department ? department + ' ' : ''}courses I found:\n\n${courseList}\n\nWould you like more details about any of these courses?`,
      type: 'course_list',
      data: courses
    };
  }

  /**
   * Handle schedule-related queries
   */
  static async handleScheduleQuery(query, params, user) {
    const { timePreference } = params;
    
    let scheduleFilter = {};
    
    if (query.includes('morning') || query.includes('before 12')) {
      scheduleFilter.schedule = /(?:10:00|11:00).*am|morning/i;
    } else if (query.includes('afternoon')) {
      scheduleFilter.schedule = /(?:1:00|2:00|3:00).*pm|afternoon/i;
    } else if (query.includes('evening')) {
      scheduleFilter.schedule = /(?:4:00|5:00|6:00).*pm|evening/i;
    }

    // Check for specific days
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const mentionedDay = days.find(day => query.includes(day));
    if (mentionedDay) {
      scheduleFilter.schedule = new RegExp(mentionedDay.substring(0, 3), 'i');
    }

    const courses = await Course.find({ 
      isActive: true, 
      ...scheduleFilter 
    }).limit(5);

    if (courses.length === 0) {
      return {
        response: "I couldn't find courses matching your schedule preferences. Would you like to see all available courses with their schedules?",
        type: 'no_results'
      };
    }

    const courseList = courses.map(course => 
      `• **${course.courseCode}** - ${course.title}\n  📅 ${course.schedule} | 📚 ${course.credits} credits`
    ).join('\n\n');

    return {
      response: `Here are courses that match your schedule preferences:\n\n${courseList}`,
      type: 'schedule_results',
      data: courses
    };
  }

  /**
   * Handle prerequisite check queries
   */
  static async handlePrerequisiteCheck(query, params, user) {
    const { courseCode } = params;
    
    const course = await Course.findOne({ 
      courseCode: new RegExp(`^${courseCode}$`, 'i'),
      isActive: true 
    });

    if (!course) {
      return {
        response: `I couldn't find a course with code "${courseCode}". Could you double-check the course code?`,
        type: 'course_not_found'
      };
    }

    const userCompletedCourses = user.enrolledCourses
      .filter(enrollment => enrollment.status === 'completed')
      .map(enrollment => enrollment.courseId.courseCode);

    const userEnrolledCourses = user.enrolledCourses
      .filter(enrollment => enrollment.status === 'enrolled')
      .map(enrollment => enrollment.courseId.courseCode);

    if (!course.prerequisites || course.prerequisites.length === 0) {
      return {
        response: `Great news! **${course.courseCode} - ${course.title}** has no prerequisites. You can enroll directly!\n\n📅 ${course.schedule}\n👨‍🏫 ${course.instructor}\n📚 ${course.credits} credits`,
        type: 'no_prerequisites',
        data: course
      };
    }

    const missingPrereqs = course.prerequisites.filter(prereq => 
      !userCompletedCourses.includes(prereq) && !userEnrolledCourses.includes(prereq)
    );

    if (missingPrereqs.length === 0) {
      return {
        response: `✅ You meet all prerequisites for **${course.courseCode} - ${course.title}**!\n\nPrerequisites completed: ${course.prerequisites.join(', ')}\n\nYou can register for this course.`,
        type: 'prerequisites_met',
        data: course
      };
    }

    return {
      response: `For **${course.courseCode} - ${course.title}**, you need:\n\n**Missing Prerequisites:**\n${missingPrereqs.map(p => `• ${p}`).join('\n')}\n\n**Already Completed:**\n${course.prerequisites.filter(p => userCompletedCourses.includes(p)).map(p => `✅ ${p}`).join('\n') || 'None'}\n\nComplete the missing prerequisites first!`,
      type: 'prerequisites_missing',
      data: { course, missingPrereqs }
    };
  }

  /**
   * Handle availability check queries
   */
  static async handleAvailabilityCheck(query, params, user) {
    const { courseCode } = params;
    
    const course = await Course.findOne({ 
      courseCode: new RegExp(`^${courseCode}$`, 'i'),
      isActive: true 
    });

    if (!course) {
      return {
        response: `I couldn't find a course with code "${courseCode}". Could you check the course code?`,
        type: 'course_not_found'
      };
    }

    const availableSeats = course.maxCapacity - course.currentEnrollment;
    const enrollmentPercentage = Math.round((course.currentEnrollment / course.maxCapacity) * 100);

    let status = '';
    let emoji = '';
    
    if (availableSeats === 0) {
      status = 'Full - Waitlist Available';
      emoji = '🔴';
    } else if (availableSeats <= 3) {
      status = 'Almost Full - Register Soon!';
      emoji = '🟡';
    } else {
      status = 'Available';
      emoji = '🟢';
    }

    return {
      response: `${emoji} **${course.courseCode} - ${course.title}**\n\n**Status:** ${status}\n**Seats:** ${course.currentEnrollment}/${course.maxCapacity} (${enrollmentPercentage}% full)\n**Available:** ${availableSeats} seats\n\n📅 ${course.schedule}\n👨‍🏫 ${course.instructor}\n📚 ${course.credits} credits`,
      type: 'availability_info',
      data: { course, availableSeats, status }
    };
  }

  /**
   * Handle recommendation requests
   */
  static async handleRecommendationRequest(query, params, user) {
    // Use the AI recommendation service
    const AIRecommendationService = require('./aiRecommendationService');
    
    try {
      const recommendations = await AIRecommendationService.getPersonalizedRecommendations(user._id, 3);
      
      if (recommendations.length === 0) {
        return {
          response: "I don't have enough information about your academic history to make personalized recommendations. Please complete a few courses first!",
          type: 'insufficient_data'
        };
      }

      const recList = recommendations.map((course, index) => 
        `${index + 1}. **${course.courseCode} - ${course.title}** (${course.score}% match)\n   📅 ${course.schedule} | 📚 ${course.credits} credits\n   💡 ${course.reasons[0]}`
      ).join('\n\n');

      return {
        response: `Based on your academic profile, here are my top recommendations:\n\n${recList}\n\nWould you like more details about any of these courses?`,
        type: 'recommendations',
        data: recommendations
      };
    } catch (error) {
      return {
        response: "I'm having trouble generating personalized recommendations right now. Would you like to browse courses by department instead?",
        type: 'error'
      };
    }
  }

  /**
   * Handle workload queries
   */
  static async handleWorkloadQuery(query, params, user) {
    const enrolledCourses = user.enrolledCourses.filter(
      enrollment => enrollment.status === 'enrolled'
    );

    const totalCredits = enrolledCourses.reduce((sum, enrollment) => 
      sum + (enrollment.courseId.credits || 3), 0
    );

    const courseCount = enrolledCourses.length;
    let workloadAssessment = '';
    let recommendations = [];

    if (totalCredits === 0) {
      workloadAssessment = "You're not currently enrolled in any courses.";
      recommendations.push("Consider browsing our course catalog to find courses for next semester!");
    } else if (totalCredits < 12) {
      workloadAssessment = "Light course load - below full-time status.";
      recommendations.push("Consider adding more courses to reach full-time status (12+ credits)");
    } else if (totalCredits <= 15) {
      workloadAssessment = "Standard full-time course load.";
      recommendations.push("Good balance! You have room for one more course if interested.");
    } else if (totalCredits <= 18) {
      workloadAssessment = "Heavy but manageable course load.";
      recommendations.push("Monitor your performance - this is a challenging schedule.");
    } else {
      workloadAssessment = "Very heavy course load!";
      recommendations.push("Consider dropping a course to maintain academic performance.");
    }

    const courseList = enrolledCourses.map(enrollment => 
      `• ${enrollment.courseId.courseCode} - ${enrollment.courseId.credits || 3} credits`
    ).join('\n');

    return {
      response: `📚 **Your Current Course Load:**\n\n${courseList}\n\n**Total:** ${courseCount} courses, ${totalCredits} credits\n**Assessment:** ${workloadAssessment}\n\n💡 **Recommendation:** ${recommendations[0]}`,
      type: 'workload_info',
      data: { courseCount, totalCredits, workloadAssessment }
    };
  }

  /**
   * Handle general queries
   */
  static async handleGeneralQuery(query, user) {
    // Simple keyword matching for common questions
    if (query.includes('register') || query.includes('enroll')) {
      return {
        response: "To register for courses:\n1. Browse the course catalog\n2. Check prerequisites\n3. Click 'Register' on course details\n4. Confirm your registration\n\nNeed help finding specific courses? Just ask me!",
        type: 'help'
      };
    }

    if (query.includes('drop') || query.includes('withdraw')) {
      return {
        response: "To drop a course:\n1. Go to 'My Courses' in your dashboard\n2. Find the course you want to drop\n3. Click 'Drop Course'\n4. Confirm the action\n\nNote: Check the academic calendar for drop deadlines!",
        type: 'help'
      };
    }

    if (query.includes('schedule') || query.includes('timetable')) {
      return {
        response: "You can view your schedule in the 'My Courses' section of your dashboard. It shows all your enrolled courses with times and locations.\n\nWant me to help you find courses that fit specific time slots?",
        type: 'help'
      };
    }

    if (query.includes('gpa') || query.includes('grades')) {
      return {
        response: `Your current GPA is ${user.gpa || 'not available'}. You can view detailed grade information in your student profile.\n\nNeed course recommendations based on your GPA?`,
        type: 'info'
      };
    }

    // Default response with helpful suggestions
    return {
      response: "I can help you with:\n• Finding courses by department or schedule\n• Checking prerequisites and availability\n• Getting personalized course recommendations\n• Analyzing your current course load\n\nTry asking something like:\n- \"Show me computer science courses\"\n- \"What courses are available in the morning?\"\n- \"Can I take CS201?\"\n- \"Recommend courses for me\"",
      type: 'help',
      suggestions: [
        'Show me all courses',
        'Recommend courses for me',
        'What\'s my current course load?',
        'Find morning courses'
      ]
    };
  }

  static async logInteraction(userId, query, response, intent, sessionId, responseTime, metadata = {}) {
    try {
      const ChatbotLog = require('../models/ChatbotLog');
      
      const logEntry = new ChatbotLog({
        userId,
        query,
        response: response.response,
        intent: intent.type,
        confidence: intent.confidence,
        responseTime,
        sessionId: sessionId || `session_${Date.now()}_${userId}`,
        metadata: {
          timestamp: new Date(),
          ...metadata
        }
      });
      
      await logEntry.save();
      
      console.log('Chatbot interaction logged successfully');
    } catch (error) {
      console.error('Error logging chatbot interaction:', error);
    }
  }
}

module.exports = EnhancedChatbotService;
