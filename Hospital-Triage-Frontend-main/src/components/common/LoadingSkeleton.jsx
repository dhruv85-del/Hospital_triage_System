import React from 'react';

export function LoadingSkeleton({ className = '', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gradient-to-r from-canvas-subtle via-white to-canvas-subtle rounded-2xl ${className}`}
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="double-bezel-outer">
      <div className="double-bezel-inner space-y-4">
        <div className="flex items-center justify-between">
          <LoadingSkeleton className="h-6 w-24 rounded-full" />
          <LoadingSkeleton className="h-6 w-16 rounded-full" />
        </div>
        <LoadingSkeleton className="h-8 w-3/4 rounded-xl" />
        <LoadingSkeleton className="h-4 w-1/2 rounded-lg" />
        <div className="pt-4 border-t border-border/50 flex justify-between">
          <LoadingSkeleton className="h-5 w-20 rounded-md" />
          <LoadingSkeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}
