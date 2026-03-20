'use client';
import { useState } from 'react';

const PLATFORMS = ['Instagram', 'YouTube', 'Twitter/X', 'LinkedIn', 'TikTok'];
const COUNTS = [10, 20, 30];

export default function HashtagGenerator() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [count, setCount] = useState(20);
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setHashtags([]);

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are a social media expert. Generate exactly ${count} trending hashtags for ${platform} about the given topic. Return ONLY a JSON array of strings. Each string must start with #. No explanation. No markdown. Just the raw JSON array like: ["#tag1","#tag2"]`
            },
            {
              role: 'user',
              content: `Topic: ${topic}`
            }
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(`API Error: ${data.error.message}`);
        return;
      }

      if (!data.choices || !data.choices[0]) {
        setError(`Unexpected response. Please try again.`);
        return;
      }

      const content = data.choices[0].message.content.trim();

      try {
        const match = content.match(/\[[\s\S]*?\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHashtags(parsed);
            return;
          }
        }
      } catch (_) {}

      const tags = content.match(/#\w+/g);
      if (tags && tags.length > 0) {
        setHashtags(tags);
      } else {
        setError('Could not parse hashtags. Try again!');
      }

    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(hashtags.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyOne = (tag) => {
    navigator.clipboard.writeText(tag);
  };

  return (
    <main style={{minHeight:'100vh',background:'#060609',color:'white',fontFamily:"'Cabinet Grotesk',sans-serif",padding:'40px 24px'}}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cabinet+Grotesk:wght@400;500;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>

      <style>{`
        .tag-chip{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;display:inline-block}
        .tag-chip:hover{background:rgba(245,230,66,.1);border-color:rgba(245,230,66,.4);color:#F5E642;transform:translateY(-2px)}
        .plat-btn{padding:8px 18px;border-radius:999px;border:1px solid rgba(255,255,255,.08);background:transparent;color:#4a5568;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;font-family:'JetBrains Mono',monospace;letter-spacing:.06em}
        .plat-btn.active{background:rgba(245,230,66,.1);border-color:rgba(245,230,66,.4);color:#F5E642}
        .plat-btn:hover{border-color:rgba(255,255,255,.2);color:white}
        .cnt-btn{width:52px;height:36px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:transparent;color:#4a5568;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;font-family:'JetBrains Mono',monospace}
        .cnt-btn.active{background:rgba(245,230,66,.1);border-color:rgba(245,230,66,.4);color:#F5E642}
        .cnt-btn:hover{border-color:rgba(255,255,255,.2);color:white}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <a href="/" style={{display:'inline-flex',alignItems:'center',gap:'8px',color:'#4a5568',textDecoration:'none',fontSize:'13px',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'48px',transition:'color .2s'}}
        onMouseOver={e=>e.currentTarget.style.color='white'}
        onMouseOut={e=>e.currentTarget.style.color='#4a5568'}
      >← Back</a>

      <div style={{maxWidth:'860px',margin:'0 auto'}}>
        <div style={{marginBottom:'48px'}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#F5E642',opacity:.75,marginBottom:'12px'}}>✦ AI Powered</div>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(54px,8vw,90px)',lineHeight:.9,marginBottom:'12px'}}>Hashtag<br/>Generator</h1>
          <p style={{color:'#4a5568',fontSize:'15px',fontWeight:500}}>AI-powered hashtags for Instagram, YouTube, Twitter & more. Free, instant, no fluff.</p>
        </div>

        <div style={{background:'rgba(255,255,255,.032)',border:'1px solid rgba(255,255,255,.072)',borderRadius:'22px',padding:'28px',marginBottom:'20px'}}>
          <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',letterSpacing:'.15em',textTransform:'uppercase',color:'#4a5568',display:'block',marginBottom:'12px'}}>Topic or Niche</label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="e.g. Cricket, Food, Fitness, Travel..."
            style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'12px',padding:'14px 18px',color:'white',fontSize:'14px',fontFamily:"'Cabinet Grotesk',sans-serif",outline:'none',transition:'border-color .2s',marginBottom:'24px'}}
            onFocus={e=>e.target.style.borderColor='rgba(245,230,66,.4)'}
            onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.08)'}
          />

          <div style={{marginBottom:'20px'}}>
            <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',letterSpacing:'.15em',textTransform:'uppercase',color:'#4a5568',display:'block',marginBottom:'12px'}}>Platform</label>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              {PLATFORMS.map(p => (
                <button key={p} className={`plat-btn${platform===p?' active':''}`} onClick={()=>setPlatform(p)}>{p}</button>
              ))}
            </div>
          </div>

          <div style={{marginBottom:'24px'}}>
            <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',letterSpacing:'.15em',textTransform:'uppercase',color:'#4a5568',display:'block',marginBottom:'12px'}}>How many hashtags?</label>
            <div style={{display:'flex',gap:'8px'}}>
              {COUNTS.map(c => (
                <button key={c} className={`cnt-btn${count===c?' active':''}`} onClick={()=>setCount(c)}>{c}</button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading || !topic.trim()}
            style={{width:'100%',background:loading||!topic.trim()?'rgba(245,230,66,.3)':'#F5E642',color:'#000',padding:'15px',borderRadius:'12px',border:'none',fontWeight:900,fontSize:'13px',letterSpacing:'.08em',textTransform:'uppercase',cursor:loading||!topic.trim()?'not-allowed':'pointer',transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}
          >
            {loading ? (
              <>
                <div style={{width:'16px',height:'16px',border:'2px solid rgba(0,0,0,.3)',borderTop:'2px solid #000',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
                Generating...
              </>
            ) : '✦ Generate Hashtags'}
          </button>
        </div>

        {error && (
          <div style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.2)',borderRadius:'14px',padding:'16px 20px',marginBottom:'20px',color:'#ef4444',fontSize:'14px',fontWeight:600}}>
            ⚠️ {error}
          </div>
        )}

        {hashtags.length > 0 && (
          <div style={{background:'rgba(255,255,255,.032)',border:'1px solid rgba(255,255,255,.072)',borderRadius:'22px',padding:'28px',animation:'fadeIn .4s ease'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px',flexWrap:'wrap',gap:'12px'}}>
              <div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',letterSpacing:'.15em',textTransform:'uppercase',color:'#4a5568',marginBottom:'4px'}}>Results</div>
                <div style={{fontSize:'15px',fontWeight:700,color:'white'}}>{hashtags.length} hashtags for <span style={{color:'#F5E642'}}>{topic}</span> on {platform}</div>
              </div>
              <button onClick={copyAll}
                style={{background:copied?'rgba(16,185,129,.15)':'rgba(245,230,66,.08)',color:copied?'#10b981':'#F5E642',border:`1px solid ${copied?'rgba(16,185,129,.3)':'rgba(245,230,66,.3)'}`,padding:'10px 20px',borderRadius:'10px',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',fontWeight:500,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',transition:'all .2s'}}
              >
                {copied ? '✓ Copied!' : 'Copy All'}
              </button>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
              {hashtags.map((tag, i) => (
                <span key={i} className="tag-chip" onClick={() => copyOne(tag)} title="Click to copy"
                  style={{animationDelay:`${i*0.03}s`,animation:'fadeIn .3s ease both'}}>
                  {tag}
                </span>
              ))}
            </div>
            <div style={{marginTop:'16px',fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',color:'#252540',letterSpacing:'.08em'}}>
              💡 Click any hashtag to copy individually
            </div>
          </div>
        )}
      </div>
    </main>
  );
}