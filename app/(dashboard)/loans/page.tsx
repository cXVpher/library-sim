'use client';

import { useLoansPage } from './_hooks/useLoansPage';
import { LoansStats } from './_components/loans-stats';
import { LoansFilterTabs } from './_components/loans-filter-tabs';
import { LoansTable } from './_components/loans-table';
import { Library } from 'lucide-react';

export default function LoansPage() {
  const { isAdmin, isLoading, activeTab, setActiveTab, filteredLoans, stats, handleApprove, handleReturn, handleReject } = useLoansPage();

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg"><Library className="w-6 h-6 text-green-400" /></div>
          <div>
            <h1 className="text-3xl font-bold text-white">{isAdmin ? 'Loan Management' : 'My Loans'}</h1>
            <p className="text-slate-400">{isAdmin ? 'Manage book loan requests from users' : 'View and manage your book loans'}</p>
          </div>
        </div>
      </div>

      <LoansStats stats={stats} isAdmin={isAdmin} />

      <LoansFilterTabs activeTab={activeTab} isAdmin={isAdmin} onTabChange={setActiveTab} />

      <LoansTable
        filteredLoans={filteredLoans}
        isLoading={isLoading}
        isAdmin={isAdmin}
        onApprove={handleApprove}
        onReturn={handleReturn}
        onReject={handleReject}
      />
    </div>
  );
}
