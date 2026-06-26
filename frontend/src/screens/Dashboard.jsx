import React, { useEffect, useState, useMemo } from 'react'
import { AlertCircle, CheckCircle2, Tag, Calendar, ChevronRight, BarChart3, Clock } from 'lucide-react'
import { API_BASE } from '../config'
import { useToast } from '../components/ToastProvider'
import { formatDistanceToNow } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function StatCard({ icon, label, value, accent, glowColor, gradient }){
  return (
    <div 
      className="p-5 rounded-xl border border-[var(--border)] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ background: gradient || 'var(--surface)' }}
    >
      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full pointer-events-none opacity-[0.03]" style={{ backgroundColor: accent }} />
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
          <p className="text-xs font-medium text-[var(--text-muted)] mt-1">{label}</p>
        </div>
        <div 
          className="p-3 rounded-lg flex items-center justify-center border" 
          style={{ 
            color: accent, 
            borderColor: glowColor,
            backgroundColor: glowColor 
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({onOpenError}){
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  useEffect(()=>{ fetchAll() },[])

  async function fetchAll(){
    setLoading(true)
    try{
      const res = await fetch(`${API_BASE}/api/errors?limit=100`)
      if(!res.ok) throw new Error(await res.text())
      const d = await res.json()
      // Extract the documents array from pagination payload
      setData(d.data || [])
    }catch(err){
      console.error(err)
      setData([])
      toast && toast.showError && toast.showError(err.message || 'Failed to load stats')
    }finally{setLoading(false)}
  }

  const total = data ? data.length : 0
  const verifiedCount = data ? data.filter(x=>x.verified).length : 0
  const thisWeek = data ? data.filter(x=> (Date.now() - new Date(x.createdAt).getTime()) < 7*24*3600*1000).length : 0

  const tagCounts = useMemo(()=>{
    const m = {};
    (data||[]).forEach(r=> (r.tags||[]).forEach(t=> m[t]=(m[t]||0)+1))
    return Object.entries(m)
      .map(([tag,count])=>({tag, count}))
      .sort((a,b)=>b.count-a.count)
      .slice(0, 5) // Top 5 tags
  },[data])

  const mostCommon = tagCounts[0]?.tag || '—'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[var(--accent-glow)] text-[var(--accent)]">
          <BarChart3 size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Diagnostics Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)]">Real-time statistics, tag frequency breakdown, and recent error alerts.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          icon={<AlertCircle size={20} />} 
          label="Total Diagnosed Errors" 
          value={total} 
          accent="var(--accent)" 
          glowColor="var(--accent-glow)"
        />
        <StatCard 
          icon={<CheckCircle2 size={20} />} 
          label={`Verified Solutions (${total ? Math.round((verifiedCount/total)*100) : 0}%)`} 
          value={verifiedCount} 
          accent="var(--success)" 
          glowColor="var(--success-glow)"
        />
        <StatCard 
          icon={<Tag size={20} />} 
          label="Most Frequent Category" 
          value={mostCommon !== '—' ? `#${mostCommon}` : mostCommon} 
          accent="#f59e0b" 
          glowColor="rgba(245, 158, 11, 0.1)"
        />
        <StatCard 
          icon={<Calendar size={20} />} 
          label="New Incidents This Week" 
          value={thisWeek} 
          accent="#ec4899" 
          glowColor="rgba(236, 72, 153, 0.1)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tag Frequency Chart */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-xl space-y-4">
          <div>
            <h2 className="text-md font-semibold text-white">Incidents by Tag</h2>
            <p className="text-xs text-[var(--text-muted)]">Relative volume of errors categorized by technological taxonomy.</p>
          </div>
          <div style={{height: 240}} className="pt-2">
            {tagCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={tagCounts} margin={{left: 0, right: 10}}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="tag" 
                    type="category" 
                    width={85} 
                    tick={{ fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 11 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#18181b',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'white'
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
                    {tagCounts.map((entry, index) => {
                      const colors = ['#6366f1', '#818cf8', '#a78bfa', '#c084fc', '#f472b6']
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)]">
                No tags recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Errors */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-md font-semibold text-white">Recent Incident Log</h2>
            <p className="text-xs text-[var(--text-muted)]">Timeline of the 5 most recently created error records.</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-center divide-y divide-[var(--border)]/50">
            {data && data.length > 0 ? (
              [...data]
                .sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0,5)
                .map(r=> (
                  <div 
                    key={r._id} 
                    onClick={() => onOpenError && onOpenError(r._id)} 
                    className="flex items-center justify-between py-3 cursor-pointer group hover:bg-[rgba(255,255,255,0.02)] transition-colors rounded-lg px-2 -mx-2"
                  >
                    <div className="space-y-0.5 max-w-[70%]">
                      <div className="text-sm font-semibold text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                        {r.title || 'Untitled Incidents'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                        <Clock size={10} />
                        <span>{formatDistanceToNow(new Date(r.createdAt || Date.now()), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {r.verified && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] shadow-[0_0_8px_var(--success)]" title="Verified" />
                      )}
                      <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-10 text-xs text-[var(--text-muted)]">
                No recent incidents available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
