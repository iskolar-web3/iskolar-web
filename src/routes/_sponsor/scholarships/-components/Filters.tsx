import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Props for the FilterSelect component (sponsor view)
 */
interface FilterSelectProps {
  /** Title/label for the filter dropdown */
  title: string;
  /** Array of available filter options */
  options: string[];
  /** Currently selected value */
  value: string;
  /** Callback function when selection changes */
  onChange: (value: string) => void;
}

/**
 * Animated dropdown filter component for sponsor view
 * Provides a filterable dropdown with smooth animations for option selection
 * @param props - Component props
 * @returns Animated filter dropdown component
 */
export default function FilterSelect({
  title,
  options,
  value,
  onChange,
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 min-w-[200px] lg:min-w-0">
      <label className="block text-xs md:text-sm text-primary mb-2">{title}</label>
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.01 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-white border border-border rounded-lg text-[11px] md:text-xs text-primary flex items-center justify-between hover:border-[#3A52A6] transition-colors"
        >
          <span>{value || 'All'}</span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto custom-scrollbar"
            >
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-[11px] md:text-xs text-left text-primary hover:bg-[#F3F4F6] transition-colors"
                >
                  {option}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
