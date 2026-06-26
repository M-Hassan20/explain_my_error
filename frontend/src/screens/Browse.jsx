import React, { useEffect, useState, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { API_BASE } from '../config'
import { useToast } from '../components/ToastProvider'
import { Search, Tag, Calendar, CheckCircle2, ChevronRight, Inbox } from 'lucide-react'

function SkeletonCard(){
  return (
    <div className="p-5 rounded-xl border border-[var(--border)] bg-[#18181b]/40 animate-pulse space-y-3">
      <div className="h-4 bg-zinc-800 w-1/3 rounded" />
      <div className="h-3 bg-zinc-800 w-full rounded" />
      <div className="h-3 bg-zinc-800 w-3/4 rounded" />
      <div className="flex gap-2 pt-2">
        <div className="h-5 bg-zinc-800 w-12 rounded" />
        <div className="h-5 bg-zinc-800 w-16 rounded" />
      </div>
    </div>
  )
}

export default function Browse({globalQuery, setGlobalQuery, onSelect, refreshKey}){
  const [query, setQuery] = useState(globalQuery || '')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const toast = useToast()

  useEffect(()=>{ setQuery(globalQuery || '') },[globalQuery])

  useEffect(()=>{
    fetchResults(query)
  },[refreshKey])

  const fetchResults = async (q) => {
    setLoading(true)
    try{
      const url = q ? `${API_BASE}/api/errors/search?q=${encodeURIComponent(q)}` : `${API_BASE}/api/errors?limit=100`
      const res = await fetch(url)
      if(!res.ok) throw new Error(await res.text())
      const data = await res.json()
      // Extract the actual documents array from the response object
      setResults(data.data || [])
    }catch(err){
      console.error(err)
      setResults([])
      toast && toast.showError && toast.showError(err.message || 'Failed to fetch errors')
    }finally{setLoading(false)}
  }

  // debounced query handler
  const debounced = useMemo(()=>{
    let timeoutId = null
    const fn = (q)=>{
      if(timeoutId){ window.clearTimeout(timeoutId) }
      timeoutId = window.setTimeout(()=>{
        setGlobalQuery(q)
        fetchResults(q)
      }, 400)
    }
    fn.cancel = ()=>{ if(timeoutId){ window.clearTimeout(timeoutId); timeoutId = null } }
    return fn
  }, [setGlobalQuery])

  useEffect(()=>{ debounced(query); return ()=>debounced.cancel() },[query, debounced])

  const allTags = useMemo(()=>{
    const set = new Set();
    (results||[]).forEach(r=> (r.tags||[]).forEach(t=>set.add(t)))
    return Array.from(set).sort()
  },[results])

  const toggleTag = (t)=>{
    setSelectedTags(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t])
  }

  const filtered = useMemo(()=>{
    if(!results) return []
    if(selectedTags.length===0) return results
    return results.filter(r=> selectedTags.every(t=> (r.tags||[]).includes(t)))
  },[results, selectedTags])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[var(--accent-glow)] text-[var(--accent)]">
          <Search size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Browse Error Catalog</h1>
          <p className="text-sm text-[var(--text-muted)]">Search through analyzed errors, filter by categories, and view solutions.</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="space-y-4">
        {/* Search box (extra contextual filters) */}
        <div className="relative max-w-lg">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            value={query} 
            onChange={(e)=>setQuery(e.target.value)} 
            placeholder="Filter results by keyword..." 
            className="w-full h-11 pl-10 pr-4 rounded-xl text-sm input-field bg-[#09090b]/80 border border-[var(--border)] focus:outline-none" 
          />
        </div>

        {/* Tags category filters */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mr-2">Tags:</span>
            {allTags.map(t=>{
              const active = selectedTags.includes(t)
              return (
                <button 
                  key={t} 
                  onClick={()=>toggleTag(t)} 
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all border duration-200 ${
                    active
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_2px_10px_rgba(99,102,241,0.2)]'
                      : 'bg-[#18181b]/50 text-[var(--text-muted)] border-[var(--border)] hover:border-zinc-500 hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Tag size={10} className={active ? 'text-white' : 'text-[var(--text-muted)]'} />
                  <span>{t}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Results State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!loading && results && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-24 glass-panel rounded-2xl border-dashed">
          <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.02)] flex items-center justify-center mb-4">
            <Inbox size={26} className="text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No diagnoses found</h3>
          <p className="text-sm text-[var(--text-muted)] max-w-sm">
            We couldn't find any saved errors matching your search or tag filters. Try analyzing a new stack trace!
          </p>
        </div>
      )}

      {!loading && results && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(r=> (
            <div 
              key={r._id} 
              onClick={()=>onSelect(r._id)} 
              className="glass-panel p-5 rounded-xl cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2.5">
                  <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-[var(--accent)]">
                    {r.title || 'Untitled'}
                  </h3>
                  {r.verified && (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[var(--success)] px-1.5 py-0.5 rounded bg-[var(--success-glow)] border border-[rgba(16,185,129,0.15)] flex-shrink-0">
                      <CheckCircle2 size={10} />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
                
                <p className="font-code text-[12px] text-[var(--text-muted)] bg-[#09090b]/55 p-3 rounded-lg border border-[var(--border)] line-clamp-3 mb-4 leading-relaxed">
                  {r.errorMessage || ''}
                </p>
              </div>

              <div className="space-y-3.5">
                {r.tags?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {r.tags.map(t=> (
                      <span 
                        key={t} 
                        className="text-[10px] font-mono text-[var(--text-muted)] px-2 py-0.5 rounded bg-zinc-800/60 border border-[var(--border)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]/60">
                  <Calendar size={12} className="text-[var(--text-muted)]" />
                  <span>
                    {formatDistanceToNow(new Date(r.createdAt || Date.now()), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
