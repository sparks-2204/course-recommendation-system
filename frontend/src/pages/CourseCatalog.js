import React, { useState, useEffect } from 'react';
import { courseAPI } from '../utils/api';
import CourseCard from '../components/CourseCard';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    semester: 'Fall',
    year: new Date().getFullYear()
  });

  const departments = [
    'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'History', 'Psychology', 'Economics', 'Business'
  ];

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getCourses(filters);
      setCourses(response.data.courses);
    } catch (error) {
      setError('Failed to load courses');
      console.error('Courses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      department: '',
      semester: 'Fall',
      year: new Date().getFullYear()
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Course Catalog</h1>
        <p className="text-secondary-600 mt-2">
          Browse and register for available courses
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-secondary-700 mb-1">
              Search Courses
            </label>
            <input
              type="text"
              id="search"
              name="search"
              placeholder="Course code, title, or instructor..."
              className="input-field"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-secondary-700 mb-1">
              Department
            </label>
            <select
              id="department"
              name="department"
              className="input-field"
              value={filters.department}
              onChange={handleFilterChange}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-secondary-700 mb-1">
              Semester
            </label>
            <select
              id="semester"
              name="semester"
              className="input-field"
              value={filters.semester}
              onChange={handleFilterChange}
            >
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
            </select>
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-secondary-700 mb-1">
              Year
            </label>
            <select
              id="year"
              name="year"
              className="input-field"
              value={filters.year}
              onChange={handleFilterChange}
            >
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-secondary-600">
            {courses.length} course{courses.length !== 1 ? 's' : ''} found
          </p>
          <button
            onClick={clearFilters}
            className="btn-secondary text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {/* Course Grid */}
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-secondary-900">No courses found</h3>
              <p className="mt-1 text-sm text-secondary-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onUpdate={fetchCourses}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseCatalog;
