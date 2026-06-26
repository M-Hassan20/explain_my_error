import React from 'react'

export default class ErrorBoundary extends React.Component{
  constructor(props){super(props); this.state={hasError:false}}
  static getDerivedStateFromError(){ return {hasError:true} }
  componentDidCatch(e,info){ console.error(e,info) }
  render(){
    if(this.state.hasError){
      return (
        <div className="h-screen w-screen flex items-center justify-center" style={{backgroundColor:'var(--bg)', color:'var(--text-primary)'}}>
          <div className="text-center">
            <div className="text-lg font-semibold mb-3">Something went wrong</div>
            <button onClick={()=> location.reload()} className="px-4 py-2 rounded" style={{backgroundColor:'var(--accent)', color:'#fff'}}>Reload</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
