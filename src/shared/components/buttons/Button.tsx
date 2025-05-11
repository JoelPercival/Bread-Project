import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  icon,
  fullWidth = false,
}) => {
  const baseClasses = 'flex items-center justify-center font-medium rounded-md focus:outline-none transition duration-150 ease-in-out';
  
  const variantClasses = {
    primary: 'bg-bread-dark-moss-green text-bread-cornsilk hover:bg-bread-earth-yellow focus:ring-2 focus:ring-offset-2 focus:ring-bread-earth-yellow',
    secondary: 'bg-bread-tigers-eye text-bread-cornsilk hover:bg-bread-earth-yellow focus:ring-2 focus:ring-offset-2 focus:ring-bread-earth-yellow',
    outline: 'bg-bread-cornsilk border border-bread-earth-yellow text-bread-dark-moss-green hover:bg-bread-earth-yellow focus:ring-2 focus:ring-offset-2 focus:ring-bread-earth-yellow',
    text: 'text-bread-dark-moss-green hover:text-bread-tigers-eye hover:bg-bread-earth-yellow',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      initial={false}
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </motion.button>
  );
};

export default Button;
