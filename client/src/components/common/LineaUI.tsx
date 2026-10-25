import React from 'react';

/**
 * Linea Audio Equalizer Wave
 * 3 animated vertical bars reflecting live acoustic synthesis or AI action.
 */
export const LineaEqualizerWave: React.FC<{ className?: string; active?: boolean }> = ({ 
  className = '',
  active = true 
}) => {
  if (!active) return null;
  return (
    <span className={`linea-btn-wave ${className}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
};

export interface LineaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'mint' | 'secondary' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showWave?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * Linea Pill Button
 * Full pill geometry (`rounded-full`), tactile spring physics (`cubic-bezier`),
 * inset specular highlight, and integrated acoustic equalizer wave.
 */
export const LineaButton: React.FC<LineaButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  showWave = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-3 py-1 text-[11px] gap-1.5',
    sm: 'px-4 py-1.5 text-xs gap-2',
    md: 'px-5 py-2.5 text-xs font-semibold gap-2.5',
    lg: 'px-6 py-3 text-sm font-bold gap-3'
  }[size];

  const variantClasses = {
    primary: 'linea-pill-primary',
    mint: 'linea-pill-mint',
    secondary: 'linea-pill-secondary',
    ghost: 'linea-pill-ghost'
  }[variant];

  return (
    <button
      className={`linea-pill-btn ${sizeClasses} ${variantClasses} ${
        disabled ? 'opacity-40 pointer-events-none cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
      {showWave && <LineaEqualizerWave />}
    </button>
  );
};

export interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  glow?: 'amber' | 'mint' | 'none';
  className?: string;
}

/**
 * Linea Bento Card
 * Heavy corner curve (`rounded-3xl`), layered translucent border,
 * inset specular highlight, and deep ambient shadow.
 */
export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  interactive = false,
  glow = 'none',
  className = '',
  ...props
}) => {
  const glowClasses = {
    amber: 'hover:shadow-glow-amber border-amber-500/30',
    mint: 'hover:shadow-glow-mint border-emerald-500/30',
    none: ''
  }[glow];

  return (
    <div
      className={`linea-bento ${
        interactive ? 'linea-bento-interactive cursor-pointer' : ''
      } ${glowClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface LineaCaptionProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'amber' | 'mint' | 'periwinkle' | 'neutral' | 'rose';
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Linea Caption Chip (.m-caption)
 * Tactile pill badge with uppercase typography, subtle border blend, and icon support.
 */
export const LineaCaption: React.FC<LineaCaptionProps> = ({
  children,
  variant = 'amber',
  icon,
  className = '',
  ...props
}) => {
  const variantStyles = {
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    mint: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    periwinkle: 'bg-sky-500/15 text-sky-200 border-sky-500/30',
    neutral: 'bg-white/5 text-stone-300 border-white/10',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
  }[variant];

  return (
    <span
      className={`linea-caption-chip ${variantStyles} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
