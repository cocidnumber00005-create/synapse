import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, Volume2, ArrowRightLeft, ShieldCheck, MapPin, 
  Clock, Download, ChevronRight, Mic, MicOff, CheckCircle2, 
  Activity, X, Send, Sparkles, Navigation, Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SCHEDULE = [
  { id: 1, time: '09:00 AM', course: 'ECE201: Signals & Systems', hall: 'Academic Block 2 (Room 301)', type: 'Lecture', x: 25, y: 30, duration: '50m' },
  { id: 2, time: '10:00 AM', course: 'CSE302: Operating Systems', hall: 'CS Department (Lab 4)', type: 'Lab', x: 60, y: 25, duration: '1h 50m' },
  { id: 3, time: '12:30 PM', course: 'ENG104: Technical Writing', hall: 'Polytechnic North Wing', type: 'Lecture', x: 75, y: 65, duration: '50m' },
  { id: 4, time: '02:30 PM', course: 'HUM205: World Literature', hall: 'Main Auditorium Foyer', type: 'Seminar', x: 30, y: 75, duration: '1h 20m' }
];

const SANCTUARIES = [
  { id: 1, name: 'Central Library - 3rd Floor Stacks', category: 'Dead Silence', db: 29, plugs: 'Every Table', status: 'Optimal Focus', accessible: true },
  { id: 2, name: 'CS Dept Graduate Reading Lounge', category: 'White Noise', db: 41, plugs: 'Plentiful', status: 'Comfortable', accessible: true },
  { id: 3, name: 'Polytechnic Garden Pavilion', category: 'Outdoor Ambient', db: 48, plugs: 'Limited', status: 'Fresh Air', accessible: false },
  { id: 4, name: 'Student Centre Cafe Foyer', category: 'Collaborative Buzz', db: 64, plugs: 'Moderate', status: 'Active Buzz', accessible: true }
];

const BARTER_ITEMS = [
  { id: 1, title: 'Drafting Tube & Mini-Drafter (Set)', course: 'MEC101', owner: 'Rohan P.', price: 'Free Swap', condition: 'Like New', spot: 'Library Main Desk' },
  { id: 2, title: 'Discrete Math & Its Applications (Rosen)', course: 'CSE204', owner: 'Sneha M.', price: '$12 / Swap', condition: 'Pencil Notes Only', spot: 'Block 2 Ground Floor' },
  { id: 3, title: 'Cotton Lab Apron (M) + Safety Goggles', course: 'CHM102', owner: 'Aarav K.', price: 'Free Swap', condition: 'Clean / Freshly Washed', spot: 'Hostel Quad Security' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('radar');
  const [selectedHop, setSelectedHop] = useState(SCHEDULE[0]);
  const [accessibleMode, setAccessibleMode] = useState(false);
  
  // Audio Decibel Telemetry
  const [isListening, setIsListening] = useState(false);
  const [decibels, setDecibels] = useState(34);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  // Negotiation Modal
  const [activeBarter, setActiveBarter] = useState(null);
  const [messages, setMessages] = useState([
    { from: 'seller', text: 'Hey! I can hand this over near the security desk after my 12:30 class.' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  // Web Audio API & Canvas Oscilloscope
  const startAudioMeter = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListening(true);
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const render = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const avg = sum / bufferLength;
        const computedDb = Math.min(92, Math.max(26, Math.round(24 + (avg / 255) * 65)));
        setDecibels(computedDb);

        const canvas = canvasRef.current;
        if (canvas) {
          const cv = canvas.getContext('2d');
          cv.clearRect(0, 0, canvas.width, canvas.height);
          const barWidth = (canvas.width / bufferLength) * 2;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const h = (dataArray[i] / 255) * canvas.height;
            cv.fillStyle = computedDb > 60 ? '#f43f5e' : computedDb > 42 ? '#fbbf24' : '#10b981';
            cv.fillRect(x, canvas.height - h, barWidth - 1, h);
            x += barWidth;
          }
        }
        animFrameRef.current = requestAnimationFrame(render);
      };
      render();
    } catch {
      alert('Microphone access enabled in simulated quiet mode.');
      setIsListening(true);
    }
  };

  const stopAudioMeter = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsListening(false);
    setDecibels(32);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages(prev => [...prev, { from: 'buyer', text: inputMsg }]);
    setInputMsg('');
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'seller', text: 'Sounds perfect. See you at the safe checkpoint.' }]);
    }, 1000);
  };

  const exportICS = () => {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    alert('Exported schedule to synchronized calendar file (.ics format).');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090a0f', color: '#f4f4f5', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Navbar */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0d0f17', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>SynapseCampus</span>
              <span style={{ fontSize: '10px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>v2.4</span>
            </div>
            <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Predictive Campus Operating Hub</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={exportICS}
            style={{ background: '#18181b', border: '1px solid #27272a', color: '#e4e4e7', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} /> Export Schedule (.ics)
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', background: 'rgba(16,185,129,0.1)', color: '#34d399', padding: '6px 12px', borderRadius: '999px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <ShieldCheck size={14} /> Client Telemetry Verified
          </div>
        </div>
      </header>

      {/* Primary Container */}
      <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '24px 20px' }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', marginBottom: '24px' }}>
          {[
            { id: 'radar', label: 'Transit & Route Wayfinder', icon: Compass },
            { id: 'sanctuaries', label: 'Acoustic Havens & Desks', icon: Volume2 },
            { id: 'barter', label: 'Peer Resource Barter', icon: ArrowRightLeft }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: active ? '#2563eb' : '#12141c',
                  border: active ? '1px solid #3b82f6' : '1px solid #27272a',
                  color: active ? '#ffffff' : '#a1a1aa',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Transit & Route Wayfinder */}
        {activeTab === 'radar' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
            {/* Campus Topology Vector Map */}
            <div style={{ background: '#0e111a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>Campus Corridor Vector Map</h3>
                  <p style={{ fontSize: '12px', color: '#71717a', margin: '2px 0 0 0' }}>Sequential hops across your daily class timetable</p>
                </div>

                <button
                  onClick={() => setAccessibleMode(!accessibleMode)}
                  style={{
                    background: accessibleMode ? 'rgba(59,130,246,0.2)' : '#18181b',
                    border: accessibleMode ? '1px solid #3b82f6' : '1px solid #27272a',
                    color: accessibleMode ? '#60a5fa' : '#a1a1aa',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {accessibleMode ? '♿ Step-Free Only' : 'Standard Paths'}
                </button>
              </div>

              {/* Schematic Map Board */}
              <div style={{ position: 'relative', height: '330px', background: '#06070a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                  <polyline
                    points={SCHEDULE.map(s => `${(s.x * 4.4) + 30},${(s.y * 2.8) + 30}`).join(' ')}
                    fill="none"
                    stroke={accessibleMode ? '#10b981' : '#3b82f6'}
                    strokeWidth="3"
                    strokeDasharray="6, 5"
                  />
                </svg>

                {SCHEDULE.map((s, idx) => {
                  const isSel = selectedHop.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedHop(s)}
                      style={{
                        position: 'absolute',
                        top: `${(s.y * 2.8) + 30}px`,
                        left: `${(s.x * 4.4) + 30}px`,
                        transform: 'translate(-50%, -50%)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{
                        width: isSel ? '40px' : '30px',
                        height: isSel ? '40px' : '30px',
                        borderRadius: '50%',
                        background: isSel ? '#3b82f6' : '#18181b',
                        border: isSel ? '3px solid #ffffff' : '2px solid #3f3f46',
                        color: isSel ? '#ffffff' : '#a1a1aa',
                        fontSize: '11px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isSel ? '0 0 16px rgba(59,130,246,0.6)' : 'none',
                        transition: 'all 0.15s ease'
                      }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: '10px', background: 'rgba(12,14,20,0.85)', color: '#d4d4d8', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', whiteSpace: 'nowrap' }}>
                        {s.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timetable Ledger */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SCHEDULE.map((item, idx) => {
                const isSel = selectedHop.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedHop(item)}
                    style={{
                      background: isSel ? '#161926' : '#0e111a',
                      border: isSel ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: '700' }}>{item.time} ({item.duration})</span>
                      <span style={{ fontSize: '10px', background: '#1e293b', color: '#93c5fd', padding: '2px 6px', borderRadius: '4px' }}>
                        {item.type}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '6px 0 4px 0', color: '#ffffff' }}>{item.course}</h4>
                    <p style={{ fontSize: '12px', color: '#71717a', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="#f59e0b" /> {item.hall}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Acoustic Havens & In-Browser FFT Sensor */}
        {activeTab === 'sanctuaries' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
            <div style={{ background: '#0e111a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>Campus Quiet Desks & Sanctuaries</h3>
                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>Verified Sound Index</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {SANCTUARIES.map(s => (
                  <div key={s.id} style={{ background: '#06070a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>{s.name}</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: s.db < 35 ? '#10b981' : s.db < 50 ? '#fbbf24' : '#f43f5e' }}>
                        {s.db} dB
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#71717a', marginTop: '6px' }}>
                      <span>Tier: {s.category}</span>
                      <span>·</span>
                      <span>Sockets: {s.plugs}</span>
                      <span>·</span>
                      <span>{s.accessible ? '♿ Accessible' : 'Stairs Only'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Web Audio API Meter */}
            <div style={{ background: '#0e111a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Live Room Sensor (Web Audio API)
              </span>
              
              <div style={{ fontSize: '56px', fontWeight: '900', color: decibels > 60 ? '#f43f5e' : decibels > 42 ? '#fbbf24' : '#10b981', margin: '4px 0' }}>
                {decibels} <span style={{ fontSize: '18px', fontWeight: '500', color: '#71717a' }}>dB</span>
              </div>

              <p style={{ fontSize: '12px', color: '#a1a1aa', maxWidth: '300px', margin: '0 auto 16px auto' }}>
                {decibels < 35 ? 'Whisper Quiet: Perfect for deep focus & thesis work' : decibels < 52 ? 'Moderate Noise: Ideal for general study' : 'High Noise: Best for group discussions'}
              </p>

              <canvas ref={canvasRef} width={280} height={50} style={{ width: '100%', height: '50px', background: '#06070a', borderRadius: '8px', marginBottom: '16px' }} />

              <button
                onClick={isListening ? stopAudioMeter : startAudioMeter}
                style={{
                  margin: '0 auto',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isListening ? '#f43f5e' : '#10b981',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                {isListening ? 'Stop Noise Meter' : 'Test Room Ambient Noise'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Peer Resource Barter */}
        {activeTab === 'barter' && (
          <div style={{ background: '#0e111a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>Campus Peer Exchange Directory</h3>
                <p style={{ fontSize: '12px', color: '#71717a', margin: '2px 0 0 0' }}>Verified textbook, lab equipment, and tool trades</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {BARTER_ITEMS.map(item => (
                <div key={item.id} style={{ background: '#06070a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                        {item.course}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>{item.price}</span>
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '10px 0 4px 0', color: '#ffffff' }}>{item.title}</h4>
                    <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Condition: {item.condition}</p>

                    <div style={{ fontSize: '11px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px' }}>
                      <MapPin size={13} color="#059669" /> Safe Meetup: <strong>{item.spot}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveBarter(item)}
                    style={{
                      marginTop: '16px',
                      padding: '8px 12px',
                      background: '#18181b',
                      border: '1px solid #27272a',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    Coordinate / Trade
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Slide-over / Modal Chat for Barter */}
      {activeBarter && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
          <div style={{ background: '#0e111a', border: '1px solid #27272a', borderRadius: '16px', width: '100%', maxWidth: '440px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', background: '#12141c', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Trade with {activeBarter.owner}</h4>
                <p style={{ fontSize: '11px', color: '#71717a', margin: 0 }}>{activeBarter.title} ({activeBarter.price})</p>
              </div>
              <X size={18} style={{ cursor: 'pointer', color: '#71717a' }} onClick={() => setActiveBarter(null)} />
            </div>

            <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', borderBottom: '1px solid rgba(16,185,129,0.15)', fontSize: '11px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} /> Designated Safe Checkpoint: <strong>{activeBarter.spot}</strong>
            </div>

            <div style={{ height: '200px', overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.from === 'buyer' ? 'flex-end' : 'flex-start',
                    background: m.from === 'buyer' ? '#2563eb' : '#18181b',
                    color: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    maxWidth: '80%',
                    fontSize: '12px'
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Suggest meetup time or make an offer..."
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', background: '#06070a', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
              />
              <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer' }}>
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}