// src/components/Card.tsx
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'hover' | 'elevated';
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick
}) => {
  const baseStyles = 'rounded-card p-card transition-all duration-200';
  
  const variantStyles = {
    default: 'bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary',
    hover: 'bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary hover:shadow-card-hover hover:border-light-border-secondary dark:hover:border-dark-border-secondary cursor-pointer',
    elevated: 'bg-light-bg-secondary dark:bg-dark-bg-secondary shadow-card border border-light-border-primary dark:border-dark-border-primary'
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
