import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from "@/lib/logger";
// import { profileService } from '@/services/profile.service';
// import { authService } from '@/services/auth.service';

/**
 * Props for the Preloader component
 */
interface PreloaderProps {
  /** Callback function to execute when preloading completes */
  onComplete?: () => void;
  /** Minimum time to display the preloader in milliseconds */
  minDisplayTime?: number;
}

/**
 * Array of motivational messages to display during loading
 */
const loadingMessages = [
  'Unlocking Opportunities',
  'Getting Your Scholarships Ready',
  'Empowering Education',
  'Connecting You to Success',
  'Preparing Opportunities',
  'Loading Your Profile',
  'Setting Up Your Journey',
  'Discovering Opportunities',
];

/**
 * Preloader component with animated logo and progress bar
 * Displays loading messages and ensures minimum display time before completing
 * @param props - Component props
 * @returns Animated preloader component
 */
export default function Preloader({ onComplete, minDisplayTime = 2000 }: PreloaderProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);

    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    let progressInterval: NodeJS.Timeout;

    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 3;
      });
    }, 50);

    const loadUserData = async () => {
      try {
        // const profileResult = await profileService.getProfileStatus();
        // if (!profileResult.success) {
        //   throw new Error('Failed to fetch profile');
        // }

        // Simulate API call delay 
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplayTime - elapsed);
        
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }

        setProgress(100);
        setIsLoading(false);

        setTimeout(() => {
          onComplete?.();
        }, 500);
      } catch (error) {
        logger.error('Preloader error:', error);
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplayTime - elapsed);
        
        setTimeout(() => {
          setProgress(100);
          setIsLoading(false);
          setTimeout(() => {
            onComplete?.();
          }, 500);
        }, remaining);
      } finally {
        clearInterval(progressInterval);
      }
    };

    loadUserData();

    return () => {
      clearInterval(progressInterval);
    };
  }, [onComplete, minDisplayTime]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-9999 bg-[#F0F7FF] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <div className="flex flex-col items-center justify-center space-y-4 px-4">
            {/* Logo/Icon Animation */}
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <motion.div
                className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#F0F7FF] flex items-center justify-center shadow-lg"
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 10px 30px rgba(58, 82, 166, 0.3)',
                    '0 15px 40px rgba(58, 82, 166, 0.5)',
                    '0 10px 30px rgba(58, 82, 166, 0.3)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <img
                  src="/logo.png"
                  alt="iSkolar Logo"
                  className="w-16 h-16 md:w-20 md:h-20 object-contain"
                />
              </motion.div>

              {/* Rotating spinner ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-5 border-transparent border-t-[#EFA508]"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </motion.div>

            {/* Dynamic Message */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessage}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl md:text-2xl text-secondary mt-8">
                  {loadingMessages[currentMessage]}
                </h2>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center mt-3 justify-center gap-2 text-[#8C8C8C] text-sm">
              <span>Please wait...</span>
            </div>

            {/* Progress Bar */}
            <div className="w-64 md:w-80">
              <div className="h-3 bg-[#E0ECFF] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#3A52A6] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
              <p className="text-center text-xs text-[#8C8C8C] mt-2">
                {progress}%
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
