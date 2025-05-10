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
    primary: 'bg-bread-crust text-white hover:bg-bread-brown-700 focus:ring-2 focus:ring-offset-2 focus:ring-bread-brown-500',
    secondary: 'bg-bread-crumb text-bread-brown-800 hover:bg-bread-brown-200 focus:ring-2 focus:ring-offset-2 focus:ring-bread-brown-300',
    outline: 'border border-bread-brown-300 text-bread-brown-700 hover:bg-bread-brown-100 focus:ring-2 focus:ring-offset-2 focus:ring-bread-brown-300',
    text: 'text-bread-brown-700 hover:text-bread-brown-900 hover:bg-bread-brown-100',
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