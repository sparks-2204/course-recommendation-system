const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    console.log('Cleared existing data...');

    // Create sample users
    const users = [
      {
        name: 'John Student',
        email: 'john.student@university.edu',
        password: 'password123',
        role: 'student',
        major: 'Computer Science',
        year: 'junior',
        gpa: 3.5,
        studentId: 'CS2021001'
      },
      {
        name: 'Jane Faculty',
        email: 'jane.faculty@university.edu',
        password: 'password123',
        role: 'faculty'
      },
      {
        name: 'Admin User',
        email: 'admin@university.edu',
        password: 'password123',
        role: 'admin'
      },
      {
        name: 'Alice Johnson',
        email: 'alice@demo.com',
        password: 'password123',
        role: 'student',
        major: 'Mathematics',
        year: 'sophomore',
        gpa: 3.8
      },
      {
        name: 'Bob Wilson',
        email: 'bob@demo.com',
        password: 'password123',
        role: 'student',
        major: 'Physics',
        year: 'senior',
        gpa: 3.2
      }
    ];

    const createdUsers = await User.create(users);
    console.log('Created sample users...');

    // Create sample courses
    const courses = [
      {
        courseCode: 'CS101',
        title: 'Introduction to Computer Science',
        description: 'Fundamental concepts of computer science including programming basics, algorithms, and data structures.',
        credits: 3,
        department: 'Computer Science',
        instructor: 'Dr. Smith',
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          startTime: '09:00',
          endTime: '10:00',
          room: 'CS-101'
        },
        semester: 'Fall',
        year: 2024,
        maxCapacity: 30,
        prerequisites: [],
        category: 'core',
        level: 'undergraduate'
      },
      {
        courseCode: 'CS201',
        title: 'Data Structures and Algorithms',
        description: 'Advanced study of data structures, algorithm design, and complexity analysis.',
        credits: 4,
        department: 'Computer Science',
        instructor: 'Dr. Johnson',
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '11:00',
          endTime: '12:30',
          room: 'CS-201'
        },
        semester: 'Fall',
        year: 2024,
        maxCapacity: 25,
        prerequisites: ['CS101'],
        category: 'major',
        level: 'undergraduate'
      },
      {
        courseCode: 'MATH101',
        title: 'Calculus I',
        description: 'Introduction to differential and integral calculus with applications.',
        credits: 4,
        department: 'Mathematics',
        instructor: 'Prof. Davis',
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          startTime: '10:00',
          endTime: '11:00',
          room: 'MATH-101'
        },
        semester: 'Fall',
        year: 2024,
        maxCapacity: 40,
        prerequisites: [],
        category: 'core',
        level: 'undergraduate'
      },
      {
        courseCode: 'PHYS101',
        title: 'General Physics I',
        description: 'Mechanics, thermodynamics, and wave motion with laboratory component.',
        credits: 4,
        department: 'Physics',
        instructor: 'Dr. Brown',
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '14:00',
          endTime: '15:30',
          room: 'PHYS-101'
        },
        semester: 'Fall',
        year: 2024,
        maxCapacity: 35,
        prerequisites: ['MATH101'],
        category: 'core',
        level: 'undergraduate'
      },
      {
        courseCode: 'ENG101',
        title: 'English Composition',
        description: 'Development of writing skills through practice in various forms of composition.',
        credits: 3,
        department: 'English',
        instructor: 'Prof. Wilson',
        schedule: {
          days: ['Monday', 'Wednesday'],
          startTime: '13:00',
          endTime: '14:30',
          room: 'ENG-101'
        },
        semester: 'Fall',
        year: 2024,
        maxCapacity: 25,
        prerequisites: [],
        category: 'general_education',
        level: 'undergraduate'
      },
      {
        courseCode: 'HIST101',
        title: 'World History',
        description: 'Survey of world civilizations from ancient times to the present.',
        credits: 3,
        department: 'History',
        instructor: 'Dr. Taylor',
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '09:00',
          endTime: '10:30',
          room: 'HIST-101'
        },
        semester: 'Fall',
        year: 2024,
        maxCapacity: 30,
        prerequisites: [],
        category: 'general_education',
        level: 'undergraduate'
      },
      {
        courseCode: 'CS301',
        title: 'Database Systems',
        description: 'Design and implementation of database systems, SQL, and database administration.',
        credits: 3,
        department: 'Computer Science',
        instructor: 'Dr. Anderson',
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          startTime: '15:00',
          endTime: '16:00',
          room: 'CS-301'
        },
        semester: 'Fall',
        year: 2024,
        maxCapacity: 20,
        prerequisites: ['CS201'],
        category: 'major',
        level: 'undergraduate'
      },
      {
        courseCode: 'PSYC101',
        title: 'Introduction to Psychology',
        description: 'Basic principles of human behavior, learning, memory, and cognition.',
        credits: 3,
        department: 'Psychology',
        instructor: 'Dr. Martinez',
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '16:00',
          endTime: '17:30',
          room: 'PSYC-101'
        },
        semester: 'Fall',
        year: 2024,
        maxCapacity: 35,
        prerequisites: [],
        category: 'elective',
        level: 'undergraduate'
      }
    ];

    const createdCourses = await Course.create(courses);
    console.log('Created sample courses...');

    // Enroll some students in courses
    const student1 = createdUsers.find(u => u.email === 'student@demo.com');
    const student2 = createdUsers.find(u => u.email === 'alice@demo.com');
    const student3 = createdUsers.find(u => u.email === 'bob@demo.com');

    // Enroll student1 in CS101, MATH101, ENG101
    const cs101 = createdCourses.find(c => c.courseCode === 'CS101');
    const math101 = createdCourses.find(c => c.courseCode === 'MATH101');
    const eng101 = createdCourses.find(c => c.courseCode === 'ENG101');

    // Update course enrollments
    cs101.enrolledStudents.push({ studentId: student1._id });
    cs101.currentEnrollment = 1;
    math101.enrolledStudents.push({ studentId: student1._id });
    math101.currentEnrollment = 1;
    eng101.enrolledStudents.push({ studentId: student1._id });
    eng101.currentEnrollment = 1;

    // Update student enrollments
    student1.enrolledCourses.push(
      { courseId: cs101._id, status: 'enrolled' },
      { courseId: math101._id, status: 'enrolled' },
      { courseId: eng101._id, status: 'enrolled' }
    );

    // Enroll student2 in MATH101, PHYS101
    math101.enrolledStudents.push({ studentId: student2._id });
    math101.currentEnrollment = 2;
    const phys101 = createdCourses.find(c => c.courseCode === 'PHYS101');
    phys101.enrolledStudents.push({ studentId: student2._id });
    phys101.currentEnrollment = 1;

    student2.enrolledCourses.push(
      { courseId: math101._id, status: 'enrolled' },
      { courseId: phys101._id, status: 'enrolled' }
    );

    // Save updated data
    await Promise.all([
      cs101.save(),
      math101.save(),
      eng101.save(),
      phys101.save(),
      student1.save(),
      student2.save()
    ]);

    console.log('Sample enrollments created...');
    console.log('\n=== SAMPLE DATA CREATED ===');
    console.log('Demo accounts:');
    console.log('Student: student@demo.com / password123');
    console.log('Faculty: faculty@demo.com / password123');
    console.log('Admin: admin@demo.com / password123');
    console.log('\nAdditional students:');
    console.log('Alice: alice@demo.com / password123');
    console.log('Bob: bob@demo.com / password123');
    console.log('\nDatabase seeded successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding
connectDB().then(() => {
  seedData();
});
