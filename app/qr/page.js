'use client';
import { useState } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

export default function QRGenerator() {
  const [input, setInput] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');

  const generate = () => {
    if (input.trim()) setQrValue(input.trim());
  };

  const download = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zaptools-qr.png';
    a.click();
  };

  const sliderPct = ((size - 128) / (338 - 128)) * 100;
  return (
    <main style={{minHeight:'100vh',background:'#060609',color:'white',fontFamily:"'Cabinet Grotesk',sans-serif",padding:'40px 24px'}}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cabinet+Grotesk:wght@400;500;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>

      <style>{`
        input[type=range]{-webkit-appearance:none;appearance:none;height:4px;border-radius:999px;outline:none;border:none;cursor:pointer}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:#F5E642;cursor:pointer;box-shadow:0 0 8px rgba(245,230,66,.5);transition:transform .15s}
        input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.2)}
        input[type=range]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#F5E642;cursor:pointer;border:none;box-shadow:0 0 8px rgba(245,230,66,.5)}
      `}</style>

      {/* Back */}
      <a href="/" style={{display:'inline-flex',alignItems:'center',gap:'8px',color:'#4a5568',textDecoration:'none',fontSize:'13px',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'48px',transition:'color .2s'}}
        onMouseOver={e=>e.target.style.color='white'}
        onMouseOut={e=>e.target.style.color='#4a5568'}
      >← Back</a>

      <div style={{maxWidth:'900px',margin:'0 auto'}}>
        {/* Header */}
        <div style={{marginBottom:'48px'}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#F5E642',opacity:.75,marginBottom:'12px'}}>⚡ Utility Tool</div>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(54px,8vw,90px)',lineHeight:.9,marginBottom:'12px'}}>QR Code<br/>Generator</h1>
          <p style={{color:'#4a5568',fontSize:'15px',fontWeight:500}}>Generate QR codes for any URL, text or contact. Free, instant, no watermark.</p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px'}}>

          {/* LEFT — Controls */}
          <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>

            {/* Input */}
            <div style={{background:'rgba(255,255,255,.032)',border:'1px solid rgba(255,255,255,.072)',borderRadius:'18px',padding:'24px'}}>
              <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',letterSpacing:'.15em',textTransform:'uppercase',color:'#4a5568',display:'block',marginBottom:'12px'}}>URL or Text</label>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && generate()}
                placeholder="https://zaptools.in"
                rows={3}
                style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'12px',padding:'14px',color:'white',fontSize:'14px',fontFamily:"'Cabinet Grotesk',sans-serif",resize:'none',outline:'none',transition:'border-color .2s'}}
                onFocus={e=>e.target.style.borderColor='rgba(245,230,66,.4)'}
                onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.08)'}
              />
              <button
                onClick={generate}
                style={{marginTop:'14px',width:'100%',background:'#F5E642',color:'#000',padding:'14px',borderRadius:'12px',border:'none',fontWeight:900,fontSize:'13px',letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',transition:'all .2s'}}
                onMouseOver={e=>{e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 16px 40px rgba(245,230,66,.35)'}}
                onMouseOut={e=>{e.target.style.transform='translateY(0)';e.target.style.boxShadow='none'}}
              >
                Generate QR ⚡
              </button>
            </div>

            {/* Customize */}
            <div style={{background:'rgba(255,255,255,.032)',border:'1px solid rgba(255,255,255,.072)',borderRadius:'18px',padding:'24px'}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',letterSpacing:'.15em',textTransform:'uppercase',color:'#4a5568',marginBottom:'20px'}}>Customize</div>

              {/* Size Slider */}
              <div style={{marginBottom:'20px'}}>
                <label style={{fontSize:'13px',color:'#6b7280',display:'flex',justifyContent:'space-between',marginBottom:'12px',fontWeight:600}}>
                  <span>Size</span>
                  <span style={{color:'#F5E642',fontFamily:"'JetBrains Mono',monospace",fontSize:'12px'}}>{size}px</span>
                </label>
                <input
                  type="range"
                  min="128"
                  max="338"
                  step="1"
                  value={size}
                  onChange={e => setSize(+e.target.value)}
                  style={{
                    width:'100%',
                    background:`linear-gradient(to right, #F5E642 ${sliderPct}%, rgba(255,255,255,.1) ${sliderPct}%)`,
                  }}
                />
                <div style={{display:'flex',justifyContent:'space-between',marginTop:'6px'}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',color:'#2d2d44'}}>128px</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',color:'#2d2d44'}}>338px</span>
                </div>
              </div>

              {/* Colors */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div>
                  <label style={{fontSize:'13px',color:'#6b7280',display:'block',marginBottom:'8px',fontWeight:600}}>QR Color</label>
                  <div style={{position:'relative',height:'44px',borderRadius:'10px',border:'1px solid rgba(255,255,255,.1)',overflow:'hidden',cursor:'pointer'}}>
                    <input type="color" value={fgColor} onChange={e=>setFgColor(e.target.value)}
                      style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none',cursor:'pointer',padding:0,opacity:0}}
                    />
                    <div style={{position:'absolute',inset:0,background:fgColor,borderRadius:'9px',pointerEvents:'none'}}/>
                  </div>
                </div>
                <div>
                  <label style={{fontSize:'13px',color:'#6b7280',display:'block',marginBottom:'8px',fontWeight:600}}>Background</label>
                  <div style={{position:'relative',height:'44px',borderRadius:'10px',border:'1px solid rgba(255,255,255,.1)',overflow:'hidden',cursor:'pointer'}}>
                    <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)}
                      style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none',cursor:'pointer',padding:0,opacity:0}}
                    />
                    <div style={{position:'absolute',inset:0,background:bgColor,borderRadius:'9px',pointerEvents:'none'}}/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Preview */}
          <div style={{background:'rgba(255,255,255,.032)',border:'1px solid rgba(255,255,255,.072)',borderRadius:'18px',padding:'32px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'24px',minHeight:'400px'}}>
            {qrValue ? (
              <>
                <div style={{background:bgColor,padding:'16px',borderRadius:'16px',boxShadow:'0 20px 60px rgba(0,0,0,.4)',transition:'all .3s'}}>
                  <QRCode
                    value={qrValue}
                    size={size}
                    fgColor={fgColor}
                    bgColor={bgColor}
                    level="H"
                    style={{display:'block',maxWidth:'100%',height:'auto'}}
                  />
                </div>
                <button onClick={download}
                  style={{background:'transparent',color:'#F5E642',border:'1px solid rgba(245,230,66,.3)',padding:'12px 28px',borderRadius:'12px',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',fontWeight:500,letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer',transition:'all .2s'}}
                  onMouseOver={e=>{e.target.style.background='rgba(245,230,66,.08)';e.target.style.borderColor='rgba(245,230,66,.6)';e.target.style.transform='translateY(-2px)'}}
                  onMouseOut={e=>{e.target.style.background='transparent';e.target.style.borderColor='rgba(245,230,66,.3)';e.target.style.transform='translateY(0)'}}
                >
                  Download PNG ↓
                </button>
              </>
            ) : (
              <div style={{textAlign:'center',opacity:.25}}>
                <div style={{fontSize:'52px',marginBottom:'14px'}}>⚡</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',letterSpacing:'.12em',textTransform:'uppercase',color:'#4a5568'}}>QR will appear here</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}