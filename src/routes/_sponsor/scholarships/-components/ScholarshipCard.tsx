import { Calendar, Users, Coins, Edit2, Trash2, UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { formatCurrency } from '@/utils/formatting.utils';
import { ScholarshipType, type Scholarship } from '@/lib/scholarship/model';
import { getSponsorName } from '@/lib/sponsor/api';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

/**
 * Props for the ScholarshipCard component (sponsor view)
 */
export interface ScholarshipCardProps {
  /** Scholarship data to display */
  scholarship: Scholarship;
  /** Index for staggered animation delay */
  index: number;
  /** Optional callback when card is clicked */
  onClick?: () => void;
  /** Optional callback when edit is selected */
  onEdit?: (scholarship: Scholarship) => void;
  /** Optional callback when delete is selected */
  onDelete?: (scholarship: Scholarship) => void;
  /** Optional callback when view applicants is selected */
  onViewApplicants?: (scholarship: Scholarship) => void;
}

/**
 * Scholarship card component for sponsor view
 * Displays scholarship information with context menu for actions (edit, delete, view applicants)
 * @param props - Component props
 * @returns Animated scholarship card with context menu
 */
export default function ScholarshipCard({
  scholarship,
  index,
  onClick,
  onEdit,
  onDelete,
  onViewApplicants
}: ScholarshipCardProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const isRange = scholarship.totalAmountMin != null || scholarship.totalAmountMax != null;
  const isFixed = !isRange && scholarship.totalAmount != null;
  const isVaries = !isRange && !isFixed;

  /**
   * Handles right-click context menu
   * @param e - Mouse event
   */
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setContextMenuPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setShowContextMenu(true);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContextMenu]);

  /**
   * Handles edit action from context menu
   * @param e - Mouse event
   */
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowContextMenu(false);
    onEdit?.(scholarship);
  };

  /**
   * Handles delete action from context menu
   * @param e - Mouse event
   */
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowContextMenu(false);
    onDelete?.(scholarship);
  };

  /**
   * Handles view applicants action from context menu
   * @param e - Mouse event
   */
  const handleViewApplicants = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowContextMenu(false);
    onViewApplicants?.(scholarship);
  };

  return (
    <motion.div
      ref={cardRef}
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
      onContextMenu={handleContextMenu}
      className="bg-white cursor-pointer rounded-md border border-border hover:border-[#3A52A6] transition-colors relative shadow-sm"
    >
      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <motion.div
            ref={contextMenuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'absolute',
              left: `${contextMenuPosition.x}px`,
              top: `${contextMenuPosition.y}px`,
              zIndex: 100,
            }}
            className="bg-white rounded-lg shadow-xl border border-border py-1 min-w-40"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleViewApplicants}
              className="w-full px-4 py-2 cursor-pointer text-left text-[12px] text-primary hover:bg-[#F0F7FF] flex items-center gap-1.5 transition-colors"
            >
              <Users size={15} />
              View Applicants
            </button>
            <button
              onClick={handleEdit}
              className="w-full px-4 py-2 cursor-pointer text-left text-[12px] text-primary hover:bg-[#F0F7FF] flex items-center gap-1.5 transition-colors"
            >
              <Edit2 size={15} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 cursor-pointer text-left text-[12px] text-[#EF4444] hover:bg-[#FEE2E2] flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="rounded-lg rounded-bl-none rounded-br-none" style={{ backgroundColor: scholarship.cardColor ?? "#3A52A6" }}>
        <div className="flex">
          {/* Image */}
          <motion.div
            transition={{ duration: 0.3 }}
            className="w-32 h-32 bg-white/10 shrink-0 overflow-hidden rounded-tl-lg"
          >
            <img
              src={scholarship.imageUrl || "/scholarship-banner-placeholder.png"}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Info */}
          <div className="flex-1 text-tertiary px-4 py-2">
            <h3 className="text-lg mb-1 line-clamp-1">{scholarship.name}</h3>

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
            <div className="space-y-1.5 text-xs opacity-90">
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
                <span>{format(scholarship.applicationDeadline, "MMM. d, yyyy")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Amount and Slots */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <motion.div
            transition={{ duration: 0.2 }}
            className="bg-[#F9FAFB] border border-border rounded-lg p-3"
          >
            <div className="flex items-center gap-1.5 text-[#6B7280] text-xs mb-1">
              <Users size={14} />
              <span>Applications</span>
            </div>
            <p className="text-sm md:text-base text-primary">{scholarship.applicationCount}</p>
            <p className="text-xs text-[#6B7280]">applicants</p>
          </motion.div>

          <motion.div
            transition={{ duration: 0.2 }}
            className="bg-[#F9FAFB] border border-border rounded-lg p-3"
          >
            <div className="flex items-center gap-1.5 text-[#6B7280] text-xs mb-1">
              <Coins size={14} />
              <span>Amount</span>
            </div>
            {isFixed && (<><p className="text-primary text-sm md:text-base">{formatCurrency(scholarship.totalAmount!, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p><p className="text-xs text-[#6B7280]">per scholar</p></>)}
            {isRange && (<><p className="text-primary text-sm md:text-base">{formatCurrency(scholarship.totalAmountMin ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{" – "}{formatCurrency(scholarship.totalAmountMax ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p><p className="text-xs text-[#6B7280]">per scholar</p></>)}
            {isVaries && (<><p className="text-primary text-sm md:text-base">Varies</p><p className="text-xs text-[#6B7280]">see details</p></>)}
          </motion.div>

          <motion.div
            transition={{ duration: 0.2 }}
            className="bg-[#F9FAFB] border border-border rounded-lg p-3"
          >
            <div className="flex items-center gap-1.5 text-[#6B7280] text-xs mb-1">
              <Users size={14} />
              <span>Slots</span>
            </div>
            <p className="text-primary text-sm md:text-base">{scholarship.totalSlots ?? "No limit"}</p>
            <p className="text-xs text-[#6B7280]">scholars</p>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.2 }}
          >
            <Button
              variant="outline"
              size="default"
              onClick={handleViewApplicants}
              className="w-full text-xs md:text-sm font-medium border-[#3A52A6] text-[#3A52A6] hover:bg-[#3A52A6] hover:text-white cursor-pointer"
            >
              <Users size={16} />
              View Applicants
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.25 }}
          >
            <Button
              variant="outline"
              size="default"
              onClick={handleEdit}
              className="w-full text-xs md:text-sm font-medium border-[#3A52A6] text-[#3A52A6] hover:bg-[#3A52A6] hover:text-white cursor-pointer"
            >
              <Edit2 size={16} />
              Edit
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.3 }}
          >
            <Button
              variant="outline"
              size="default"
              onClick={handleDelete}
              className="w-full text-xs md:text-sm font-medium border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-white cursor-pointer"
            >
              <Trash2 size={16} />
              Delete
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
