'use client';

import React, { useState } from 'react';

interface BankLogoProps {
  bankName?: string;
  bankCode?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function resolveBankTheme(bankName: string = '', bankCode: string = '') {
  const nameLower = bankName.toLowerCase();
  const code = (bankCode || '').trim();

  if (code === '057' || nameLower.includes('zenith')) {
    return {
      bg: 'bg-red-600',
      text: 'text-white',
      label: 'Z',
      brand: 'Zenith Bank',
      logoUrl: 'https://cdn.jsdelivr.net/gh/wovenfinance/cdn@main/logos/057.png',
    };
  }
  if (code === '058' || nameLower.includes('gtbank') || nameLower.includes('guaranty')) {
    return {
      bg: 'bg-orange-600',
      text: 'text-white',
      label: 'GT',
      brand: 'GTBank',
      logoUrl: 'https://cdn.jsdelivr.net/gh/wovenfinance/cdn@main/logos/058.png',
    };
  }
  if (code === '044' || code === '063' || nameLower.includes('access')) {
    return {
      bg: 'bg-blue-950',
      text: 'text-orange-400',
      label: 'a',
      brand: 'Access Bank',
      logoUrl: 'https://cdn.jsdelivr.net/gh/wovenfinance/cdn@main/logos/044.png',
    };
  }
  if (code === '50211' || nameLower.includes('kuda')) {
    return {
      bg: 'bg-purple-900',
      text: 'text-emerald-400',
      label: 'K',
      brand: 'Kuda Bank',
      logoUrl: 'https://cdn.jsdelivr.net/gh/wovenfinance/cdn@main/logos/50211.png',
    };
  }
  if (code === '999992' || nameLower.includes('opay') || nameLower.includes('paycom')) {
    return {
      bg: 'bg-emerald-500',
      text: 'text-white',
      label: 'O',
      brand: 'OPay',
      logoUrl: 'https://cdn.jsdelivr.net/gh/wovenfinance/cdn@main/logos/999992.png',
    };
  }
  if (code === '999991' || nameLower.includes('palmpay')) {
    return {
      bg: 'bg-purple-700',
      text: 'text-amber-300',
      label: 'P',
      brand: 'PalmPay',
      logoUrl: 'https://cdn.jsdelivr.net/gh/wovenfinance/cdn@main/logos/999991.png',
    };
  }
  if (code === '011' || nameLower.includes('first bank') || nameLower.includes('firstbank')) {
    return {
      bg: 'bg-slate-900',
      text: 'text-amber-400',
      label: 'F',
      brand: 'First Bank',
      logoUrl: 'https://cdn.jsdelivr.net/gh/wovenfinance/cdn@main/logos/011.png',
    };
  }
  if (code === '033' || nameLower.includes('uba') || nameLower.includes('united bank for africa')) {
    return {
      bg: 'bg-red-700',
      text: 'text-white',
      label: 'UBA',
      brand: 'UBA',
      logoUrl: 'https://cdn.jsdelivr.net/gh/wovenfinance/cdn@main/logos/033.png',
    };
  }
  if (code === '50515' || nameLower.includes('moniepoint')) {
    return {
      bg: 'bg-slate-900',
      text: 'text-sky-400',
      label: 'M',
      brand: 'Moniepoint',
      logoUrl: 'https://cdn.jsdelivr.net/gh/wovenfinance/cdn@main/logos/50515.png',
    };
  }
  if (code === '214' || nameLower.includes('fcmb') || nameLower.includes('first city')) {
    return {
      bg: 'bg-purple-950',
      text: 'text-amber-300',
      label: 'FCMB',
      brand: 'FCMB',
      logoUrl: 'https://cdn.jsdelivr.net/gh/wovenfinance/cdn@main/logos/214.png',
    };
  }
  if (code === '221' || nameLower.includes('stanbic')) {
    return {
      bg: 'bg-blue-600',
      text: 'text-white',
      label: 'S',
      brand: 'Stanbic IBTC',
      logoUrl: 'https://cdn.jsdelivr.net/gh/wovenfinance/cdn@main/logos/221.png',
    };
  }
  if (code === '232' || nameLower.includes('sterling')) {
    return {
      bg: 'bg-red-800',
      text: 'text-white',
      label: 'S',
      brand: 'Sterling Bank',
      logoUrl: 'https://cdn.jsdelivr.net/gh/wovenfinance/cdn@main/logos/232.png',
    };
  }
  if (code === '035' || code === '035A' || nameLower.includes('wema') || nameLower.includes('alat')) {
    return {
      bg: 'bg-purple-700',
      text: 'text-white',
      label: 'W',
      brand: 'Wema Bank',
      logoUrl: 'https://cdn.jsdelivr.net/gh/wovenfinance/cdn@main/logos/035.png',
    };
  }

  // Fallback for any unknown bank
  const cleanName = bankName.trim();
  const initials = cleanName ? cleanName.slice(0, 2).toUpperCase() : 'BK';
  return {
    bg: 'bg-gradient-to-br from-slate-800 to-slate-900',
    text: 'text-white',
    label: initials,
    brand: bankName || 'Bank',
  };
}

export default function BankLogo({ bankName = '', bankCode = '', className = '', size = 'md' }: BankLogoProps) {
  const theme = resolveBankTheme(bankName, bankCode);
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px] rounded-lg',
    md: 'w-10 h-10 text-xs rounded-xl',
    lg: 'w-12 h-12 text-sm rounded-2xl',
  }[size];

  if (theme.logoUrl && !imgError) {
    return (
      <div className={`relative shrink-0 overflow-hidden bg-white border border-kpugi-border flex items-center justify-center p-1 shadow-xs ${sizeClasses} ${className}`}>
        <img
          src={theme.logoUrl}
          alt={theme.brand}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain rounded-md"
        />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 flex items-center justify-center font-mono font-bold shadow-xs transition-transform ${theme.bg} ${theme.text} ${sizeClasses} ${className}`}
      title={theme.brand}
    >
      {theme.label}
    </div>
  );
}
