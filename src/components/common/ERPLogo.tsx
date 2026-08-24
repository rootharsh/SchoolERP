import React from 'react';

interface ERPLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  language?: 'en' | 'gu';
  variant?: 'light' | 'dark' | 'brand';
  className?: string;
}

export const ERPLogo: React.FC<ERPLogoProps> = ({
  size = 'md',
  showText = true,
  language = 'en',
  variant = 'light',
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const titleSize = {
    sm: 'text-sm font-extrabold',
    md: 'text-base font-extrabold',
    lg: 'text-xl font-extrabold',
    xl: 'text-2xl font-extrabold',
  }[size];

  const subtitleSize = {
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  }[size];

  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Modern High-End Eye-Catching Emblem */}
      <div className={`relative ${iconDimensions} rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-600 to-slate-900 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center text-white shrink-0 overflow-hidden ring-2 ring-emerald-400/30 transition-transform duration-300 hover:scale-105 group`}>
        {/* Glow ambient highlight */}
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-300/40 rounded-full blur-xs pointer-events-none" />
        <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-teal-400/30 rounded-full blur-xs pointer-events-none" />
        
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-2 relative z-10 drop-shadow"
        >
          {/* Outer Cyber-Hex Shield */}
          <path
            d="M24 4L38 10V22C38 31.5 32 39.5 24 44C16 39.5 10 31.5 10 22V10L24 4Z"
            stroke="url(#shield_grad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Golden Core Spark / Wisdom Sun */}
          <circle cx="24" cy="15" r="3.5" fill="#FBBF24" />
          <path
            d="M24 8V10M19 12L20.5 13.5M29 12L27.5 13.5"
            stroke="#FDE68A"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Clean Open Book Wings */}
          <path
            d="M15 31C19 29.5 22.5 30.5 24 33C25.5 30.5 29 29.5 33 31V21.5C29 20 25.5 21 24 23.5C22.5 21 19 20 15 21.5V31Z"
            fill="white"
            fillOpacity="0.95"
          />

          {/* Stylized Core Spine */}
          <path
            d="M24 23.5V33"
            stroke="#059669"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <defs>
            <linearGradient id="shield_grad" x1="10" y1="4" x2="38" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34D399" />
              <stop offset="0.5" stopColor="#10B981" />
              <stop offset="1" stopColor="#065F46" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="leading-tight">
          <div className="flex items-center space-x-2">
            <span className={`font-heading tracking-tight ${titleSize} flex items-center`}>
              <span className={isDark ? 'text-white font-extrabold' : 'text-slate-900 font-extrabold'}>Class</span>
              <span className="text-emerald-400 font-black ml-0.5 drop-shadow-xs">Sec</span>
            </span>
            <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-md uppercase tracking-wider shadow-xs">
              GSEB
            </span>
          </div>
          <p className={`font-medium tracking-wide ${subtitleSize} ${isDark ? 'text-slate-300' : 'text-slate-500'} hidden sm:block`}>
            {language === 'gu'
              ? 'ગુજરાત સ્કૂલ ગવર્નન્સ પ્લેટફોર્મ'
              : 'Gujarat School Governance Platform'}
          </p>
        </div>
      )}
    </div>
  );
};

