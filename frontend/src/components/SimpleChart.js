import React from 'react';

export const BarChart = ({ data, title, className = '' }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className={`card ${className}`}>
      <h3 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-sm font-medium text-secondary-600 dark:text-secondary-400 truncate">
              {item.label}
            </div>
            <div className="flex-1 relative">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="w-12 text-sm font-semibold text-secondary-800 dark:text-secondary-200 text-right">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PieChart = ({ data, title, className = '' }) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = [
    'bg-primary-500',
    'bg-secondary-500', 
    'bg-accent-500',
    'bg-success-500',
    'bg-warning-500',
    'bg-error-500'
  ];

  return (
    <div className={`card ${className}`}>
      <h3 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-4">{title}</h3>
      <div className="flex items-center space-x-6">
        {/* Simple visual representation */}
        <div className="flex-1 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                <span className="text-sm text-secondary-600 dark:text-secondary-400">{item.label}</span>
              </div>
              <div className="text-sm font-semibold text-secondary-800 dark:text-secondary-200">
                {item.value} ({Math.round((item.value / total) * 100)}%)
              </div>
            </div>
          ))}
        </div>
        
        {/* Simple donut representation */}
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-secondary-200 dark:text-secondary-700"
            />
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage * 2.51} ${251 - percentage * 2.51}`;
              const rotation = data.slice(0, index).reduce((acc, prev) => acc + (prev.value / total) * 251, 0);
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={-rotation}
                  className={`${colors[index % colors.length].replace('bg-', 'text-')}`}
                  stroke="currentColor"
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

export const LineChart = ({ data, title, className = '' }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue || 1;

  return (
    <div className={`card ${className}`}>
      <h3 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-4">{title}</h3>
      <div className="relative h-48 bg-secondary-50 dark:bg-slate-800 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 400 160">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * 40}
              x2="400"
              y2={i * 40}
              stroke="currentColor"
              strokeWidth="1"
              className="text-secondary-200 dark:text-secondary-600"
              opacity="0.3"
            />
          ))}
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-primary-500"
            points={data.map((item, index) => {
              const x = (index / (data.length - 1)) * 400;
              const y = 160 - ((item.value - minValue) / range) * 160;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 400;
            const y = 160 - ((item.value - minValue) / range) * 160;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="currentColor"
                className="text-primary-600"
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-secondary-500 dark:text-secondary-400">
          {data.map((item, index) => (
            <span key={index}>{item.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StatCard = ({ title, value, change, icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600 text-primary-600',
    success: 'from-success-500 to-success-600 text-success-600',
    warning: 'from-warning-500 to-warning-600 text-warning-600',
    error: 'from-error-500 to-error-600 text-error-600',
  };

  return (
    <div className="card hover-glow">
      <div className="flex items-center">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} bg-opacity-10 mr-4`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">{title}</p>
          <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${
              change.startsWith('+') ? 'text-success-600' : 'text-error-600'
            }`}>
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
