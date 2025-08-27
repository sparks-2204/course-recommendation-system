import React, { useState, useEffect } from 'react';
import { aiAPI } from '../utils/api';
import { useNotification } from './NotificationSystem';

const AnomalyDetection = () => {
  const [anomalies, setAnomalies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('weekly');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchAnomalies();
  }, [timeframe]);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getAnomalyDetection(timeframe);
      setAnomalies(response.data.data);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      showNotification('Failed to fetch anomaly detection data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const renderAnomalyCard = (title, data, description) => {
    if (!data.detected) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
            {data.count} detected
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
        
        <div className="space-y-3">
          {data.details.slice(0, 5).map((detail, index) => (
            <div key={index} className={`p-3 rounded-lg ${getSeverityColor(detail.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getSeverityIcon(detail.severity)}</span>
                  <div>
                    {detail.courseCode && (
                      <div className="font-medium">
                        {detail.courseCode}: {detail.title}
                      </div>
                    )}
                    {detail.studentName && (
                      <div className="font-medium">Student: {detail.studentName}</div>
                    )}
                    {detail.type && (
                      <div className="text-sm opacity-75">Type: {detail.type}</div>
                    )}
                    {detail.description && (
                      <div className="text-sm">{detail.description}</div>
                    )}
                    {detail.enrollmentCount && (
                      <div className="text-sm">Enrollments: {detail.enrollmentCount}</div>
                    )}
                    {detail.hoursHeld && (
                      <div className="text-sm">Duration: {detail.hoursHeld} hours</div>
                    )}
                    {detail.spikePercentage && (
                      <div className="text-sm">Spike: {detail.spikePercentage}%</div>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(detail.severity)}`}>
                  {detail.severity}
                </span>
              </div>
            </div>
          ))}
          
          {data.details.length > 5 && (
            <div className="text-sm text-gray-500 text-center py-2">
              ... and {data.details.length - 5} more
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!anomalies) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No anomaly data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Registration Anomaly Detection
          </h2>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="daily">Last 24 Hours</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
          </select>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {anomalies.summary.totalAnomalies}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Total Anomalies</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {anomalies.summary.highSeverity}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">High Severity</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {anomalies.summary.mediumSeverity}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Medium Severity</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {anomalies.summary.categories.length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Categories Affected</div>
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date(anomalies.detectedAt).toLocaleString()}
        </div>
      </div>

      {/* Anomaly Categories */}
      {renderAnomalyCard(
        'Mass Registrations',
        anomalies.anomalies.massRegistrations,
        'Multiple students registering for the same course within a short time period'
      )}

      {renderAnomalyCard(
        'Rapid Course Drops',
        anomalies.anomalies.rapidDrops,
        'Students dropping courses shortly after registration'
      )}

      {renderAnomalyCard(
        'Unusual Time Patterns',
        anomalies.anomalies.unusualTimePatterns,
        'Registrations occurring at unusual hours (midnight to 6 AM)'
      )}

      {renderAnomalyCard(
        'Capacity Anomalies',
        anomalies.anomalies.capacityAnomalies,
        'Courses exceeding capacity or suspicious enrollment patterns'
      )}

      {renderAnomalyCard(
        'Suspicious User Behavior',
        anomalies.anomalies.suspiciousUserBehavior,
        'Students exhibiting unusual registration/drop patterns'
      )}

      {renderAnomalyCard(
        'Course Popularity Spikes',
        anomalies.anomalies.coursePopularitySpikes,
        'Sudden increases in course enrollment activity'
      )}

      {/* No Anomalies Message */}
      {anomalies.summary.totalAnomalies === 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            No Anomalies Detected
          </h3>
          <p className="text-green-600 dark:text-green-300">
            All registration patterns appear normal for the selected timeframe.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnomalyDetection;
