import React, { useState, useRef } from 'react'
import { API_BASE } from '../config'
import { useToast } from '../components/ToastProvider'
import { Sparkles, Terminal, CheckCircle2, ChevronRight, Save, Trash2 } from 'lucide-react'

export default function Analyze(){
  const [errorMessage, setErrorMessage] = useState('')
  const textRef = useRef(null)
  const [codeSnippet, setCodeSnippet] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [apiError, setApiError] = useState('')
  const [inlineError, setInlineError] = useState('')
  const [saving, setSaving] = useState(false)
  const [verified, setVerified] = useState(false)
  const toast = useToast()

  async function handleAnalyze(){
    setApiError('')
    setInlineError('')
    setResult(null)
    setLoading(true)
    if(!errorMessage.trim()){
      setInlineError('Error message is required')
      if(textRef.current){ 
        textRef.current.classList.remove('shake')
        void textRef.current.offsetWidth
        textRef.current.classList.add('shake') 
      }
      setLoading(false)
      return
    }
    try{
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ errorMessage, codeSnippet })
      })
      if(!res.ok){
        const txt = await res.text()
        throw new Error(txt || res.statusText)
      }
      const data = await res.json()
      setResult(data)
    }catch(err){
      console.error(err)
      setApiError(err.message || 'Request failed')
      toast && toast.showError && toast.showError(err.message || 'Request failed')
    }finally{
      setLoading(false)
    }
  }

  async function handleSave(){
    if(!result) return
    setSaving(true)
    try{
      const payload = { ...result, errorMessage, codeSnippet, verified }
      const res = await fetch(`${API_BASE}/api/errors`, {
        method: 'POST', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify(payload)
      })
      if(!res.ok) throw new Error(await res.text())
      toast && toast.showSuccess && toast.showSuccess('Saved successfully')
      // Reset after save
      setResult(null)
      setErrorMessage('')
      setCodeSnippet('')
      setVerified(false)
    }catch(err){
      console.error(err)
      setApiError(err.message || 'Save failed')
      toast && toast.showError && toast.showError(err.message || 'Save failed')
    }finally{setSaving(false)}
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[var(--accent-glow)] text-[var(--accent)]">
          <Sparkles size={22} className="animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Error Analyzer</h1>
          <p className="text-sm text-[var(--text-muted)]">Paste your stack trace or compilation error to get instant diagnoses and solutions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-6 space-y-5 glass-panel p-6 rounded-xl">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
              <Terminal size={14} className="text-[var(--accent)]" />
              Error Message / Stack Trace <span className="text-[var(--danger)]">*</span>
            </label>
            <textarea
              value={errorMessage}
              onChange={(e)=>setErrorMessage(e.target.value)}
              ref={textRef}
              placeholder="Paste the full error log, exception, or stack trace here..."
              className="w-full min-h-[180px] resize-y input-field p-3.5 font-code text-sm rounded-lg"
            />
            {inlineError && (
              <div className="text-xs font-medium text-[var(--danger)] mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]" />
                {inlineError}
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
              <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--border)] font-mono text-[var(--text-muted)]">JSON/JS</span>
              Code Snippet (optional)
            </label>
            <textarea
              value={codeSnippet}
              onChange={(e)=>setCodeSnippet(e.target.value)}
              placeholder="// Paste relevant file content or the failing function here to give AI context..."
              className="w-full min-h-[140px] resize-y input-field p-3.5 font-code text-sm rounded-lg"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg text-white font-medium bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 duration-200"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            <span>{loading ? 'Analyzing with Gemini...' : 'Analyze Error'}</span>
          </button>

          {apiError && (
            <div className="p-4 rounded-lg bg-[var(--danger-glow)] text-[var(--danger)] border border-[rgba(244,63,94,0.2)] text-sm flex items-start gap-2.5">
              <span className="mt-0.5 font-bold">⚠️</span>
              <div>
                <span className="font-semibold block mb-0.5">Analysis Failed</span>
                {apiError}
              </div>
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-6">
          {result ? (
            <div className="space-y-5 animate-fade-in-up">
              <div className="glass-panel p-6 rounded-xl border-l-4 border-l-[var(--accent)] space-y-5">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent)]">Diagnosis Title</span>
                  <h2 className="text-lg font-bold text-white mt-0.5">{result.title || 'Untitled Explanation'}</h2>
                </div>

                <div className="border-t border-[var(--border)] pt-4">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-[var(--text-muted)] mb-1.5">What Happened</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {result.aiExplanation?.whatHappened || '—'}
                  </p>
                </div>

                <div className="border-t border-[var(--border)] pt-4">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-[var(--text-muted)] mb-1.5">Root Cause</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {result.aiExplanation?.rootCause || '—'}
                  </p>
                </div>

                <div className="border-t border-[var(--border)] pt-4">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-[var(--text-muted)] mb-2">Fix / Solution</h3>
                  <pre className="font-code text-sm p-4 rounded-lg bg-[#09090b]/80 border border-[var(--border)] overflow-x-auto text-[var(--text-primary)]">
                    {result.aiExplanation?.fix || '—'}
                  </pre>
                </div>

                {result.aiExplanation?.watchOutFor?.length > 0 && (
                  <div className="border-t border-[var(--border)] pt-4">
                    <h3 className="text-xs uppercase font-bold tracking-widest text-[var(--text-muted)] mb-2">Watch Out For</h3>
                    <ul className="space-y-1.5">
                      {result.aiExplanation.watchOutFor.map((it, i) => (
                        <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                          <ChevronRight size={14} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.tags?.length > 0 && (
                  <div className="border-t border-[var(--border)] pt-4 flex flex-wrap gap-1.5">
                    {result.tags.map((t, i) => (
                      <span 
                        key={i} 
                        className="text-[11px] font-mono font-medium text-[var(--accent)] px-2.5 py-1 rounded-md bg-[var(--accent-glow)] border border-[rgba(99,102,241,0.15)]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 glass-panel rounded-xl">
                <div className="flex items-center gap-3">
                  <label className="relative flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={verified} 
                      onChange={(e)=>setVerified(e.target.checked)}
                      className="w-4 h-4 rounded border-[var(--border)] bg-[#09090b] text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    <span className="text-sm font-medium text-[var(--text-secondary)]">Mark as Verified</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setResult(null)} 
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] border border-[var(--border)] transition-all"
                  >
                    <Trash2 size={14} />
                    <span>Discard</span>
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 shadow-[0_2px_10px_rgba(99,102,241,0.1)] hover:-translate-y-0.5 duration-200"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    <span>{saving ? 'Saving...' : 'Save diagnosis'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-[var(--border)] rounded-xl bg-[rgba(255,255,255,0.01)] text-[var(--text-muted)]">
              <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.02)] flex items-center justify-center mb-3">
                <Sparkles size={20} className="text-[var(--text-muted)]" />
              </div>
              <h3 className="font-semibold text-white mb-1">Awaiting Analysis</h3>
              <p className="text-xs max-w-xs leading-relaxed">
                Provide an error description and run the analyzer to see Gemini's structured response here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
