import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function useToast(){ return useContext(ToastContext) }

export default function ToastProvider({children}){
  const [toasts, setToasts] = useState([])

  const show = useCallback((type, message)=>{
    const id = Math.random().toString(36).slice(2)
    setToasts(t=>[...t, {id, type, message}])
    setTimeout(()=> setToasts(t=>t.filter(x=>x.id!==id)), 3000)
  },[])

  const value = { showSuccess: (m)=>show('success', m), showError: (m)=>show('error', m) }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-6 right-6 flex flex-col gap-3 z-50">
        {toasts.map(t=> (
          <div key={t.id} className="px-4 py-2 rounded shadow" style={{backgroundColor:'#252526', borderLeft: `4px solid ${t.type==='success'? 'var(--success)': '#f44747'}`, color:'var(--text-primary)'}}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
