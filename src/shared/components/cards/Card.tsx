import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  interactive = false,
}) => {
  const baseClasses = 'bg-white shadow-md rounded-lg overflow-hidden';
  const interactiveClasses = interactive
    ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer'
    : '';

  const CardComponent = interactive ? motion.div : 'div';
  const motionProps = interactive
    ? {
        whileHover: { y: -4 },
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }
    : {};

  return (
    <CardComponent
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </CardComponent>
  );
};

export default Card;
