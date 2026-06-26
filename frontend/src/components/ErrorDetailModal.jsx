import React, { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { useToast } from './ToastProvider'
import { API_BASE } from '../config'
import { X, Calendar, CheckCircle2, AlertTriangle, Code2, Trash2, Check, BookOpen } from 'lucide-react'

export default function ErrorDetailModal({id, onClose, onSavedOrDeleted}){
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(()=>{
    if(!id) return
    setLoading(true)
    fetch(`${API_BASE}/api/errors/${id}`).then(async res=>{
      if(!res.ok) throw new Error(await res.text())
      const d = await res.json()
      setData(d)
    }).catch(err=>{
      console.error(err)
      onClose()
    }).finally(()=>setLoading(false))
  },[id])

  useEffect(()=>{
    if(data){ 
      // Delay slightly to allow DOM to render and highlight.js to capture code blocks
      setTimeout(() => {
        hljs.highlightAll()
      }, 50)
    }
  },[data])

  useEffect(()=>{
    function onKey(e){ if(e.key==='Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return ()=>window.removeEventListener('keydown', onKey)
  },[onClose])

  if(!id) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl glass-panel p-6 md:p-8 animate-modal z-10 flex flex-col justify-between"
        style={{ background: 'rgba(20, 20, 25, 0.9)', backdropFilter: 'blur(20px)' }}
      >
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)] space-y-3">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Fetching diagnosis details...</span>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Error Diagnostic</span>
                <h2 className="text-xl font-extrabold text-white leading-snug">{data.title || 'Error Detail'}</h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Metadata Indicators */}
            <div className="flex flex-wrap items-center gap-4 py-2 border-y border-[var(--border)]/40 text-xs">
              <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <Calendar size={13} />
                <span>{formatDistanceToNow(new Date(data.createdAt || Date.now()), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                {data.verified ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--success)] px-2.5 py-1 rounded-full bg-[var(--success-glow)] border border-[rgba(16,185,129,0.2)]">
                    <CheckCircle2 size={11} />
                    Verified Solution
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle size={11} />
                    Unverified
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
            {data.tags?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {data.tags.map(t=> (
                  <span 
                    key={t} 
                    className="text-[11px] font-mono font-medium text-[var(--accent)] px-2.5 py-0.5 rounded bg-[var(--accent-glow)] border border-[rgba(99,102,241,0.1)]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Content Details */}
            <div className="space-y-5">
              {/* Stacktrace Message */}
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
                  <Code2 size={12} className="text-[var(--text-muted)]" />
                  Original Error Message
                </span>
                <pre className="font-code text-xs p-4 rounded-xl bg-[#09090b]/80 border border-[var(--border)] max-h-[140px] overflow-y-auto text-[var(--text-secondary)] leading-relaxed">
                  {data.errorMessage}
                </pre>
              </div>

              {/* What Happened */}
              <div className="space-y-1.5">
                <span className="text-xs uppercase font-bold tracking-widest text-[var(--text-muted)] block">What Happened</span>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {data.aiExplanation?.whatHappened || '—'}
                </p>
              </div>

              {/* Root Cause */}
              <div className="space-y-1.5">
                <span className="text-xs uppercase font-bold tracking-widest text-[var(--text-muted)] block">Root Cause</span>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {data.aiExplanation?.rootCause || '—'}
                </p>
              </div>

              {/* Solution / Fix */}
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest text-[var(--text-muted)] block">Proposed Fix</span>
                <div className="relative rounded-xl border border-[var(--border)] overflow-hidden bg-[#09090b]/90">
                  {/* Editor Top Bar */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]/50 bg-[#0d0d11]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--danger)]/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)]/80" />
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">solution.js</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm">
                    <code className="language-javascript">
                      {data.aiExplanation?.fix || '// No code block available'}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Watch Out For */}
              {data.aiExplanation?.watchOutFor?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs uppercase font-bold tracking-widest text-[var(--text-muted)] block">Watch Out For</span>
                  <ul className="space-y-1.5">
                    {data.aiExplanation.watchOutFor.map((it, i) => (
                      <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-[var(--border)]/40 mt-8">
              <button 
                onClick={async ()=>{
                  if(!confirm('Are you sure you want to delete this diagnosed incident?')) return
                  try{
                    const res = await fetch(`${API_BASE}/api/errors/${id}`, { method: 'DELETE' })
                    if(!res.ok) throw new Error(await res.text())
                    onSavedOrDeleted(true)
                    onClose()
                    toast.showSuccess('Deleted successfully')
                  }catch(err){
                    console.error(err)
                  }
                }} 
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger-glow)] hover:border-[var(--danger)]/30 border border-transparent transition-all"
              >
                <Trash2 size={14} />
                <span>Delete Log</span>
              </button>

              <button 
                onClick={async ()=>{
                  setSaving(true)
                  try{
                    const res = await fetch(`${API_BASE}/api/errors/${id}`, {
                      method: 'PATCH', 
                      headers: {'Content-Type': 'application/json'}, 
                      body: JSON.stringify({ verified: !data.verified })
                    })
                    if(!res.ok) throw new Error(await res.text())
                    const updated = await res.json()
                    setData(updated)
                    onSavedOrDeleted()
                    toast.showSuccess('Verified status updated')
                  }catch(err){
                    console.error(err)
                  }finally{setSaving(false)}
                }} 
                disabled={saving}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  data.verified 
                    ? 'bg-[var(--success-glow)] text-[var(--success)] border border-[rgba(16,185,129,0.3)] hover:bg-[var(--success-glow)]/80' 
                    : 'bg-white text-black hover:bg-zinc-200 shadow-md'
                }`}
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : data.verified ? (
                  <>
                    <Check size={15} />
                    <span>Verified</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Mark as Verified</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
