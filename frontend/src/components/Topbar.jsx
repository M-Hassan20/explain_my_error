import React from 'react'
import { Search, Menu } from 'lucide-react'

export default function Topbar({query, setQuery, onHamburger}){
  React.useEffect(()=>{
    function onKey(e){ 
      if(e.ctrlKey && e.key.toLowerCase()==='k'){ 
        e.preventDefault(); 
        const el = document.querySelector('.global-search'); 
        if(el) el.focus(); 
      }
    }
    window.addEventListener('keydown', onKey)
    return ()=>window.removeEventListener('keydown', onKey)
  },[])

  return (
    <header 
      className="h-16 flex items-center px-6 bg-[#09090b]/40 backdrop-blur-md relative z-30" 
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <button 
        className="md:hidden p-2 -ml-2 mr-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors" 
        onClick={onHamburger} 
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-3 w-full max-w-xl relative">
        <Search size={16} className="absolute left-3 text-[var(--text-muted)] pointer-events-none" />
        <input
          value={query}
          onChange={(e)=> setQuery(e.target.value)}
          placeholder="Search all error logs..."
          className="global-search w-full h-10 pl-9 pr-12 rounded-lg text-sm bg-[#09090b]/80 border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] transition-all placeholder:text-[var(--text-muted)]" 
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-[var(--border)] bg-[#18181b] px-1.5 font-mono text-[10px] font-medium text-[var(--text-muted)] leading-none">
            Ctrl+K
          </kbd>
        </div>
      </div>
    </header>
  )
}
