import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

/**
 * Props for the ScholarshipCardSkeleton component
 */
interface ScholarshipCardSkeletonProps {
  /** Index for staggered animation delay */
  index?: number;
}

/**
 * Skeleton loading component for scholarship cards
 * Displays an animated placeholder while scholarship data is loading
 * @param props - Component props
 * @returns Animated skeleton card component
 */
export default function ScholarshipCardSkeleton({ index = 0 }: ScholarshipCardSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className="bg-card rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-card">
        <div className="flex">
          {/* Image Skeleton */}
          <div className="w-32 h-32 bg-muted-foreground shrink-0 overflow-hidden">
            <Skeleton className="w-full h-full rounded-none bg-muted-foreground" />
          </div>

          {/* Info Skeleton */}
          <div className="flex-1 px-4 py-2">
            {/* Title Skeleton */}
            <Skeleton className="h-6 w-full mb-1 bg-muted-foreground" />
            
            {/* Badges Skeleton */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Skeleton className="h-5 w-20 bg-muted-foreground rounded" />
              <Skeleton className="h-5 w-16 bg-muted-foreground rounded" />
            </div>

            {/* Sponsor and Deadline Skeleton */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full bg-muted-foreground" />
                <Skeleton className="h-3 w-24 bg-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded bg-muted-foreground" />
                <Skeleton className="h-3 w-32 bg-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Amount and Slots Skeleton */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* Amount Card Skeleton */}
          <div className="bg-[#F9FAFB] border border-border rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Skeleton className="w-4 h-4 rounded bg-muted-foreground" />
              <Skeleton className="h-3 w-12 bg-muted-foreground" />
            </div>
            <Skeleton className="h-5 w-20 mb-1 bg-muted-foreground" />
            <Skeleton className="h-3 w-16 bg-muted-foreground" />
          </div>

          {/* Slots Card Skeleton */}
          <div className="bg-[#F9FAFB] border border-border rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Skeleton className="w-4 h-4 rounded bg-muted-foreground" />
              <Skeleton className="h-3 w-10 bg-muted-foreground" />
            </div>
            <Skeleton className="h-5 w-12 mb-1 bg-muted-foreground" />
            <Skeleton className="h-3 w-16 bg-muted-foreground" />
          </div>
        </div>

        {/* Criteria and Documents Skeleton */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          {/* Criteria Skeleton */}
          <div>
            <Skeleton className="h-3 w-16 mb-2 bg-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded bg-muted-foreground" />
              <Skeleton className="h-6 w-20 rounded bg-muted-foreground" />
              <Skeleton className="h-6 w-20 rounded bg-muted-foreground" />
            </div>
          </div>

          {/* Required Documents Skeleton */}
          <div>
            <Skeleton className="h-3 w-28 mb-2 bg-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24 rounded bg-muted-foreground" />
              <Skeleton className="h-6 w-28 rounded bg-muted-foreground" />
              <Skeleton className="h-6 w-20 rounded bg-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}