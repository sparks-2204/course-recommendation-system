import React from 'react';

export const CardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card animate-pulse">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-6 bg-secondary-200 rounded-lg w-48"></div>
                <div className="h-4 bg-secondary-200 rounded-lg w-32"></div>
              </div>
              <div className="h-4 bg-secondary-200 rounded-lg w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-secondary-200 rounded-lg w-full"></div>
              <div className="h-4 bg-secondary-200 rounded-lg w-3/4"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-secondary-200 rounded-lg w-40"></div>
              <div className="h-4 bg-secondary-200 rounded-lg w-36"></div>
              <div className="h-4 bg-secondary-200 rounded-lg w-32"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-6 bg-secondary-200 rounded-full w-16"></div>
              <div className="h-6 bg-secondary-200 rounded-full w-20"></div>
            </div>
            <div className="h-10 bg-secondary-200 rounded-xl w-full"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="card">
      <div className="space-y-4">
        <div className="h-6 bg-secondary-200 rounded-lg w-48"></div>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={`h-4 bg-secondary-200 rounded-lg ${
                    colIndex === 0 ? 'w-32' : colIndex === 1 ? 'w-24' : 'w-20'
                  }`}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StatCardSkeleton = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card animate-pulse">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-secondary-200 w-12 h-12"></div>
            <div className="ml-4 space-y-2">
              <div className="h-4 bg-secondary-200 rounded-lg w-24"></div>
              <div className="h-8 bg-secondary-200 rounded-lg w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export const ScheduleSkeleton = () => {
  return (
    <div className="card">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-secondary-200 rounded-lg w-32"></div>
          <div className="h-8 bg-secondary-200 rounded-lg w-24"></div>
        </div>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-6 gap-2 min-w-full">
            <div className="h-8 bg-secondary-200 rounded-lg"></div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-8 bg-secondary-200 rounded-lg"></div>
            ))}
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <div className="h-12 bg-secondary-200 rounded-lg"></div>
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <div key={colIndex} className="h-12 bg-secondary-100 rounded-lg"></div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ChatSkeleton = () => {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div className={`max-w-xs p-3 rounded-lg animate-pulse ${
            index % 2 === 0 ? 'bg-secondary-200' : 'bg-primary-200'
          }`}>
            <div className="space-y-2">
              <div className="h-4 bg-current opacity-20 rounded w-32"></div>
              <div className="h-4 bg-current opacity-20 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ListSkeleton = ({ items = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg animate-pulse">
          <div className="w-10 h-10 bg-secondary-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
            <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
          </div>
          <div className="h-4 bg-secondary-200 rounded w-16"></div>
        </div>
      ))}
    </div>
  );
};
