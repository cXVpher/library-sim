'use client';

import { LoanTabFilter } from '../_hooks/useLoansPage';

interface LoansFilterTabsProps {
  activeTab: LoanTabFilter;
  isAdmin: boolean;
  onTabChange: (tab: LoanTabFilter) => void;
}

export function LoansFilterTabs({ activeTab, isAdmin, onTabChange }: LoansFilterTabsProps) {
  const tabs = (isAdmin
    ? ['all', 'PENDING', 'APPROVED', 'RETURNED', 'REJECTED']
    : ['all', 'PENDING', 'APPROVED', 'RETURNED']) as LoanTabFilter[];

  return (
    <div className="flex gap-2 border-b border-white/10 pb-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          {tab === 'all' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
  );
}
