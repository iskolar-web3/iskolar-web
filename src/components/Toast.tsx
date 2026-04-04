import { motion, AnimatePresence } from "framer-motion";
import { HiCheckCircle, HiXCircle } from "react-icons/hi2";
import type { JSX } from "react";

/**
 * Props for the Toast component
 */
interface ToastProps {
  /** Whether the toast is visible */
  visible: boolean;
  /** Type of toast notification */
  type: "success" | "error" | 'info' | 'warning';
  /** Title text for the toast */
  title: string;
  /** Message text for the toast */
  message: string;
}

/**
 * Toast notification component
 * Displays animated success or error messages with icons
 * @param props - Component props
 * @returns Animated toast notification component
 */
export default function Toast({ visible, type, title, message }: ToastProps): JSX.Element {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 500 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 500 }}
          transition={{
            type: "spring",
            stiffness: 800,
            damping: 28,
          }}
          className="fixed top-4 md:top-6 right-4 z-1000 w-[350px] h-[50px] md:w-[360px] md:h-[60px] rounded-lg flex items-center justify-end shadow-lg"
          style={{
            backgroundColor: type === "success" ? "#31D0AA" : "#EF4444",
          }}
        >
          <div className="flex items-center w-[345px] h-[50px] md:w-[355px] md:h-[60px] bg-[#F0F7FF] rounded-lg px-3 py-2 gap-3 opacity-80">
            <div className="flex items-center justify-center">
              {type === "success" ? (
                <HiCheckCircle className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-[#31D0AA]" />
              ) : (
                <HiXCircle className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-[#EF4444]" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm md:text-base text-primary leading-tight">
                {title}
              </p>
              <p className="text-xs md:text-sm text-primary opacity-85 leading-tight">
                {message}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
