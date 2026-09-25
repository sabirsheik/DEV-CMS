import React, { useEffect } from 'react';
import { useCmsStore } from '../../stores/useCmsStore';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../common/ToastContainer';
import { CommandPalette } from '../common/CommandPalette';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const { sidebarCollapsed, theme } = useCmsStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200 relative">
      {/* Dynamic ambient background glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-80 transition-all duration-300"
        style={{ background: 'var(--ambient-glow)' }}
        aria-hidden="true"
      />

      <Sidebar />
      <Topbar />

      <main 
        className={`flex-1 transition-all duration-200 pt-14 flex flex-col relative z-10 ${
          sidebarCollapsed ? 'pl-16' : 'pl-64'
        }`}
      >
        <div className="flex-1 w-full max-w-[1600px] mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>

      <ToastContainer />
      <CommandPalette />
    </div>
  );
};

