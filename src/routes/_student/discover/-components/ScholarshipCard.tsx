import { Calendar, Users, Coins, UserIcon, LockKeyhole } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '@/utils/formatting.utils';
import { ScholarshipType, type Scholarship } from '@/lib/scholarship/model';
import { getSponsorName } from '@/lib/sponsor/api';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

/**
 * Props for the ScholarshipCard component (student view)
 */
export interface ScholarshipCardProps {
  /** Scholarship data to display */
  scholarship: Scholarship;
  /** Index for staggered animation delay */
  index: number;
  /** Whether the student has a verified identity */
  isVerified?: boolean;
  /** Optional callback when card is clicked */
  onClick?: () => void;
}

/**
 * Scholarship card component for student view
 * Displays scholarship information with animations and interactive hover effects
 * @param props - Component props
 * @returns Animated scholarship card component
 */
export default function ScholarshipCard({ scholarship, index, onClick, isVerified = true }: ScholarshipCardProps) {
  const navigate = useNavigate();
  const isRange = scholarship.totalAmountMin != null || scholarship.totalAmountMax != null;
  const isFixed = !isRange && scholarship.totalAmount != null;
  const isVaries = !isRange && !isFixed;
  const applyDisabled = !isVerified;

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ to: `/scholarship/${scholarship.id}/apply` });
  };

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
      className="bg-card cursor-pointer rounded-md overflow-hidden border border-[#D3DCF6] hover:border-[#3A52A6] transition-colors"
    >
      {/* Header */}
      <div style={{ backgroundColor: scholarship.cardColor ?? "#3A52A6" }}>
        <div className="flex">
          {/* Image */}
          <motion.div
            transition={{ duration: 0.3 }}
            className="w-32 h-32 bg-white/10 shrink-0 overflow-hidden"
          >
            <img
              src={scholarship.imageUrl || "/scholarship-banner-placeholder.png"}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Info */}
          <div className="flex-1 text-tertiary px-4 py-2">
            <h3 className="text-xl mb-1 line-clamp-1">{scholarship.name}</h3>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {scholarship.scholarshipType.code === ScholarshipType.Combined ? (
                <>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                    className="px-2 py-0.5 bg-white/90 text-secondary text-[10px] md:text-[11px] rounded"
                  >
                    Merit-Based
                  </motion.span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 + 0.15 }}
                    className="px-2 py-0.5 bg-white/90 text-secondary text-[10px] md:text-[11px] rounded"
                  >
                    Need-Based
                  </motion.span>
                </>
              ) : (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                  className="px-2 py-0.5 bg-white/90 text-secondary text-[10px] md:text-[11px] rounded"
                >
                  {scholarship.scholarshipType.name}
                </motion.span>
              )}
            </div>

            {/* Sponsor and Deadline */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-card flex items-center justify-center shrink-0">
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
            {isFixed && (<><p className="text-sm md:text-base text-primary">{formatCurrency(scholarship.totalAmount!, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p><p className="text-xs text-[#6B7280]">per scholar</p></>)}
            {isRange && (<><p className="text-sm md:text-base text-primary">{formatCurrency(scholarship.totalAmountMin ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{" – "}{formatCurrency(scholarship.totalAmountMax ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p><p className="text-xs text-[#6B7280]">per scholar</p></>)}
            {isVaries && (<><p className="text-sm md:text-base text-primary">Varies</p><p className="text-xs text-[#6B7280]">see details</p></>)}
          </motion.div>

          <motion.div
            transition={{ duration: 0.2 }}
            className="bg-[#F9FAFB] border border-border rounded-lg p-3"
          >
            <div className="flex items-center gap-1.5 text-[#6B7280] text-xs mb-1">
              <Users size={16} />
              <span>Slots</span>
            </div>
            <p className="text-sm md:text-base text-primary">{scholarship.totalSlots ?? "No limit"}</p>
            <p className="text-xs text-[#6B7280]">scholars</p>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.2 }}
          >
            <Button
              variant="outline"
              size="default"
              onClick={onClick}
              className="w-full text-xs md:text-sm border-[#3A52A6] text-[#3A52A6] hover:bg-[#3A52A6] hover:text-white cursor-pointer"
            >
              View Details
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.25 }}
          >
            <span title={applyDisabled ? "Verify your identity to apply" : undefined}>
              <Button
                size="default"
                onClick={handleApplyClick}
                disabled={applyDisabled}
                className="w-full text-xs md:text-sm bg-[#3A52A6] text-white hover:bg-[#2f4389] cursor-pointer"
              >
                {applyDisabled ? (
                  <><LockKeyhole className="w-3 h-3" /> Apply Now</>
                ) : (
                  "Apply Now"
                )}
              </Button>
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
