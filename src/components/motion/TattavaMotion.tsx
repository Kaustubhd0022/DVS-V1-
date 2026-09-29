import React from 'react';
import { motion, MotionConfig, useReducedMotion } from 'framer-motion';

export const tattavaMotion = {
  page: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: 0.28, ease: 'easeOut' as const }
  },
  card: {
    initial: { opacity: 0, y: 8, scale: 0.995 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.22, ease: 'easeOut' as const }
  },
  stagger: {
    animate: { transition: { staggerChildren: 0.045 } }
  }
};

export const TattavaMotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MotionConfig reducedMotion="user" transition={{ duration: 0.22, ease: 'easeOut' }}>
    {children}
  </MotionConfig>
);

export const MotionPage: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : tattavaMotion.page.initial}
      animate={tattavaMotion.page.animate}
      transition={tattavaMotion.page.transition}
    >
      {children}
    </motion.div>
  );
};

export const MotionCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : tattavaMotion.card.initial}
      animate={tattavaMotion.card.animate}
      transition={{ ...tattavaMotion.card.transition, delay }}
      whileHover={reduce ? undefined : { y: -2, transition: { duration: 0.16 } }}
    >
      {children}
    </motion.div>
  );
};

export const MotionPresence: React.FC<{ children: React.ReactNode }> = ({ children }) => children;
