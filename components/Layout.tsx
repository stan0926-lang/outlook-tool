
import React, { useState } from 'react';
import { View } from '../types';
import { IconMail, IconPeople, IconFolderOpen, IconDocumentText, IconDownload, IconMenu, IconClose, IconCreate } from './ui/Icons';

interface LayoutProps {
  currentView: View;
  onChangeView: (view: View) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: View.COMPOSE, label: 'メール作成', icon: <IconMail className="w-5 h-5" /> },
    { id: View.ADDRESS_BOOK, label: 'アドレス帳', icon: <IconPeople className="w-5 h-5" /> },
    { id: View.GROUPS, label: 'グループ管理', icon: <IconFolderOpen className="w-5 h-5" /> },
    { id: View.TEMPLATES, label: 'テンプレート', icon: <IconDocumentText className="w-5 h-5" /> },
    { id: View.VARIABLES, label: '変数設定', icon: <IconCreate className="w-5 h-5" /> },
    { id: View.IMPORT, label: 'データ取込', icon: <IconDownload className="w-5 h-5" /> },
  ];

  const handleNavClick = (view: View) => {
    onChangeView(view);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-sans text-[#334155]">
      
      {/* Toggle Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="group flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 shadow-sm hover:bg-slate-50 transition-all"
          aria-label="Toggle Menu"
        >
          {isSidebarOpen ? (
             <IconClose className="w-6 h-6 text-slate-600" />
          ) : (
             <IconMenu className="w-6 h-6 text-slate-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out shadow-lg md:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col pt-20 px-4 pb-6">
          <div className="mb-8 px-4 border-b border-slate-100 pb-4">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Outlook Mail Tool</h1>
            <p className="text-xs text-slate-500 font-medium">version 2.0.0</p>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main 
        className={`flex-1 flex flex-col h-full overflow-visible relative transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-50' : 'ml-0'
        }`}
      >
        <div className="flex-1 overflow-visible p-4 md:p-8 pt-20 md:pt-8 bg-[#f8fafc]">
          <div className="max-w-5xl mx-auto min-h-full pb-10 overflow-visible">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
