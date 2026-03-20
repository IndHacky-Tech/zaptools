'use client';
import { useState, useRef } from 'react';

const TOOLS = [
  { id: 'pdf2img', label: '📄 PDF → Images', desc: 'Convert PDF pages to PNG images' },
  { id: 'img2pdf', label: '📸 Images → PDF', desc: 'Combine images into one PDF' },
  { id: 'docx2pdf', label: '📝 DOCX → PDF', desc: 'Convert Word doc to PDF' },
];

// ── PDF TO IMAGES ─────────────────────────────────────────────────
function PDFtoImages() {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setImages([]); setDone(false); setError('');
  };

  const convert = async () => {
    if (!file) return;
    setLoading(true); setError(''); setImages([]); setDone(false);
    try {
      setProgress('Loading PDF...');
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.min.js', import.meta.url).toString();

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const result = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setProgress(`Converting page ${pageNum} of ${totalPages}...`);
        const page = await pdf.getPage(pageNum);
        const scale = 2; // High quality
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/png');
        result.push({ src: dataUrl, page: pageNum });
      }

      setImages(result);
      setDone(true);
      setProgress('');
    } catch (err) {
      console.error(err);
      setError('Could not convert PDF. Make sure it is a valid PDF file.');
    }
    setLoading(false);
  };

  const downloadOne = (img) => {
    const a = document.createElement('a');
    a.href = img.src;
    a.download = `${file.name.replace('.pdf', '')}-page-${img.page}.png`;
    a.click();
  };

  const downloadAll = () => images.forEach(img => downloadOne(img));

  const reset = () => { setFile(null); setImages([]); setDone(false); setError(''); setProgress(''); };

  return (
    <div>
      <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} style={{ display: 'none' }} />
      {!file ? (
        <div onClick={() => inputRef.current.click()}
          style={{ border: '2px dashed rgba(245,230,66,.2)', borderRadius: '16px', padding: '52px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s' }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(245,230,66,.5)'; e.currentTarget.style.background = 'rgba(245,230,66,.03)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(245,230,66,.2)'; e.currentTarget.style.background = 'transparent'; }}>
          <div style={{ fontSize: '44px', marginBottom: '14px' }}>📄</div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Click to select PDF</div>
          <div style={{ fontSize: '13px', color: '#4a5568', marginBottom: '14px' }}>Each page becomes a high-quality PNG image</div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['✅ High quality 2x', '✅ All pages', '✅ PNG format', '✅ Works offline'].map((f, i) => (
              <span key={i} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#4a5568', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', padding: '4px 10px', borderRadius: '6px' }}>{f}</span>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* File info */}
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '32px' }}>📄</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '3px' }}>{file.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#4a5568' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
            {!loading && <button onClick={reset} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: '#6b7280', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Change</button>}
          </div>

          {/* Progress */}
          {loading && (
            <div style={{ background: 'rgba(245,230,66,.05)', border: '1px solid rgba(245,230,66,.15)', borderRadius: '12px', padding: '18px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '20px', height: '20px', border: '2.5px solid rgba(245,230,66,.2)', borderTop: '2.5px solid #F5E642', borderRadius: '50%', animation: 'spin .8s linear infinite', flexShrink: 0 }} />
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: '#F5E642' }}>{progress}</div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px' }}>
              <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 600 }}>⚠️ {error}</div>
            </div>
          )}

          {/* Results */}
          {images.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{images.length} page{images.length !== 1 ? 's' : ''} converted ✅</div>
                <button onClick={downloadAll}
                  style={{ background: '#F5E642', color: '#000', padding: '10px 22px', borderRadius: '10px', border: 'none', fontWeight: 900, fontSize: '12px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  ⬇ Download All
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {images.map((img, i) => (
                  <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)', background: '#111', cursor: 'pointer', transition: 'all .2s' }}
                    onClick={() => downloadOne(img)}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(245,230,66,.4)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'}>
                    <img src={img.src} alt={`Page ${img.page}`} style={{ width: '100%', display: 'block' }} />
                    <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#4a5568' }}>Page {img.page}</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#F5E642' }}>↓ PNG</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#252540' }}>💡 Click any image to download individually</div>
            </div>
          )}

          {/* Convert button */}
          {!done && !loading && (
            <button onClick={convert}
              style={{ background: '#F5E642', color: '#000', padding: '13px 28px', borderRadius: '12px', border: 'none', fontWeight: 900, fontSize: '13px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s' }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              ⬇ Convert to Images
            </button>
          )}

          {done && (
            <button onClick={reset} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: '#6b7280', padding: '11px 22px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginTop: '8px' }}>
              Convert Another PDF
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── IMAGE TO PDF ──────────────────────────────────────────────────
function ImageToPDF() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef();

  const handleFiles = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    Promise.all(files.map(file => new Promise(res => {
      const reader = new FileReader();
      reader.onload = e => res({ name: file.name, src: e.target.result });
      reader.readAsDataURL(file);
    }))).then(imgs => { setImages(prev => [...prev, ...imgs]); setDone(false); });
  };

  const removeImage = (i) => setImages(prev => prev.filter((_, idx) => idx !== i));
  const moveUp = (i) => { if (i === 0) return; const a = [...images]; [a[i-1],a[i]]=[a[i],a[i-1]]; setImages(a); };
  const moveDown = (i) => { if (i === images.length-1) return; const a=[...images]; [a[i],a[i+1]]=[a[i+1],a[i]]; setImages(a); };

  const convert = async () => {
    if (!images.length) return;
    setLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const W = 210, H = 297;
      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage();
        const img = new window.Image();
        await new Promise(res => { img.onload = res; img.src = images[i].src; });
        const scale = Math.min(W / img.width, H / img.height);
        pdf.addImage(images[i].src, 'JPEG', (W - img.width*scale)/2, (H - img.height*scale)/2, img.width*scale, img.height*scale);
      }
      pdf.save('zaptools-images.pdf');
      setDone(true);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
      {images.length === 0 ? (
        <div onClick={() => inputRef.current.click()}
          style={{ border: '2px dashed rgba(245,230,66,.2)', borderRadius: '16px', padding: '52px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s' }}
          onMouseOver={e => { e.currentTarget.style.borderColor='rgba(245,230,66,.5)'; e.currentTarget.style.background='rgba(245,230,66,.03)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor='rgba(245,230,66,.2)'; e.currentTarget.style.background='transparent'; }}>
          <div style={{ fontSize: '44px', marginBottom: '14px' }}>📸</div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Click to select images</div>
          <div style={{ fontSize: '13px', color: '#4a5568' }}>PNG, JPG, WEBP — multiple files OK</div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
                <img src={img.src} alt={img.name} style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
                  <button onClick={() => removeImage(i)} style={{ background: 'rgba(239,68,68,.85)', border: 'none', borderRadius: '4px', color: 'white', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}>×</button>
                </div>
                <div style={{ position: 'absolute', bottom: '4px', left: '4px', display: 'flex', gap: '2px' }}>
                  <button onClick={() => moveUp(i)} style={{ background: 'rgba(0,0,0,.75)', border: 'none', borderRadius: '3px', color: 'white', width: '16px', height: '16px', cursor: 'pointer', fontSize: '8px' }}>↑</button>
                  <button onClick={() => moveDown(i)} style={{ background: 'rgba(0,0,0,.75)', border: 'none', borderRadius: '3px', color: 'white', width: '16px', height: '16px', cursor: 'pointer', fontSize: '8px' }}>↓</button>
                </div>
                <div style={{ padding: '3px 6px', fontSize: '8px', color: '#4a5568', background: '#0a0a0f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i+1}. {img.name}</div>
              </div>
            ))}
            <div onClick={() => inputRef.current.click()}
              style={{ height: '110px', border: '2px dashed rgba(255,255,255,.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a5568', fontSize: '26px', transition: 'all .2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor='rgba(245,230,66,.3)'; e.currentTarget.style.color='#F5E642'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.1)'; e.currentTarget.style.color='#4a5568'; }}>+</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={convert} disabled={loading}
              style={{ background: loading ? 'rgba(245,230,66,.3)' : '#F5E642', color: '#000', padding: '13px 28px', borderRadius: '12px', border: 'none', fontWeight: 900, fontSize: '13px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: '8px' }}
              onMouseOver={e => { if(!loading) e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
              {loading ? <><div style={{ width:'14px',height:'14px',border:'2px solid rgba(0,0,0,.3)',borderTop:'2px solid #000',borderRadius:'50%',animation:'spin .8s linear infinite' }}/>Converting...</> : '⬇ Download PDF'}
            </button>
            <button onClick={() => { setImages([]); setDone(false); }} style={{ background:'transparent',border:'1px solid rgba(255,255,255,.1)',color:'#6b7280',padding:'13px 20px',borderRadius:'12px',cursor:'pointer',fontSize:'13px',fontWeight:600 }}>Clear</button>
            {done && <span style={{ color:'#10b981',fontFamily:"'JetBrains Mono',monospace",fontSize:'12px',fontWeight:700 }}>✓ Downloaded!</span>}
          </div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',color:'#252540',marginTop:'10px' }}>💡 Arrows to reorder · {images.length} image{images.length!==1?'s':''} selected</div>
        </div>
      )}
    </div>
  );
}

// ── DOCX TO PDF ───────────────────────────────────────────────────
function DocxToPDF() {
  const [file, setFile] = useState(null);
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('upload');
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setError(''); setLoading(true); setStep('upload');
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.convertToHtml({ arrayBuffer: await f.arrayBuffer() });
      setHtml(result.value); setStep('preview');
    } catch { setError('Could not read DOCX file.'); }
    setLoading(false);
  };

  const downloadPDF = () => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>${file?.name?.replace('.docx','')}</title><style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.6;margin:2.5cm;color:#000}h1,h2,h3{margin:1em 0 .5em}p{margin:.5em 0}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px 10px}</style></head><body>${html}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); setStep('done'); }, 500);
  };

  const reset = () => { setFile(null); setHtml(''); setStep('upload'); setError(''); };

  return (
    <div>
      <input ref={inputRef} type="file" accept=".docx" onChange={handleFile} style={{ display: 'none' }} />
      {step === 'upload' && !loading && (
        <div onClick={() => inputRef.current.click()}
          style={{ border:'2px dashed rgba(245,230,66,.2)',borderRadius:'16px',padding:'52px 24px',textAlign:'center',cursor:'pointer',transition:'all .2s' }}
          onMouseOver={e => { e.currentTarget.style.borderColor='rgba(245,230,66,.5)'; e.currentTarget.style.background='rgba(245,230,66,.03)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor='rgba(245,230,66,.2)'; e.currentTarget.style.background='transparent'; }}>
          <div style={{ fontSize:'44px',marginBottom:'14px' }}>📝</div>
          <div style={{ fontSize:'17px',fontWeight:700,color:'white',marginBottom:'8px' }}>Click to select DOCX</div>
          <div style={{ fontSize:'13px',color:'#4a5568' }}>Microsoft Word (.docx) files only</div>
          {error && <div style={{ marginTop:'14px',color:'#ef4444',fontSize:'13px',fontWeight:600 }}>⚠️ {error}</div>}
        </div>
      )}
      {loading && <div style={{ textAlign:'center',padding:'52px' }}><div style={{ width:'36px',height:'36px',border:'3px solid rgba(245,230,66,.2)',borderTop:'3px solid #F5E642',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 16px' }}/><div style={{ color:'#6b7280',fontFamily:"'JetBrains Mono',monospace",fontSize:'12px' }}>Processing...</div></div>}
      {step === 'preview' && !loading && (
        <div>
          <div style={{ background:'#fff',borderRadius:'12px',padding:'28px',marginBottom:'16px',maxHeight:'360px',overflowY:'auto',border:'1px solid rgba(255,255,255,.1)' }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'9px',color:'#aaa',marginBottom:'14px',textTransform:'uppercase',letterSpacing:'.1em' }}>Preview — {file?.name}</div>
            <div style={{ color:'#111',fontSize:'13px',lineHeight:1.7 }} dangerouslySetInnerHTML={{ __html: html }}/>
          </div>
          <div style={{ display:'flex',gap:'10px',flexWrap:'wrap' }}>
            <button onClick={downloadPDF} style={{ background:'#F5E642',color:'#000',padding:'13px 28px',borderRadius:'12px',border:'none',fontWeight:900,fontSize:'13px',letterSpacing:'.06em',textTransform:'uppercase',cursor:'pointer',transition:'all .2s' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>🖨️ Print / Save as PDF</button>
            <button onClick={reset} style={{ background:'transparent',border:'1px solid rgba(255,255,255,.1)',color:'#6b7280',padding:'13px 20px',borderRadius:'12px',cursor:'pointer',fontSize:'13px',fontWeight:600 }}>Try Another</button>
          </div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',color:'#4a5568',marginTop:'10px' }}>💡 Print dialog → select "Save as PDF"</div>
        </div>
      )}
      {step === 'done' && <div style={{ textAlign:'center',padding:'32px' }}><div style={{ fontSize:'48px',marginBottom:'12px' }}>✅</div><div style={{ fontSize:'18px',fontWeight:700,color:'white',marginBottom:'20px' }}>Done!</div><button onClick={reset} style={{ background:'#F5E642',color:'#000',padding:'12px 28px',borderRadius:'12px',border:'none',fontWeight:900,fontSize:'13px',cursor:'pointer' }}>Convert Another</button></div>}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────
export default function Converter() {
  const [activeTool, setActiveTool] = useState('pdf2img');

  return (
    <main style={{ minHeight:'100vh',background:'#060609',color:'white',fontFamily:"'Cabinet Grotesk',sans-serif",padding:'40px 24px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cabinet+Grotesk:wght@400;500;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <a href="/" style={{display:'inline-flex',alignItems:'center',gap:'8px',color:'#6b7280',textDecoration:'none',fontSize:'13px',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'48px',transition:'all .2s',border:'1px solid rgba(255,255,255,.1)',padding:'10px 20px',borderRadius:'999px'}}
  onMouseOver={e=>{e.currentTarget.style.color='white';e.currentTarget.style.borderColor='rgba(255,255,255,.3)';}}
  onMouseOut={e=>{e.currentTarget.style.color='#6b7280';e.currentTarget.style.borderColor='rgba(255,255,255,.1)';}}>← Back</a>

      <div style={{ maxWidth:'820px',margin:'0 auto' }}>
        <div style={{ marginBottom:'40px' }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#F5E642',opacity:.75,marginBottom:'12px' }}>🔄 Converter</div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(54px,8vw,90px)',lineHeight:.9,marginBottom:'12px' }}>File<br/>Converter</h1>
          <p style={{ color:'#4a5568',fontSize:'15px',fontWeight:500 }}>Convert files instantly in your browser. Free, private, no server upload.</p>
        </div>

        <div style={{ display:'flex',gap:'10px',marginBottom:'24px',flexWrap:'wrap' }}>
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => setActiveTool(t.id)}
              style={{ padding:'13px 20px',borderRadius:'14px',border:`1.5px solid ${activeTool===t.id?'rgba(245,230,66,.5)':'rgba(255,255,255,.07)'}`,background:activeTool===t.id?'rgba(245,230,66,.08)':'rgba(255,255,255,.02)',color:activeTool===t.id?'#F5E642':'#6b7280',cursor:'pointer',transition:'all .2s',textAlign:'left' }}>
              <div style={{ fontSize:'14px',fontWeight:800,marginBottom:'3px' }}>{t.label}</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',opacity:.7 }}>{t.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'22px',padding:'28px' }}>
          {activeTool === 'pdf2img' && <PDFtoImages />}
          {activeTool === 'img2pdf' && <ImageToPDF />}
          {activeTool === 'docx2pdf' && <DocxToPDF />}
        </div>

        <div style={{ marginTop:'16px',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px' }}>
          {[
            {icon:'🔒',title:'Private',desc:'Files stay on your device'},
            {icon:'⚡',title:'Instant',desc:'No upload, no waiting'},
            {icon:'💰',title:'Free Forever',desc:'No limits, no account'}
          ].map((item,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'12px',padding:'14px 16px',display:'flex',gap:'10px',alignItems:'flex-start' }}>
              <span style={{ fontSize:'18px' }}>{item.icon}</span>
              <div>
                <div style={{ fontSize:'13px',fontWeight:700,color:'white',marginBottom:'2px' }}>{item.title}</div>
                <div style={{ fontSize:'12px',color:'#4a5568' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}