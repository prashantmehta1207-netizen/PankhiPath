import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, Bird, CheckCircle2, CircleStop, Clock3, Compass, Footprints,
  Headphones, Leaf, MapPinned, Pause, Play, Route, RotateCcw, ShieldCheck,
  Sparkles, Timer, Trees, Waves
} from 'lucide-react';
import './walkplanner.css';

const MISSIONS = [
  { id: 'listen', icon: Waves, en: 'Listen for bird calls', gu: 'પક્ષીઓના અવાજ ધ્યાનથી સાંભળો', detailEn: 'Stand still for a moment. Notice how many different calls you can hear.', detailGu: 'થોડી વાર શાંત રહો અને અલગ અલગ કેટલા અવાજ સંભળાય છે તે ધ્યાનથી સાંભળો.' },
  { id: 'canopy', icon: Bird, en: 'Scan the trees', gu: 'ઝાડની ડાળીઓ જુઓ', detailEn: 'Look slowly through the branches without chasing or disturbing wildlife.', detailGu: 'ડાળીઓ પર નજર ફેરવો, પણ પક્ષીઓને ડરાવશો કે તેમની પાછળ દોડશો નહીં.' },
  { id: 'colours', icon: Leaf, en: 'Find three natural colours', gu: 'કુદરતના ત્રણ રંગ શોધો', detailEn: 'Notice three shades of green, brown, yellow, or another colour in nature.', detailGu: 'કુદરતમાં લીલો, ભૂરો, પીળો કે બીજા ત્રણ રંગો શોધો.' },
  { id: 'journal', icon: Compass, en: 'Remember one discovery', gu: 'એક નવી શોધ યાદ રાખો', detailEn: 'At the end, note one bird, sound, plant, or detail you had not noticed before.', detailGu: 'અંતે એક પક્ષી, અવાજ, છોડ કે એવી વાત લખો જે પહેલાં ધ્યાનમાં નહોતી આવી.' },
];

const WARMUP = {
  en: { title: 'Arrive & settle', detail: 'Choose a safe spot, look around, and let your eyes adjust.' },
  gu: { title: 'સ્થિર થાઓ', detail: 'સુરક્ષિત જગ્યા પસંદ કરો, આસપાસ જુઓ અને ધીમે ધીમે ધ્યાન કેન્દ્રિત કરો.' }
};
const WRAPUP = {
  en: { title: 'Reflect, then return', detail: 'Write down one thing you noticed. Keep a respectful distance from wildlife.' },
  gu: { title: 'નોંધ કરો અને પાછા ફરો', detail: 'તમે જોયેલી એક વાત લખો અને જંગલી જીવોથી યોગ્ય અંતર રાખો.' }
};

function loadWalkHistory() {
  try { const parsed = JSON.parse(localStorage.getItem('pankhipath-walk-sessions') || '[]'); return Array.isArray(parsed) ? parsed : []; }
  catch { return []; }
}

export default function WalkPlanner({ language = 'en', onNearby, onPhoto }) {
  const gu = language === 'gu';
  const [duration, setDuration] = useState(20);
  const [selected, setSelected] = useState(['listen', 'canopy', 'journal']);
  const [plan, setPlan] = useState(null);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [complete, setComplete] = useState(false);
  const [completedMinutes, setCompletedMinutes] = useState(0);
  const [sessionCount, setSessionCount] = useState(() => loadWalkHistory().length);
  const finalizedRef = useRef(false);
  const totalSecondsRef = useRef(0);

  const labels = useMemo(() => gu ? {
    eyebrow: 'તમારી બહારની સફર', title: 'એક નાની સફર બનાવો.', subtitle: 'સમય પસંદ કરો, કુદરતનાં મિશન પસંદ કરો અને પછી ફોન બાજુ પર મૂકી દો.',
    duration: 'તમારી પાસે કેટલો સમય છે?', missions: 'આજનાં મિશન પસંદ કરો', build: 'મારી વોક બનાવો', nearby: 'નજીકનાં બગીચા જુઓ', photo: 'ફોટાથી પક્ષી ઓળખો', plan: 'તમારી સફરનો પ્લાન', start: 'Phone-Down Mode શરૂ કરો', minutes: 'મિનિટ', first: 'શરૂઆત', last: 'અંતિમ નોંધ',
    underway: 'હવે પ્રકૃતિ સાથે રહો.', putDown: 'ફોનને સુરક્ષિત રીતે ખિસ્સામાં મૂકો. અહીંનો ટાઈમર માત્ર યાદ અપાવવા માટે છે—આ એપ ફોનને લૉક કરતી નથી.', pause: 'વિરામ', resume: 'ફરી શરૂ કરો', finish: 'સેશન પૂરું કરો', remaining: 'બાકી સમય', sessionLength: 'સેશન સમય', done: 'સરસ કર્યું! તમે બહાર સમય પસાર કર્યો.', saved: 'આ સેશન તમારા ડિવાઇસ પર સાચવાયું.', again: 'બીજી સફર બનાવો', planner: 'પ્લાન પર પાછા જાઓ', sessions: 'પૂર્ણ કરેલી સફરો', safety: 'સુરક્ષા પહેલાં', safetyText: 'રસ્તો પાર કરતી વખતે અથવા ચાલતી વખતે સ્ક્રીન ન જુઓ. જાહેર રસ્તા અને હવામાન માટે સાવચેત રહો.', chooseOne: 'ઓછામાં ઓછું એક મિશન પસંદ કરો.',
  } : {
    eyebrow: 'YOUR NEXT OUTDOOR ADVENTURE', title: 'Plan a little nature break.', subtitle: 'Pick your time, choose a few simple missions, then put the phone away and explore.',
    duration: 'How much time do you have?', missions: 'Choose your nature missions', build: 'Build my walk', nearby: 'Find nearby gardens', photo: 'Identify from a photo', plan: 'Your walk plan', start: 'Start Phone-Down Mode', minutes: 'min', first: 'Start here', last: 'Wrap up',
    underway: 'Be here, not on your screen.', putDown: 'Put your phone away somewhere safe. The timer is only a gentle reminder—this app does not lock your phone.', pause: 'Pause', resume: 'Resume', finish: 'Finish session', remaining: 'Time left', sessionLength: 'Session length', done: 'Lovely work. You made time for the outdoors.', saved: 'This session was saved on this device.', again: 'Plan another walk', planner: 'Back to planner', sessions: 'Completed walks', safety: 'Safety first', safetyText: 'Do not look at the screen while walking or crossing roads. Stay aware of traffic, weather, and your surroundings.', chooseOne: 'Choose at least one mission.',
  }, [gu]);

  useEffect(() => {
    if (!running || paused) return undefined;
    const timer = window.setInterval(() => setSecondsLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, paused]);

  useEffect(() => {
    if (running && secondsLeft === 0 && !finalizedRef.current) finishSession();
    // Intentionally only react when the countdown reaches zero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, running]);

  const selectedMissions = MISSIONS.filter((mission) => selected.includes(mission.id));
  let consumedSeconds = 0;
  const currentActivity = (plan || []).find((activity) => {
    consumedSeconds += activity.minutes * 60;
    return Math.max(0, totalSecondsRef.current - secondsLeft) < consumedSeconds;
  }) || (plan || []).at(-1);

  function buildPlan() {
    if (!selectedMissions.length) return;
    const introMinutes = Math.max(2, Math.round(duration * 0.1));
    const outroMinutes = Math.max(2, Math.round(duration * 0.1));
    const missionBudget = Math.max(selectedMissions.length, duration - introMinutes - outroMinutes);
    const base = Math.floor(missionBudget / selectedMissions.length);
    let remainder = missionBudget - base * selectedMissions.length;
    const activities = selectedMissions.map((mission) => {
      const minutes = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;
      return { id: mission.id, minutes, title: gu ? mission.gu : mission.en, detail: gu ? mission.detailGu : mission.detailEn, Icon: mission.icon };
    });
    setPlan([
      { id: 'warmup', minutes: introMinutes, title: gu ? WARMUP.gu.title : WARMUP.en.title, detail: gu ? WARMUP.gu.detail : WARMUP.en.detail, Icon: Trees },
      ...activities,
      { id: 'wrapup', minutes: outroMinutes, title: gu ? WRAPUP.gu.title : WRAPUP.en.title, detail: gu ? WRAPUP.gu.detail : WRAPUP.en.detail, Icon: CheckCircle2 },
    ]);
    setComplete(false);
  }

  function startSession() {
    if (!plan) buildPlan();
    finalizedRef.current = false;
    const total = duration * 60;
    totalSecondsRef.current = total;
    setSecondsLeft(total);
    setComplete(false);
    setPaused(false);
    setRunning(true);
  }

  function finishSession() {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    const elapsedSeconds = Math.max(0, totalSecondsRef.current - secondsLeft);
    const minutes = elapsedSeconds > 0 ? Math.max(1, Math.round(elapsedSeconds / 60)) : 0;
    const entry = { id: `${Date.now()}`, date: new Date().toISOString(), durationMinutes: minutes, missions: selected.slice() };
    const history = loadWalkHistory();
    const next = [...history, entry].slice(-100);
    try { localStorage.setItem('pankhipath-walk-sessions', JSON.stringify(next)); } catch { /* local storage may be unavailable */ }
    setSessionCount(next.length);
    setCompletedMinutes(minutes);
    setRunning(false);
    setPaused(false);
    setComplete(true);
  }

  function resetPlanner() {
    finalizedRef.current = false;
    setRunning(false); setPaused(false); setSecondsLeft(0); setComplete(false); setPlan(null);
  }

  const time = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;
  const progress = totalSecondsRef.current ? Math.min(100, ((totalSecondsRef.current - secondsLeft) / totalSecondsRef.current) * 100) : 0;

  if (running) {
    return <section className="workspace wrap walk-planner-view">
      <div className="phone-down-screen">
        <div className="phone-down-top"><span className="walk-brand-mark"><Leaf size={20}/></span><span>PankhiPath / {gu ? 'પ્રકૃતિ વિરામ' : 'Nature pause'}</span></div>
        <div className="phone-down-orbit"><div className="phone-down-orbit-inner"><Footprints size={37}/></div></div>
        <span className="eyebrow">{gu ? 'PHONE-DOWN MODE' : 'PHONE-DOWN MODE'}</span>
        <h1>{labels.underway}</h1>
        <p className="phone-down-subtitle">{labels.putDown}</p>
        <div className="walk-timer-value" aria-live="polite">{time}</div>
        <div className="walk-progress-track"><span style={{ width: `${progress}%` }}/></div>
        <div className="walk-timer-meta"><span>{labels.sessionLength}</span><strong>{duration} {labels.minutes}</strong></div>
        <div className="phone-down-mission"><span>{gu ? 'હમણાં ધ્યાન આપો' : 'YOUR CURRENT INTENTION'}</span><strong>{currentActivity?.title || (gu ? 'આસપાસ જુઓ' : 'Notice what is around you')}</strong><p>{currentActivity?.detail || (gu ? 'ધીમે શ્વાસ લો. સાંભળો. સ્ક્રીનથી દૂર રહો.' : 'Breathe slowly. Listen carefully. Let the screen be the least interesting thing here.')}</p></div>
        <div className="phone-down-controls">
          <button className="button button-secondary" onClick={() => setPaused((current) => !current)}>{paused ? <Play size={16}/> : <Pause size={16}/>} {paused ? labels.resume : labels.pause}</button>
          <button className="button button-primary" onClick={finishSession}><CircleStop size={16}/>{labels.finish}</button>
        </div>
        <div className="walk-safety-note"><ShieldCheck size={16}/><span>{labels.safetyText}</span></div>
      </div>
    </section>;
  }

  if (complete) {
    return <section className="workspace wrap walk-planner-view">
      <div className="walk-complete-card"><div className="walk-complete-icon"><CheckCircle2 size={35}/></div><span className="eyebrow">{gu ? 'સફર નોંધાઈ' : 'WALK SESSION SAVED'}</span><h1>{labels.done}</h1><p>{labels.saved}</p><div className="walk-complete-stats"><div><strong>{completedMinutes}</strong><span>{gu ? 'મિનિટ બહાર' : 'minutes outdoors'}</span></div><div><strong>{sessionCount}</strong><span>{labels.sessions}</span></div></div><div className="walk-complete-actions"><button className="button button-primary" onClick={resetPlanner}><RotateCcw size={16}/>{labels.again}</button><button className="button button-secondary" onClick={() => { setComplete(false); setPlan(null); }}>{labels.planner}</button></div></div>
    </section>;
  }

  return <section className="workspace wrap walk-planner-view">
    <div className="page-title-row"><div><span className="eyebrow">{labels.eyebrow}</span><h1>{labels.title}</h1><p>{labels.subtitle}</p></div><div className="walk-count-pill"><Footprints size={17}/><span><strong>{sessionCount}</strong><small>{labels.sessions}</small></span></div></div>
    <div className="walk-planner-layout">
      <div className="walk-builder-column">
        <article className="walk-planner-card">
          <div className="walk-card-heading"><span className="walk-card-icon"><Clock3 size={19}/></span><div><h2>{labels.duration}</h2><p>{gu ? 'તમારા દિવસ પ્રમાણે પસંદ કરો.' : 'Make it fit your day.'}</p></div></div>
          <div className="walk-duration-options">{[15, 20, 30, 45, 60].map((mins) => <button key={mins} className={duration === mins ? 'selected' : ''} onClick={() => { setDuration(mins); setPlan(null); }}><strong>{mins}</strong><span>{labels.minutes}</span></button>)}</div>
        </article>
        <article className="walk-planner-card">
          <div className="walk-card-heading"><span className="walk-card-icon"><Sparkles size={19}/></span><div><h2>{labels.missions}</h2><p>{gu ? 'તમારી વોક માટે થોડાં સરળ કામ પસંદ કરો.' : 'Choose the things you would like to notice.'}</p></div></div>
          <div className="walk-mission-options">{MISSIONS.map((mission) => { const Icon = mission.icon; const active = selected.includes(mission.id); return <button key={mission.id} className={`walk-mission-choice ${active ? 'selected' : ''}`} onClick={() => { setSelected((current) => active ? current.filter((id) => id !== mission.id) : [...current, mission.id]); setPlan(null); }} aria-pressed={active}><span className="mission-choice-icon"><Icon size={18}/></span><span className="mission-choice-copy"><strong>{gu ? mission.gu : mission.en}</strong><small>{gu ? mission.detailGu : mission.detailEn}</small></span><span className="mission-check"><CheckCircle2 size={18}/></span></button>; })}</div>
          {!selected.length && <p className="walk-inline-error">{labels.chooseOne}</p>}
          <div className="walk-builder-actions"><button className="button button-primary" onClick={buildPlan} disabled={!selected.length}><Route size={16}/>{labels.build}<ArrowRight size={15}/></button><button className="button button-secondary" onClick={onNearby}><MapPinned size={16}/>{labels.nearby}</button></div>
          <div className="walk-secondary-link-row"><button onClick={onPhoto}><Bird size={15}/>{labels.photo}<ArrowRight size={14}/></button></div>
        </article>
      </div>
      <aside className="walk-preview-column">
        <div className="walk-preview-art"><div className="walk-sun"/><div className="walk-hill walk-hill-back"/><div className="walk-hill walk-hill-front"/><div className="walk-art-bird"><Bird size={45}/></div><span className="walk-art-chip"><Leaf size={13}/> OUTSIDE IS WAITING</span></div>
        <div className="walk-preview-card"><div className="walk-preview-title"><div><span className="eyebrow">{labels.plan}</span><h2>{duration} {gu ? 'મિનિટની સફર' : 'minute walk'}</h2></div><span className="walk-duration-badge"><Timer size={15}/>{duration}m</span></div>
          {!plan ? <div className="walk-preview-empty"><Trees size={28}/><strong>{gu ? 'તમારો પ્લાન અહીં દેખાશે' : 'Your itinerary will appear here'}</strong><p>{gu ? 'મિશન પસંદ કરીને “મારી વોક બનાવો” દબાવો.' : 'Pick your missions and build a walk to see a simple timed itinerary.'}</p></div> : <div className="walk-itinerary">{plan.map((activity, index) => { const Icon = activity.Icon; return <div className="walk-itinerary-row" key={activity.id}><div className="walk-itinerary-rail"><span>{index + 1}</span>{index < plan.length - 1 && <i/>}</div><div className="walk-itinerary-icon"><Icon size={16}/></div><div className="walk-itinerary-copy"><strong>{activity.title}</strong><p>{activity.detail}</p></div><span className="walk-itinerary-minutes">{activity.minutes}m</span></div>; })}</div>}
          <button className="button button-primary walk-start-button" disabled={!selected.length} onClick={startSession}><Footprints size={17}/>{labels.start}<ArrowRight size={15}/></button>
          <div className="walk-privacy-note"><ShieldCheck size={15}/><span>{gu ? 'સેશનની નોંધ આ બ્રાઉઝરમાં જ સાચવાય છે.' : 'Walk session history stays on this browser.'}</span></div>
        </div>
        <div className="walk-safety-card"><ShieldCheck size={18}/><div><strong>{labels.safety}</strong><p>{labels.safetyText}</p></div></div>
      </aside>
    </div>
  </section>;
}
