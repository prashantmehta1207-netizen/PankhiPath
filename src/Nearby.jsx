import { useEffect, useMemo, useState } from 'react';
import {
  MapPin, LocateFixed, Trees, Flower2, Compass, Navigation, Heart, Search, Bird,
  RefreshCw, ExternalLink, ShieldCheck, Clock3, Footprints, CheckCircle2,
  Leaf, Sparkles, Map as MapIcon, List, SlidersHorizontal, Info, LoaderCircle
} from 'lucide-react';
import './nearby.css';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

const CHALLENGES = [
  { en: 'Find three different bird calls', gu: 'ત્રણ અલગ અલગ પક્ષીઓના અવાજ સાંભળો', detailEn: 'Pause for two quiet minutes. Notice how each call sounds different.', detailGu: 'બે મિનિટ શાંતિથી રહો અને દરેક પક્ષીનો અવાજ અલગ રીતે સાંભળો.' },
  { en: 'Spot a bird without using your phone', gu: 'ફોન જોયા વગર એક પક્ષી શોધો', detailEn: 'Look at its shape, colour and how it moves before checking a guide.', detailGu: 'માર્ગદર્શિકા ખોલતાં પહેલાં તેનો આકાર, રંગ અને હલનચલન જુઓ.' },
  { en: 'Notice five different leaf shapes', gu: 'પાંદડાના પાંચ અલગ આકાર શોધો', detailEn: 'Look closely at a tree or garden bed and notice the details.', detailGu: 'ઝાડ કે બગીચામાં પાંદડાના અલગ આકાર ધ્યાનથી જુઓ.' },
  { en: 'Spend ten minutes listening outdoors', gu: 'બહાર દસ મિનિટ અવાજો સાંભળો', detailEn: 'Listen for birds, wind, leaves and the other small sounds around you.', detailGu: 'પક્ષીઓ, પવન, પાંદડાં અને આસપાસના નાના અવાજો સાંભળો.' },
  { en: 'Find a shady place and look up', gu: 'છાંયડાવાળી જગ્યા શોધી ઉપર જુઓ', detailEn: 'Observe the tree canopy and see if any birds visit it.', detailGu: 'ઝાડની ડાળીઓ તરફ જુઓ અને કોઈ પક્ષી આવે છે કે નહીં તે નિહાળો.' },
  { en: 'Notice one sign of seasonal change', gu: 'ઋતુ બદલાવની એક નિશાની શોધો', detailEn: 'Look for a new flower, fallen leaves, fruit or birds gathering.', detailGu: 'નવું ફૂલ, ખરેલાં પાંદડાં, ફળ કે ભેગાં થયેલાં પક્ષીઓ જુઓ.' },
  { en: 'Take a slow, screen-free nature walk', gu: 'ફોન વગર ધીમે ધીમે પ્રકૃતિમાં ચાલો', detailEn: 'Walk for five minutes and notice something you usually pass by.', detailGu: 'પાંચ મિનિટ ચાલો અને રોજ નજરમાંથી રહી જતી કોઈ વસ્તુ જુઓ.' }
];

function haversineKm(aLat, aLon, bLat, bLon) {
  const toRad = value => (value * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function formatDistance(km, gu) {
  if (km < 1) return `${Math.round(km * 1000)} ${gu ? 'મીટર' : 'm'}`;
  return `${km.toFixed(1)} ${gu ? 'કિમી' : 'km'}`;
}

function classify(tags = {}) {
  if (tags.leisure === 'garden') return 'garden';
  if (tags.leisure === 'playground') return 'playground';
  if (tags.leisure === 'nature_reserve' || tags.boundary === 'protected_area' || tags.landuse === 'forest' || tags.natural === 'wood') return 'nature';
  return 'park';
}

function labelFor(category, gu) {
  const labels = {
    park: gu ? 'પાર્ક' : 'Park',
    garden: gu ? 'બગીચો' : 'Garden',
    nature: gu ? 'કુદરતી વિસ્તાર' : 'Nature area',
    playground: gu ? 'રમતનું મેદાન' : 'Playground'
  };
  return labels[category] || (gu ? 'બહારની જગ્યા' : 'Outdoor spot');
}

function locationCoords(element) {
  const lat = Number(element.lat ?? element.center?.lat);
  const lon = Number(element.lon ?? element.center?.lon);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
}

async function queryNearby(center, radiusMeters) {
  const query = `
    [out:json][timeout:25];
    (
      nwr(around:${radiusMeters},${center.lat},${center.lon})["leisure"~"^(park|garden|nature_reserve|recreation_ground|playground)$"];
      nwr(around:${radiusMeters},${center.lat},${center.lon})["boundary"="protected_area"];
      nwr(around:${radiusMeters},${center.lat},${center.lon})["landuse"="forest"];
      nwr(around:${radiusMeters},${center.lat},${center.lon})["natural"="wood"];
    );
    out center tags 120;
  `;
  let lastError;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Open map service returned ${response.status}`);
      const data = await response.json();
      const items = (data.elements || []).map(element => {
        const point = locationCoords(element);
        const tags = element.tags || {};
        const name = tags.name || tags['name:en'] || tags['name:gu'] || tags['name:hi'];
        if (!point || !name) return null;
        const category = classify(tags);
        return {
          id: `${element.type}/${element.id}`,
          name,
          lat: point.lat,
          lon: point.lon,
          category,
          leisure: tags.leisure || tags.landuse || tags.natural || tags.boundary || '',
          openingHours: tags.opening_hours || '',
          website: tags.website || tags['contact:website'] || '',
          distanceKm: haversineKm(center.lat, center.lon, point.lat, point.lon)
        };
      }).filter(Boolean);
      const unique = [...new Map(items.map(item => [item.id, item])).values()];
      return unique.sort((a, b) => a.distanceKm - b.distanceKm);
    } catch (error) {
      lastError = error;
    } finally {
      window.clearTimeout(timeout);
    }
  }
  throw lastError || new Error('Could not load nearby places');
}

function getChallenge() {
  const date = new Date();
  const keyDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const dayIndex = Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86400000);
  return { ...CHALLENGES[((dayIndex % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length], keyDate };
}

export default function Nearby({ language = 'en' }) {
  const gu = language === 'gu';
  const challenge = useMemo(() => getChallenge(), []);
  const [center, setCenter] = useState(null);
  const [demoCenter, setDemoCenter] = useState(false);
  const [spots, setSpots] = useState([]);
  const [radius, setRadius] = useState('5000');
  const [appliedRadius, setAppliedRadius] = useState('5000');
  const [filter, setFilter] = useState('all');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingSpots, setLoadingSpots] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pankhipath-favorite-places') || '[]'); } catch { return []; }
  });
  const challengeKey = `pankhipath-challenge-${challenge.keyDate}`;
  const [challengeDone, setChallengeDone] = useState(() => localStorage.getItem(challengeKey) === 'true');
  const [mapMode, setMapMode] = useState('map');

  useEffect(() => {
    try { localStorage.setItem('pankhipath-favorite-places', JSON.stringify(favorites)); } catch { /* Local storage can be disabled by the browser. */ }
  }, [favorites]);

  const filteredSpots = useMemo(() => {
    const selected = spots.filter(spot => {
      if (filter === 'favorites') return favorites.some(favourite => favourite.id === spot.id);
      if (filter === 'all') return true;
      return spot.category === filter;
    });
    return selected.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [spots, filter, favorites]);

  async function loadForCenter(nextCenter, isDemo = false, nextRadius = radius) {
    setCenter(nextCenter);
    setDemoCenter(isDemo);
    setAppliedRadius(String(nextRadius));
    setLoadingSpots(true);
    setError('');
    setHasSearched(true);
    try {
      const data = await queryNearby(nextCenter, Number(nextRadius));
      setSpots(data);
      if (!data.length) setError(gu ? 'આ વિસ્તાર માટે નકશામાં નામવાળી બગીચા/પાર્કની નોંધો મળી નથી. બીજો radius અજમાવો.' : 'No named parks or gardens were found in this map area. Try a wider radius.');
    } catch {
      setSpots([]);
      setError(gu ? 'નજીકનાં સ્થળો લાવી શકાયાં નથી. નેટવર્ક તપાસો અથવા OpenStreetMap ખોલો.' : 'Nearby places could not be loaded. Check your connection or open OpenStreetMap directly.');
    } finally {
      setLoadingSpots(false);
    }
  }

  function findMyLocation() {
    if (!navigator.geolocation) {
      setError(gu ? 'આ બ્રાઉઝરમાં location ઉપલબ્ધ નથી.' : 'Location is not available in this browser.');
      return;
    }
    setLoadingLocation(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      position => {
        const next = { lat: position.coords.latitude, lon: position.coords.longitude };
        setLoadingLocation(false);
        loadForCenter(next, false, radius);
      },
      issue => {
        setLoadingLocation(false);
        const message = issue.code === 1
          ? (gu ? 'Location permission બંધ છે. Browser settings માંથી મંજૂરી આપો અથવા demo area જુઓ.' : 'Location permission was denied. Allow it in browser settings or try the demo area.')
          : (gu ? 'હાલ location મળી શક્યું નથી. ફરી પ્રયાસ કરો અથવા demo area જુઓ.' : 'Could not get your location right now. Try again or use the demo area.');
        setError(message);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
    );
  }

  function toggleFavorite(spot) {
    setFavorites(current => current.some(item => item.id === spot.id)
      ? current.filter(item => item.id !== spot.id)
      : [{ id: spot.id, name: spot.name, lat: spot.lat, lon: spot.lon, category: spot.category }, ...current]);
  }

  function markChallenge() {
    const next = !challengeDone;
    setChallengeDone(next);
    try { localStorage.setItem(challengeKey, String(next)); } catch { /* Optional local progress. */ }
  }

  const radiusLabel = gu ? `${Number(appliedRadius) / 1000} કિમી` : `${Number(appliedRadius) / 1000} km`;
  const mapUrl = center ? (() => {
    const latSpan = (Number(appliedRadius) / 1000 / 111) * 1.5;
    const lonSpan = latSpan / Math.max(0.25, Math.cos(center.lat * Math.PI / 180));
    const bbox = `${center.lon - lonSpan},${center.lat - latSpan},${center.lon + lonSpan},${center.lat + latSpan}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${center.lat}%2C${center.lon}`;
  })() : '';
  const osmUrl = center ? `https://www.openstreetmap.org/#map=14/${center.lat}/${center.lon}` : 'https://www.openstreetmap.org/';

  return (
    <section className="workspace wrap nearby-view">
      <div className="nearby-header page-title-row">
        <div>
          <span className="eyebrow">{gu ? 'તમારી આસપાસ / 02' : 'YOUR OUTDOOR MAP / 02'}</span>
          <h1>{gu ? 'નજીકનાં બગીચા અને પાર્ક' : 'Gardens & parks near you'}</h1>
          <p>{gu ? 'બહાર જવા માટે સુંદર જગ્યા શોધો, પછી ફોન ખિસ્સામાં મૂકી દો.' : 'Find a green space for your next walk, then put your phone away.'}</p>
        </div>
        <div className="nearby-location-status"><span className={center && !demoCenter ? 'status-dot is-live' : 'status-dot'} />{center ? (demoCenter ? (gu ? 'અમદાવાદ ડેમો વિસ્તાર' : 'Ahmedabad demo area') : (gu ? 'તમારા સ્થાન પરથી' : 'Using your location')) : (gu ? 'સ્થાન હજુ પસંદ નથી' : 'Location not selected')}</div>
      </div>

      <div className="nearby-privacy-note"><ShieldCheck size={17} /><span>{gu ? 'તમારી મંજૂરી પછી જ location લેવાશે. નજીકનાં સ્થળો શોધવા માટે coordinates OpenStreetMap ના public service ને મોકલાશે; PankhiPath તેને account માં સાચવતું નથી. રસ્તો જોવા દબાવશો તો પસંદ કરેલો route Google Maps માં ખુલશે.' : 'Your location is requested only when you tap the button. Coordinates are sent to OpenStreetMap’s public service to find nearby places; PankhiPath does not save them to an account. Walking directions open Google Maps with your selected route.'}</span></div>

      <div className="nearby-control-panel">
        <div className="nearby-control-copy"><span className="nearby-control-icon"><LocateFixed size={20} /></span><div><strong>{gu ? 'તમારી નજીક શું છે?' : 'What’s around you?'}</strong><small>{gu ? 'નજીકનાં પાર્ક અને બગીચા શોધવા માટે location વાપરો.' : 'Use your location to discover mapped parks and gardens.'}</small></div></div>
        <div className="nearby-controls">
          <label className="radius-select"><SlidersHorizontal size={15} /><span>{gu ? 'અંતર' : 'Radius'}</span><select aria-label={gu ? 'શોધ વિસ્તાર' : 'Search radius'} value={radius} onChange={event => setRadius(event.target.value)}><option value="2000">{gu ? '2 કિમી' : '2 km'}</option><option value="5000">{gu ? '5 કિમી' : '5 km'}</option><option value="10000">{gu ? '10 કિમી' : '10 km'}</option></select></label>
          <button className="button button-primary" onClick={findMyLocation} disabled={loadingLocation || loadingSpots}>{loadingLocation ? <LoaderCircle className="spin" size={16} /> : <LocateFixed size={16} />}{loadingLocation ? (gu ? 'સ્થાન શોધી રહ્યું છે…' : 'Locating…') : (gu ? 'મારું સ્થાન શોધો' : 'Use my location')}</button>
          <button className="button button-secondary" onClick={() => loadForCenter({ lat: 23.0225, lon: 72.5714 }, true)} disabled={loadingSpots}><Compass size={16} />{gu ? 'અમદાવાદ demo' : 'Try Ahmedabad demo'}</button>
          {center && radius !== appliedRadius && <button className="button button-primary" onClick={() => loadForCenter(center, demoCenter, radius)} disabled={loadingSpots}><Search size={15} />{gu ? 'ફરી શોધો' : 'Update search'}</button>}
          {center && <button className="icon-button nearby-refresh" title={gu ? 'ફરીથી લોડ કરો' : 'Refresh nearby places'} aria-label={gu ? 'ફરીથી લોડ કરો' : 'Refresh nearby places'} onClick={() => loadForCenter(center, demoCenter, radius)} disabled={loadingSpots}><RefreshCw size={16} /></button>}
        </div>
      </div>

      {error && <div className="nearby-alert" role="status"><Info size={17} /><span>{error}</span>{center && <a href={osmUrl} target="_blank" rel="noreferrer">{gu ? 'OpenStreetMap ખોલો' : 'Open OpenStreetMap'} <ExternalLink size={13} /></a>}</div>}

      <div className="nearby-workspace-grid">
        <div className="nearby-results-column">
          <div className="nearby-list-heading"><div><h2>{gu ? 'શોધાયેલાં સ્થળો' : 'Nearby green spaces'}</h2><p>{loadingSpots ? (gu ? 'નકશામાં તપાસી રહ્યું છે…' : 'Searching the map…') : hasSearched ? `${filteredSpots.length} ${gu ? 'સ્થળો' : 'places'} · ${radiusLabel}` : (gu ? 'શરૂ કરવા માટે ઉપરનું બટન દબાવો.' : 'Choose your location to get started.')}</p></div><div className="list-map-toggle"><button className={mapMode === 'list' ? 'active' : ''} onClick={() => setMapMode('list')}><List size={14} />{gu ? 'યાદી' : 'List'}</button><button className={mapMode === 'map' ? 'active' : ''} onClick={() => setMapMode('map')}><MapIcon size={14} />{gu ? 'નકશો' : 'Map'}</button></div></div>

          <div className="nearby-filters" aria-label={gu ? 'સ્થળના પ્રકાર' : 'Place type filters'}>
            {[['all', gu ? 'બધાં' : 'All'], ['park', gu ? 'પાર્ક' : 'Parks'], ['garden', gu ? 'બગીચા' : 'Gardens'], ['nature', gu ? 'કુદરત' : 'Nature'], ['playground', gu ? 'રમતનું મેદાન' : 'Playgrounds'], ['favorites', gu ? 'સાચવેલાં' : 'Saved']].map(([id, label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{id === 'favorites' && <Heart size={12} />}{label}{id === 'favorites' && <span>{favorites.length}</span>}</button>)}
          </div>

          {mapMode === 'map' && center && <div className="nearby-map-frame"><iframe title={gu ? 'તમારા વિસ્તારનો OpenStreetMap' : 'OpenStreetMap of the selected area'} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><a href={osmUrl} className="map-open-link" target="_blank" rel="noreferrer"><ExternalLink size={13} />{gu ? 'મોટો નકશો ખોલો' : 'Open larger map'}</a><span className="map-radius-label"><MapPin size={12} />{radiusLabel}</span></div>}

          {loadingSpots && <div className="nearby-loading"><LoaderCircle className="spin" size={25} /><strong>{gu ? 'નજીકનાં સ્થળો શોધી રહ્યું છે' : 'Finding nearby green spaces'}</strong><span>{gu ? 'OpenStreetMap માંથી ઉપલબ્ધ માહિતી લાવી રહ્યા છીએ.' : 'Loading mapped places from OpenStreetMap.'}</span></div>}

          {!loadingSpots && filteredSpots.length > 0 && <div className="nearby-spot-list">{filteredSpots.map((spot, index) => {
            const saved = favorites.some(item => item.id === spot.id);
            const directions = center ? `https://www.google.com/maps/dir/?api=1&origin=${center.lat},${center.lon}&destination=${spot.lat},${spot.lon}&travelmode=walking` : `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lon}`;
            return <article key={spot.id} className="nearby-spot-card">
              <div className={`nearby-spot-art art-${spot.category}`}><span className="spot-number">{String(index + 1).padStart(2, '0')}</span>{spot.category === 'garden' ? <Flower2 size={25} /> : spot.category === 'nature' ? <Leaf size={25} /> : spot.category === 'playground' ? <Footprints size={25} /> : <Trees size={25} />}</div>
              <div className="nearby-spot-info"><div className="spot-label-row"><span className="spot-type-chip">{labelFor(spot.category, gu)}</span>{spot.openingHours && <span className="spot-hours"><Clock3 size={12} />{spot.openingHours}</span>}</div><h3>{spot.name}</h3><p><MapPin size={13} />~{formatDistance(spot.distanceKm, gu)} · {gu ? 'સીધું અંતર' : 'straight-line distance'}</p><div className="spot-actions"><a className="button button-primary spot-directions" href={directions} target="_blank" rel="noreferrer"><Navigation size={14} />{gu ? 'રસ્તો જુઓ' : 'Get directions'}<ExternalLink size={12} /></a>{spot.website && <a className="spot-website" href={spot.website} target="_blank" rel="noreferrer">{gu ? 'વેબસાઇટ' : 'Website'} <ExternalLink size={12} /></a>}</div></div>
              <button className={`spot-favorite ${saved ? 'is-saved' : ''}`} onClick={() => toggleFavorite(spot)} aria-label={saved ? (gu ? 'સાચવેલામાંથી દૂર કરો' : 'Remove from saved places') : (gu ? 'સ્થળ સાચવો' : 'Save place')} title={saved ? (gu ? 'સાચવ્યું' : 'Saved') : (gu ? 'સ્થળ સાચવો' : 'Save place')}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button>
            </article>;
          })}</div>}

          {!loadingSpots && hasSearched && !filteredSpots.length && !error && <div className="nearby-empty"><Trees size={29} /><h3>{gu ? 'આ ફિલ્ટરમાં સ્થળ મળ્યું નથી' : 'No places in this filter'}</h3><p>{gu ? 'બીજો પ્રકાર પસંદ કરો અથવા વિસ્તાર મોટો કરો.' : 'Try another category or search a wider radius.'}</p></div>}
          {!hasSearched && <div className="nearby-empty"><div className="nearby-empty-icon"><MapPin size={27} /></div><h3>{gu ? 'તમારા વિસ્તારમાં લીલી જગ્યાઓ શોધો' : 'Find your next green escape'}</h3><p>{gu ? 'સ્થાનની મંજૂરી આપો, અથવા પહેલાં અમદાવાદના ડેમો વિસ્તારથી સુવિધા અજમાવો.' : 'Allow location access, or preview the feature with the Ahmedabad demo area.'}</p></div>}
          <p className="osm-attribution">Map and place data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>. {gu ? 'સ્થળો અને ખુલવાના સમયની માહિતીમાં ફેરફાર હોઈ શકે છે.' : 'Place names and opening-hour information may be incomplete or outdated.'}</p>
        </div>

        <aside className="nearby-side-column">
          <article className={`nature-challenge-card ${challengeDone ? 'is-complete' : ''}`}>
            <div className="challenge-topline"><span><Sparkles size={15} />{gu ? 'આજનો પ્રકૃતિ પડકાર' : 'TODAY’S NATURE CHALLENGE'}</span><span className="challenge-day">{gu ? 'દૈનિક' : 'DAILY'}</span></div>
            <div className="challenge-illustration"><div className="challenge-sun" /><div className="challenge-hill hill-a" /><div className="challenge-hill hill-b" /><Trees size={40} /><Bird size={22} className="challenge-bird" /></div>
            <h3>{gu ? challenge.gu : challenge.en}</h3><p>{gu ? challenge.detailGu : challenge.detailEn}</p>
            <button className={`button ${challengeDone ? 'button-secondary' : 'button-primary'} challenge-done-button`} onClick={markChallenge}>{challengeDone ? <CheckCircle2 size={16} /> : <CheckCircle2 size={16} />}{challengeDone ? (gu ? 'આજનો પડકાર પૂર્ણ!' : 'Challenge completed') : (gu ? 'મેં આ કર્યું!' : 'I did this')}</button>
            <span className="challenge-footnote"><Leaf size={13} />{gu ? 'પૂર્ણતા ફક્ત આ બ્રાઉઝરમાં સાચવાય છે.' : 'Completion is saved only in this browser.'}</span>
          </article>

          <article className="nearby-tip-card"><div className="nearby-tip-icon"><ShieldCheck size={19} /></div><div><strong>{gu ? 'પ્રકૃતિ અને પ્રાઇવસી' : 'Nature & privacy'}</strong><p>{gu ? 'સ્થાન માત્ર નજીકનાં સ્થળો શોધવા માટે વપરાય છે. મન થાય ત્યારે location permission બંધ કરી શકો છો.' : 'Location is only used to discover nearby places. You can revoke browser location permission any time.'}</p></div></article>
          <article className="nearby-favorites-card"><div className="favorites-card-heading"><span><Heart size={16} />{gu ? 'સાચવેલાં સ્થળો' : 'Saved places'}</span><strong>{favorites.length}</strong></div>{favorites.length ? <div className="saved-place-list">{favorites.slice(0, 4).map(place => <div key={place.id}><span className="saved-place-dot"><MapPin size={13} /></span><span>{place.name}<small>{labelFor(place.category, gu)}</small></span><a href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`} target="_blank" rel="noreferrer" aria-label={`${gu ? 'નકશો ખોલો' : 'Open map'} ${place.name}`}><ExternalLink size={13} /></a></div>)}</div> : <p className="no-favorites-copy">{gu ? 'હાર્ટ બટન દબાવીને મનપસંદ જગ્યાઓ સાચવો.' : 'Tap the heart on any place to keep it here for your next walk.'}</p>}</article>

          <article className="nearby-mini-guide"><div className="mini-guide-icon"><Footprints size={18} /></div><div><strong>{gu ? 'નાનું સૂચન' : 'A small tip'}</strong><p>{gu ? 'શક્ય હોય તો ગરમી ઓછી હોય ત્યારે જાઓ, પાણી સાથે રાખો અને પક્ષીઓથી સુરક્ષિત અંતર રાખો.' : 'Visit during cooler hours, carry water and observe birds from a respectful distance.'}</p></div></article>
        </aside>
      </div>
    </section>
  );
}

