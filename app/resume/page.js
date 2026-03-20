'use client';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false, loading: () => <button style={{background:'rgba(245,230,66,.3)',color:'#000',padding:'13px 28px',borderRadius:'12px',border:'none',fontWeight:900,fontSize:'13px'}}>Loading...</button> }
);
// ── 20 TEMPLATES ──────────────────────────────────────────────────
const TEMPLATES = [
  { id:1,  name:'Classic Pro',    category:'Corporate', layout:'classic'   },
  { id:2,  name:'Sidebar Dark',   category:'Modern',    layout:'sidebar'   },
  { id:3,  name:'Full Banner',    category:'Corporate', layout:'banner'    },
  { id:4,  name:'Split Column',   category:'Modern',    layout:'twocol'    },
  { id:5,  name:'Ultra Minimal',  category:'Minimal',   layout:'minimal'   },
  { id:6,  name:'Card Boxes',     category:'Creative',  layout:'boxed'     },
  { id:7,  name:'Elegant Center', category:'Modern',    layout:'elegant'   },
  { id:8,  name:'Sidebar Light',  category:'Corporate', layout:'sidelight' },
  { id:9,  name:'Dev / Tech',     category:'Creative',  layout:'tech'      },
  { id:10, name:'Executive',      category:'Corporate', layout:'executive' },
  { id:11, name:'Left Accent',    category:'Creative',  layout:'block'     },
  { id:12, name:'Compact Grid',   category:'Minimal',   layout:'compact'   },
  { id:13, name:'Gold Luxury',    category:'Modern',    layout:'luxury'    },
  { id:14, name:'Top Strip',      category:'Creative',  layout:'strip'     },
  { id:15, name:'Timeline',       category:'Modern',    layout:'timeline'  },
  { id:16, name:'Bold Name',      category:'Creative',  layout:'boldname'  },
  { id:17, name:'Clean Split',    category:'Minimal',   layout:'cleansplit'},
  { id:18, name:'Infographic',    category:'Creative',  layout:'infographic'},
  { id:19, name:'Swiss',          category:'Minimal',   layout:'swiss'     },
  { id:20, name:'Gradient Side',  category:'Modern',    layout:'gradside'  },
];

const DEFAULT_COLORS = {
  1:  { accent:'#2563eb', bg:'#ffffff', text:'#111111', sidebar:'#f1f5f9' },
  2:  { accent:'#F5E642', bg:'#0d0d14', text:'#ffffff', sidebar:'#111118' },
  3:  { accent:'#1e3a5f', bg:'#ffffff', text:'#111111', sidebar:'#1e3a5f' },
  4:  { accent:'#059669', bg:'#ffffff', text:'#111111', sidebar:'#f0fdf4' },
  5:  { accent:'#000000', bg:'#ffffff', text:'#111111', sidebar:'#ffffff' },
  6:  { accent:'#7c3aed', bg:'#fafafa', text:'#111111', sidebar:'#fafafa' },
  7:  { accent:'#be185d', bg:'#fff8f8', text:'#111111', sidebar:'#fff8f8' },
  8:  { accent:'#334155', bg:'#ffffff', text:'#111111', sidebar:'#f1f5f9' },
  9:  { accent:'#0891b2', bg:'#f0f9ff', text:'#111111', sidebar:'#0891b2' },
  10: { accent:'#7f1d1d', bg:'#ffffff', text:'#111111', sidebar:'#ffffff' },
  11: { accent:'#ea580c', bg:'#ffffff', text:'#111111', sidebar:'#ffffff' },
  12: { accent:'#525252', bg:'#fafafa', text:'#111111', sidebar:'#fafafa' },
  13: { accent:'#92400e', bg:'#fffbeb', text:'#111111', sidebar:'#fffbeb' },
  14: { accent:'#4f46e5', bg:'#ffffff', text:'#111111', sidebar:'#4f46e5' },
  15: { accent:'#0f766e', bg:'#ffffff', text:'#111111', sidebar:'#f0fdfa' },
  16: { accent:'#dc2626', bg:'#ffffff', text:'#111111', sidebar:'#ffffff' },
  17: { accent:'#1d4ed8', bg:'#f8fafc', text:'#111111', sidebar:'#e2e8f0' },
  18: { accent:'#7c3aed', bg:'#fdf4ff', text:'#111111', sidebar:'#f3e8ff' },
  19: { accent:'#000000', bg:'#ffffff', text:'#000000', sidebar:'#000000' },
  20: { accent:'#6d28d9', bg:'#ffffff', text:'#111111', sidebar:'#4c1d95' },
};

const FONTS = ['Helvetica','Times-Roman','Courier'];
const FONT_LABELS = { 'Helvetica':'Modern Sans', 'Times-Roman':'Classic Serif', 'Courier':'Monospace' };
const CATEGORIES = ['All','Corporate','Modern','Creative','Minimal'];
const TABS = ['Personal','Experience','Education','Skills'];

// ── DEFAULT DATA (good examples) ─────────────────────────────────
const DEFAULT_DATA = {
  name:'',role:'',email:'',phone:'',location:'',linkedin:'',
  website:'',summary:'',
  experience:[
    {title:'',company:'',duration:'',points:['','']},
  ],
  education:[{degree:'',school:'',year:''}],
  skills:['','','',''],
};

// ── PDF RENDERER ──────────────────────────────────────────────────
const ResumePDF = ({ data, tmpl, colors, font, spacing, photo }) => {
  const a = colors.accent;
  const bg = colors.bg;
  const tc = colors.text;
  const sb = colors.sidebar;
  const dark = tmpl.id === 2 || tc === '#ffffff';
  const sc = dark ? '#aaaaaa' : '#666666';
  const lc = dark ? '#2a2a3a' : '#eeeeee';
  const pad = spacing === 'compact' ? 30 : spacing === 'spacious' ? 54 : 42;
  const fb = font || 'Helvetica';
  const fbd = fb === 'Times-Roman' ? 'Times-Bold' : fb === 'Courier' ? 'Courier-Bold' : 'Helvetica-Bold';

  const name = data.name || 'Your Full Name';
  const role = data.role || 'Your Job Title';
  const contacts = [
    data.email && `✉ ${data.email}`,
    data.phone && `📞 ${data.phone}`,
    data.location && `📍 ${data.location}`,
    data.linkedin && `in ${data.linkedin}`,
    data.website && `🌐 ${data.website}`,
  ].filter(Boolean);
  const exps = (data.experience || []).filter(e => e.company);
  const edus = (data.education || []).filter(e => e.school);
  const skills = (data.skills || []).filter(s => s);

  // ── CLASSIC ──
  if (tmpl.layout === 'classic') return (
    <Document><Page size="A4" style={{padding:pad,fontFamily:fb,backgroundColor:bg}}>
      <View style={{borderBottom:`2.5px solid ${a}`,paddingBottom:14,marginBottom:18,flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
        <View style={{flex:1}}>
          <Text style={{fontSize:28,fontFamily:fbd,color:tc,marginBottom:2}}>{name}</Text>
          <Text style={{fontSize:13,color:a,fontFamily:fbd,marginBottom:8,letterSpacing:0.3}}>{role}</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:14}}>{contacts.map((c,i)=><Text key={i} style={{fontSize:9,color:sc}}>{c}</Text>)}</View>
        </View>
        {photo&&<Image src={photo} style={{width:68,height:68,borderRadius:34,border:`2px solid ${a}`,marginLeft:16}}/>}
      </View>
      {data.summary&&<View style={{marginBottom:14}}><Text style={{fontSize:8,color:a,textTransform:'uppercase',letterSpacing:1.8,fontFamily:fbd,marginBottom:6,borderBottom:`1px solid ${lc}`,paddingBottom:4}}>Summary</Text><Text style={{fontSize:10.5,color:sc,lineHeight:1.6}}>{data.summary}</Text></View>}
      {exps.length>0&&<View style={{marginBottom:14}}><Text style={{fontSize:8,color:a,textTransform:'uppercase',letterSpacing:1.8,fontFamily:fbd,marginBottom:8,borderBottom:`1px solid ${lc}`,paddingBottom:4}}>Experience</Text>{exps.map((e,i)=><View key={i} style={{marginBottom:10}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:tc}}>{e.title}</Text><Text style={{fontSize:9.5,color:a}}>{e.duration}</Text></View><Text style={{fontSize:10,color:sc,marginBottom:3}}>{e.company}</Text>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:sc,paddingLeft:10,marginBottom:2}}>• {p}</Text>)}</View>)}</View>}
      {edus.length>0&&<View style={{marginBottom:14}}><Text style={{fontSize:8,color:a,textTransform:'uppercase',letterSpacing:1.8,fontFamily:fbd,marginBottom:8,borderBottom:`1px solid ${lc}`,paddingBottom:4}}>Education</Text>{edus.map((e,i)=><View key={i} style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}><Text style={{fontSize:10.5,fontFamily:fbd,color:tc}}>{e.degree} · {e.school}</Text><Text style={{fontSize:9.5,color:a}}>{e.year}</Text></View>)}</View>}
      {skills.length>0&&<View><Text style={{fontSize:8,color:a,textTransform:'uppercase',letterSpacing:1.8,fontFamily:fbd,marginBottom:8,borderBottom:`1px solid ${lc}`,paddingBottom:4}}>Skills</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{skills.map((sk,i)=><Text key={i} style={{fontSize:9.5,color:a,border:`1px solid ${a}`,padding:'2 8',borderRadius:3}}>{sk}</Text>)}</View></View>}
    </Page></Document>
  );

  // ── SIDEBAR DARK ──
  if (tmpl.layout === 'sidebar') return (
    <Document><Page size="A4" style={{padding:0,fontFamily:fb,backgroundColor:bg,flexDirection:'row'}}>
      <View style={{width:178,backgroundColor:sb,padding:24,minHeight:'100%'}}>
        {photo&&<Image src={photo} style={{width:72,height:72,borderRadius:36,border:`2px solid ${a}`,marginBottom:14,alignSelf:'center'}}/>}
        <Text style={{fontSize:18,fontFamily:fbd,color:dark?'#fff':tc,marginBottom:3,lineHeight:1.2}}>{name}</Text>
        <Text style={{fontSize:10,color:a,marginBottom:16,fontFamily:fbd}}>{role}</Text>
        <Text style={{fontSize:7.5,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:8,fontFamily:fbd}}>Contact</Text>
        {contacts.map((c,i)=><Text key={i} style={{fontSize:8.5,color:dark?'#aaa':sc,marginBottom:5,lineHeight:1.4}}>{c}</Text>)}
        {skills.length>0&&<View style={{marginTop:18}}><Text style={{fontSize:7.5,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:8,fontFamily:fbd}}>Skills</Text>{skills.map((sk,i)=><View key={i} style={{backgroundColor:dark?'rgba(255,255,255,.08)':`${a}18`,borderRadius:3,padding:'4 8',marginBottom:4}}><Text style={{fontSize:8.5,color:dark?'#ddd':a}}>{sk}</Text></View>)}</View>}
      </View>
      <View style={{flex:1,padding:28,backgroundColor:dark?'#16161e':'#ffffff'}}>
        {data.summary&&<View style={{marginBottom:16}}><Text style={{fontSize:9,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6,fontFamily:fbd}}>About</Text><Text style={{fontSize:10.5,color:dark?'#ccc':'#444',lineHeight:1.65}}>{data.summary}</Text></View>}
        {exps.length>0&&<View style={{marginBottom:16}}><Text style={{fontSize:9,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:10,fontFamily:fbd,borderBottom:`1.5px solid ${a}`,paddingBottom:4}}>Experience</Text>{exps.map((e,i)=><View key={i} style={{marginBottom:11}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:dark?'#fff':'#111'}}>{e.title}</Text><Text style={{fontSize:9,color:a}}>{e.duration}</Text></View><Text style={{fontSize:10,color:dark?'#888':'#666',marginBottom:3}}>{e.company}</Text>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:dark?'#ccc':'#555',paddingLeft:8,marginBottom:2}}>• {p}</Text>)}</View>)}</View>}
        {edus.length>0&&<View><Text style={{fontSize:9,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:10,fontFamily:fbd,borderBottom:`1.5px solid ${a}`,paddingBottom:4}}>Education</Text>{edus.map((e,i)=><View key={i} style={{marginBottom:8}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:dark?'#fff':'#111'}}>{e.degree}</Text><Text style={{fontSize:9,color:a}}>{e.year}</Text></View><Text style={{fontSize:10,color:dark?'#888':'#666'}}>{e.school}</Text></View>)}</View>}
      </View>
    </Page></Document>
  );

  // ── BANNER ──
  if (tmpl.layout === 'banner') return (
    <Document><Page size="A4" style={{padding:0,fontFamily:fb,backgroundColor:'#ffffff'}}>
      <View style={{backgroundColor:a,padding:'26 42',marginBottom:24,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <View style={{flex:1}}>
          <Text style={{fontSize:30,fontFamily:fbd,color:'#fff',marginBottom:4}}>{name}</Text>
          <Text style={{fontSize:13,color:'rgba(255,255,255,.85)',marginBottom:10}}>{role}</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:16}}>{contacts.map((c,i)=><Text key={i} style={{fontSize:9.5,color:'rgba(255,255,255,.75)'}}>{c}</Text>)}</View>
        </View>
        {photo&&<Image src={photo} style={{width:72,height:72,borderRadius:36,border:'2px solid rgba(255,255,255,.5)',marginLeft:20}}/>}
      </View>
      <View style={{paddingHorizontal:42}}>
        {data.summary&&<View style={{marginBottom:16}}><Text style={{fontSize:10.5,color:'#444',lineHeight:1.65}}>{data.summary}</Text></View>}
        {exps.length>0&&<View style={{marginBottom:16}}><Text style={{fontSize:10,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:10}}>── Experience</Text>{exps.map((e,i)=><View key={i} style={{marginBottom:10,paddingLeft:12,borderLeft:`3px solid ${a}`}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:'#111'}}>{e.title}</Text><Text style={{fontSize:9.5,color:a}}>{e.duration}</Text></View><Text style={{fontSize:10,color:'#666',marginBottom:3}}>{e.company}</Text>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:'#555',marginBottom:2}}>• {p}</Text>)}</View>)}</View>}
        {edus.length>0&&<View style={{marginBottom:14}}><Text style={{fontSize:10,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:10}}>── Education</Text>{edus.map((e,i)=><View key={i} style={{marginBottom:8,paddingLeft:12,borderLeft:`3px solid ${a}`}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:'#111'}}>{e.degree}</Text><Text style={{fontSize:9.5,color:a}}>{e.year}</Text></View><Text style={{fontSize:10,color:'#666'}}>{e.school}</Text></View>)}</View>}
        {skills.length>0&&<View><Text style={{fontSize:10,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:8}}>── Skills</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{skills.map((sk,i)=><View key={i} style={{backgroundColor:`${a}15`,border:`1px solid ${a}`,borderRadius:3,padding:'3 10'}}><Text style={{fontSize:9.5,color:a}}>{sk}</Text></View>)}</View></View>}
      </View>
    </Page></Document>
  );

  // ── TWO COLUMN ──
  if (tmpl.layout === 'twocol') return (
    <Document><Page size="A4" style={{padding:pad,fontFamily:fb,backgroundColor:bg}}>
      <View style={{borderBottom:`3px solid ${a}`,paddingBottom:14,marginBottom:18,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <View style={{flex:1}}>
          <Text style={{fontSize:26,fontFamily:fbd,color:tc}}>{name}</Text>
          <Text style={{fontSize:12,color:a,fontFamily:fbd,marginBottom:8}}>{role}</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:14}}>{contacts.map((c,i)=><Text key={i} style={{fontSize:9,color:sc}}>{c}</Text>)}</View>
        </View>
        {photo&&<Image src={photo} style={{width:62,height:62,borderRadius:31,border:`2px solid ${a}`,marginLeft:16}}/>}
      </View>
      <View style={{flexDirection:'row',gap:22}}>
        <View style={{flex:1.4}}>
          {data.summary&&<View style={{marginBottom:14}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6}}>Summary</Text><Text style={{fontSize:10,color:sc,lineHeight:1.65}}>{data.summary}</Text></View>}
          {exps.length>0&&<View><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:8}}>Experience</Text>{exps.map((e,i)=><View key={i} style={{marginBottom:10}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:tc}}>{e.title}</Text><Text style={{fontSize:9,color:a}}>{e.duration}</Text></View><Text style={{fontSize:9.5,color:sc,marginBottom:3}}>{e.company}</Text>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9,color:sc,paddingLeft:8,marginBottom:2}}>• {p}</Text>)}</View>)}</View>}
        </View>
        <View style={{width:1,backgroundColor:lc}}/>
        <View style={{flex:0.8}}>
          {edus.length>0&&<View style={{marginBottom:14}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:8}}>Education</Text>{edus.map((e,i)=><View key={i} style={{marginBottom:10}}><Text style={{fontSize:10.5,fontFamily:fbd,color:tc}}>{e.degree}</Text><Text style={{fontSize:9.5,color:sc}}>{e.school}</Text><Text style={{fontSize:9,color:a}}>{e.year}</Text></View>)}</View>}
          {skills.length>0&&<View><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:8}}>Skills</Text>{skills.map((sk,i)=><View key={i} style={{backgroundColor:`${a}12`,borderRadius:4,padding:'5 10',marginBottom:5}}><Text style={{fontSize:9.5,color:a}}>{sk}</Text></View>)}</View>}
        </View>
      </View>
    </Page></Document>
  );

  // ── MINIMAL ──
  if (tmpl.layout === 'minimal') return (
    <Document><Page size="A4" style={{padding:50,fontFamily:fb,backgroundColor:bg}}>
      <View style={{marginBottom:28,flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
        <View>
          <Text style={{fontSize:32,fontFamily:fbd,color:tc,letterSpacing:-0.5}}>{name}</Text>
          <Text style={{fontSize:12,color:sc,marginBottom:10,letterSpacing:0.8}}>{role}</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:16}}>{contacts.map((c,i)=><Text key={i} style={{fontSize:9,color:'#888'}}>{c}</Text>)}</View>
        </View>
        {photo&&<Image src={photo} style={{width:58,height:58,borderRadius:29}}/>}
      </View>
      {data.summary&&<View style={{marginBottom:20,paddingTop:14,borderTop:'1px solid #ddd'}}><Text style={{fontSize:10.5,color:sc,lineHeight:1.7}}>{data.summary}</Text></View>}
      {exps.length>0&&<View style={{marginBottom:18,paddingTop:14,borderTop:'1px solid #ddd'}}><Text style={{fontSize:8.5,color:'#999',textTransform:'uppercase',letterSpacing:2,marginBottom:12}}>Experience</Text>{exps.map((e,i)=><View key={i} style={{marginBottom:12}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:tc}}>{e.title} <Text style={{fontFamily:fb,color:sc}}>— {e.company}</Text></Text><Text style={{fontSize:9,color:'#999'}}>{e.duration}</Text></View>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:sc,marginBottom:2,marginTop:3}}>{p}</Text>)}</View>)}</View>}
      {edus.length>0&&<View style={{marginBottom:18,paddingTop:14,borderTop:'1px solid #ddd'}}><Text style={{fontSize:8.5,color:'#999',textTransform:'uppercase',letterSpacing:2,marginBottom:12}}>Education</Text>{edus.map((e,i)=><View key={i} style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}><Text style={{fontSize:11,fontFamily:fbd,color:tc}}>{e.degree} <Text style={{fontFamily:fb,color:sc}}>— {e.school}</Text></Text><Text style={{fontSize:9,color:'#999'}}>{e.year}</Text></View>)}</View>}
      {skills.length>0&&<View style={{paddingTop:14,borderTop:'1px solid #ddd'}}><Text style={{fontSize:8.5,color:'#999',textTransform:'uppercase',letterSpacing:2,marginBottom:10}}>Skills</Text><Text style={{fontSize:10.5,color:sc}}>{skills.join('  ·  ')}</Text></View>}
    </Page></Document>
  );

  // ── BOXED ──
  if (tmpl.layout === 'boxed') return (
    <Document><Page size="A4" style={{padding:32,fontFamily:fb,backgroundColor:'#fafafa'}}>
      <View style={{backgroundColor:a,padding:'22 30',borderRadius:8,marginBottom:20,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <View style={{flex:1}}>
          <Text style={{fontSize:26,fontFamily:fbd,color:'#fff',marginBottom:3}}>{name}</Text>
          <Text style={{fontSize:11,color:'rgba(255,255,255,.85)',marginBottom:10}}>{role}</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:14}}>{contacts.map((c,i)=><Text key={i} style={{fontSize:9,color:'rgba(255,255,255,.7)'}}>{c}</Text>)}</View>
        </View>
        {photo&&<Image src={photo} style={{width:66,height:66,borderRadius:33,border:'2px solid rgba(255,255,255,.5)',marginLeft:16}}/>}
      </View>
      {data.summary&&<View style={{border:`1px solid ${a}30`,borderRadius:8,padding:16,marginBottom:12,backgroundColor:'#fff'}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6}}>About Me</Text><Text style={{fontSize:10.5,color:'#444',lineHeight:1.65}}>{data.summary}</Text></View>}
      {exps.length>0&&<View style={{border:`1px solid ${a}30`,borderRadius:8,padding:16,marginBottom:12,backgroundColor:'#fff'}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:10}}>Work Experience</Text>{exps.map((e,i)=><View key={i} style={{marginBottom:10,paddingBottom:8,borderBottom:i<exps.length-1?'1px dashed #eee':'none'}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:'#111'}}>{e.title}</Text><Text style={{fontSize:9,color:'#fff',backgroundColor:a,padding:'2 8',borderRadius:99}}>{e.duration}</Text></View><Text style={{fontSize:10,color:'#777',marginBottom:4}}>{e.company}</Text>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:'#555',paddingLeft:10,marginBottom:2}}>• {p}</Text>)}</View>)}</View>}
      <View style={{flexDirection:'row',gap:12}}>
        {edus.length>0&&<View style={{flex:1,border:`1px solid ${a}30`,borderRadius:8,padding:14,backgroundColor:'#fff'}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:8}}>Education</Text>{edus.map((e,i)=><View key={i} style={{marginBottom:8}}><Text style={{fontSize:10.5,fontFamily:fbd,color:'#111'}}>{e.degree}</Text><Text style={{fontSize:9.5,color:'#777'}}>{e.school}</Text><Text style={{fontSize:9,color:a}}>{e.year}</Text></View>)}</View>}
        {skills.length>0&&<View style={{flex:1,border:`1px solid ${a}30`,borderRadius:8,padding:14,backgroundColor:'#fff'}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:8}}>Skills</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:5}}>{skills.map((sk,i)=><View key={i} style={{backgroundColor:`${a}15`,borderRadius:99,padding:'4 10'}}><Text style={{fontSize:9,color:a}}>{sk}</Text></View>)}</View></View>}
      </View>
    </Page></Document>
  );

  // ── ELEGANT ──
  if (tmpl.layout === 'elegant') return (
    <Document><Page size="A4" style={{padding:44,fontFamily:fb,backgroundColor:bg}}>
      <View style={{alignItems:'center',marginBottom:24,paddingBottom:18}}>
        {photo&&<Image src={photo} style={{width:72,height:72,borderRadius:36,border:`2px solid ${a}`,marginBottom:12}}/>}
        <Text style={{fontSize:28,fontFamily:fbd,color:tc,letterSpacing:2,marginBottom:4}}>{name.toUpperCase()}</Text>
        <Text style={{fontSize:11,color:a,letterSpacing:3,marginBottom:10}}>{role.toUpperCase()}</Text>
        <View style={{flexDirection:'row',gap:3,alignItems:'center',marginBottom:12,flexWrap:'wrap',justifyContent:'center'}}>{contacts.map((c,i)=><Text key={i} style={{fontSize:9,color:'#888'}}>{c}{i<contacts.length-1?' · ':''}</Text>)}</View>
        <View style={{flexDirection:'row',alignItems:'center',gap:8,width:'100%',justifyContent:'center'}}>
          <View style={{flex:1,height:0.5,backgroundColor:a}}/><Text style={{fontSize:12,color:a}}>✦</Text><View style={{flex:1,height:0.5,backgroundColor:a}}/>
        </View>
      </View>
      {data.summary&&<View style={{alignItems:'center',marginBottom:18}}><Text style={{fontSize:10.5,color:sc,lineHeight:1.7,textAlign:'center'}}>{data.summary}</Text></View>}
      {exps.length>0&&<View style={{marginBottom:16}}>
        <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:12}}><View style={{flex:1,height:0.5,backgroundColor:'#ddd'}}/><Text style={{fontSize:8.5,color:a,textTransform:'uppercase',letterSpacing:2}}>Experience</Text><View style={{flex:1,height:0.5,backgroundColor:'#ddd'}}/></View>
        {exps.map((e,i)=><View key={i} style={{marginBottom:10}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:tc}}>{e.title}</Text><Text style={{fontSize:9.5,color:a}}>{e.duration}</Text></View><Text style={{fontSize:10,color:'#888',marginBottom:4}}>{e.company}</Text>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:sc,paddingLeft:8,marginBottom:2}}>• {p}</Text>)}</View>)}
      </View>}
      {edus.length>0&&<View style={{marginBottom:16}}>
        <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:12}}><View style={{flex:1,height:0.5,backgroundColor:'#ddd'}}/><Text style={{fontSize:8.5,color:a,textTransform:'uppercase',letterSpacing:2}}>Education</Text><View style={{flex:1,height:0.5,backgroundColor:'#ddd'}}/></View>
        {edus.map((e,i)=><View key={i} style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}><Text style={{fontSize:10.5,fontFamily:fbd,color:tc}}>{e.degree} · {e.school}</Text><Text style={{fontSize:9.5,color:a}}>{e.year}</Text></View>)}
      </View>}
      {skills.length>0&&<View>
        <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:10}}><View style={{flex:1,height:0.5,backgroundColor:'#ddd'}}/><Text style={{fontSize:8.5,color:a,textTransform:'uppercase',letterSpacing:2}}>Skills</Text><View style={{flex:1,height:0.5,backgroundColor:'#ddd'}}/></View>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,justifyContent:'center'}}>{skills.map((sk,i)=><Text key={i} style={{fontSize:9.5,color:a,border:`0.5px solid ${a}`,padding:'3 10',borderRadius:2}}>{sk}</Text>)}</View>
      </View>}
    </Page></Document>
  );

  // ── SIDEBAR LIGHT ──
  if (tmpl.layout === 'sidelight') return (
    <Document><Page size="A4" style={{padding:0,fontFamily:fb,backgroundColor:'#ffffff',flexDirection:'row'}}>
      <View style={{width:182,backgroundColor:sb,padding:24,minHeight:'100%'}}>
        {photo&&<Image src={photo} style={{width:72,height:72,borderRadius:36,border:`2px solid ${a}`,marginBottom:14,alignSelf:'center'}}/>}
        <Text style={{fontSize:18,fontFamily:fbd,color:tc,marginBottom:3,lineHeight:1.2}}>{name}</Text>
        <Text style={{fontSize:10,color:a,marginBottom:16,fontFamily:fbd}}>{role}</Text>
        <Text style={{fontSize:7.5,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:8,fontFamily:fbd}}>Contact</Text>
        {contacts.map((c,i)=><Text key={i} style={{fontSize:8.5,color:'#555',marginBottom:5}}>{c}</Text>)}
        {skills.length>0&&<View style={{marginTop:18}}><Text style={{fontSize:7.5,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:8,fontFamily:fbd}}>Skills</Text>{skills.map((sk,i)=><View key={i} style={{backgroundColor:`${a}18`,borderRadius:3,padding:'4 8',marginBottom:4}}><Text style={{fontSize:8.5,color:a}}>{sk}</Text></View>)}</View>}
      </View>
      <View style={{flex:1,padding:28}}>
        {data.summary&&<View style={{marginBottom:16}}><Text style={{fontSize:10.5,color:'#444',lineHeight:1.65}}>{data.summary}</Text></View>}
        {exps.length>0&&<View style={{marginBottom:14}}><Text style={{fontSize:9,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:10,fontFamily:fbd,borderBottom:`2px solid ${a}`,paddingBottom:4}}>Experience</Text>{exps.map((e,i)=><View key={i} style={{marginBottom:10}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:'#111'}}>{e.title}</Text><Text style={{fontSize:9,color:a}}>{e.duration}</Text></View><Text style={{fontSize:10,color:'#666',marginBottom:3}}>{e.company}</Text>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:'#555',paddingLeft:8,marginBottom:2}}>• {p}</Text>)}</View>)}</View>}
        {edus.length>0&&<View><Text style={{fontSize:9,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:10,fontFamily:fbd,borderBottom:`2px solid ${a}`,paddingBottom:4}}>Education</Text>{edus.map((e,i)=><View key={i} style={{marginBottom:8}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:'#111'}}>{e.degree}</Text><Text style={{fontSize:9,color:a}}>{e.year}</Text></View><Text style={{fontSize:10,color:'#666'}}>{e.school}</Text></View>)}</View>}
      </View>
    </Page></Document>
  );

  // ── TECH ──
  if (tmpl.layout === 'tech') return (
    <Document><Page size="A4" style={{padding:40,fontFamily:fb,backgroundColor:bg}}>
      <View style={{backgroundColor:a,padding:'16 26',marginBottom:20,borderRadius:4,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <View><Text style={{fontSize:22,fontFamily:fbd,color:'#fff',letterSpacing:0.5}}>{`> ${name}`}</Text><Text style={{fontSize:11,color:'rgba(255,255,255,.8)',marginTop:4}}>{`$ role: "${role}"`}</Text></View>
        {photo&&<Image src={photo} style={{width:54,height:54,borderRadius:4,border:'1px solid rgba(255,255,255,.35)'}}/>}
      </View>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:14,marginBottom:20,padding:'8 16',backgroundColor:`${a}12`,borderRadius:4,borderLeft:`3px solid ${a}`}}>{contacts.map((c,i)=><Text key={i} style={{fontSize:9,color:a}}>{c}</Text>)}</View>
      {data.summary&&<View style={{marginBottom:16}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:2,marginBottom:6}}>{`// summary`}</Text><Text style={{fontSize:10.5,color:'#444',lineHeight:1.65}}>{data.summary}</Text></View>}
      {exps.length>0&&<View style={{marginBottom:16}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:2,marginBottom:10}}>{`// experience`}</Text>{exps.map((e,i)=><View key={i} style={{marginBottom:10,paddingLeft:12,borderLeft:`3px solid ${a}`}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:'#111'}}>{e.title}</Text><Text style={{fontSize:9,color:a}}>{e.duration}</Text></View><Text style={{fontSize:10,color:'#666',marginBottom:3}}>{e.company}</Text>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:'#555',marginBottom:2}}>{`-> ${p}`}</Text>)}</View>)}</View>}
      {edus.length>0&&<View style={{marginBottom:16}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:2,marginBottom:10}}>{`// education`}</Text>{edus.map((e,i)=><View key={i} style={{marginBottom:8,paddingLeft:12,borderLeft:`3px solid ${a}`}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:'#111'}}>{e.degree}</Text><Text style={{fontSize:9,color:a}}>{e.year}</Text></View><Text style={{fontSize:10,color:'#666'}}>{e.school}</Text></View>)}</View>}
      {skills.length>0&&<View><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:2,marginBottom:10}}>{`// skills = [`}</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:6,paddingLeft:12}}>{skills.map((sk,i)=><View key={i} style={{backgroundColor:`${a}12`,border:`1px solid ${a}50`,borderRadius:3,padding:'3 10'}}><Text style={{fontSize:9.5,color:a}}>{sk}</Text></View>)}</View><Text style={{fontSize:9,color:a,paddingLeft:0,marginTop:6}}>{']'}</Text></View>}
    </Page></Document>
  );

  // ── EXECUTIVE ──
  if (tmpl.layout === 'executive') return (
    <Document><Page size="A4" style={{padding:48,fontFamily:fb,backgroundColor:'#ffffff'}}>
      <View style={{marginBottom:22}}>
        <View style={{height:2,backgroundColor:a,marginBottom:10}}/>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end'}}>
          <View><Text style={{fontSize:28,fontFamily:fbd,color:tc,letterSpacing:0.5}}>{name}</Text><Text style={{fontSize:12,color:a,fontFamily:fbd,letterSpacing:0.8,marginTop:2}}>{role}</Text></View>
          <View style={{alignItems:'flex-end',flexDirection:'row',gap:12,alignItems:'center'}}>
            <View style={{alignItems:'flex-end'}}>{contacts.map((c,i)=><Text key={i} style={{fontSize:9,color:'#777',marginBottom:2}}>{c}</Text>)}</View>
            {photo&&<Image src={photo} style={{width:56,height:56,borderRadius:4,border:`1px solid ${a}`}}/>}
          </View>
        </View>
        <View style={{height:0.5,backgroundColor:a,marginTop:10}}/>
      </View>
      {data.summary&&<View style={{marginBottom:16}}><Text style={{fontSize:10.5,color:sc,lineHeight:1.65}}>{data.summary}</Text></View>}
      {exps.length>0&&<View style={{marginBottom:16}}>
        <View style={{flexDirection:'row',alignItems:'center',gap:10,marginBottom:10}}><Text style={{fontSize:10,fontFamily:fbd,color:tc,textTransform:'uppercase',letterSpacing:1.5}}>Professional Experience</Text><View style={{flex:1,height:0.5,backgroundColor:'#ccc'}}/></View>
        {exps.map((e,i)=><View key={i} style={{marginBottom:12}}><View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:2}}><Text style={{fontSize:11,fontFamily:fbd,color:tc}}>{e.title}</Text><Text style={{fontSize:9.5,color:sc,fontFamily:fbd}}>{e.duration}</Text></View><Text style={{fontSize:10,color:a,marginBottom:4,fontFamily:fbd}}>{e.company}</Text>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:sc,paddingLeft:12,marginBottom:2}}>▪ {p}</Text>)}</View>)}
      </View>}
      {edus.length>0&&<View style={{marginBottom:14}}>
        <View style={{flexDirection:'row',alignItems:'center',gap:10,marginBottom:10}}><Text style={{fontSize:10,fontFamily:fbd,color:tc,textTransform:'uppercase',letterSpacing:1.5}}>Education</Text><View style={{flex:1,height:0.5,backgroundColor:'#ccc'}}/></View>
        {edus.map((e,i)=><View key={i} style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}><View><Text style={{fontSize:11,fontFamily:fbd,color:tc}}>{e.degree}</Text><Text style={{fontSize:10,color:sc}}>{e.school}</Text></View><Text style={{fontSize:9.5,color:sc}}>{e.year}</Text></View>)}
      </View>}
      {skills.length>0&&<View>
        <View style={{flexDirection:'row',alignItems:'center',gap:10,marginBottom:10}}><Text style={{fontSize:10,fontFamily:fbd,color:tc,textTransform:'uppercase',letterSpacing:1.5}}>Core Skills</Text><View style={{flex:1,height:0.5,backgroundColor:'#ccc'}}/></View>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{skills.map((sk,i)=><Text key={i} style={{fontSize:10,color:sc}}>◆ {sk}</Text>)}</View>
      </View>}
    </Page></Document>
  );

  // ── BLOCK ──
  if (tmpl.layout === 'block') return (
    <Document><Page size="A4" style={{padding:0,fontFamily:fb,backgroundColor:'#ffffff',flexDirection:'row'}}>
      <View style={{width:8,backgroundColor:a,minHeight:'100%'}}/>
      <View style={{flex:1,padding:'38 42'}}>
        <View style={{marginBottom:24,flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
          <View style={{flex:1}}>
            <Text style={{fontSize:28,fontFamily:fbd,color:tc,marginBottom:4}}>{name}</Text>
            <View style={{flexDirection:'row',alignItems:'center',gap:10,marginBottom:10}}><View style={{width:28,height:3,backgroundColor:a,borderRadius:2}}/><Text style={{fontSize:12,color:a,fontFamily:fbd}}>{role}</Text></View>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:14}}>{contacts.map((c,i)=><Text key={i} style={{fontSize:9,color:sc}}>{c}</Text>)}</View>
          </View>
          {photo&&<Image src={photo} style={{width:62,height:62,borderRadius:4,border:`2px solid ${a}`,marginLeft:16}}/>}
        </View>
        {data.summary&&<View style={{marginBottom:16,backgroundColor:`${a}08`,padding:'10 14',borderRadius:4}}><Text style={{fontSize:10.5,color:sc,lineHeight:1.65}}>{data.summary}</Text></View>}
        {exps.length>0&&<View style={{marginBottom:16}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:12}}><View style={{width:4,height:14,backgroundColor:a,borderRadius:2}}/><Text style={{fontSize:11,fontFamily:fbd,color:tc,textTransform:'uppercase',letterSpacing:0.8}}>Experience</Text></View>
          {exps.map((e,i)=><View key={i} style={{marginBottom:10}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:tc}}>{e.title}</Text><Text style={{fontSize:9,color:a}}>{e.duration}</Text></View><Text style={{fontSize:10,color:sc,marginBottom:3}}>{e.company}</Text>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:sc,paddingLeft:8,marginBottom:2}}>• {p}</Text>)}</View>)}
        </View>}
        <View style={{flexDirection:'row',gap:22}}>
          {edus.length>0&&<View style={{flex:1}}><View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:10}}><View style={{width:4,height:14,backgroundColor:a,borderRadius:2}}/><Text style={{fontSize:11,fontFamily:fbd,color:tc,textTransform:'uppercase',letterSpacing:0.8}}>Education</Text></View>{edus.map((e,i)=><View key={i} style={{marginBottom:8}}><Text style={{fontSize:10.5,fontFamily:fbd,color:tc}}>{e.degree}</Text><Text style={{fontSize:9.5,color:sc}}>{e.school} · {e.year}</Text></View>)}</View>}
          {skills.length>0&&<View style={{flex:1}}><View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:10}}><View style={{width:4,height:14,backgroundColor:a,borderRadius:2}}/><Text style={{fontSize:11,fontFamily:fbd,color:tc,textTransform:'uppercase',letterSpacing:0.8}}>Skills</Text></View><View style={{flexDirection:'row',flexWrap:'wrap',gap:5}}>{skills.map((sk,i)=><View key={i} style={{backgroundColor:`${a}15`,padding:'4 9',borderRadius:3}}><Text style={{fontSize:9,color:a}}>{sk}</Text></View>)}</View></View>}
        </View>
      </View>
    </Page></Document>
  );

  // ── COMPACT ──
  if (tmpl.layout === 'compact') return (
    <Document><Page size="A4" style={{padding:32,fontFamily:fb,backgroundColor:bg}}>
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',borderBottom:`1.5px solid ${a}`,paddingBottom:12,marginBottom:14}}>
        <View style={{flex:1}}>
          <Text style={{fontSize:22,fontFamily:fbd,color:tc}}>{name}</Text>
          <Text style={{fontSize:10,color:a,fontFamily:fbd,letterSpacing:0.3}}>{role}</Text>
        </View>
        <View style={{alignItems:'flex-end',flexDirection:'row',gap:10,alignItems:'center'}}>
          <View style={{alignItems:'flex-end'}}>{contacts.map((c,i)=><Text key={i} style={{fontSize:8.5,color:sc,marginBottom:2}}>{c}</Text>)}</View>
          {photo&&<Image src={photo} style={{width:46,height:46,borderRadius:23,border:`1px solid ${a}`}}/>}
        </View>
      </View>
      {data.summary&&<Text style={{fontSize:9.5,color:sc,lineHeight:1.55,marginBottom:12}}>{data.summary}</Text>}
      {exps.length>0&&<View style={{marginBottom:12}}><Text style={{fontSize:7.5,color:a,textTransform:'uppercase',letterSpacing:2,fontFamily:fbd,marginBottom:6}}>Experience</Text>{exps.map((e,i)=><View key={i} style={{flexDirection:'row',gap:10,marginBottom:8}}><View style={{width:58}}><Text style={{fontSize:8.5,color:a}}>{e.duration}</Text></View><View style={{flex:1}}><Text style={{fontSize:10,fontFamily:fbd,color:tc}}>{e.title}</Text><Text style={{fontSize:9,color:sc}}>{e.company}</Text>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:8.5,color:sc,marginTop:1}}>• {p}</Text>)}</View></View>)}</View>}
      {edus.length>0&&<View style={{marginBottom:12}}><Text style={{fontSize:7.5,color:a,textTransform:'uppercase',letterSpacing:2,fontFamily:fbd,marginBottom:6}}>Education</Text>{edus.map((e,i)=><View key={i} style={{flexDirection:'row',gap:10,marginBottom:5}}><View style={{width:58}}><Text style={{fontSize:8.5,color:a}}>{e.year}</Text></View><View style={{flex:1}}><Text style={{fontSize:10,fontFamily:fbd,color:tc}}>{e.degree}</Text><Text style={{fontSize:9,color:sc}}>{e.school}</Text></View></View>)}</View>}
      {skills.length>0&&<View><Text style={{fontSize:7.5,color:a,textTransform:'uppercase',letterSpacing:2,fontFamily:fbd,marginBottom:6}}>Skills</Text><Text style={{fontSize:9.5,color:sc}}>{skills.join(' · ')}</Text></View>}
    </Page></Document>
  );

  // ── LUXURY ──
  if (tmpl.layout === 'luxury') return (
    <Document><Page size="A4" style={{padding:44,fontFamily:fb,backgroundColor:bg}}>
      <View style={{border:`2px solid ${a}`,padding:'22 30',marginBottom:22}}>
        <View style={{borderBottom:`0.5px solid ${a}`,paddingBottom:14,marginBottom:14,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:16}}>
          {photo&&<Image src={photo} style={{width:62,height:62,borderRadius:31,border:`1.5px solid ${a}`}}/>}
          <View style={{alignItems:'center'}}>
            <Text style={{fontSize:26,fontFamily:fbd,color:tc,textAlign:'center',letterSpacing:2}}>{name.toUpperCase()}</Text>
            <Text style={{fontSize:11,color:a,letterSpacing:3,marginTop:4}}>{role.toUpperCase()}</Text>
          </View>
        </View>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:14,justifyContent:'center'}}>{contacts.map((c,i)=><Text key={i} style={{fontSize:9,color:sc}}>{c}</Text>)}</View>
      </View>
      {data.summary&&<View style={{marginBottom:18,borderLeft:`3px solid ${a}`,paddingLeft:14}}><Text style={{fontSize:10.5,color:sc,lineHeight:1.7}}>{data.summary}</Text></View>}
      {exps.length>0&&<View style={{marginBottom:16}}><View style={{flexDirection:'row',alignItems:'center',gap:10,marginBottom:12}}><View style={{height:1,width:18,backgroundColor:a}}/><Text style={{fontSize:8.5,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:2}}>Experience</Text><View style={{flex:1,height:1,backgroundColor:a}}/></View>{exps.map((e,i)=><View key={i} style={{marginBottom:10}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:tc}}>{e.title}</Text><Text style={{fontSize:9.5,color:a}}>{e.duration}</Text></View><Text style={{fontSize:10,color:sc,marginBottom:3}}>{e.company}</Text>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:sc,paddingLeft:8,marginBottom:2}}>• {p}</Text>)}</View>)}</View>}
      {edus.length>0&&<View style={{marginBottom:14}}><View style={{flexDirection:'row',alignItems:'center',gap:10,marginBottom:12}}><View style={{height:1,width:18,backgroundColor:a}}/><Text style={{fontSize:8.5,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:2}}>Education</Text><View style={{flex:1,height:1,backgroundColor:a}}/></View>{edus.map((e,i)=><View key={i} style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}><Text style={{fontSize:10.5,fontFamily:fbd,color:tc}}>{e.degree} · {e.school}</Text><Text style={{fontSize:9.5,color:a}}>{e.year}</Text></View>)}</View>}
      {skills.length>0&&<View><View style={{flexDirection:'row',alignItems:'center',gap:10,marginBottom:12}}><View style={{height:1,width:18,backgroundColor:a}}/><Text style={{fontSize:8.5,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:2}}>Skills</Text><View style={{flex:1,height:1,backgroundColor:a}}/></View><View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{skills.map((sk,i)=><View key={i} style={{border:`1px solid ${a}`,padding:'3 12'}}><Text style={{fontSize:9.5,color:a}}>{sk}</Text></View>)}</View></View>}
    </Page></Document>
  );

  // ── TOP STRIP ──
  if (tmpl.layout === 'strip') return (
    <Document><Page size="A4" style={{padding:0,fontFamily:fb,backgroundColor:'#ffffff'}}>
      <View style={{backgroundColor:a,height:8,width:'100%'}}/>
      <View style={{padding:'32 44'}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${lc}`}}>
          <View style={{flex:1}}>
            <Text style={{fontSize:30,fontFamily:fbd,color:tc,marginBottom:4}}>{name}</Text>
            <Text style={{fontSize:13,color:a,fontFamily:fbd,letterSpacing:0.5}}>{role}</Text>
          </View>
          <View style={{alignItems:'flex-end',flexDirection:'row',gap:14,alignItems:'center'}}>
            <View style={{alignItems:'flex-end'}}>{contacts.map((c,i)=><Text key={i} style={{fontSize:9,color:'#666',marginBottom:3}}>{c}</Text>)}</View>
            {photo&&<Image src={photo} style={{width:66,height:66,borderRadius:33,border:`2px solid ${a}`}}/>}
          </View>
        </View>
        {data.summary&&<View style={{marginBottom:16,backgroundColor:`${a}08`,padding:'12 16',borderRadius:4,borderLeft:`3px solid ${a}`}}><Text style={{fontSize:10.5,color:'#444',lineHeight:1.65}}>{data.summary}</Text></View>}
        {exps.length>0&&<View style={{marginBottom:16}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.8,marginBottom:10,borderBottom:`1px solid ${lc}`,paddingBottom:4}}>Work Experience</Text>{exps.map((e,i)=><View key={i} style={{marginBottom:10}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:tc}}>{e.title}</Text><Text style={{fontSize:9.5,color:a,backgroundColor:`${a}12`,padding:'1 8',borderRadius:3}}>{e.duration}</Text></View><Text style={{fontSize:10,color:'#666',marginBottom:3}}>{e.company}</Text>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:'#555',paddingLeft:10,marginBottom:2}}>• {p}</Text>)}</View>)}</View>}
        <View style={{flexDirection:'row',gap:24}}>
          {edus.length>0&&<View style={{flex:1}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.8,marginBottom:8,borderBottom:`1px solid ${lc}`,paddingBottom:4}}>Education</Text>{edus.map((e,i)=><View key={i} style={{marginBottom:8}}><Text style={{fontSize:11,fontFamily:fbd,color:tc}}>{e.degree}</Text><Text style={{fontSize:9.5,color:'#666'}}>{e.school} · {e.year}</Text></View>)}</View>}
          {skills.length>0&&<View style={{flex:1}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.8,marginBottom:8,borderBottom:`1px solid ${lc}`,paddingBottom:4}}>Skills</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:5}}>{skills.map((sk,i)=><View key={i} style={{border:`1px solid ${a}`,borderRadius:3,padding:'3 8'}}><Text style={{fontSize:9,color:a}}>{sk}</Text></View>)}</View></View>}
        </View>
      </View>
      <View style={{backgroundColor:a,height:4,width:'100%',position:'absolute',bottom:0}}/>
    </Page></Document>
  );

  // ── TIMELINE ──
  if (tmpl.layout === 'timeline') return (
    <Document><Page size="A4" style={{padding:pad,fontFamily:fb,backgroundColor:bg}}>
      <View style={{borderBottom:`2px solid ${a}`,paddingBottom:16,marginBottom:20,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <View style={{flex:1}}>
          <Text style={{fontSize:26,fontFamily:fbd,color:tc,marginBottom:3}}>{name}</Text>
          <Text style={{fontSize:12,color:a,fontFamily:fbd,marginBottom:8}}>{role}</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:14}}>{contacts.map((c,i)=><Text key={i} style={{fontSize:9,color:sc}}>{c}</Text>)}</View>
        </View>
        {photo&&<Image src={photo} style={{width:62,height:62,borderRadius:31,border:`2px solid ${a}`,marginLeft:16}}/>}
      </View>
      {data.summary&&<View style={{marginBottom:18}}><Text style={{fontSize:10.5,color:sc,lineHeight:1.65}}>{data.summary}</Text></View>}
      {exps.length>0&&<View style={{marginBottom:16}}>
        <Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.8,marginBottom:12}}>Career Timeline</Text>
        {exps.map((e,i)=>(
          <View key={i} style={{flexDirection:'row',gap:12,marginBottom:12}}>
            <View style={{alignItems:'center',width:12}}>
              <View style={{width:10,height:10,borderRadius:5,backgroundColor:a,marginTop:2}}/>
              {i<exps.length-1&&<View style={{width:1.5,flex:1,backgroundColor:`${a}40`,marginTop:2}}/>}
            </View>
            <View style={{flex:1,paddingBottom:8}}>
              <Text style={{fontSize:9.5,color:a,fontFamily:fbd,marginBottom:2}}>{e.duration}</Text>
              <Text style={{fontSize:11,fontFamily:fbd,color:tc,marginBottom:1}}>{e.title}</Text>
              <Text style={{fontSize:10,color:sc,marginBottom:4}}>{e.company}</Text>
              {e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:sc,paddingLeft:8,marginBottom:2}}>• {p}</Text>)}
            </View>
          </View>
        ))}
      </View>}
      <View style={{flexDirection:'row',gap:22}}>
        {edus.length>0&&<View style={{flex:1}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.8,marginBottom:10}}>Education</Text>{edus.map((e,i)=><View key={i} style={{marginBottom:8}}><Text style={{fontSize:11,fontFamily:fbd,color:tc}}>{e.degree}</Text><Text style={{fontSize:9.5,color:sc}}>{e.school}</Text><Text style={{fontSize:9,color:a}}>{e.year}</Text></View>)}</View>}
        {skills.length>0&&<View style={{flex:1}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.8,marginBottom:10}}>Skills</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:5}}>{skills.map((sk,i)=><View key={i} style={{backgroundColor:`${a}14`,borderRadius:99,padding:'4 10',marginBottom:4}}><Text style={{fontSize:9,color:a}}>{sk}</Text></View>)}</View></View>}
      </View>
    </Page></Document>
  );

  // ── BOLD NAME ──
  if (tmpl.layout === 'boldname') return (
    <Document><Page size="A4" style={{padding:pad,fontFamily:fb,backgroundColor:bg}}>
      <View style={{marginBottom:20}}>
        <Text style={{fontSize:42,fontFamily:fbd,color:a,letterSpacing:-1,lineHeight:1,marginBottom:2}}>{name}</Text>
        <View style={{flexDirection:'row',alignItems:'center',gap:12,marginBottom:10}}>
          <Text style={{fontSize:13,color:tc,fontFamily:fbd}}>{role}</Text>
          <View style={{flex:1,height:1.5,backgroundColor:a}}/>
        </View>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:16,alignItems:'center'}}>
          {contacts.map((c,i)=><Text key={i} style={{fontSize:9,color:sc}}>{c}</Text>)}
          {photo&&<Image src={photo} style={{width:48,height:48,borderRadius:24,border:`2px solid ${a}`,marginLeft:'auto'}}/>}
        </View>
      </View>
      {data.summary&&<View style={{marginBottom:16,paddingLeft:14,borderLeft:`3px solid ${a}`}}><Text style={{fontSize:10.5,color:sc,lineHeight:1.65}}>{data.summary}</Text></View>}
      {exps.length>0&&<View style={{marginBottom:14}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:2,marginBottom:10}}>Experience</Text>{exps.map((e,i)=><View key={i} style={{marginBottom:10,flexDirection:'row',gap:14}}><View style={{width:72,alignItems:'flex-end'}}><Text style={{fontSize:8.5,color:a,textAlign:'right',lineHeight:1.4}}>{e.duration}</Text></View><View style={{flex:1,borderLeft:`1px solid ${lc}`,paddingLeft:12}}><Text style={{fontSize:11,fontFamily:fbd,color:tc,marginBottom:1}}>{e.title}</Text><Text style={{fontSize:10,color:sc,marginBottom:3}}>{e.company}</Text>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:sc,marginBottom:2}}>• {p}</Text>)}</View></View>)}</View>}
      {edus.length>0&&<View style={{marginBottom:14}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:2,marginBottom:10}}>Education</Text>{edus.map((e,i)=><View key={i} style={{marginBottom:8,flexDirection:'row',gap:14}}><View style={{width:72,alignItems:'flex-end'}}><Text style={{fontSize:8.5,color:a,textAlign:'right'}}>{e.year}</Text></View><View style={{flex:1,borderLeft:`1px solid ${lc}`,paddingLeft:12}}><Text style={{fontSize:11,fontFamily:fbd,color:tc}}>{e.degree}</Text><Text style={{fontSize:10,color:sc}}>{e.school}</Text></View></View>)}</View>}
      {skills.length>0&&<View><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:2,marginBottom:10}}>Skills</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{skills.map((sk,i)=><Text key={i} style={{fontSize:9.5,color:a,backgroundColor:`${a}10`,border:`1px solid ${a}30`,padding:'3 10',borderRadius:99}}>{sk}</Text>)}</View></View>}
    </Page></Document>
  );

  // ── CLEAN SPLIT ──
  if (tmpl.layout === 'cleansplit') return (
    <Document><Page size="A4" style={{padding:0,fontFamily:fb,backgroundColor:'#ffffff',flexDirection:'row'}}>
      <View style={{width:200,backgroundColor:sb,padding:26,minHeight:'100%',justifyContent:'space-between'}}>
        <View>
          {photo&&<Image src={photo} style={{width:76,height:76,borderRadius:38,border:`2px solid ${a}`,marginBottom:16,alignSelf:'center'}}/>}
          <View style={{marginBottom:20}}>
            <Text style={{fontSize:16,fontFamily:fbd,color:tc,lineHeight:1.2,marginBottom:3}}>{name}</Text>
            <Text style={{fontSize:10,color:a,fontFamily:fbd}}>{role}</Text>
          </View>
          <View style={{marginBottom:20}}>
            <Text style={{fontSize:7.5,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:8,fontFamily:fbd}}>Contact</Text>
            {contacts.map((c,i)=><Text key={i} style={{fontSize:8.5,color:'#555',marginBottom:5,lineHeight:1.4}}>{c}</Text>)}
          </View>
          {skills.length>0&&<View>
            <Text style={{fontSize:7.5,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:8,fontFamily:fbd}}>Skills</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:4}}>{skills.map((sk,i)=><View key={i} style={{backgroundColor:`${a}15`,borderRadius:3,padding:'3 8',marginBottom:4}}><Text style={{fontSize:8,color:a}}>{sk}</Text></View>)}</View>
          </View>}
        </View>
      </View>
      <View style={{flex:1,padding:'28 30',borderLeft:`3px solid ${a}`}}>
        {data.summary&&<View style={{marginBottom:18,paddingBottom:14,borderBottom:`1px solid #eee`}}><Text style={{fontSize:10.5,color:'#444',lineHeight:1.65}}>{data.summary}</Text></View>}
        {exps.length>0&&<View style={{marginBottom:16}}><Text style={{fontSize:9,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:10,fontFamily:fbd}}>Work Experience</Text>{exps.map((e,i)=><View key={i} style={{marginBottom:11}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:'#111'}}>{e.title}</Text><Text style={{fontSize:9,color:a}}>{e.duration}</Text></View><Text style={{fontSize:10,color:'#666',marginBottom:3}}>{e.company}</Text>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:'#555',paddingLeft:8,marginBottom:2}}>• {p}</Text>)}</View>)}</View>}
        {edus.length>0&&<View><Text style={{fontSize:9,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:10,fontFamily:fbd}}>Education</Text>{edus.map((e,i)=><View key={i} style={{marginBottom:8}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:'#111'}}>{e.degree}</Text><Text style={{fontSize:9,color:a}}>{e.year}</Text></View><Text style={{fontSize:10,color:'#666'}}>{e.school}</Text></View>)}</View>}
      </View>
    </Page></Document>
  );

  // ── INFOGRAPHIC ──
  if (tmpl.layout === 'infographic') return (
    <Document><Page size="A4" style={{padding:pad,fontFamily:fb,backgroundColor:bg}}>
      <View style={{backgroundColor:a,padding:'18 24',borderRadius:8,marginBottom:20,flexDirection:'row',alignItems:'center',gap:16}}>
        {photo&&<Image src={photo} style={{width:70,height:70,borderRadius:35,border:'2px solid rgba(255,255,255,.5)'}}/>}
        <View style={{flex:1}}>
          <Text style={{fontSize:26,fontFamily:fbd,color:'#fff',marginBottom:2}}>{name}</Text>
          <Text style={{fontSize:12,color:'rgba(255,255,255,.8)',marginBottom:8}}>{role}</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{contacts.map((c,i)=><Text key={i} style={{fontSize:9,color:'rgba(255,255,255,.7)'}}>{c}</Text>)}</View>
        </View>
      </View>
      {data.summary&&<View style={{marginBottom:16}}><Text style={{fontSize:10.5,color:sc,lineHeight:1.65}}>{data.summary}</Text></View>}
      {exps.length>0&&<View style={{marginBottom:16}}>
        <Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.8,marginBottom:10}}>Experience</Text>
        {exps.map((e,i)=><View key={i} style={{flexDirection:'row',gap:10,marginBottom:10}}>
          <View style={{backgroundColor:`${a}15`,borderRadius:4,padding:'6 10',alignItems:'center',justifyContent:'center',minWidth:56}}>
            <Text style={{fontSize:8,color:a,fontFamily:fbd,textAlign:'center',lineHeight:1.3}}>{e.duration?.split('-')?.[0]?.trim()}</Text>
            <Text style={{fontSize:7,color:sc,textAlign:'center'}}>to</Text>
            <Text style={{fontSize:8,color:a,fontFamily:fbd,textAlign:'center',lineHeight:1.3}}>{e.duration?.split('-')?.[1]?.trim()}</Text>
          </View>
          <View style={{flex:1,borderLeft:`2px solid ${a}30`,paddingLeft:10}}>
            <Text style={{fontSize:11,fontFamily:fbd,color:tc,marginBottom:1}}>{e.title}</Text>
            <Text style={{fontSize:10,color:a,marginBottom:4,fontFamily:fbd}}>{e.company}</Text>
            {e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:sc,marginBottom:2}}>• {p}</Text>)}
          </View>
        </View>)}
      </View>}
      <View style={{flexDirection:'row',gap:20}}>
        {edus.length>0&&<View style={{flex:1}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.8,marginBottom:10}}>Education</Text>{edus.map((e,i)=><View key={i} style={{marginBottom:8,backgroundColor:`${a}06`,padding:'8 12',borderRadius:4}}><Text style={{fontSize:10.5,fontFamily:fbd,color:tc}}>{e.degree}</Text><Text style={{fontSize:9.5,color:sc}}>{e.school}</Text><Text style={{fontSize:9,color:a,marginTop:2}}>{e.year}</Text></View>)}</View>}
        {skills.length>0&&<View style={{flex:1}}><Text style={{fontSize:9,fontFamily:fbd,color:a,textTransform:'uppercase',letterSpacing:1.8,marginBottom:10}}>Skills</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:5}}>{skills.map((sk,i)=><View key={i} style={{backgroundColor:`${a}15`,borderRadius:99,padding:'4 10',marginBottom:4}}><Text style={{fontSize:9,color:a}}>{sk}</Text></View>)}</View></View>}
      </View>
    </Page></Document>
  );

  // ── SWISS ──
  if (tmpl.layout === 'swiss') return (
    <Document><Page size="A4" style={{padding:44,fontFamily:fb,backgroundColor:'#ffffff'}}>
      <View style={{flexDirection:'row',marginBottom:28}}>
        <View style={{width:3,backgroundColor:'#000',marginRight:20}}/>
        <View style={{flex:1}}>
          <Text style={{fontSize:36,fontFamily:fbd,color:'#000',letterSpacing:-1,lineHeight:0.9,marginBottom:8}}>{name.toUpperCase()}</Text>
          <Text style={{fontSize:11,color:'#000',letterSpacing:2,fontFamily:fbd}}>{role.toUpperCase()}</Text>
        </View>
        {photo&&<Image src={photo} style={{width:60,height:60,borderRadius:0}}/>}
      </View>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:16,marginBottom:20,borderTop:'1px solid #000',paddingTop:10}}>{contacts.map((c,i)=><Text key={i} style={{fontSize:8.5,color:'#000'}}>{c}</Text>)}</View>
      {data.summary&&<View style={{marginBottom:18,borderTop:'1px solid #000',paddingTop:10}}><Text style={{fontSize:10.5,color:'#333',lineHeight:1.65}}>{data.summary}</Text></View>}
      {exps.length>0&&<View style={{marginBottom:16,borderTop:'1px solid #000',paddingTop:10}}>
        <Text style={{fontSize:8,color:'#000',textTransform:'uppercase',letterSpacing:3,fontFamily:fbd,marginBottom:12}}>Experience</Text>
        {exps.map((e,i)=><View key={i} style={{flexDirection:'row',marginBottom:10}}>
          <Text style={{fontSize:9,color:'#888',width:72}}>{e.duration}</Text>
          <View style={{flex:1}}>
            <Text style={{fontSize:11,fontFamily:fbd,color:'#000'}}>{e.title}</Text>
            <Text style={{fontSize:10,color:'#555',marginBottom:3}}>{e.company}</Text>
            {e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:'#444',marginBottom:2}}>— {p}</Text>)}
          </View>
        </View>)}
      </View>}
      {edus.length>0&&<View style={{marginBottom:14,borderTop:'1px solid #000',paddingTop:10}}>
        <Text style={{fontSize:8,color:'#000',textTransform:'uppercase',letterSpacing:3,fontFamily:fbd,marginBottom:10}}>Education</Text>
        {edus.map((e,i)=><View key={i} style={{flexDirection:'row',marginBottom:6}}><Text style={{fontSize:9,color:'#888',width:72}}>{e.year}</Text><Text style={{fontSize:11,fontFamily:fbd,color:'#000'}}>{e.degree} — <Text style={{fontFamily:fb,color:'#555'}}>{e.school}</Text></Text></View>)}
      </View>}
      {skills.length>0&&<View style={{borderTop:'1px solid #000',paddingTop:10}}>
        <Text style={{fontSize:8,color:'#000',textTransform:'uppercase',letterSpacing:3,fontFamily:fbd,marginBottom:10}}>Skills</Text>
        <Text style={{fontSize:10.5,color:'#333'}}>{skills.join('   /   ')}</Text>
      </View>}
    </Page></Document>
  );

  // ── GRADIENT SIDE ──
  if (tmpl.layout === 'gradside') return (
    <Document><Page size="A4" style={{padding:0,fontFamily:fb,backgroundColor:'#ffffff',flexDirection:'row'}}>
      <View style={{width:185,backgroundColor:sb,padding:26,minHeight:'100%'}}>
        {photo&&<View style={{alignItems:'center',marginBottom:16}}><Image src={photo} style={{width:76,height:76,borderRadius:38,border:`3px solid ${a}`}}/></View>}
        <Text style={{fontSize:17,fontFamily:fbd,color:'#fff',marginBottom:3,lineHeight:1.2}}>{name}</Text>
        <Text style={{fontSize:10,color:a,marginBottom:20,fontFamily:fbd}}>{role}</Text>
        <View style={{marginBottom:20}}>
          <Text style={{fontSize:7.5,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:1.5,marginBottom:8,fontFamily:fbd}}>Contact</Text>
          {contacts.map((c,i)=><Text key={i} style={{fontSize:8.5,color:'rgba(255,255,255,.75)',marginBottom:5}}>{c}</Text>)}
        </View>
        {skills.length>0&&<View>
          <Text style={{fontSize:7.5,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:1.5,marginBottom:8,fontFamily:fbd}}>Skills</Text>
          {skills.map((sk,i)=><View key={i} style={{backgroundColor:'rgba(255,255,255,.1)',borderRadius:3,padding:'4 8',marginBottom:4}}><Text style={{fontSize:8.5,color:'rgba(255,255,255,.85)'}}>{sk}</Text></View>)}
        </View>}
      </View>
      <View style={{flex:1,padding:'30 32'}}>
        {data.summary&&<View style={{marginBottom:16,paddingBottom:14,borderBottom:`1px solid #eee`}}><Text style={{fontSize:10.5,color:'#444',lineHeight:1.65}}>{data.summary}</Text></View>}
        {exps.length>0&&<View style={{marginBottom:16}}><Text style={{fontSize:9,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:10,fontFamily:fbd}}>Experience</Text>{exps.map((e,i)=><View key={i} style={{marginBottom:11}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:'#111'}}>{e.title}</Text><Text style={{fontSize:9,color:a,backgroundColor:`${a}10`,padding:'1 8',borderRadius:99}}>{e.duration}</Text></View><Text style={{fontSize:10,color:'#666',marginBottom:3}}>{e.company}</Text>{e.points?.filter(p=>p).map((p,j)=><Text key={j} style={{fontSize:9.5,color:'#555',paddingLeft:8,marginBottom:2}}>• {p}</Text>)}</View>)}</View>}
        {edus.length>0&&<View><Text style={{fontSize:9,color:a,textTransform:'uppercase',letterSpacing:1.5,marginBottom:10,fontFamily:fbd}}>Education</Text>{edus.map((e,i)=><View key={i} style={{marginBottom:8}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontSize:11,fontFamily:fbd,color:'#111'}}>{e.degree}</Text><Text style={{fontSize:9,color:a}}>{e.year}</Text></View><Text style={{fontSize:10,color:'#666'}}>{e.school}</Text></View>)}</View>}
      </View>
    </Page></Document>
  );

  return <Document><Page size="A4" style={{padding:44,fontFamily:fb,backgroundColor:bg}}><Text style={{fontSize:20,color:tc}}>{name}</Text></Page></Document>;
};

// ── MAIN COMPONENT ────────────────────────────────────────────────
export default function ResumeBuilder() {
  const [activeSection, setActiveSection] = useState('templates');
  const [tab, setTab] = useState(0);
  const [tmpl, setTmpl] = useState(TEMPLATES[0]);
  const [cat, setCat] = useState('All');
  const [colors, setColors] = useState(DEFAULT_COLORS[1]);
  const [font, setFont] = useState('Helvetica');
  const [spacing, setSpacing] = useState('normal');
  const [photo, setPhoto] = useState(null);
  const photoRef = useRef();
  const [data, setData] = useState(DEFAULT_DATA);

  const upd = (f, v) => setData(d => ({ ...d, [f]: v }));
  const updExp = (i, f, v) => { const e = [...data.experience]; e[i] = { ...e[i], [f]: v }; setData(d => ({ ...d, experience: e })); };
  const updEPt = (i, j, v) => { const e = [...data.experience]; e[i].points[j] = v; setData(d => ({ ...d, experience: e })); };
  const addExp = () => setData(d => ({ ...d, experience: [...d.experience, { title: '', company: '', duration: '', points: ['', ''] }] }));
  const updEdu = (i, f, v) => { const e = [...data.education]; e[i] = { ...e[i], [f]: v }; setData(d => ({ ...d, education: e })); };
  const addEdu = () => setData(d => ({ ...d, education: [...d.education, { degree: '', school: '', year: '' }] }));
  const updSk = (i, v) => { const s = [...data.skills]; s[i] = v; setData(d => ({ ...d, skills: s })); };
  const addSk = () => setData(d => ({ ...d, skills: [...d.skills, ''] }));

  const selectTemplate = (t) => { setTmpl(t); setColors(DEFAULT_COLORS[t.id]); };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const filtered = cat === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === cat);

  const inp = (val, fn, ph, multi = false) => multi ? (
    <textarea value={val} onChange={e => fn(e.target.value)} placeholder={ph} rows={3}
      style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', borderRadius: '10px', padding: '11px 14px', color: 'white', fontSize: '13px', fontFamily: "'Cabinet Grotesk',sans-serif", outline: 'none', resize: 'vertical', transition: 'border-color .2s', marginBottom: '10px' }}
      onFocus={e => e.target.style.borderColor = 'rgba(245,230,66,.5)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.09)'} />
  ) : (
    <input value={val} onChange={e => fn(e.target.value)} placeholder={ph}
      style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', borderRadius: '10px', padding: '11px 14px', color: 'white', fontSize: '13px', fontFamily: "'Cabinet Grotesk',sans-serif", outline: 'none', transition: 'border-color .2s', marginBottom: '10px' }}
      onFocus={e => e.target.style.borderColor = 'rgba(245,230,66,.5)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.09)'} />
  );

  const lbl = (t) => <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '9px', letterSpacing: '.15em', textTransform: 'uppercase', color: '#4a5568', marginBottom: '5px' }}>{t}</div>;

  // Layout mini preview renderer
  const MiniPreview = ({ t }) => {
    const dc = DEFAULT_COLORS[t.id];
    const a = dc.accent;
    const bg = dc.bg;
    const sb = dc.sidebar;
    return (
      <div style={{ height: '70px', borderRadius: '7px', background: bg, border: '1px solid rgba(0,0,0,.07)', overflow: 'hidden', position: 'relative', marginBottom: '9px' }}>
        {t.layout === 'sidebar' && <><div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '32%', background: sb }} /><div style={{ position: 'absolute', top: '8px', left: '36%', right: '6px' }}><div style={{ width: '62%', height: '5px', borderRadius: '2px', background: a, marginBottom: '3px' }} /><div style={{ width: '80%', height: '2.5px', borderRadius: '2px', background: '#ccc', marginBottom: '2.5px' }} /><div style={{ width: '70%', height: '2.5px', borderRadius: '2px', background: '#ddd' }} /></div></>}
        {t.layout === 'banner' && <><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '28px', background: a }} /><div style={{ position: 'absolute', top: '32px', left: '6px', right: '6px' }}><div style={{ width: '74%', height: '2.5px', borderRadius: '2px', background: '#ddd', marginBottom: '3px' }} /><div style={{ width: '54%', height: '2px', borderRadius: '2px', background: '#eee' }} /></div></>}
        {t.layout === 'twocol' && <><div style={{ position: 'absolute', top: '6px', left: '6px', width: '51%', bottom: '6px', background: 'rgba(0,0,0,.03)', borderRadius: '3px' }} /><div style={{ position: 'absolute', top: '6px', left: '57%', width: '1px', bottom: '6px', background: '#ddd' }} /><div style={{ position: 'absolute', top: '6px', left: '61%', right: '6px', bottom: '6px', background: 'rgba(0,0,0,.03)', borderRadius: '3px' }} /><div style={{ position: 'absolute', top: '10px', left: '9px', width: '37%', height: '4px', borderRadius: '2px', background: a }} /></>}
        {t.layout === 'minimal' && <div style={{ padding: '8px' }}><div style={{ width: '56%', height: '7px', borderRadius: '2px', background: '#111', marginBottom: '3px' }} /><div style={{ width: '100%', height: '0.5px', background: '#ccc', marginBottom: '6px' }} />{[80, 65, 72].map((w, i) => <div key={i} style={{ width: `${w}%`, height: '2.5px', borderRadius: '2px', background: '#eee', marginBottom: '2.5px' }} />)}</div>}
        {t.layout === 'boxed' && <><div style={{ position: 'absolute', top: '5px', left: '5px', right: '5px', height: '18px', borderRadius: '4px', background: a }} /><div style={{ position: 'absolute', top: '27px', left: '5px', right: '5px', height: '12px', borderRadius: '3px', border: `1px solid ${a}44` }} /><div style={{ position: 'absolute', top: '43px', left: '5px', width: '42%', height: '14px', borderRadius: '3px', border: `1px solid ${a}44` }} /><div style={{ position: 'absolute', top: '43px', left: '51%', right: '5px', height: '14px', borderRadius: '3px', border: `1px solid ${a}44` }} /></>}
        {t.layout === 'elegant' && <div style={{ padding: '7px', textAlign: 'center' }}><div style={{ width: '50%', height: '5px', borderRadius: '2px', background: '#333', marginBottom: '3px', marginLeft: 'auto', marginRight: 'auto' }} /><div style={{ width: '75%', height: '0.5px', background: a, marginBottom: '5px', marginLeft: 'auto', marginRight: 'auto' }} />{[85, 65, 75].map((w, i) => <div key={i} style={{ width: `${w}%`, height: '2.5px', borderRadius: '2px', background: '#eee', marginBottom: '2.5px', marginLeft: 'auto', marginRight: 'auto' }} />)}</div>}
        {t.layout === 'sidelight' && <><div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '32%', background: sb || '#f1f5f9' }} /><div style={{ position: 'absolute', top: '8px', left: '36%', right: '6px' }}><div style={{ width: '62%', height: '5px', borderRadius: '2px', background: '#ccc', marginBottom: '3px' }} /><div style={{ width: '80%', height: '2.5px', borderRadius: '2px', background: '#eee' }} /></div></>}
        {t.layout === 'tech' && <><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '20px', background: a, borderRadius: '3px 3px 0 0' }} /><div style={{ position: 'absolute', top: '24px', left: '5px', right: '5px' }}><div style={{ width: '3px', height: '36px', background: a, position: 'absolute', left: 0 }} /><div style={{ paddingLeft: '8px' }}><div style={{ width: '68%', height: '2.5px', background: '#ddd', marginBottom: '4px' }} /><div style={{ width: '50%', height: '2px', background: '#eee' }} /></div></div></>}
        {t.layout === 'executive' && <div style={{ padding: '6px 7px' }}><div style={{ width: '100%', height: '1.5px', background: a, marginBottom: '5px' }} /><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}><div style={{ width: '48%', height: '6px', borderRadius: '2px', background: '#222' }} /><div style={{ width: '24%', height: '4px', borderRadius: '2px', background: '#eee' }} /></div><div style={{ width: '100%', height: '0.5px', background: a, marginBottom: '5px' }} />{[78, 62].map((w, i) => <div key={i} style={{ width: `${w}%`, height: '2px', background: '#eee', marginBottom: '2.5px' }} />)}</div>}
        {t.layout === 'block' && <><div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '5px', background: a }} /><div style={{ position: 'absolute', top: '8px', left: '12px', right: '6px' }}><div style={{ width: '54%', height: '5px', borderRadius: '2px', background: '#222', marginBottom: '3px' }} /><div style={{ width: '34%', height: '2.5px', borderRadius: '2px', background: a, marginBottom: '5px' }} />{[80, 65].map((w, i) => <div key={i} style={{ width: `${w}%`, height: '2.5px', background: '#eee', marginBottom: '2.5px' }} />)}</div></>}
        {t.layout === 'compact' && <div style={{ padding: '6px 7px' }}><div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${a}`, paddingBottom: '3px', marginBottom: '4px' }}><div style={{ width: '44%', height: '5px', borderRadius: '2px', background: '#333' }} /><div style={{ width: '27%', height: '4px', borderRadius: '2px', background: '#eee' }} /></div>{[82, 68, 74].map((w, i) => <div key={i} style={{ width: `${w}%`, height: '2px', background: '#eee', marginBottom: '2.5px' }} />)}</div>}
        {t.layout === 'luxury' && <><div style={{ position: 'absolute', inset: '3px', border: `1.5px solid ${a}`, borderRadius: '3px' }} /><div style={{ position: 'absolute', top: '11px', left: 0, right: 0, textAlign: 'center', padding: '0 5px' }}><div style={{ width: '55%', height: '5px', borderRadius: '2px', background: '#333', marginBottom: '2px', marginLeft: 'auto', marginRight: 'auto' }} /><div style={{ width: '35%', height: '0.5px', background: a, marginLeft: 'auto', marginRight: 'auto', marginBottom: '5px' }} />{[78, 60].map((w, i) => <div key={i} style={{ width: `${w}%`, height: '2.5px', background: '#eee', marginBottom: '2.5px', marginLeft: 'auto', marginRight: 'auto' }} />)}</div></>}
        {t.layout === 'strip' && <><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: a }} /><div style={{ position: 'absolute', top: '9px', left: '7px', right: '7px' }}><div style={{ width: '58%', height: '6px', borderRadius: '2px', background: '#222', marginBottom: '3px' }} /><div style={{ width: '100%', height: '0.5px', background: '#ccc', marginBottom: '5px' }} />{[75, 62].map((w, i) => <div key={i} style={{ width: `${w}%`, height: '2.5px', background: '#eee', marginBottom: '2.5px' }} />)}</div></>}
        {t.layout === 'timeline' && <div style={{ padding: '7px' }}><div style={{ width: '55%', height: '5px', borderRadius: '2px', background: '#222', marginBottom: '3px' }} /><div style={{ display: 'flex', gap: '6px', marginTop: '5px' }}><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div style={{ width: '7px', height: '7px', borderRadius: '50%', background: a }} /><div style={{ width: '1.5px', flex: 1, background: `${a}40`, marginTop: '2px' }} /></div><div style={{ flex: 1 }}><div style={{ width: '70%', height: '3px', background: '#ccc', marginBottom: '3px' }} /><div style={{ width: '50%', height: '2.5px', background: '#eee' }} /></div></div></div>}
        {t.layout === 'boldname' && <div style={{ padding: '7px' }}><div style={{ width: '80%', height: '9px', borderRadius: '2px', background: a, marginBottom: '3px' }} /><div style={{ width: '100%', height: '0.5px', background: '#ccc', marginBottom: '5px' }} />{[75, 58, 68].map((w, i) => <div key={i} style={{ width: `${w}%`, height: '2px', background: '#eee', marginBottom: '2.5px' }} />)}</div>}
        {t.layout === 'cleansplit' && <><div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '36%', background: sb || '#e2e8f0' }} /><div style={{ position: 'absolute', top: 0, left: '36%', bottom: 0, width: '2px', background: a }} /><div style={{ position: 'absolute', top: '8px', left: '42%', right: '6px' }}><div style={{ width: '65%', height: '2.5px', background: '#ddd', marginBottom: '3px' }} /><div style={{ width: '80%', height: '2.5px', background: '#eee' }} /></div></>}
        {t.layout === 'infographic' && <><div style={{ position: 'absolute', top: '5px', left: '5px', right: '5px', height: '22px', borderRadius: '5px', background: a }} /><div style={{ position: 'absolute', top: '31px', left: '5px', right: '5px' }}><div style={{ display: 'flex', gap: '5px', marginBottom: '4px' }}><div style={{ width: '14px', height: '28px', borderRadius: '3px', background: `${a}20` }} /><div style={{ flex: 1 }}><div style={{ width: '80%', height: '2.5px', background: '#ddd', marginBottom: '3px' }} /><div style={{ width: '60%', height: '2px', background: '#eee' }} /></div></div></div></>}
        {t.layout === 'swiss' && <div style={{ padding: '7px' }}><div style={{ display: 'flex', gap: '5px', marginBottom: '4px' }}><div style={{ width: '2.5px', background: '#000', alignSelf: 'stretch' }} /><div style={{ width: '65%', height: '8px', borderRadius: '1px', background: '#000' }} /></div><div style={{ width: '100%', height: '0.5px', background: '#000', marginBottom: '5px' }} />{[75, 60, 68].map((w, i) => <div key={i} style={{ width: `${w}%`, height: '2px', background: '#ccc', marginBottom: '2.5px' }} />)}</div>}
        {t.layout === 'gradside' && <><div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '33%', background: sb || '#4c1d95' }} /><div style={{ position: 'absolute', top: '8px', left: '38%', right: '6px' }}><div style={{ width: '65%', height: '5px', borderRadius: '2px', background: '#ccc', marginBottom: '3px' }} /><div style={{ width: '80%', height: '2.5px', borderRadius: '2px', background: '#eee' }} /></div></>}
        {tmpl.id === t.id && <div style={{ position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#F5E642', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#000', fontWeight: 900, zIndex: 2 }}>✓</div>}
      </div>
    );
  };

  return (
    <main style={{ minHeight: '100vh', background: '#060609', color: 'white', fontFamily: "'Cabinet Grotesk',sans-serif", padding: '32px 24px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cabinet+Grotesk:wght@400;500;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .tb { padding: 8px 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,.08); background: transparent; color: #4a5568; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .2s; font-family: 'JetBrains Mono', monospace; letter-spacing: .06em; }
        .tb.on { background: rgba(245,230,66,.1); border-color: rgba(245,230,66,.35); color: #F5E642; }
        .tb:hover { border-color: rgba(255,255,255,.2); color: white; }
        .cb { padding: 5px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,.06); background: transparent; color: #4a5568; font-size: 11px; font-weight: 700; cursor: pointer; transition: all .2s; font-family: 'JetBrains Mono', monospace; }
        .cb.on { background: rgba(245,230,66,.08); border-color: rgba(245,230,66,.25); color: #F5E642; }
        .ab { background: rgba(255,255,255,.03); border: 1px dashed rgba(255,255,255,.1); border-radius: 10px; padding: 9px; color: #4a5568; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .2s; width: 100%; margin-top: 4px; font-family: 'Cabinet Grotesk', sans-serif; }
        .ab:hover { border-color: rgba(245,230,66,.3); color: #F5E642; }
        .tc2 { border-radius: 12px; padding: 12px; cursor: pointer; transition: all .2s; border: 1.5px solid rgba(255,255,255,.06); background: rgba(255,255,255,.02); }
        .tc2:hover { transform: translateY(-2px); border-color: rgba(255,255,255,.14); background: rgba(255,255,255,.04); }
        .tc2.sel { border-color: rgba(245,230,66,.7) !important; background: rgba(245,230,66,.06) !important; }
        .sn-btn { padding: 11px 20px; border-radius: 10px; border: none; font-weight: 700; font-size: 13px; cursor: pointer; transition: all .2s; font-family: 'Cabinet Grotesk', sans-serif; display: flex; align-items: center; gap: 7px; }
        .sn-btn.on { background: #F5E642; color: #000; }
        .sn-btn.off { background: rgba(255,255,255,.05); color: #6b7280; }
        .sn-btn.off:hover { background: rgba(255,255,255,.08); color: white; }
        .clr-wrap { width: 36px; height: 36px; border-radius: 8px; cursor: pointer; border: 1.5px solid rgba(255,255,255,.15); position: relative; overflow: hidden; transition: transform .2s; }
        .clr-wrap:hover { transform: scale(1.1); }
        .clr-wrap input { position: absolute; inset: -5px; opacity: 0; cursor: pointer; width: 200%; height: 200%; }
        .sp-btn { padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,.08); background: transparent; color: #6b7280; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .2s; font-family: 'Cabinet Grotesk', sans-serif; flex: 1; text-transform: capitalize; }
        .sp-btn.on { background: rgba(245,230,66,.1); border-color: rgba(245,230,66,.3); color: #F5E642; }
      `}</style>

      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: '#4a5568', textDecoration: 'none', fontSize: '12px', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '28px', transition: 'color .2s' }}
        onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#4a5568'}>← Back</a>

      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '9px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#F5E642', opacity: .7, marginBottom: '8px' }}>📄 Career Tool</div>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(44px,7vw,78px)', lineHeight: .9, marginBottom: '8px' }}>Resume<br />Builder</h1>
            <p style={{ color: '#4a5568', fontSize: '14px', fontWeight: 500 }}>20 unique layouts · Custom colors & fonts · Photo upload · Free forever</p>
          </div>
          <PDFDownloadLink document={<ResumePDF data={data} tmpl={tmpl} colors={colors} font={font} spacing={spacing} photo={photo} />} fileName={`${data.name || 'my-resume'}-zaptools.pdf`}>
            {({ loading: pl }) => (
              <button style={{ background: pl ? 'rgba(245,230,66,.3)' : '#F5E642', color: '#000', padding: '13px 28px', borderRadius: '12px', border: 'none', fontWeight: 900, fontSize: '13px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(245,230,66,.3)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >{pl ? 'Generating...' : '⬇ Download PDF'}</button>
            )}
          </PDFDownloadLink>
        </div>

        {/* ── SECTION NAV ── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', padding: '6px', background: 'rgba(255,255,255,.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,.05)', width: 'fit-content' }}>
          <button className={`sn-btn ${activeSection === 'templates' ? 'on' : 'off'}`} onClick={() => setActiveSection('templates')}>🎨 Templates</button>
          <button className={`sn-btn ${activeSection === 'customize' ? 'on' : 'off'}`} onClick={() => setActiveSection('customize')}>⚙️ Customize</button>
          <button className={`sn-btn ${activeSection === 'content' ? 'on' : 'off'}`} onClick={() => setActiveSection('content')}>📝 Content</button>
        </div>

        {/* ── TEMPLATES ── */}
        {activeSection === 'templates' && (
          <div style={{ animation: 'fadeIn .25s ease', background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>Choose Your Layout</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#4a5568', marginTop: '3px' }}>{filtered.length} templates available</div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {CATEGORIES.map(c => <button key={c} className={`cb${cat === c ? ' on' : ''}`} onClick={() => setCat(c)}>{c}</button>)}
              </div>
            </div>

            {/* Selected indicator */}
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(245,230,66,.04)', border: '1px solid rgba(245,230,66,.12)', borderRadius: '8px', padding: '9px 14px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.accent, boxShadow: `0 0 8px ${colors.accent}` }} />
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#F5E642', fontWeight: 700 }}>{tmpl.name}</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#4a5568' }}>{tmpl.category} · {tmpl.layout}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(136px, 1fr))', gap: '10px' }}>
              {filtered.map(t => (
                <div key={t.id} className={`tc2${tmpl.id === t.id ? ' sel' : ''}`} onClick={() => selectTemplate(t)}>
                  <MiniPreview t={t} />
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'white', marginBottom: '2px' }}>{t.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '8.5px', color: '#4a5568' }}>{t.category}</span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: DEFAULT_COLORS[t.id].accent, display: 'inline-block' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CUSTOMIZE ── */}
        {activeSection === 'customize' && (
          <div style={{ animation: 'fadeIn .25s ease', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Colors */}
            <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>🎨 Colors</div>
              {[
                { key: 'accent', label: 'Accent Color' },
                { key: 'bg', label: 'Page Background' },
                { key: 'text', label: 'Text Color' },
                { key: 'sidebar', label: 'Sidebar / Banner' },
              ].map(({ key, label }) => (
                <div key={key} style={{ marginBottom: '16px' }}>
                  {lbl(label)}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="clr-wrap" style={{ background: colors[key] }}>
                      <input type="color" value={colors[key]} onChange={e => setColors(c => ({ ...c, [key]: e.target.value }))} />
                    </div>
                    <input value={colors[key]} onChange={e => setColors(c => ({ ...c, [key]: e.target.value }))}
                      style={{ flex: 1, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '12px', fontFamily: "'JetBrains Mono',monospace", outline: 'none' }} />
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '20px' }}>
                {lbl('Color Presets')}
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                  {[
                    { name: 'Ocean', accent: '#0284c7', bg: '#f0f9ff', text: '#0c1a2e', sidebar: '#bae6fd' },
                    { name: 'Forest', accent: '#15803d', bg: '#f0fdf4', text: '#14532d', sidebar: '#bbf7d0' },
                    { name: 'Royal', accent: '#7c3aed', bg: '#faf5ff', text: '#3b0764', sidebar: '#e9d5ff' },
                    { name: 'Crimson', accent: '#dc2626', bg: '#fff', text: '#1c1917', sidebar: '#fce7f3' },
                    { name: 'Gold', accent: '#d97706', bg: '#fffbeb', text: '#1c1917', sidebar: '#fef3c7' },
                    { name: 'Night', accent: '#818cf8', bg: '#0f0f1a', text: '#e2e8f0', sidebar: '#1e1e2e' },
                    { name: 'Slate', accent: '#475569', bg: '#f8fafc', text: '#0f172a', sidebar: '#e2e8f0' },
                    { name: 'Rose', accent: '#e11d48', bg: '#fff1f2', text: '#1c1917', sidebar: '#ffe4e6' },
                  ].map(p => (
                    <button key={p.name} onClick={() => setColors({ accent: p.accent, bg: p.bg, text: p.text, sidebar: p.sidebar })}
                      style={{ padding: '5px 11px', borderRadius: '999px', border: 'none', background: p.accent, color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}
                      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >{p.name}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Font + Spacing + Photo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Font */}
              <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '20px', padding: '22px' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>✏️ Font Style</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {FONTS.map(f => (
                    <button key={f} onClick={() => setFont(f)}
                      style={{ padding: '11px 16px', borderRadius: '10px', border: `1px solid ${font === f ? 'rgba(245,230,66,.4)' : 'rgba(255,255,255,.08)'}`, background: font === f ? 'rgba(245,230,66,.08)' : 'transparent', color: font === f ? '#F5E642' : '#6b7280', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all .2s', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{FONT_LABELS[f]}</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', opacity: .5 }}>{f}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Spacing */}
              <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '20px', padding: '22px' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px' }}>📐 Page Density</div>
                <div style={{ display: 'flex', gap: '7px' }}>
                  {['compact', 'normal', 'spacious'].map(s => (
                    <button key={s} className={`sp-btn${spacing === s ? ' on' : ''}`} onClick={() => setSpacing(s)}>{s}</button>
                  ))}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '9px', color: '#4a5568', marginTop: '10px' }}>
                  {spacing === 'compact' ? '↔ More content fits on one page' : spacing === 'spacious' ? '↕ Airy and premium feel' : '◈ Recommended for most resumes'}
                </div>
              </div>

              {/* Photo */}
              <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '20px', padding: '22px' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>📷 Profile Photo</div>
                <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                {photo ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img src={photo} alt="preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(245,230,66,.5)' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Photo added ✓</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => photoRef.current.click()} style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid rgba(255,255,255,.1)', background: 'transparent', color: '#aaa', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>Change</button>
                        <button onClick={() => setPhoto(null)} style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid rgba(239,68,68,.3)', background: 'transparent', color: '#ef4444', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => photoRef.current.click()}
                    style={{ width: '100%', padding: '20px', borderRadius: '12px', border: '1.5px dashed rgba(255,255,255,.1)', background: 'transparent', color: '#4a5568', cursor: 'pointer', transition: 'all .2s', fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 600, fontSize: '13px' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(245,230,66,.35)'; e.currentTarget.style.color = '#F5E642'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#4a5568'; }}
                  >+ Upload Photo (PNG / JPG)</button>
                )}
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '9px', color: '#2d2d44', marginTop: '10px' }}>Appears in most layouts. Square/circle photos look best.</div>
              </div>
            </div>
          </div>
        )}

        {/* ── CONTENT ── */}
        {activeSection === 'content' && (
          <div style={{ animation: 'fadeIn .25s ease', background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', gap: '7px', marginBottom: '22px', flexWrap: 'wrap' }}>
              {TABS.map((t, i) => <button key={t} className={`tb${tab === i ? ' on' : ''}`} onClick={() => setTab(i)}>{t}</button>)}
            </div>

            <div style={{ animation: 'fadeIn .2s ease' }}>

              {/* PERSONAL */}
              {tab === 0 && <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  <div>{lbl('Full Name')}{inp(data.name, v => upd('name', v), 'e.g. Rahul Sharma')}</div>
                  <div>{lbl('Job Title')}{inp(data.role, v => upd('role', v), 'e.g. Software Engineer')}</div>
                  <div>{lbl('Email Address')}{inp(data.email, v => upd('email', v), 'e.g. rahul@gmail.com')}</div>
                  <div>{lbl('Phone Number')}{inp(data.phone, v => upd('phone', v), 'e.g. +91 98765 43210')}</div>
                  <div>{lbl('City, State')}{inp(data.location, v => upd('location', v), 'e.g. Bangalore, Karnataka')}</div>
                  <div>{lbl('LinkedIn URL')}{inp(data.linkedin, v => upd('linkedin', v), 'e.g. linkedin.com/in/rahulsharma')}</div>
                  <div style={{ gridColumn: 'span 2' }}>{lbl('Portfolio / Website (optional)')}{inp(data.website, v => upd('website', v), 'e.g. rahulsharma.dev or github.com/rahul')}</div>
                </div>
                <div>{lbl('Professional Summary (2-3 sentences about yourself)')}{inp(data.summary, v => upd('summary', v), 'e.g. Frontend developer with 3 years of experience building React apps. Passionate about clean UI and performance optimization. Looking for a senior role where I can lead a team.', true)}</div>
              </div>}

              {/* EXPERIENCE */}
              {tab === 1 && <div>
                {data.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: '22px', paddingBottom: '22px', borderBottom: i < data.experience.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '9px', color: '#F5E642', opacity: .6, marginBottom: '12px' }}>Work Experience {i + 1}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                      <div>{lbl('Job Title')}{inp(exp.title, v => updExp(i, 'title', v), 'e.g. Frontend Developer')}</div>
                      <div>{lbl('Company Name')}{inp(exp.company, v => updExp(i, 'company', v), 'e.g. Infosys, TCS, Startup XYZ')}</div>
                      <div style={{ gridColumn: 'span 2' }}>{lbl('Duration')}{inp(exp.duration, v => updExp(i, 'duration', v), 'e.g. Jun 2022 - Present  or  Jan 2021 - May 2022')}</div>
                    </div>
                    {lbl('Key Achievements / Responsibilities (use action verbs)')}
                    {exp.points.map((pt, j) => (
                      <input key={j} value={pt} onChange={e => updEPt(i, j, e.target.value)}
                        placeholder={j === 0 ? 'e.g. Built a React dashboard that reduced report time by 40%' : j === 1 ? 'e.g. Led a team of 3 developers and shipped 5 features on time' : 'e.g. Improved page load speed by 60% using lazy loading'}
                        style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', borderRadius: '10px', padding: '10px 13px', color: 'white', fontSize: '13px', fontFamily: "'Cabinet Grotesk',sans-serif", outline: 'none', marginBottom: '8px', transition: 'border-color .2s' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(245,230,66,.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.09)'} />
                    ))}
                    <button className="ab" onClick={() => { const e = [...data.experience]; e[i].points.push(''); setData(d => ({ ...d, experience: e })); }}>+ Add Point</button>
                  </div>
                ))}
                <button className="ab" onClick={addExp}>+ Add Another Job</button>
              </div>}

              {/* EDUCATION */}
              {tab === 2 && <div>
                {data.education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: i < data.education.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '9px', color: '#F5E642', opacity: .6, marginBottom: '12px' }}>Education {i + 1}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                      <div style={{ gridColumn: 'span 2' }}>{lbl('Degree / Course')}{inp(edu.degree, v => updEdu(i, 'degree', v), 'e.g. B.Tech in Computer Science  or  MBA in Marketing')}</div>
                      <div>{lbl('College / University')}{inp(edu.school, v => updEdu(i, 'school', v), 'e.g. IIT Delhi, VIT, Pune University')}</div>
                      <div>{lbl('Year of Graduation')}{inp(edu.year, v => updEdu(i, 'year', v), 'e.g. 2023  or  2020 - 2024')}</div>
                    </div>
                  </div>
                ))}
                <button className="ab" onClick={addEdu}>+ Add Another Degree</button>
              </div>}

              {/* SKILLS */}
              {tab === 3 && <div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '9px', color: '#4a5568', marginBottom: '14px' }}>Add each skill separately — they appear as badge/pill in the PDF</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  {data.skills.map((sk, i) => (
                    <div key={i}>{inp(sk, v => updSk(i, v),
                      i === 0 ? 'e.g. React.js' :
                      i === 1 ? 'e.g. Node.js' :
                      i === 2 ? 'e.g. Python' :
                      i === 3 ? 'e.g. SQL / MongoDB' :
                      i === 4 ? 'e.g. Figma / UI Design' :
                      i === 5 ? 'e.g. Git / GitHub' :
                      'e.g. another skill...'
                    )}</div>
                  ))}
                </div>
                <button className="ab" onClick={addSk}>+ Add Skill</button>
              </div>}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '16px', fontFamily: "'JetBrains Mono',monospace", fontSize: '9px', color: '#1a1a28', letterSpacing: '.08em' }}>
          💡 Pick template → Customize colors → Add content → Download PDF
        </div>
      </div>
    </main>
  );
}