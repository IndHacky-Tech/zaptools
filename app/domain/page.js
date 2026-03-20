'use client';
import { useState } from 'react';

const EXTENSIONS = ['.com', '.in', '.io', '.co', '.net', '.org', '.dev', '.app', '.ai', '.tech'];

export default function DomainChecker() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState('');

  const cleanDomain = (val) => {
    return val.trim().toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .split('.')[0];
  };

  const checkDomain = async (domain) => {
    try {
      const res = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
      const data = await res.json();
      // If Answer exists = domain is taken
      // If Status 3 (NXDOMAIN) = domain is available
      if (data.Status === 3 || !data.Answer) {
        return 'available';
      }
      return 'taken';
    } catch {
      return 'unknown';
    }
  };

  const check = async () => {
    if (!input.trim()) return;
    const base = cleanDomain(input);
    if (!base) return;

    setLoading(true);
    setResults([]);
    setSearched(base);

    const checks = EXTENSIONS.map(async (ext) => {
      const full = base + ext;
      const status = await checkDomain(full);
      return { domain: full, status };
    });

    const all = await Promise.all(checks);
    setResults(all);
    setLoading(false);
  };

  const statusColor = (s) => {
    if (s === 'available') return { bg: 'rgba(16,185,129,.1)', border: 'rgba(16,185,129,.25)', color: '#10b981', label: '✓ Available' };
    if (s === 'taken') return { bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.2)', color: '#ef4444', label: '✗ Taken' };
    return { bg: 'rgba(255,255,255,.04)', border: 'rgba(255,255,255,.08)', color: '#4a5568', label: '? Unknown' };
  };

  const available = results.filter(r => r.status === 'available');

  return (
    <main style={{minHeight:'100vh',background:'#060609',color:'white',fontFamily:"'Cabinet Grotesk',sans-serif",padding:'40px 24px'}}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cabinet+Grotesk:wght@400;500;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .domain-row{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-radius:14px;border:1px solid;transition:all .2s;animation:fadeIn .3s ease both}
        .domain-row:hover{transform:translateX(4px)}
        .buy-btn{padding:7px 16px;border-radius:8px;background:rgba(245,230,66,.08);border:1px solid rgba(245,230,66,.2);color:#F5E642;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;text-decoration:none;transition:all .2s}
        .buy-btn:hover{background:rgba(245,230,66,.15);border-color:rgba(245,230,66,.4)}
      `}</style>

      {/* Back */}
      <a href="/" style={{display:'inline-flex',alignItems:'center',gap:'8px',color:'#4a5568',textDecoration:'none',fontSize:'13px',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'48px',transition:'color .2s'}}
        onMouseOver={e=>e.currentTarget.style.color='white'}
        onMouseOut={e=>e.currentTarget.style.color='#4a5568'}
      >← Back</a>

      <div style={{maxWidth:'760px',margin:'0 auto'}}>

        {/* Header */}
        <div style={{marginBottom:'48px'}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#F5E642',opacity:.75,marginBottom:'12px'}}>🌐 Domain Tool</div>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(54px,8vw,90px)',lineHeight:.9,marginBottom:'12px'}}>Domain<br/>Checker</h1>
          <p style={{color:'#4a5568',fontSize:'15px',fontWeight:500}}>Check domain availability across 10 extensions instantly. Free, no signup, no limits.</p>
        </div>

        {/* Input */}
        <div style={{background:'rgba(255,255,255,.032)',border:'1px solid rgba(255,255,255,.072)',borderRadius:'22px',padding:'28px',marginBottom:'20px'}}>
          <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',letterSpacing:'.15em',textTransform:'uppercase',color:'#4a5568',display:'block',marginBottom:'12px'}}>Enter Domain Name</label>

          <div style={{display:'flex',gap:'12px'}}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && check()}
              placeholder="zaptools, myapp, coolbrand..."
              style={{flex:1,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'12px',padding:'14px 18px',color:'white',fontSize:'14px',fontFamily:"'Cabinet Grotesk',sans-serif",outline:'none',transition:'border-color .2s'}}
              onFocus={e=>e.target.style.borderColor='rgba(245,230,66,.4)'}
              onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.08)'}
            />
            <button
              onClick={check}
              disabled={loading || !input.trim()}
              style={{background:loading||!input.trim()?'rgba(245,230,66,.3)':'#F5E642',color:'#000',padding:'14px 24px',borderRadius:'12px',border:'none',fontWeight:900,fontSize:'13px',letterSpacing:'.06em',textTransform:'uppercase',cursor:loading||!input.trim()?'not-allowed':'pointer',transition:'all .2s',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:'8px'}}
              onMouseOver={e=>{if(!loading&&input.trim()){e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 12px 30px rgba(245,230,66,.3)'}}}
              onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}
            >
              {loading
                ? <><div style={{width:'14px',height:'14px',border:'2px solid rgba(0,0,0,.3)',borderTop:'2px solid #000',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>Checking...</>
                : 'Check →'
              }
            </button>
          </div>

          {/* Extensions Preview */}
          <div style={{marginTop:'16px',display:'flex',flexWrap:'wrap',gap:'6px'}}>
            {EXTENSIONS.map(ext => (
              <span key={ext} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',color:'#252540',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.04)',borderRadius:'6px',padding:'4px 8px'}}>
                {ext}
              </span>
            ))}
          </div>
        </div>

        {/* Summary */}
        {results.length > 0 && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'20px'}}>
            {[
              {label:'Available',val:available.length,color:'#10b981',bg:'rgba(16,185,129,.08)',border:'rgba(16,185,129,.2)'},
              {label:'Taken',val:results.filter(r=>r.status==='taken').length,color:'#ef4444',bg:'rgba(239,68,68,.08)',border:'rgba(239,68,68,.2)'},
              {label:'Checked',val:results.length,color:'#F5E642',bg:'rgba(245,230,66,.06)',border:'rgba(245,230,66,.15)'},
            ].map(s => (
              <div key={s.label} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:'16px',padding:'18px',textAlign:'center',animation:'fadeIn .4s ease'}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'40px',color:s.color,lineHeight:1}}>{s.val}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',color:s.color,opacity:.6,letterSpacing:'.1em',textTransform:'uppercase',marginTop:'4px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div style={{background:'rgba(255,255,255,.032)',border:'1px solid rgba(255,255,255,.072)',borderRadius:'22px',padding:'24px'}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',letterSpacing:'.15em',textTransform:'uppercase',color:'#4a5568',marginBottom:'16px'}}>
              Results for "{searched}"
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {results.map((r, i) => {
                const s = statusColor(r.status);
                return (
                  <div key={r.domain} className="domain-row"
                    style={{background:s.bg,borderColor:s.border,animationDelay:`${i*0.04}s`}}
                  >
                    <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'15px',fontWeight:700,color:'white'}}>{r.domain}</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',fontWeight:600,color:s.color}}>{s.label}</span>
                      {r.status === 'available' && (
                        <a
                          href={`https://www.namecheap.com/domains/registration/results/?domain=${r.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="buy-btn"
                        >
                          Buy →
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}