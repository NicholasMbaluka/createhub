import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md'
  className?: string
}

export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '' 
}: BadgeProps) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full'
  
  const variantClasses = {
    default: 'bg-primary-600/20 text-primary-400 border border-primary-600/50',
    success: 'bg-green-600/20 text-green-400 border border-green-600/50',
    warning: 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/50',
    error: 'bg-red-600/20 text-red-400 border border-red-600/50'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  }
  
  return (
    <span className={`
      ${baseClasses} 
      ${variantClasses[variant]} 
      ${sizeClasses[size]} 
      ${className}
    `}>
      {children}
    </span>
  )
}
