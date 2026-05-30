import { Calendar, Users, Coins, UserIcon, LockKeyhole } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { formatCurrency, formatDate } from '@/utils/formatting.utils';
import { ScholarshipStatus, ScholarshipType, type Scholarship } from '@/lib/scholarship/model';
import { getSponsorName } from '@/lib/sponsor/api';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { isLightColor } from '@/routes/_sponsor/create/-components/fields/CardColorPicker';

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
  const isClosed = scholarship.status.code === ScholarshipStatus.Closed;
  const applyDisabled = !isVerified || isClosed;
  const cardColor = scholarship.cardColor ?? "#3A52A6";
  const isLight = isLightColor(cardColor);
  const headerTextColor = isLight ? "#111827" : undefined;
  const onHoverTextColor = isLight ? "#111827" : "white";
  const [cardHovered, setCardHovered] = useState(false);
  const [viewHovered, setViewHovered] = useState(false);
  const [applyHovered, setApplyHovered] = useState(false);

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
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
      className="bg-card cursor-pointer rounded-md overflow-hidden border transition-colors"
      style={{ borderColor: cardHovered ? cardColor : "#D3DCF6" }}
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
          <div className="flex-1 text-tertiary px-4 py-2" style={{ color: headerTextColor }}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-xl line-clamp-1">{scholarship.name}</h3>
              {scholarship.applicationCount > 0 && (
                <div className="flex items-center gap-1 shrink-0 bg-white/20 rounded px-2 py-0.5 text-[11px] whitespace-nowrap">
                  <Users size={11} />
                  <span>{scholarship.applicationCount} {scholarship.applicationCount === 1 ? "applicant" : "applicants"}</span>
                </div>
              )}
            </div>

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
              className="w-full text-xs md:text-sm cursor-pointer"
              onMouseEnter={() => setViewHovered(true)}
              onMouseLeave={() => setViewHovered(false)}
              style={{
                borderColor: cardColor,
                color: viewHovered ? onHoverTextColor : cardColor,
                backgroundColor: viewHovered ? cardColor : "transparent",
              }}
            >
              View Details
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.25 }}
          >
            <span title={isClosed ? "This scholarship is no longer accepting applications" : !isVerified ? "Verify your identity to apply" : undefined}>
              <Button
                size="default"
                onClick={handleApplyClick}
                disabled={applyDisabled}
                className="w-full text-xs md:text-sm cursor-pointer"
                onMouseEnter={() => setApplyHovered(true)}
                onMouseLeave={() => setApplyHovered(false)}
                style={{
                  backgroundColor: applyDisabled ? undefined : cardColor,
                  color: applyDisabled ? undefined : onHoverTextColor,
                  filter: applyHovered && !applyDisabled ? "brightness(0.88)" : "none",
                }}
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
