import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
    <Skeleton className="h-52 w-full !rounded-none" />
    <div className="p-6 flex-1 flex flex-col gap-3">
      <Skeleton className="h-4 w-24 rounded-full mb-1" />
      <Skeleton className="h-7 w-3/4 mb-1" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="mt-auto pt-2">
         <Skeleton className="h-4 w-20" />
      </div>
    </div>
  </div>
);

export const AppCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5">
    <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
    <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-6 w-16 rounded-md mt-1" />
    </div>
  </div>
);

export const GameCardSkeleton: React.FC = () => (
  <div className="relative rounded-3xl overflow-hidden aspect-[16/9] shadow-sm bg-gray-200 dark:bg-gray-800">
    <Skeleton className="w-full h-full" />
    <div className="absolute bottom-0 right-0 p-8 w-full z-10 space-y-3">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

export const DetailSkeleton: React.FC = () => (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-32" />
      </div>
      
      <Skeleton className="h-10 w-3/4 mb-4" />
      <div className="flex gap-4 mb-8">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>

      <Skeleton className="w-full h-[400px] rounded-2xl mb-8" />

      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
);
