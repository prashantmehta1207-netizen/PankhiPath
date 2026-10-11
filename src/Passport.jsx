import { useMemo, useState } from 'react';
import {
  Activity, ArrowRight, Award, Bird, CalendarDays, CheckCircle2, Compass,
  Download, Footprints, Leaf, LockKeyhole, MapPinned, Medal, Sparkles, Target, Trophy
} from 'lucide-react';
import './passport.css';

function safeCountPrefix(prefix) {
  try {
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(Boolean);
    return keys.filter((key) => key.startsWith(prefix) && localStorage.getItem(key) === 'true').length;
  } catch {
    return 0;
  }
}

function localDayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getStreak(sightings) {
  const days = new Set(sightings.map((sighting) => localDayKey(new Date(sighting.date))));
  if (!days.size) return 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!days.has(localDayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(localDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function Passport({ language = 'en', sightings = [], onNavigate, onExport }) {
  const gu = language === 'gu';
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const uniqueBirds = useMemo(() => new Set(sightings.map((sighting) => sighting.birdId || sighting.scientific || sighting.name)).size, [sightings]);
  const streak = useMemo(() => getStreak(sightings), [sightings]);
  const challengeCount = useMemo(() => safeCountPrefix('pankhipath-challenge-'), []);
  const parkCount = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('pankhipath-favorite-places') || '[]').length; } catch { return 0; }
  }, []);
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setHours(0, 0, 0, 0);
      day.setDate(today.getDate() - (6 - index));
      const key = localDayKey(day);
      const count = sightings.filter((sighting) => localDayKey(new Date(sighting.date)) === key).length;
      return { key, label: day.toLocaleDateString(gu ? 'gu-IN' : 'en-IN', { weekday: 'short' }), count, isToday: index === 6 };
    });
  }, [sightings, gu]);
  const maxCount = Math.max(1, ...days.map((day) => day.count));
  const achievements = [
    { id: 'first', title: gu ? 'પહેલી શોધ' : 'First discovery', detail: gu ? 'પહેલી નોંધ સાચવો' : 'Save your first sighting', done: sightings.length >= 1, icon: Bird, progress: Math.min(sightings.length, 1), target: 1 },
    { id: 'collector', title: gu ? 'પક્ષી સંગ્રહક' : 'Bird collector', detail: gu ? '3 અલગ જાતિ નોંધો' : 'Record 3 different species', done: uniqueBirds >= 3, icon: Medal, progress: Math.min(uniqueBirds, 3), target: 3 },
    { id: 'journal', title: gu ? 'પ્રકૃતિ લેખક' : 'Field journaler', detail: gu ? '5 નોંધો સાચવો' : 'Save 5 field notes', done: sightings.length >= 5, icon: CalendarDays, progress: Math.min(sightings.length, 5), target: 5 },
    { id: 'explorer', title: gu ? 'લીલી શોધખોળ' : 'Green explorer', detail: gu ? 'મનપસંદ પાર્ક સાચવો' : 'Save a favourite green space', done: parkCount >= 1, icon: MapPinned, progress: Math.min(parkCount, 1), target: 1 },
    { id: 'challenge', title: gu ? 'પ્રકૃતિ પડકાર' : 'Nature challenger', detail: gu ? 'એક દૈનિક પડકાર પૂર્ણ કરો' : 'Complete a daily nature mission', done: challengeCount >= 1, icon: Target, progress: Math.min(challengeCount, 1), target: 1 },
    { id: 'regular', title: gu ? 'નિયમિત નિરીક્ષક' : 'Regular observer', detail: gu ? '10 નોંધો સાચવો' : 'Save 10 field notes', done: sightings.length >= 10, icon: Trophy, progress: Math.min(sightings.length, 10), target: 10 },
  ];
  const earned = achievements.filter((item) => item.done).length;

  const quickActions = [
    { id: 'identify', icon: Bird, title: gu ? 'પક્ષી ઓળખો' : 'Identify a bird', copy: gu ? 'અવાજથી નવી શોધ કરો' : 'Turn a birdsong into a discovery' },
    { id: 'nearby', icon: MapPinned, title: gu ? 'નજીકનાં પાર્ક' : 'Nearby green spaces', copy: gu ? 'તમારી આસપાસ બહાર જવાની જગ્યા શોધો' : 'Find a place to step outside' },
    { id: 'guide', icon: Compass, title: gu ? 'પક્ષી માર્ગદર્શિકા' : 'Bird guide', copy: gu ? 'સામાન્ય પક્ષીઓને ઓળખતા શીખો' : 'Learn the birds around you' },
  ];

  return (
    <section className="workspace wrap passport-view">
      <div className="passport-hero">
        <div className="passport-hero-copy">
          <span className="eyebrow"><Sparkles size={13} /> {gu ? 'તમારી પ્રકૃતિની સફર' : 'YOUR NATURE JOURNEY'}</span>
          <h1>{gu ? 'પ્રકૃતિ પાસપોર્ટ' : 'Nature Passport'}<span>.</span></h1>
          <p>{gu ? 'દરેક નોંધ એક નાની શોધ છે. પ્રગતિ જુઓ, નવી સિદ્ધિઓ મેળવો અને વધુ સમય બહાર વિતાવો.' : 'Every field note is a small discovery. Track your progress, earn new milestones, and make more room for the outdoors.'}</p>
          <div className="passport-hero-actions">
            <button className="button button-primary" onClick={() => onNavigate('identify')}><Bird size={16} />{gu ? 'નવી શોધ શરૂ કરો' : 'Start a discovery'}<ArrowRight size={15} /></button>
            <button className="button passport-export-btn" onClick={() => onExport('csv')}><Download size={15} />{gu ? 'જર્નલ એક્સપોર્ટ' : 'Export journal'}</button>
          </div>
        </div>
        <div className="passport-emblem" aria-hidden="true"><div className="passport-emblem-orbit orbit-a"/><div className="passport-emblem-orbit orbit-b"/><div className="passport-emblem-core"><Bird size={43}/></div><span className="emblem-leaf leaf-a"><Leaf size={18}/></span><span className="emblem-leaf leaf-b"><Leaf size={14}/></span><span className="emblem-caption">TOUCH GRASS · NOTICE MORE</span></div>
      </div>

      <div className="passport-stats-grid">
        <article className="passport-stat-card stat-primary"><span className="passport-stat-icon"><Bird size={18}/></span><small>{gu ? 'કુલ નોંધો' : 'Total sightings'}</small><strong>{sightings.length}</strong><span className="stat-context">{gu ? 'તમારા જર્નલમાં' : 'in your field journal'}</span></article>
        <article className="passport-stat-card"><span className="passport-stat-icon"><Leaf size={18}/></span><small>{gu ? 'અલગ પક્ષીઓ' : 'Unique birds'}</small><strong>{uniqueBirds}</strong><span className="stat-context">{gu ? 'અલગ ઓળખ' : 'different species logged'}</span></article>
        <article className="passport-stat-card"><span className="passport-stat-icon"><Activity size={18}/></span><small>{gu ? 'હાલની streak' : 'Current streak'}</small><strong>{streak}<em>{gu ? ' દિવસ' : streak === 1 ? ' day' : ' days'}</em></strong><span className="stat-context">{gu ? 'સળંગ નિરીક્ષણના દિવસો' : 'consecutive days with a sighting'}</span></article>
        <article className="passport-stat-card"><span className="passport-stat-icon"><MapPinned size={18}/></span><small>{gu ? 'સાચવેલાં સ્થળો' : 'Saved green spaces'}</small><strong>{parkCount}</strong><span className="stat-context">{gu ? 'આગામી વોક માટે' : 'ready for your next walk'}</span></article>
      </div>

      <div className="passport-content-grid">
        <section className="passport-panel activity-panel">
          <div className="passport-panel-heading"><div><span className="eyebrow">{gu ? 'છેલ્લા 7 દિવસ' : 'LAST 7 DAYS'}</span><h2>{gu ? 'તમારી બહારની સફર' : 'Your field activity'}</h2><p>{gu ? 'દરરોજની સાચવેલી નોંધો પરથી બનેલું ચાર્ટ.' : 'Based on sightings you actually saved in this browser.'}</p></div><span className="panel-heading-icon"><Activity size={19}/></span></div>
          <div className="activity-chart" role="img" aria-label={gu ? 'છેલ્લા સાત દિવસની નોંધો' : 'Sightings saved over the last seven days'}>
            {days.map((day) => <div className={`activity-day ${day.isToday ? 'today' : ''}`} key={day.key}><div className="activity-bar-track"><span className="activity-bar-value">{day.count > 0 ? day.count : ''}</span><div className="activity-bar" style={{ height: `${day.count ? Math.max(15, (day.count / maxCount) * 100) : 5}%` }}/></div><small>{day.label}</small></div>)}
          </div>
          <div className="activity-chart-foot"><span><span className="activity-legend-dot"/>{gu ? 'સાચવેલી નોંધો' : 'Saved sightings'}</span><strong>{days.reduce((total, day) => total + day.count, 0)} <small>{gu ? 'છેલ્લા 7 દિવસમાં' : 'this week'}</small></strong></div>
        </section>

        <section className="passport-panel achievement-panel">
          <div className="passport-panel-heading"><div><span className="eyebrow">{gu ? 'સિદ્ધિઓ' : 'MILESTONES'}</span><h2>{gu ? 'પ્રકૃતિ બેજ' : 'Nature badges'}</h2><p>{gu ? 'સાચી પ્રવૃત્તિથી unlock કરો.' : 'Unlocked through real activity, not sample data.'}</p></div><span className="achievement-total"><Award size={15}/>{earned}/{achievements.length}</span></div>
          <div className="achievement-progress"><span style={{ width: `${(earned / achievements.length) * 100}%` }}/></div>
          <div className="achievement-list">{achievements.slice(0, showAllAchievements ? achievements.length : 4).map((item) => { const Icon = item.icon; return <article className={`achievement-item ${item.done ? 'is-earned' : ''}`} key={item.id}><span className="achievement-icon"><Icon size={17}/></span><div className="achievement-copy"><strong>{item.title}</strong><small>{item.detail}</small><div className="achievement-mini-progress"><span style={{ width: `${(item.progress / item.target) * 100}%` }}/></div></div><span className="achievement-status" title={item.done ? (gu ? 'મેળવ્યું' : 'Earned') : (gu ? 'હજુ બાકી' : 'In progress')}>{item.done ? <CheckCircle2 size={17}/> : `${item.progress}/${item.target}`}</span></article>; })}</div>
          <button className="passport-link-btn" onClick={() => setShowAllAchievements((value) => !value)}>{showAllAchievements ? (gu ? 'ઓછું બતાવો' : 'Show less') : (gu ? 'બધી સિદ્ધિઓ જુઓ' : 'View all milestones')}<ArrowRight size={14}/></button>
        </section>
      </div>

      <section className="passport-quick-actions">
        <div className="passport-quick-heading"><div><span className="eyebrow">{gu ? 'આગળ શું?' : 'WHAT’S NEXT'}</span><h2>{gu ? 'તમારી આગળની નાની શોધ' : 'Your next small discovery'}</h2></div><span className="screen-reminder"><LockKeyhole size={14}/>{gu ? 'નોંધો આ ડિવાઇસમાં રહે છે' : 'Your notes stay on this device'}</span></div>
        <div className="passport-action-grid">{quickActions.map((action) => { const Icon = action.icon; return <button className="passport-action-card" key={action.id} onClick={() => onNavigate(action.id)}><span className="passport-action-icon"><Icon size={20}/></span><span className="passport-action-copy"><strong>{action.title}</strong><small>{action.copy}</small></span><ArrowRight size={17}/></button>; })}</div>
      </section>
      <p className="passport-footnote"><Footprints size={14}/>{gu ? 'આ સ્કોર ફક્ત આ બ્રાઉઝરમાં સાચવેલી નોંધો અને પડકારો પરથી ગણાય છે. બહારની પ્રવૃત્તિનું આપમેળે ટ્રેકિંગ થતું નથી.' : 'Progress is calculated from notes and challenges saved in this browser. Outdoor activity is not tracked automatically.'}</p>
    </section>
  );
}
