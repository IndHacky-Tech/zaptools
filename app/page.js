'use client';
import { useEffect } from 'react';
import Script from 'next/script';

export default function Home() {
  useEffect(() => {
    const cur = document.getElementById('cur');
    const ring = document.getElementById('cur-r');
    let cx = 0, cy = 0, rx = 0, ry = 0;
    const onMouseMove = (e) => { cx = e.clientX; cy = e.clientY; cur.style.left = cx + 'px'; cur.style.top = cy + 'px'; };
    document.addEventListener('mousemove', onMouseMove);
    const ri = () => { rx += (cx - rx) * .1; ry += (cy - ry) * .1; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(ri); };
    ri();
    document.querySelectorAll('a,button,.fq').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hov'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hov'));
    });
    const prog = document.getElementById('prog');
    const nv = document.getElementById('nv');
    const onScroll = () => { prog.style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%'; nv.classList.toggle('scrolled', window.scrollY > 50); };
    window.addEventListener('scroll', onScroll);
    const heroTitle = document.querySelector('.hero-title');
    const heroDesc = document.querySelector('.hero-desc');
    const heroBadge = document.querySelector('.hero-badge');
    const onScrollPara = () => { const s = window.scrollY; if (heroTitle) heroTitle.style.transform = `translateY(${s * .25}px)`; if (heroDesc) heroDesc.style.transform = `translateY(${s * .15}px)`; if (heroBadge) heroBadge.style.transform = `translateY(${s * .1}px)`; };
    window.addEventListener('scroll', onScrollPara, { passive: true });
    const obs = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); }); }, { threshold: .1 });
    document.querySelectorAll('.tc,.fc,.step,.fi2,.sc,.reveal,.reveal-left,.reveal-right,.reveal-scale').forEach(el => obs.observe(el));
    document.querySelectorAll('[data-tilt]').forEach(card => {
      const sh = card.querySelector('.tcs');
      card.addEventListener('mousemove', (e) => { const r = card.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top; card.style.transform = `perspective(750px) rotateX(${(.5-(y/r.height))*18}deg) rotateY(${((x/r.width)-.5)*18}deg) translateZ(12px)`; if (sh) { sh.style.setProperty('--mx', (x/r.width*100)+'%'); sh.style.setProperty('--my', (y/r.height*100)+'%'); } });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
    document.querySelectorAll('.fq').forEach(q => {
      q.addEventListener('click', () => { const it = q.parentElement, was = it.classList.contains('open'); document.querySelectorAll('.fi2').forEach(f => f.classList.remove('open')); if (!was) it.classList.add('open'); });
    });
    const cobs = new IntersectionObserver(es => { es.forEach(e => { if (!e.isIntersecting) return; const el = e.target, target = +el.dataset.count; const suf = el.dataset.suffix || ''; if (!target) { cobs.unobserve(el); return; } let v = 0; const inc = target / 50; const tm = setInterval(() => { v = Math.min(v + inc, target); el.textContent = Math.round(v) + suf; if (v >= target) clearInterval(tm); }, 20); cobs.unobserve(el); }); }, { threshold: .5 });
    document.querySelectorAll('[data-count]').forEach(el => cobs.observe(el));
    const pi = setInterval(() => { const p = document.createElement('div'); p.className = 'fp'; const s = 1 + Math.random() * 2.5; p.style.cssText = `left:${Math.random()*100}vw;width:${s}px;height:${s}px;animation-duration:${9+Math.random()*10}s;animation-delay:${Math.random()*2}s`; document.body.appendChild(p); setTimeout(() => p.remove(), 22000); }, 500);
    return () => { document.removeEventListener('mousemove', onMouseMove); window.removeEventListener('scroll', onScroll); window.removeEventListener('scroll', onScrollPara); clearInterval(pi); };
  }, []);

  const initThree = () => {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('c'); if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight);
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 3000); camera.position.z = 70;
    const N = 5000; const sg = new THREE.BufferGeometry(); const spos = new Float32Array(N*3); const scol = new Float32Array(N*3);
    for (let i=0;i<N;i++){const th=Math.random()*Math.PI*2;const ph=Math.acos(2*Math.random()-1);const r=100+Math.random()*800;spos[i*3]=r*Math.sin(ph)*Math.cos(th);spos[i*3+1]=r*Math.sin(ph)*Math.sin(th);spos[i*3+2]=r*Math.cos(ph);const isY=Math.random()>.4;if(isY){scol[i*3]=1;scol[i*3+1]=.87+Math.random()*.1;scol[i*3+2]=Math.random()*.1;}else{const w=.5+Math.random()*.5;scol[i*3]=w*.3;scol[i*3+1]=w*.4;scol[i*3+2]=w;}}
    sg.setAttribute('position',new THREE.BufferAttribute(spos,3));sg.setAttribute('color',new THREE.BufferAttribute(scol,3));
    const stars=new THREE.Points(sg,new THREE.PointsMaterial({size:.7,vertexColors:true,transparent:true,opacity:.95}));scene.add(stars);
    const N2=1500;const sg2=new THREE.BufferGeometry();const sp2=new Float32Array(N2*3);const sc2=new Float32Array(N2*3);
    for(let i=0;i<N2;i++){sp2[i*3]=(Math.random()-.5)*300;sp2[i*3+1]=(Math.random()-.5)*300;sp2[i*3+2]=(Math.random()-.5)*200;const y=Math.random()>.35;sc2[i*3]=y?1:.15;sc2[i*3+1]=y?.88:.15;sc2[i*3+2]=y?0:.25;}
    sg2.setAttribute('position',new THREE.BufferAttribute(sp2,3));sg2.setAttribute('color',new THREE.BufferAttribute(sc2,3));
    const stars2=new THREE.Points(sg2,new THREE.PointsMaterial({size:.5,vertexColors:true,transparent:true,opacity:.8}));scene.add(stars2);
    const shapes=[];
    [[new THREE.OctahedronGeometry(5,0),0xFFE500,.5,[-65,18,-25]],[new THREE.IcosahedronGeometry(4,0),0x1a1a40,.22,[58,-18,-12]],[new THREE.TetrahedronGeometry(3.5,0),0x111130,.16,[-28,-28,8]],[new THREE.OctahedronGeometry(3,0),0xFFE500,.18,[75,32,-35]],[new THREE.IcosahedronGeometry(2,0),0xFFE500,.1,[-80,-10,10]]].forEach(([g,c,o,p])=>{const wf=new THREE.WireframeGeometry(g);const l=new THREE.LineSegments(wf,new THREE.LineBasicMaterial({color:c,transparent:true,opacity:o}));l.position.set(...p);scene.add(l);shapes.push(l);});
    function mkGrid(zStart,step,count,color,opacity){const grp=[];for(let i=0;i<count;i++){const g=new THREE.Group();const sz=160,divs=20,s=sz/divs;const mat=new THREE.LineBasicMaterial({color,transparent:true,opacity});for(let j=0;j<=divs;j++){const x=j*s-sz/2;g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,-80,0),new THREE.Vector3(x,80,0)]),mat));g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-80,x,0),new THREE.Vector3(80,x,0)]),mat));}g.rotation.x=Math.PI/2;g.position.y=-45;g.position.z=zStart-i*step;scene.add(g);grp.push(g);}return grp;}
    const grids1=mkGrid(20,28,10,0x0e0e20,.55);const grids2=mkGrid(5,56,5,0x151528,.35);
    let mx=0,my=0,sy=0,tsy=0,t=0;
    document.addEventListener('mousemove',e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2;});
    window.addEventListener('scroll',()=>{sy=window.scrollY;});
    const animate=()=>{requestAnimationFrame(animate);t+=.0025;tsy+=(sy-tsy)*.04;stars.rotation.y=t*.015;stars.rotation.x=t*.006;stars2.rotation.y=t*.025;stars2.rotation.x=t*.01;camera.position.x+=(mx*6-camera.position.x)*.028;camera.position.y+=(-my*6-camera.position.y)*.028;const sr=tsy/Math.max(1,document.body.scrollHeight-innerHeight);camera.position.z=70-sr*120;camera.lookAt(0,0,camera.position.z-60);shapes.forEach((s,i)=>{s.rotation.x=t*(.15+i*.04)+sr*.5;s.rotation.y=t*(.1+i*.06)+sr*.3;s.position.y+=Math.sin(t*(.3+i*.08))*.018;});const spd=.4+sr*1.2;grids1.forEach(g=>{g.position.z+=spd;if(g.position.z>30)g.position.z-=grids1.length*28;});grids2.forEach(g=>{g.position.z+=spd*.6;if(g.position.z>20)g.position.z-=grids2.length*56;});renderer.render(scene,camera);};
    animate();
    window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
  };

  const tools = [
    { name: 'QR Code Generator', desc: 'Generate QR for any URL or text instantly', href: '/qr', emoji: '⚡', tag: 'Utility Tool', delay: '.05s', ic: 'ic1' },
    { name: 'Hashtag Generator', desc: 'AI-powered hashtags for Instagram, YouTube & Twitter', href: '/hashtag', emoji: '#', tag: 'AI Powered', delay: '.1s', ic: 'ic2' },
    { name: 'Domain Checker', desc: 'Check domain availability across all extensions instantly', href: '/domain', emoji: '🌐', tag: 'Domain Tool', delay: '.15s', ic: 'ic3' },
    { name: 'Resume Builder', desc: '20 templates · Custom colors · Photo upload · Download PDF', href: '/resume', emoji: '📄', tag: 'Career Tool', delay: '.2s', ic: 'ic4' },
    { name: 'File Converter', desc: 'PDF→Images · Images→PDF · DOCX→PDF · PDF→DOCX coming soon!', href: '/convert', emoji: '🔄', tag: 'Converter', delay: '.25s', ic: 'ic5' },
  ];

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--y:#F5E642;--y2:#ffb800;--bg:#060609;--glass:rgba(255,255,255,0.032);--border:rgba(255,255,255,0.072);--text:#c9d1d9;--muted:#6b7280;--r:22px}
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:'Cabinet Grotesk',sans-serif;overflow-x:hidden;cursor:none}
        #cur{position:fixed;width:9px;height:9px;background:var(--y);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);mix-blend-mode:difference;transition:width .15s,height .15s}
        #cur-r{position:fixed;width:34px;height:34px;border:1.5px solid rgba(245,230,66,.3);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:width .25s,height .25s,border-color .25s}
        body.hov #cur{width:20px;height:20px}
        body.hov #cur-r{width:58px;height:58px;border-color:rgba(245,230,66,.75)}
        #c{position:fixed;inset:0;z-index:0;pointer-events:none}
        .noise{position:fixed;inset:0;z-index:1;opacity:.025;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
        #prog{position:fixed;top:0;left:0;height:2px;background:linear-gradient(90deg,var(--y),var(--y2),#ff6b35);z-index:1000;width:0;box-shadow:0 0 18px rgba(245,230,66,.7)}
        nav{position:fixed;top:0;left:0;right:0;z-index:200;padding:18px 48px;display:flex;align-items:center;justify-content:space-between;transition:all .4s}
        nav.scrolled{background:rgba(6,6,9,.88);backdrop-filter:blur(28px);border-bottom:1px solid rgba(255,255,255,.04)}
        .nl{font-family:'Bebas Neue',sans-serif;font-size:27px;letter-spacing:2px;text-decoration:none;color:white}
        .nl em{color:var(--y);font-style:normal}
        .nm{display:flex;gap:30px;list-style:none}
        .nm a{text-decoration:none;color:var(--muted);font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;transition:color .2s}
        .nm a:hover{color:white}
        .nc{background:var(--y);color:#000;padding:10px 24px;border-radius:999px;font-size:13px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;transition:all .2s}
        .nc:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(245,230,66,.45)}
        @media(max-width:768px){.nm{display:none}.nl{font-size:22px}nav{padding:14px 20px}}
        #hero{position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:130px 24px 100px;z-index:2;overflow:hidden}
        .hero-badge{display:inline-flex;align-items:center;gap:10px;background:rgba(245,230,66,.055);border:1px solid rgba(245,230,66,.18);border-radius:999px;padding:10px 22px;font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--y);letter-spacing:.08em;text-transform:uppercase;margin-bottom:36px;opacity:0;animation:fadeUp .6s .2s both;position:relative;z-index:2}
        .pdot{width:7px;height:7px;background:var(--y);border-radius:50%;animation:pA 2s infinite}
        @keyframes pA{0%,100%{box-shadow:0 0 0 0 rgba(245,230,66,.6)}50%{box-shadow:0 0 0 8px rgba(245,230,66,0)}}
        .hero-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(90px,18vw,200px);line-height:.8;letter-spacing:1px;margin-bottom:32px;opacity:0;animation:fadeUp .8s .3s both;position:relative;z-index:2}
        .yt{color:var(--y);display:inline-block;animation:flick 10s infinite}
        .wt{color:white;display:block}
        @keyframes flick{0%,90%,100%{opacity:1}91%{opacity:.55}92.5%{opacity:1}94%{opacity:.3}95%{opacity:1}}
        .hero-desc{font-size:19px;color:var(--muted);max-width:420px;line-height:1.8;margin-bottom:48px;opacity:0;animation:fadeUp .6s .45s both;position:relative;z-index:2;font-weight:500}
        .hero-desc b{color:#9ca3af;font-weight:700}
        .hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;opacity:0;animation:fadeUp .6s .55s both;position:relative;z-index:2}
        .bp{background:var(--y);color:#000;padding:16px 36px;border-radius:14px;font-weight:900;font-size:14px;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;transition:all .25s;display:inline-flex;align-items:center;gap:9px}
        .bp:hover{transform:translateY(-4px);box-shadow:0 24px 60px rgba(245,230,66,.35)}
        .bg2{background:transparent;color:white;padding:16px 36px;border-radius:14px;font-weight:700;font-size:14px;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;border:1px solid rgba(255,255,255,.1);transition:all .25s}
        .bg2:hover{border-color:rgba(255,255,255,.28);background:rgba(255,255,255,.05);transform:translateY(-3px)}
        .hs-line{width:1px;height:50px;background:linear-gradient(to bottom,rgba(245,230,66,.6),transparent);animation:hsA 2s ease-in-out infinite}
        .hs-label{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);opacity:.5}
        @keyframes hsA{0%,100%{transform:scaleY(1);opacity:.8}50%{transform:scaleY(.6);opacity:.3}}
        .tw{overflow:hidden;z-index:2;position:relative;padding:16px 0;background:rgba(245,230,66,.02);border-top:1px solid rgba(245,230,66,.055);border-bottom:1px solid rgba(245,230,66,.055)}
        .tt{display:flex;animation:tka 22s linear infinite;white-space:nowrap}
        .ti{display:inline-flex;align-items:center;gap:12px;padding:0 32px;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:#2d2d44}
        .ti .s{color:var(--y);opacity:.5;font-size:18px;line-height:0}
        @keyframes tka{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        section{position:relative;z-index:2;padding:120px 24px}
        .con{max-width:1120px;margin:0 auto}
        .st2{display:inline-flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.15em;text-transform:uppercase;color:var(--y);margin-bottom:20px;opacity:.8}
        .sh{font-family:'Bebas Neue',sans-serif;font-size:clamp(54px,8.5vw,96px);line-height:.88;margin-bottom:20px;color:white}
        .ss{font-size:17px;color:var(--muted);max-width:500px;line-height:1.8;font-weight:500}
        .bento{display:grid;grid-template-columns:repeat(12,1fr);gap:14px;margin-top:64px}
        .tc{position:relative;background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:32px;overflow:hidden;text-decoration:none;color:white;display:flex;flex-direction:column;transform-style:preserve-3d;transition:border-color .3s,background .3s;opacity:0;transform:translateY(40px) scale(.98)}
        .tc.vis{opacity:1;transform:translateY(0) scale(1);transition:opacity .55s,transform .55s,border-color .3s,background .3s}
        .tc:nth-child(1){grid-column:span 5;min-height:240px}
        .tc:nth-child(2){grid-column:span 7;min-height:240px}
        .tc:nth-child(3),.tc:nth-child(4),.tc:nth-child(5){grid-column:span 4;min-height:220px}
        @media(max-width:900px){.tc{grid-column:span 12!important}}
        .tcs{position:absolute;inset:0;border-radius:var(--r);background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.065) 0%,transparent 55%);opacity:0;transition:opacity .3s;pointer-events:none}
        .tc:hover .tcs{opacity:1}
        .tc:hover{border-color:rgba(255,255,255,.15);background:rgba(255,255,255,.05)}
        .tc:hover .tch{color:var(--y)}
        .tc:hover .tcn{color:rgba(255,255,255,.08)}
        .tcn{position:absolute;top:16px;right:22px;font-family:'Bebas Neue',sans-serif;font-size:58px;color:rgba(245,230,66,.35);line-height:1;transition:color .3s;pointer-events:none;letter-spacing:-1px}
        .tci{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:18px;transition:transform .3s;flex-shrink:0}
        .tc:hover .tci{transform:scale(1.15) rotate(-8deg)}
        .tct{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:10px;font-weight:600}
        .tch{font-size:22px;font-weight:800;margin-bottom:10px;color:white;transition:color .3s;line-height:1.2}
        .tcd{color:#6b7280;font-size:15px;line-height:1.7;flex:1;font-weight:500}
        .tc:hover .tcd{color:#9ca3af}
        .tca{margin-top:22px;display:inline-flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#252535;transition:all .3s}
        .tc:hover .tca{color:var(--y);gap:14px}
        .tal{width:20px;height:1px;background:currentColor;transition:width .3s}
        .tc:hover .tal{width:32px}
        #stats{padding:72px 24px;background:var(--y);position:relative;overflow:hidden;z-index:2}
        #stats::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(0,0,0,.02) 0,rgba(0,0,0,.02) 1px,transparent 1px,transparent 14px)}
        .sr{display:flex;justify-content:space-around;flex-wrap:wrap;gap:28px;max-width:900px;margin:0 auto;position:relative;z-index:1}
        .si{text-align:center}
        .sn{font-family:'Bebas Neue',sans-serif;font-size:clamp(66px,10vw,100px);color:#0a0a12;line-height:1;letter-spacing:-2px}
        .sl{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:rgba(0,0,0,.4);margin-top:6px}
        #features{background:rgba(255,255,255,.007)}
        .fg{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:15px;margin-top:64px}
        .fc{background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:32px;opacity:0;transform:translateY(30px);transition:opacity .5s,transform .5s,border-color .3s,background .3s}
        .fc.vis{opacity:1;transform:translateY(0)}
        .fc:hover{border-color:rgba(255,255,255,.13);background:rgba(255,255,255,.045)}
        .fi{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:18px}
        .ftt{font-size:17px;font-weight:800;margin-bottom:10px;color:white}
        .fd{font-size:15px;color:var(--muted);line-height:1.7;font-weight:500}
        .srow{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:48px;margin-top:70px}
        .step{text-align:center;opacity:0;transform:translateY(30px);transition:opacity .5s,transform .5s}
        .step.vis{opacity:1;transform:translateY(0)}
        .sorb{width:80px;height:80px;border-radius:50%;background:rgba(245,230,66,.055);border:1px solid rgba(245,230,66,.18);display:flex;align-items:center;justify-content:center;margin:0 auto 22px;position:relative}
        .sorb::after{content:'';position:absolute;inset:-6px;border-radius:50%;border:1px dashed rgba(245,230,66,.1);animation:rotSlow 22s linear infinite}
        @keyframes rotSlow{to{transform:rotate(360deg)}}
        .snm{font-family:'Bebas Neue',sans-serif;font-size:36px;color:var(--y);line-height:1}
        .stit{font-size:17px;font-weight:800;margin-bottom:10px;color:white}
        .sdsc{font-size:15px;color:var(--muted);line-height:1.7;font-weight:500}
        .fw{max-width:760px;margin:66px auto 0;display:flex;flex-direction:column;gap:10px}
        .fi2{background:var(--glass);border:1px solid var(--border);border-radius:18px;overflow:hidden;opacity:0;transform:translateY(22px);transition:opacity .45s,transform .45s,border-color .3s}
        .fi2.vis{opacity:1;transform:translateY(0)}
        .fi2.open{border-color:rgba(245,230,66,.18)}
        .fq{display:flex;align-items:center;justify-content:space-between;padding:22px 28px;font-weight:700;font-size:16px;cursor:pointer;user-select:none;color:white;transition:color .2s}
        .fq:hover{color:var(--y)}
        .fc2x{width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;transition:all .3s;color:var(--muted)}
        .fi2.open .fc2x{transform:rotate(45deg);border-color:rgba(245,230,66,.3);color:var(--y)}
        .fb2{max-height:0;overflow:hidden;transition:max-height .38s ease}
        .fi2.open .fb2{max-height:250px}
        .fb2 p{padding:0 28px 24px;font-size:15px;color:var(--muted);line-height:1.8;font-weight:500}
        .sg{display:grid;grid-template-columns:repeat(auto-fill,minmax(272px,1fr));gap:14px;margin-top:64px}
        .sc{background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:28px;display:flex;flex-direction:column;gap:12px;opacity:0;transform:translateY(28px);transition:opacity .45s,transform .45s,border-color .3s,background .3s}
        .sc.vis{opacity:1;transform:translateY(0)}
        .sc:hover{border-color:rgba(245,230,66,.2);background:rgba(245,230,66,.022)}
        .sci{font-size:30px}
        .sct{font-size:17px;font-weight:800;color:white}
        .scd{font-size:15px;color:var(--muted);line-height:1.7;flex:1;font-weight:500}
        .scl{display:inline-flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--y);text-decoration:none;transition:gap .2s}
        .scl:hover{gap:12px}
        #cta{z-index:2;position:relative;padding:0 24px 120px}
        .ci{max-width:1120px;margin:0 auto;background:linear-gradient(135deg,rgba(245,230,66,.07) 0%,rgba(255,184,0,.035) 50%,rgba(245,230,66,.04) 100%);border:1px solid rgba(245,230,66,.14);border-radius:32px;padding:100px 64px;text-align:center;position:relative;overflow:hidden}
        .ci::before{content:'';position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:600px;height:350px;background:radial-gradient(ellipse,rgba(245,230,66,.1) 0%,transparent 70%);pointer-events:none}
        .ci::after{content:'ZAP';position:absolute;bottom:-50px;right:-10px;font-family:'Bebas Neue',sans-serif;font-size:260px;color:rgba(245,230,66,.025);line-height:1;pointer-events:none;user-select:none;letter-spacing:-5px}
        .ctag{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--y);opacity:.7;margin-bottom:22px;position:relative;z-index:1}
        .ctit{font-family:'Bebas Neue',sans-serif;font-size:clamp(60px,10vw,110px);line-height:.88;margin-bottom:22px;color:white;position:relative;z-index:1}
        .ctit span{color:var(--y)}
        .csub{font-size:18px;color:var(--muted);margin:0 auto 48px;max-width:380px;line-height:1.75;position:relative;z-index:1;font-weight:500}
        .cbtns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1}
        footer{position:relative;z-index:2;padding:72px 24px 36px;border-top:1px solid rgba(255,255,255,.04)}
        .ftop{display:grid;grid-template-columns:2fr 1fr 1fr;gap:52px;margin-bottom:52px;max-width:1120px;margin-left:auto;margin-right:auto}
        @media(max-width:768px){.ftop{grid-template-columns:1fr}}
        .flog{font-family:'Bebas Neue',sans-serif;font-size:42px;letter-spacing:1px;margin-bottom:14px;color:white}
        .flog em{color:var(--y);font-style:normal}
        .ftag{font-size:15px;color:var(--muted);line-height:1.75;max-width:260px;font-weight:500}
        .fh{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:18px;opacity:.5}
        .fl{display:flex;flex-direction:column;gap:12px}
        .fl a{font-size:15px;color:#2d2d40;text-decoration:none;transition:color .2s;font-weight:500}
        .fl a:hover{color:#6b7280}
        .fbot{max-width:1120px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding-top:26px;border-top:1px solid rgba(255,255,255,.04);flex-wrap:wrap;gap:12px}
        .fcp,.fmade{font-family:'JetBrains Mono',monospace;font-size:12px;color:#1f1f30;letter-spacing:.05em}
        .fmade em{color:var(--y);font-style:normal}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        .ic1{background:linear-gradient(135deg,#f59e0b,#ef4444)}.ic2{background:linear-gradient(135deg,#a855f7,#ec4899)}.ic3{background:linear-gradient(135deg,#3b82f6,#06b6d4)}.ic4{background:linear-gradient(135deg,#10b981,#059669)}.ic5{background:linear-gradient(135deg,#ef4444,#f97316)}
        .fc1b{background:rgba(245,158,11,.1)}.fc2b{background:rgba(168,85,247,.1)}.fc3b{background:rgba(6,182,212,.1)}.fc4b{background:rgba(16,185,129,.1)}.fc5b{background:rgba(239,68,68,.1)}.fc6b{background:rgba(245,230,66,.1)}
        .reveal{opacity:0;transform:translateY(48px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)}.reveal.vis{opacity:1;transform:none}
        .reveal-left{opacity:0;transform:translateX(-48px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)}.reveal-left.vis{opacity:1;transform:none}
        .reveal-scale{opacity:0;transform:scale(.9);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)}.reveal-scale.vis{opacity:1;transform:none}
        .fp{position:fixed;border-radius:50%;background:var(--y);pointer-events:none;z-index:1;opacity:0;animation:fpa linear infinite}
        @keyframes fpa{0%{transform:translateY(100vh);opacity:0}8%{opacity:.55}88%{opacity:.25}100%{transform:translateY(-5vh);opacity:0}}
      `}</style>

      <div id="cur"></div><div id="cur-r"></div>
      <div className="noise"></div>
      <div id="prog"></div>
      <canvas id="c"></canvas>

      <nav id="nv">
        <a href="#" className="nl"><em>Zap</em>Tools</a>
        <ul className="nm">
          <li><a href="#tools">Tools</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How It Works</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#support">Support</a></li>
        </ul>
        <a href="#tools" className="nc">Try Free ⚡</a>
      </nav>

      <section id="hero">
        <div className="hero-badge"><div className="pdot"></div>5 Tools · 100% Free · No Signup</div>
        <h1 className="hero-title"><span className="yt">Zap</span><span className="wt">Tools</span></h1>
        <p className="hero-desc">Built for <b>creators</b>, <b>builders</b> &amp; <b>hustlers</b><br/>who move fast and ship faster.</p>
        <div className="hero-btns">
          <a href="#tools" className="bp">Explore Tools ⚡</a>
          <a href="#how" className="bg2">How It Works →</a>
        </div>
        <div style={{position:'absolute',bottom:'40px',left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:'10px',zIndex:2}}>
          <div className="hs-line"></div>
          <div className="hs-label">Scroll</div>
        </div>
      </section>

      <div className="tw">
        <div className="tt">
          {['QR Generator','Hashtag AI','Domain Checker','Resume Builder','File Converter','100% Free','No Signup Ever','Instant Results','Privacy First','Browser Based',
            'QR Generator','Hashtag AI','Domain Checker','Resume Builder','File Converter','100% Free','No Signup Ever','Instant Results','Privacy First','Browser Based'
          ].map((item,i)=><span key={i} className="ti"><span className="s">⚡</span>{item}</span>)}
        </div>
      </div>

      <section id="tools">
        <div className="con">
          <div className="reveal-left">
            <div className="st2">⚡ Our Tools</div>
            <h2 className="sh">Everything<br/>you need — free.</h2>
            <p className="ss">No subscriptions. No paywalls. No BS. Just powerful tools that work right now.</p>
          </div>
          <div className="bento">
            {tools.map((tool,i)=>(
              <a key={i} className="tc" href={tool.href} data-tilt="true" style={{transitionDelay:tool.delay}}>
                <div className="tcs"></div>
                <div className="tcn">0{i+1}</div>
                <div className={`tci ${tool.ic}`} style={tool.emoji==='#'?{fontFamily:"'Bebas Neue',sans-serif",fontSize:'26px'}:{}}>{tool.emoji}</div>
                <div className="tct">{tool.tag}</div>
                <div className="tch">{tool.name}</div>
                <div className="tcd">{tool.desc}</div>
                <div className="tca"><div className="tal"></div>Try Now</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div id="stats">
        <div className="sr">
          <div className="si reveal-scale" style={{transitionDelay:'.04s'}}><div className="sn" data-count="5">0</div><div className="sl">Free Tools</div></div>
          <div className="si reveal-scale" style={{transitionDelay:'.1s'}}><div className="sn">₹0</div><div className="sl">Cost To Use</div></div>
          <div className="si reveal-scale" style={{transitionDelay:'.16s'}}><div className="sn" data-count="3">0</div><div className="sl">Seconds To Start</div></div>
          <div className="si reveal-scale" style={{transitionDelay:'.22s'}}><div className="sn" data-count="100" data-suffix="%">0%</div><div className="sl">Free Forever</div></div>
        </div>
      </div>

      <section id="features">
        <div className="con">
          <div className="reveal"><div className="st2">✦ Why ZapTools</div><h2 className="sh">Built different.<br/>Works better.</h2><p className="ss">Everything you hate about other tools — we ripped it out.</p></div>
          <div className="fg">
            {[
              {bg:'fc1b',icon:'⚡',t:'Lightning Fast',d:'All tools run instantly. No loading screens. Results in under a second.'},
              {bg:'fc2b',icon:'🔒',t:'Privacy First',d:"Files never leave your device. No account = zero tracking."},
              {bg:'fc3b',icon:'📱',t:'Works Everywhere',d:'Phone, tablet, desktop — perfect on all. No app needed.'},
              {bg:'fc4b',icon:'🎯',t:'Zero Signup',d:'No email. No password. No verification. Open and use.'},
              {bg:'fc5b',icon:'💰',t:'Free Forever',d:'Core tools stay free. No bait-and-switch. No credit card.'},
              {bg:'fc6b',icon:'🚀',t:'Always Improving',d:'New tools every month. Built by creators, for creators.'},
            ].map((f,i)=>(
              <div key={i} className="fc reveal" style={{transitionDelay:`${.05+i*.05}s`}}>
                <div className={`fi ${f.bg}`}>{f.icon}</div>
                <div className="ftt">{f.t}</div>
                <div className="fd">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" style={{background:'rgba(255,255,255,.005)'}}>
        <div className="con">
          <div className="reveal"><div className="st2">→ Process</div><h2 className="sh">3 steps.<br/>That&apos;s it.</h2></div>
          <div className="srow">
            {[
              {n:'01',t:'Pick a Tool',d:'Choose from 5 powerful free tools made for creators who move fast.'},
              {n:'02',t:'Enter Input',d:'Type your URL, topic or upload a file. No forms, no signup required.'},
              {n:'03',t:'Get Results',d:'Download, copy or share instantly. Done in seconds. Always free.'},
            ].map((s,i)=>(
              <div key={i} className="step reveal" style={{transitionDelay:`${.06+i*.12}s`}}>
                <div className="sorb"><div className="snm">{s.n}</div></div>
                <div className="stit">{s.t}</div>
                <div className="sdsc">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="con" style={{textAlign:'center'}}>
          <div className="reveal"><div className="st2">? FAQ</div><h2 className="sh">Got questions?<br/>We got answers.</h2></div>
          <div className="fw" style={{textAlign:'left'}}>
            {[
              {q:'Is ZapTools really free?',a:'Yes — 100% free, no catch. Core tools stay free forever.'},
              {q:'Do I need an account?',a:'Absolutely not. Open any tool and use it immediately. No email, no password, no verification. Ever.'},
              {q:'Are my files safe?',a:'Yes — all file conversions happen in your browser. Files never get uploaded to any server.'},
              {q:'How does the File Converter work?',a:'Upload your file → convert in browser → download instantly. No server, no storage, 100% private.'},
              {q:'Works on mobile?',a:'100% yes. Fully responsive — phone, tablet, desktop. No app download needed.'},
              {q:'More tools coming?',a:'Constantly building. Got a request? Hit us in support — popular ideas get shipped first.'},
            ].map((f,i)=>(
              <div key={i} className="fi2 reveal" style={{transitionDelay:`${.04+i*.04}s`}}>
                <div className="fq">{f.q}<div className="fc2x">+</div></div>
                <div className="fb2"><p>{f.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="support" style={{background:'rgba(255,255,255,.006)'}}>
        <div className="con">
          <div className="reveal"><div className="st2">💬 Support</div><h2 className="sh">We&apos;ve got<br/>your back.</h2><p className="ss">Multiple ways to reach us. Fast, real, responsive.</p></div>
          <div className="sg">
            {[
              {i:'📧',t:'Email Support',d:'Drop a message — we reply within 24 hours.',l:'Email Us →',h:'mailto:support@zaptools.in'},
              {i:'💬',t:'Community',d:'Join our Discord. Ask questions, suggest tools.',l:'Join Discord →',h:'#'},
              {i:'🐛',t:'Bug Reports',d:'Found something broken? Fixed within 48 hours.',l:'Report Bug →',h:'#'},
              {i:'💡',t:'Feature Requests',d:'Got a tool idea? Most voted ideas get built first.',l:'Suggest →',h:'#'},
            ].map((s,i)=>(
              <div key={i} className="sc reveal" style={{transitionDelay:`${.05+i*.05}s`}}>
                <div className="sci">{s.i}</div>
                <div className="sct">{s.t}</div>
                <div className="scd">{s.d}</div>
                <a href={s.h} className="scl">{s.l}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cta">
        <div className="con">
          <div className="ci reveal-scale">
            <div className="ctag">// Ready to Zap?</div>
            <h2 className="ctit">Stop wasting time.<br/><span>Start building.</span></h2>
            <p className="csub">5 free tools. No signup. No cost.<br/>Just open a tab and go.</p>
            <div className="cbtns">
              <a href="#tools" className="bp">Get Started Free ⚡</a>
              <a href="#faq" className="bg2">Learn More →</a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="ftop">
          <div>
            <div className="flog"><em>Zap</em>Tools</div>
            <div className="ftag">Free tools for creators, builders and hustlers. No BS, no signup. Just tools that work.</div>
          </div>
          <div>
            <div className="fh">Tools</div>
            <div className="fl">
              <a href="/qr">QR Code Generator</a>
              <a href="/hashtag">Hashtag Generator</a>
              <a href="/domain">Domain Checker</a>
              <a href="/resume">Resume Builder</a>
              <a href="/convert">File Converter</a>
            </div>
          </div>
          <div>
            <div className="fh">Company</div>
            <div className="fl">
              <a href="#features">Features</a>
              <a href="#how">How It Works</a>
              <a href="#faq">FAQ</a>
              <a href="#support">Support</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
        <div className="fbot">
          <div className="fcp">© 2025 ZapTools. All rights reserved.</div>
          <div className="fmade">Made with <em>⚡</em> — Free Forever</div>
        </div>
      </footer>

      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" onLoad={initThree}/>
    </>
  );
}