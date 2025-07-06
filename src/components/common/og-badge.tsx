'use client'

import { cn } from '@/utils/utils'
import { useRouter } from 'next/navigation'
import { getOGBadgeText, getOGBadgeTooltip } from '@/utils/og-user'

interface OGBadgeProps {
  username: string;
  reason?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
}

export function OGBadge({ 
  username, 
  reason, 
  className, 
  size = 'sm',
  clickable = true 
}: OGBadgeProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (clickable) {
      router.push(`/${username}`);
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 h-5',
    md: 'text-sm px-2 py-1 h-6',
    lg: 'text-base px-2.5 py-1.5 h-8'
  };

  return (
    <>
      {/* Nabla Font Import - Load only when needed */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Nabla:EDPT,EHLT@0..200,0..24&display=swap');
        .font-nabla {
          font-family: 'Nabla', system-ui, sans-serif;
        }
      `}</style>
      
      <button
        onClick={handleClick}
        disabled={!clickable}
        title={getOGBadgeTooltip(reason)}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-full font-bold',
          'transition-all duration-300 ease-in-out',
          'border border-yellow-500/50 bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
          'text-yellow-400 hover:text-yellow-300',
          'shadow-sm hover:shadow-md',
          
          // Animation styles
          'animate-pulse hover:animate-none',
          'hover:scale-105 active:scale-95',
          'hover:border-yellow-400 hover:from-yellow-400/30 hover:to-amber-400/30',
          'hover:shadow-yellow-500/25',
          
          // Nabla font
          'font-nabla',
          
          // Size classes
          sizeClasses[size],
          
          // Clickable styles
          clickable && 'cursor-pointer',
          !clickable && 'cursor-default',
          
          // Custom className
          className
        )}
        style={{
          fontFamily: 'Nabla, system-ui, sans-serif',
          fontVariationSettings: '"EDPT" 100, "EHLT" 12',
          textShadow: '0 0 8px rgba(234, 179, 8, 0.3)',
        }}
      >
        <span className="relative">
          {getOGBadgeText(reason)}
          
          {/* Subtle glow effect */}
          <span 
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(45deg, transparent, rgba(234, 179, 8, 0.1), transparent)',
              filter: 'blur(1px)',
            }}
          />
        </span>
      </button>
    </>
  );
}
