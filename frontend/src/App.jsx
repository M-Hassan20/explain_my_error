import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Analyze from './screens/Analyze'
import Browse from './screens/Browse'
import ErrorDetailModal from './components/ErrorDetailModal'
import Dashboard from './screens/Dashboard'

export default function App(){
  const [screen, setScreen] = useState('analyze')
  const [query, setQuery] = useState('')
  const [selectedErrorId, setSelectedErrorId] = useState(null)
  const [browseRefreshKey, setBrowseRefreshKey] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(()=>{
    const titleMap = { 
      analyze: 'Analyze — Explain My Error', 
      browse: 'Browse — Explain My Error', 
      dashboard: 'Dashboard — Explain My Error' 
    }
    document.title = titleMap[screen] || 'Explain My Error'
  },[screen])

  return (
    <div className="app-root relative h-screen w-screen flex bg-[#09090b] text-[var(--text-primary)] font-ui overflow-hidden">
      {/* Premium Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,rgba(0,0,0,0)_70%)] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none z-0" />

      {/* Main UI Layout */}
      <div className="relative z-10 flex w-full h-full">
        <Sidebar active={screen} onChange={(s)=>{ setScreen(s); setMobileMenuOpen(false) }} open={mobileMenuOpen} onClose={()=>setMobileMenuOpen(false)} />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Topbar query={query} setQuery={(q)=>{setQuery(q); setScreen('browse')}} onHamburger={()=>setMobileMenuOpen(v=>!v)} />
          
          <main className="p-6 md:p-8 overflow-y-auto flex-1 h-full scroll-smooth">
            <div className="max-w-7xl mx-auto w-full animate-fade-in-up">
              {screen === 'analyze' && <Analyze />}
              {screen === 'browse' && <Browse globalQuery={query} setGlobalQuery={setQuery} onSelect={setSelectedErrorId} refreshKey={browseRefreshKey} />}
              {screen === 'dashboard' && <Dashboard onOpenError={(id)=>{ setScreen('browse'); setSelectedErrorId(id) }} />}
            </div>
          </main>
        </div>
      </div>

      {selectedErrorId && (
        <ErrorDetailModal 
          id={selectedErrorId} 
          onClose={()=>setSelectedErrorId(null)} 
          onSavedOrDeleted={(deleted)=>{ 
            setBrowseRefreshKey(k=>k+1); 
            if(deleted) setSelectedErrorId(null)
          }} 
        />
      )}
    </div>
  )
}
