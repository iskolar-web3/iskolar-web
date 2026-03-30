import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { SEO } from "@/components/SEO";

export const Route = createFileRoute('/_onboarding/welcome')({
  component: WelcomePage,
})

function WelcomePage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const logoVariants: Variants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };

  const titleText = "Welcome to iSkolar";
  const subtitleText = "Connecting Students and Sponsors";

  return (
    <>
      <SEO title="Welcome" noindex={true} />
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Logo */}
      <motion.div 
        className="mb-2 sm:mb-3 md:mb-2"
        variants={logoVariants}
      >
        <img 
          src="/logo.png" 
          alt="iSkolar Logo" 
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-35 lg:h-35 mx-auto"
        />
      </motion.div>

      {/* Welcome Text with Typewriter Effect */}
      <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl text-secondary mb-2">
        {titleText.split("").map((char, index) => (
          <motion.span
            key={`title-${index}`}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{
              delay: 0.6 + index * 0.05
            }}
            style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
          >
            {char}
          </motion.span>
        ))}
      </h1>

      {/* Subtitle with Typewriter Effect */}
      <p className="text-secondary text-base sm:text-md md:text-lg lg:text-xl mb-6 sm:mb-7 md:mb-8">
        {subtitleText.split("").map((char, index) => (
          <motion.span
            key={`subtitle-${index}`}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{
              delay: 1.5 + index * 0.04
            }}
            style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
          >
            {char}
          </motion.span>
        ))}
      </p>

      {/* Get Started Button */}
      <motion.div variants={buttonVariants}>
        <Link 
          to="/role-selection"
        >
          <button
            className="bg-[#EFA508] cursor-pointer text-xs sm:text-sm md:text-sm text-tertiary py-2.5 px-16 sm:py-3 sm:px-22 md:py-3 md:px-28 lg:px-30 rounded-md transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Get Started
          </button>
        </Link>
      </motion.div>
    </motion.div>
    </>
  );
}