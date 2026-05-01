import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  glass?: boolean
  glow?: boolean
}

export const Card = ({ children, className = '', glass = false, glow = false }: CardProps) => {
  const baseClasses = 'rounded-2xl p-6 shadow-2xl'
  
  const variantClasses = {
    glass: 'bg-dark-950/50 backdrop-blur-md border border-dark-800/50',
    regular: 'bg-dark-900 border border-dark-800'
  }
  
  return (
    <div className={`
      ${baseClasses} 
      ${glass ? variantClasses.glass : variantClasses.regular}
      ${glow ? 'glow' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}
