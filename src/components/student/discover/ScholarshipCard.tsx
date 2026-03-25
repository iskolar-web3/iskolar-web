import { Calendar, Users, Coins, UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateAmountPerScholar, formatCurrency, formatDate } from '@/utils/formatting.utils';
import type { Scholarship } from '@/lib/scholarship/model';
import { getSponsorName } from '@/lib/sponsor/api';

/**
 * Props for the ScholarshipCard component (student view)
 */
export interface ScholarshipCardProps {
  /** Scholarship data to display */
  scholarship: Scholarship;
  /** Index for staggered animation delay */
  index: number;
  /** Optional callback when card is clicked */
  onClick?: () => void;
}

/**
 * Scholarship card component for student view
 * Displays scholarship information with animations and interactive hover effects
 * @param props - Component props
 * @returns Animated scholarship card component
 */
export default function ScholarshipCard({ scholarship, index, onClick }: ScholarshipCardProps) {
  const amountPerScholar = calculateAmountPerScholar(scholarship.totalAmount, scholarship.totalSlots);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        scale: 0.99,
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
      className="bg-card cursor-pointer rounded-lg overflow-hidden border border-[#D3DCF6] hover:border-[#3A52A6] transition-colors"
    >
      {/* Header */}
      <div className="bg-[#3A52A6]">
        <div className="flex">
          {/* Image */}
          <motion.div 
            transition={{ duration: 0.3 }}
            className="w-32 h-32 bg-white/10 flex-shrink-0 overflow-hidden"
          >
            <img
              src={scholarship.imageUrl || "/logo.jpg"}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Info */}
          <div className="flex-1 text-tertiary px-4 py-2">
            <h3 className="text-xl mb-1 line-clamp-1">{scholarship.name}</h3>
            
            {/* Badges */}
            <div className="flex gap-2 mb-3">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 + 0.1 }}
                className="px-2 py-0.5 bg-white/90 text-secondary text-[10px] md:text-[11px] rounded"
              >
                {scholarship.scholarshipType.name}
              </motion.span>
            </div>

            {/* Sponsor and Deadline */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-card flex items-center justify-center flex-shrink-0">
                  {scholarship?.sponsor?.avatarUrl ? (
                    <img
                      src={scholarship?.sponsor?.avatarUrl}
                      alt={getSponsorName(scholarship.sponsor)}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-full h-full text-secondary" />
                  )}
                </div>
                <span>{getSponsorName(scholarship.sponsor)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatDate(scholarship.applicationDeadline)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Amount and Slots */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <motion.div
            transition={{ duration: 0.2 }}
            className="bg-[#F9FAFB] border border-border rounded-lg p-3"
          >
            <div className="flex items-center gap-1.5 text-[#6B7280] text-xs mb-1">
              <Coins size={16} />
              <span>Amount</span>
            </div>
            <p className="text-sm md:text-base text-primary">
              {amountPerScholar !== null
                ? formatCurrency(amountPerScholar, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '₱0.00'}
            </p>
            <p className="text-xs text-[#6B7280]">per scholar</p>
          </motion.div>

          <motion.div
            transition={{ duration: 0.2 }}
            className="bg-[#F9FAFB] border border-border rounded-lg p-3"
          >
            <div className="flex items-center gap-1.5 text-[#6B7280] text-xs mb-1">
              <Users size={16} />
              <span>Slots</span>
            </div>
            <p className="text-sm md:text-base text-primary">{scholarship.totalSlots}</p>
            <p className="text-xs text-[#6B7280]">scholars</p>
          </motion.div>
        </div>

        {/* Criteria and Documents */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="text-[#6B7280] text-xs tracking-wide mb-2">
              Criteria
            </h4>
            <div className="flex flex-wrap gap-2">
              {scholarship.criterias.slice(0, 2).map((item, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-[#F9FAFB] text-[#374151] text-[10px] md:text-[11px] rounded border border-border"
                >
                  {item}
                </span>
              ))}
              {scholarship.criterias.length > 2 && (
                <span className="px-2.5 py-1 bg-[#F9FAFB] text-[#374151] text-[10px] md:text-[11px] rounded border border-border">
                  + {scholarship.criterias.length - 2} more
                </span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-[#6B7280] text-xs tracking-wider mb-2">
              Required Documents
            </h4>
            <div className="flex flex-wrap gap-2">
              {scholarship.requirements.slice(0, 2).map((item, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-[#F9FAFB] text-[#374151] text-[10px] md:text-[11px] rounded border border-border"
                >
                  {item}
                </span>
              ))}
              {scholarship.requirements.length > 2 && (
                <span className="px-2.5 py-1 bg-[#F9FAFB] text-[#374151] text-[10px] md:text-[11px] rounded border border-border">
                  + {scholarship.requirements.length - 2} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
