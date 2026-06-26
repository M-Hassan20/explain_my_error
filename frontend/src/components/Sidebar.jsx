import React from 'react'
import { Activity, FileText, Grid, X } from 'lucide-react'

const NavItem = ({id, label, icon:Icon, active, onClick}) => (
  <button 
    onClick={()=>onClick(id)} 
    className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-lg text-sm transition-all duration-300 ${
      active
        ? 'bg-[var(--accent-glow)] text-[var(--accent)] font-semibold border-l-4 border-l-[var(--accent)] shadow-[0_0_15px_rgba(99,102,241,0.1)]'
        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.03)]'
    }`}
  >
    <Icon size={18} className={`transition-transform duration-300 ${active ? 'scale-110 text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}`} />
    <span className="tracking-wider text-[12px] uppercase font-medium">{label}</span>
  </button>
)

export default function Sidebar({active, onChange, open, onClose}){
  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className="hidden md:flex flex-col w-[260px] flex-shrink-0 h-screen bg-[#0d0d11]/80 backdrop-blur-md" 
        style={{ borderRight: '1px solid var(--border)' }}
      >
        <div className="px-6 py-6 border-b border-[var(--border)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--accent)] to-[#a78bfa] flex items-center justify-center font-bold text-white shadow-lg shadow-[var(--accent-glow)]">
            E
          </div>
          <div>
            <div className="text-[var(--text-primary)] font-bold tracking-tight text-sm">Explain My Error</div>
            <div className="text-[10px] text-[var(--text-muted)] font-mono">v1.0.0 — Gemini AI</div>
          </div>
        </div>
        
        <nav className="flex-1 mt-6 px-4 flex flex-col gap-1.5">
          <NavItem id="analyze" label="Analyze" icon={Activity} active={active==='analyze'} onClick={onChange} />
          <NavItem id="browse" label="Browse" icon={FileText} active={active==='browse'} onClick={onChange} />
          <NavItem id="dashboard" label="Dashboard" icon={Grid} active={active==='dashboard'} onClick={onChange} />
        </nav>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="w-[260px] h-full flex flex-col bg-[#0d0d11]/95 backdrop-blur-lg border-r border-[var(--border)] animate-modal">
            <div className="px-6 py-6 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--accent)] to-[#a78bfa] flex items-center justify-center font-bold text-white">
                  E
                </div>
                <div>
                  <div className="text-[var(--text-primary)] font-bold tracking-tight text-sm">Explain My Error</div>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            
            <nav className="flex-1 mt-6 px-4 flex flex-col gap-1.5">
              <NavItem id="analyze" label="Analyze" icon={Activity} active={active==='analyze'} onClick={onChange} />
              <NavItem id="browse" label="Browse" icon={FileText} active={active==='browse'} onClick={onChange} />
              <NavItem id="dashboard" label="Dashboard" icon={Grid} active={active==='dashboard'} onClick={onChange} />
            </nav>
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        </div>
      )}
    </>
  )
}
