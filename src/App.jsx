import { useEffect, useRef, useState } from 'react';
import {
  Bird, Leaf, ShieldCheck, MapPin, Mic, Volume2, ArrowRight, ArrowUpRight,
  Menu, X, Sparkles, Waves, Globe2, Clock3, Search, Bookmark, Upload, Check,
  Play, Heart, SlidersHorizontal, Info, FileAudio, WifiOff, LockKeyhole, Trees,
  Compass, CalendarDays, Settings as SettingsIcon, Trash2, History, Headphones,
  CircleStop, Languages, ChevronRight, CheckCircle2, LoaderCircle, MapPinned,
  Feather, Footprints, ListFilter, CircleHelp, Download, ExternalLink, Award, FileText, FileJson, Camera, Route
} from 'lucide-react';
import Nearby from './Nearby.jsx';
import Passport from './Passport.jsx';
import WalkPlanner from './WalkPlanner.jsx';
import PhotoIdentifier from './PhotoIdentifier.jsx';

const BIRDS = [
  {
    id: 'bulbul',
    name: 'Red-vented Bulbul',
    gu: 'લાલપૂંછ બુલબુલ',
    scientific: 'Pycnonotus cafer',
    image: '/assets/bulbul-hero.jpg',
    habitat: 'Gardens · Parks · Urban green spaces',
    habitatGu: 'બગીચા · પાર્ક · શહેરની હરિયાળી',
    fact: 'Its cheerful calls are often heard around gardens and homes.',
    factGu: 'તેનો મીઠો અવાજ બગીચા અને ઘરની આસપાસ વારંવાર સંભળાય છે.',
    category: 'Garden bird',
    categoryGu: 'બગીચાનું પક્ષી',
    color: 'sage'
  },
  {
    id: 'sparrow',
    name: 'House Sparrow',
    gu: 'ઘર ચકલી',
    scientific: 'Passer domesticus',
    image: '/assets/house-sparrow.jpg',
    habitat: 'Homes · Balconies · Streets',
    habitatGu: 'ઘર · બાલ્કની · શેરીઓ',
    fact: 'A familiar neighbour that often looks for seeds near people.',
    factGu: 'આપણી આસપાસ રહેતી ચકલીને દાણા શોધતી જોઈ શકાય છે.',
    category: 'Common visitor',
    categoryGu: 'સામાન્ય મુલાકાતી',
    color: 'sand'
  },
  {
    id: 'myna',
    name: 'Common Myna',
    gu: 'દેશી મેના',
    scientific: 'Acridotheres tristis',
    image: '/assets/common-myna.jpg',
    habitat: 'Open grounds · Gardens · Towns',
    habitatGu: 'ખુલ્લી જગ્યા · બગીચા · શહેરો',
    fact: 'Mynas are adaptable birds and are often seen walking on the ground.',
    factGu: 'મેના ઘણી પરિસ્થિતિમાં અનુકૂળ થઈ જાય છે અને જમીન પર ચાલતી જોવા મળે છે.',
    category: 'City bird',
    categoryGu: 'શહેરનું પક્ષી',
    color: 'mint'
  },
  {
    id: 'pigeon',
    name: 'Rock Pigeon',
    gu: 'કબૂતર',
    scientific: 'Columba livia',
    image: '/assets/rock-pigeon.jpg',
    habitat: 'Buildings · Cliffs · City squares',
    habitatGu: 'ઇમારતો · ખડકો · શહેરના ચોક',
    fact: 'Rock pigeons have adapted well to living alongside people.',
    factGu: 'કબૂતર માણસોની આસપાસ રહેવા માટે સારી રીતે અનુકૂળ થઈ ગયું છે.',
    category: 'City regular',
    categoryGu: 'શહેરમાં સામાન્ય',
    color: 'blue'
  }
];

const COPY = {
  en: {
    home: 'Home', identify: 'Identify', guide: 'Bird guide', sightings: 'My sightings', settings: 'Settings',
    eyebrow: 'YOUR OUTDOOR BIRD COMPANION', title1: 'Listen to nature.', title2: 'Discover your world.',
    subtitle: 'Recognise bird calls, learn their stories, and trade a little screen time for a little more outside time.',
    start: 'Identify a bird', learn: 'Explore bird guide', offline: 'Offline-ready', private: 'Private by design', guj: 'Gujarati + English', outside: 'Made for outdoors',
    today: 'A little more nature, every day', birds: 'Meet your neighbours', viewAll: 'Explore all birds',
    why: 'AI that gets you outside', whySub: 'The screen should be the shortest part of the adventure.',
    how: 'A simpler kind of discovery', howSub: 'Three small steps. Then look up.',
    steps: ['Record a short bird sound', 'Let local AI analyse the clip', 'Learn one new thing, then explore'],
    stepDetail: ['Use your mic or upload a short audio clip.', 'BirdNET can identify possible species on your device.', 'Save the sighting and return your attention to nature.'],
    built: 'Built with open AI', builtSub: 'Powered by BirdNET, a community-built bird sound identification project.',
    discover: 'Your next discovery is outside.', discoverSub: 'Take a breath, listen carefully, and see what is nearby.',
    recordTitle: 'Identify a bird sound', recordSub: 'Record nearby birds or choose an audio file to analyse.',
    record: 'Start recording', stop: 'Stop recording', upload: 'Upload audio', analyse: 'Identify sound', sample: 'Try a sample result',
    recording: 'Listening…', ready: 'Ready when you are', duration: 'Keep the clip between 5 and 15 seconds for a useful first test.',
    result: 'Identification result', confidence: 'Model confidence', demo: 'Demo preview', save: 'Save sighting', saved: 'Saved to your sightings',
    noResult: 'Your result will appear here', noResultSub: 'Record a bird call or upload an audio clip to begin.',
    guideTitle: 'Bird guide', guideSub: 'A few familiar birds to start noticing around you.', search: 'Search birds…', all: 'All birds',
    sightsTitle: 'My sightings', sightsSub: 'Your nature notes are saved on this device.', empty: 'Your field notebook is empty', emptySub: 'Identify a bird and save it here to start your personal list.',
    exploreNow: 'Identify your first bird', settingsTitle: 'Settings & privacy', settingsSub: 'Keep control of your language and local data.', language: 'App language', local: 'Local-first experience', localSub: 'Sightings stay in this browser. Audio is sent only to your local BirdNET service when you run it.',
    clear: 'Clear saved sightings', clearConfirm: 'Clear all saved sightings from this browser?', cleared: 'Saved sightings cleared.',
    apiNote: 'AI service not connected', apiNoteSub: 'You can explore the interface in demo mode. Start the local backend to get real BirdNET predictions.',
    aiReady: 'Local AI connected', retry: 'Try again', fact: 'Did you know?', habitat: 'Often found in', scientific: 'Scientific name', about: 'About this bird',
    footer: 'Less scrolling. More noticing.', footerSub: 'Made for small discoveries in the big outdoors.', footerAI: 'Open-source AI · Local-first · Nature-first',
    micPermission: 'Allow microphone access in your browser, or upload an audio file instead.', fileReady: 'Audio ready to analyse', working: 'Analysing audio…',
    privacyLine: 'Your recordings are not sent to a third-party cloud AI by this app. The included backend runs locally on your machine.',
    source: 'Model: BirdNET · Results are suggestions, not guaranteed identifications.',
    noBirds: 'No birds match your search.', allSaved: 'All caught up', remove: 'Remove',
  },
  gu: {
    home: 'હોમ', identify: 'ઓળખો', guide: 'પક્ષી માર્ગદર્શિકા', sightings: 'મારી નોંધો', settings: 'સેટિંગ્સ',
    eyebrow: 'તમારો બહારનો પક્ષી સાથી', title1: 'પ્રકૃતિને સાંભળો.', title2: 'તમારી દુનિયા શોધો.',
    subtitle: 'પક્ષીઓના અવાજ ઓળખો, તેમની વાતો જાણો અને સ્ક્રીનથી થોડો સમય દૂર રહી પ્રકૃતિને નજીકથી અનુભવો.',
    start: 'પક્ષી ઓળખો', learn: 'પક્ષી માર્ગદર્શિકા જુઓ', offline: 'ઓફલાઇન માટે તૈયાર', private: 'તમારી પ્રાઇવસી', guj: 'ગુજરાતી + અંગ્રેજી', outside: 'બહારની શોધખોળ માટે',
    today: 'દરરોજ પ્રકૃતિ સાથે થોડો વધુ સમય', birds: 'આસપાસનાં પક્ષીઓને મળો', viewAll: 'બધાં પક્ષીઓ જુઓ',
    why: 'બહાર લઈ જાય તેવી AI', whySub: 'સ્ક્રીનનો સમય ઓછો અને પ્રકૃતિનો અનુભવ વધુ.',
    how: 'પક્ષી શોધવાની સરળ રીત', howSub: 'ત્રણ સરળ પગલાં. પછી આસપાસ જુઓ.',
    steps: ['પક્ષીનો થોડો અવાજ રેકોર્ડ કરો', 'લોકલ AI ને અવાજ તપાસવા દો', 'નવી વાત જાણો અને પ્રકૃતિ માણો'],
    stepDetail: ['માઇક્રોફોન વાપરો અથવા ઓડિયો ફાઇલ પસંદ કરો.', 'BirdNET સંભવિત પક્ષીની ઓળખ કરવામાં મદદ કરે છે.', 'નોંધ સાચવો અને ફરી પ્રકૃતિ તરફ ધ્યાન આપો.'],
    built: 'ઓપન AI સાથે બનાવ્યું', builtSub: 'BirdNET દ્વારા સંચાલિત, પક્ષીઓના અવાજ ઓળખવા માટેનો પ્રોજેક્ટ.',
    discover: 'તમારી આગળની શોધ બહાર છે.', discoverSub: 'થોડો વિરામ લો, ધ્યાનથી સાંભળો અને આસપાસ જુઓ.',
    recordTitle: 'પક્ષીનો અવાજ ઓળખો', recordSub: 'અવાજ રેકોર્ડ કરો અથવા ઓડિયો ફાઇલ પસંદ કરો.',
    record: 'રેકોર્ડિંગ શરૂ કરો', stop: 'રેકોર્ડિંગ બંધ કરો', upload: 'ઓડિયો અપલોડ કરો', analyse: 'અવાજ ઓળખો', sample: 'ડેમો પરિણામ જુઓ',
    recording: 'સાંભળી રહ્યું છે…', ready: 'તૈયાર હોય ત્યારે શરૂ કરો', duration: 'શરૂઆત માટે 5 થી 15 સેકન્ડનો અવાજ રાખો.',
    result: 'ઓળખનું પરિણામ', confidence: 'મોડલનો વિશ્વાસ સ્કોર', demo: 'ડેમો પ્રીવ્યૂ', save: 'નોંધ સાચવો', saved: 'તમારી નોંધોમાં સાચવ્યું',
    noResult: 'પરિણામ અહીં દેખાશે', noResultSub: 'શરૂ કરવા માટે અવાજ રેકોર્ડ કરો અથવા ઓડિયો ફાઇલ પસંદ કરો.',
    guideTitle: 'પક્ષી માર્ગદર્શિકા', guideSub: 'તમારી આસપાસ જોવા મળતાં થોડાં સામાન્ય પક્ષીઓ.', search: 'પક્ષી શોધો…', all: 'બધાં પક્ષીઓ',
    sightsTitle: 'મારી નોંધો', sightsSub: 'તમારી પ્રકૃતિની નોંધો આ ડિવાઇસમાં સાચવાય છે.', empty: 'તમારી નોંધપોથી ખાલી છે', emptySub: 'પક્ષી ઓળખીને સાચવો, જેથી તમારી પોતાની યાદી શરૂ થાય.',
    exploreNow: 'પહેલું પક્ષી ઓળખો', settingsTitle: 'સેટિંગ્સ અને પ્રાઇવસી', settingsSub: 'ભાષા અને સ્થાનિક ડેટા પર તમારું નિયંત્રણ રાખો.', language: 'એપની ભાષા', local: 'સ્થાનિક રીતે કામ કરવાની રચના', localSub: 'નોંધો આ બ્રાઉઝરમાં રહે છે. ઓડિયો ફક્ત તમારા લોકલ BirdNET સર્વિસને મોકલાય છે.',
    clear: 'બધી નોંધો સાફ કરો', clearConfirm: 'આ બ્રાઉઝરમાંથી બધી સાચવેલી નોંધો કાઢી નાખવી છે?', cleared: 'નોંધો સાફ કરી.',
    apiNote: 'AI સર્વિસ જોડાયેલી નથી', apiNoteSub: 'ડેમો મોડમાં વેબસાઇટ જોઈ શકો છો. સાચા BirdNET પરિણામ માટે લોકલ બેકએન્ડ શરૂ કરો.',
    aiReady: 'લોકલ AI જોડાયેલ છે', retry: 'ફરી પ્રયાસ કરો', fact: 'શું તમે જાણો છો?', habitat: 'સામાન્ય રીતે અહીં જોવા મળે', scientific: 'વૈજ્ઞાનિક નામ', about: 'આ પક્ષી વિશે',
    footer: 'ઓછું સ્ક્રોલિંગ. વધુ અવલોકન.', footerSub: 'બહારની દુનિયામાં નાની શોધો માટે બનાવ્યું.', footerAI: 'ઓપન-સોર્સ AI · લોકલ-ફર્સ્ટ · પ્રકૃતિ-ફર્સ્ટ',
    micPermission: 'બ્રાઉઝરમાં માઇક્રોફોનની મંજૂરી આપો અથવા ઓડિયો ફાઇલ અપલોડ કરો.', fileReady: 'ઓડિયો વિશ્લેષણ માટે તૈયાર છે', working: 'ઓડિયો તપાસી રહ્યું છે…',
    privacyLine: 'આ એપ તમારા રેકોર્ડિંગને તૃતીય-પક્ષ ક્લાઉડ AI પાસે મોકલતી નથી. સમાવિષ્ટ બેકએન્ડ તમારા કમ્પ્યુટર પર ચાલે છે.',
    source: 'મોડલ: BirdNET · પરિણામ સૂચન છે, ખાતરીપૂર્વકની ઓળખ નહીં.',
    noBirds: 'તમારી શોધ પ્રમાણે કોઈ પક્ષી મળ્યું નથી.', allSaved: 'બધી નોંધો અહીં છે', remove: 'દૂર કરો',
  }
};

const DEMO_RESULT = {
  species_name: 'Red-vented Bulbul',
  common_name: 'Red-vented Bulbul',
  gujarati_name: 'લાલપૂંછ બુલબુલ',
  scientific_name: 'Pycnonotus cafer',
  confidence: 0.92,
  status: 'demo',
  note: 'This is a sample interface preview, not a prediction from your recording.'
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function speciesForResult(result) {
  const text = `${result?.common_name || ''} ${result?.species_name || ''} ${result?.scientific_name || ''}`.toLowerCase();
  const match = BIRDS.find((bird) => text.includes(bird.name.toLowerCase()) || text.includes(bird.scientific.toLowerCase()) || text.includes(bird.id));
  if (match) return match;
  const foundName = result?.common_name || result?.species_name || 'Possible bird match';
  return {
    id: 'unknown',
    name: foundName,
    gu: result?.gujarati_name || 'ગુજરાતી નામ ઉપલબ્ધ નથી',
    scientific: result?.scientific_name || 'Scientific name unavailable',
    image: '',
    habitat: 'This species is not in the starter guide yet.',
    habitatGu: 'આ પક્ષી હજી શરૂઆતની માર્ગદર્શિકામાં ઉમેરાયું નથી.',
    fact: 'Treat this model output as a suggestion. Check a trusted local field guide to learn more.',
    factGu: 'આ AI પરિણામને સૂચન તરીકે લો. વધુ માહિતી માટે વિશ્વસનીય સ્થાનિક માર્ગદર્શિકા તપાસો.',
    category: 'AI match',
    categoryGu: 'AI ઓળખ',
    color: 'sage'
  };
}

function App() {
  const [view, setView] = useState('home');
  const [language, setLanguage] = useState(() => readStorage('pankhipath-language', 'en'));
  const [sightings, setSightings] = useState(() => readStorage('pankhipath-sightings', []));
  const [search, setSearch] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioName, setAudioName] = useState('');
  const [result, setResult] = useState(null);
  const [serviceOnline, setServiceOnline] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [toast, setToast] = useState('');
  const [expandedBird, setExpandedBird] = useState(null);
  const [filter, setFilter] = useState('All');
  const [sightingNote, setSightingNote] = useState('');
  const [attachLocation, setAttachLocation] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const stopTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const t = COPY[language];

  useEffect(() => localStorage.setItem('pankhipath-language', JSON.stringify(language)), [language]);
  useEffect(() => { document.documentElement.lang = language === 'gu' ? 'gu' : 'en'; }, [language]);
  useEffect(() => localStorage.setItem('pankhipath-sightings', JSON.stringify(sightings)), [sightings]);
  useEffect(() => {
    let active = true;
    fetch('/api/health').then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => { if (active) setServiceOnline(Boolean(data?.ok)); })
      .catch(() => { if (active) setServiceOnline(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const onBeforeInstall = (event) => { event.preventDefault(); setInstallPrompt(event); };
    const onInstalled = () => { setInstallPrompt(null); setToast(language === 'gu' ? 'PankhiPath ઇન્સ્ટોલ થયું.' : 'PankhiPath installed.'); };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [language]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => () => {
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice.catch(() => null);
    if (choice?.outcome === 'accepted') setToast(language === 'gu' ? 'ઇન્સ્ટોલ કરવાની પ્રક્રિયા શરૂ થઈ.' : 'Installation started.');
    setInstallPrompt(null);
  }

  function changeView(next) {
    setView(next);
    setMobileMenu(false);
    setExpandedBird(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAudioFile(file) {
    if (!file) return;
    if (!file.type.startsWith('audio/') && !/\.(wav|mp3|m4a|aac|ogg|webm|flac)$/i.test(file.name)) {
      setToast('Please choose an audio file (WAV, MP3, M4A or WEBM).');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setToast('Please use an audio file smaller than 25 MB.');
      return;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
    setAudioName(file.name || 'field-recording.webm');
    setResult(null);
    setToast(t.fileReady);
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setToast(t.micPermission);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      streamRef.current = stream;
      chunksRef.current = [];
      const possibleType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, possibleType ? { mimeType: possibleType } : undefined);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data?.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm';
        const extension = type.includes('mp4') ? 'm4a' : 'webm';
        const blob = new Blob(chunksRef.current, { type });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setAudioName(`pankhipath-recording.${extension}`);
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setToast(t.fileReady);
      };
      recorder.start();
      setIsRecording(true);
      setResult(null);
      stopTimerRef.current = window.setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 15000);
    } catch {
      setToast(t.micPermission);
    }
  }

  function stopRecording() {
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
    if (recorderRef.current && recorderRef.current.state === 'recording') recorderRef.current.stop();
  }

  async function analyseAudio() {
    if (!audioBlob) {
      setToast(language === 'gu' ? 'પહેલા અવાજ રેકોર્ડ કરો અથવા ફાઇલ પસંદ કરો.' : 'Record or upload an audio clip first.');
      return;
    }
    setIsAnalysing(true);
    setResult(null);
    const form = new FormData();
    form.append('audio', audioBlob, audioName || 'field-recording.webm');
    try {
      const response = await fetch('/api/identify', { method: 'POST', body: form });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        setServiceOnline(true);
        setToast(errorBody.detail || (language === 'gu' ? 'ઓડિયો તપાસી શકાયો નહીં. ફરી પ્રયાસ કરો.' : 'The audio could not be analysed. Please try again.'));
        setResult(null);
        return;
      }
      const data = await response.json();
      const first = data.top_prediction || data.predictions?.[0];
      if (!first) {
        setServiceOnline(true);
        setResult(null);
        setToast(data.message || (language === 'gu' ? 'સ્પષ્ટ પક્ષીનો અવાજ મળ્યો નથી. ફરી રેકોર્ડ કરો.' : 'No confident bird sound was found. Try a clearer recording.'));
        return;
      }
      const cleanResult = {
        ...first,
        species_name: first.common_name || first.species_name || first.name,
        confidence: Number(first.confidence ?? first.score ?? 0),
        status: 'ai',
        model: data.model || 'BirdNET'
      };
      setResult(cleanResult);
      setServiceOnline(true);
    } catch {
      setServiceOnline(false);
      setResult({ ...DEMO_RESULT, status: 'demo' });
    } finally {
      setIsAnalysing(false);
    }
  }

  function runSample() {
    setResult({ ...DEMO_RESULT, status: 'demo' });
    setToast(language === 'gu' ? 'આ નમૂનાનું પરિણામ છે, રેકોર્ડિંગનું પરિણામ નથી.' : 'Sample result loaded. This is not an analysis of your recording.');
  }

  async function saveSighting(birdResult = result) {
    if (!birdResult) return;
    let location = null;
    if (attachLocation) {
      if (!navigator.geolocation) {
        setToast(language === 'gu' ? 'આ બ્રાઉઝરમાં સ્થાન ઉપલબ્ધ નથી. સ્થાન વગર સાચવો અથવા ફરી પ્રયાસ કરો.' : 'Location is unavailable in this browser. Turn off the location tag or try another browser.');
        return;
      }
      try {
        const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }));
        location = { lat: Number(position.coords.latitude.toFixed(3)), lon: Number(position.coords.longitude.toFixed(3)) };
      } catch {
        setToast(language === 'gu' ? 'સ્થાનની મંજૂરી મળી નથી. સ્થાન ટૅગ વગર સાચવવા ટૉગલ બંધ કરો.' : 'Location permission was not granted. Turn off the location tag to save without it.');
        return;
      }
    }
    const bird = speciesForResult(birdResult);
    const newSighting = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      birdId: bird.id,
      name: birdResult.common_name || birdResult.species_name || bird.name,
      gu: birdResult.gujarati_name || bird.gu,
      scientific: birdResult.scientific_name || bird.scientific,
      confidence: Number(birdResult.confidence ?? 0),
      mode: birdResult.status || 'ai',
      date: new Date().toISOString(),
      note: sightingNote.trim(),
      location
    };
    setSightings((current) => [newSighting, ...current]);
    setSightingNote('');
    setAttachLocation(false);
    setToast(t.saved);
  }

  function exportSightings(format = 'csv') {
    const columns = ['date', 'name', 'gu', 'scientific', 'confidence', 'mode', 'note', 'latitude', 'longitude'];
    const rows = sightings.map((item) => ({
      date: item.date || '', name: item.name || '', gu: item.gu || '', scientific: item.scientific || '',
      confidence: item.confidence ?? '', mode: item.mode || '', note: item.note || '',
      latitude: item.location?.lat ?? '', longitude: item.location?.lon ?? ''
    }));
    let content;
    let mime;
    let extension;
    if (format === 'json') {
      content = JSON.stringify(rows, null, 2);
      mime = 'application/json;charset=utf-8';
      extension = 'json';
    } else {
      const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
      content = [columns.map(escapeCsv).join(','), ...rows.map((row) => columns.map((column) => escapeCsv(row[column])).join(','))].join('\r\n');
      mime = 'text/csv;charset=utf-8';
      extension = 'csv';
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pankhipath-field-journal-${new Date().toISOString().slice(0, 10)}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast(language === 'gu' ? 'તમારી નોંધો એક્સપોર્ટ થઈ.' : 'Your field journal was exported.');
  }

  function savePhotoSighting(candidate) {
    if (!candidate?.common_name) return;
    const matchingBird = BIRDS.find((bird) => bird.name.toLowerCase() === candidate.common_name.toLowerCase());
    const entry = {
      id: `photo-${Date.now()}`,
      birdId: matchingBird?.id || '',
      name: candidate.common_name,
      gu: candidate.gujarati_name || '',
      scientific: candidate.scientific_name || '',
      confidence: Number(candidate.score) || 0,
      date: new Date().toISOString(),
      note: 'Experimental local CLIP photo shortlist — verify the species with a field guide.',
      mode: 'photo-ai',
      source: 'photo'
    };
    setSightings((current) => [entry, ...current]);
    setToast(language === 'gu' ? 'ફોટાની સંભવિત ઓળખ તમારી નોંધોમાં સાચવી.' : 'Photo match saved to your field journal.');
  }

  function removeSighting(id) {
    setSightings((current) => current.filter((item) => item.id !== id));
  }

  function clearSightings() {
    if (!window.confirm(t.clearConfirm)) return;
    setSightings([]);
    setToast(t.cleared);
  }

  const navItems = [
    { id: 'home', label: t.home, icon: Leaf },
    { id: 'identify', label: t.identify, icon: Mic },
    { id: 'guide', label: t.guide, icon: Bird },
    { id: 'walk', label: language === 'gu' ? 'વોક પ્લાન' : 'Walk plan', icon: Footprints },
    { id: 'nearby', label: language === 'gu' ? 'નજીકનાં સ્થળો' : 'Nearby parks', icon: MapPinned },
    { id: 'sightings', label: t.sightings, icon: Bookmark },
    { id: 'passport', label: language === 'gu' ? 'પ્રકૃતિ પાસપોર્ટ' : 'Passport', icon: Award }
  ];

  const uniqueSpeciesCount = new Set(sightings.map((item) => item.birdId || item.scientific || item.name)).size;
  const savedGreenSpaceCount = readStorage('pankhipath-favorite-places', []).length;
  const filteredBirds = BIRDS.filter((bird) => {
    const matchesSearch = `${bird.name} ${bird.gu} ${bird.scientific}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || (filter === 'Garden' && /garden|common visitor/i.test(`${bird.category} ${bird.habitat}`)) || (filter === 'City' && /city|urban|street|building/i.test(`${bird.category} ${bird.habitat}`));
    return matchesSearch && matchesFilter;
  });
  const resultBird = result ? speciesForResult(result) : null;
  const resultConfidence = result ? Math.round((Number(result.confidence) > 1 ? Number(result.confidence) / 100 : Number(result.confidence)) * 100) : 0;

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={() => changeView('home')} aria-label="PankhiPath home">
          <span className="brand-mark"><Bird size={23} strokeWidth={2.4} /></span>
          <span className="brand-copy"><strong>PankhiPath</strong><small>Your outdoor bird companion</small></span>
        </button>
        <nav className={`main-nav ${mobileMenu ? 'is-open' : ''}`} aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} className={`nav-link ${view === item.id ? 'active' : ''}`} onClick={() => changeView(item.id)}><Icon size={16} />{item.label}</button>;
          })}
          <button className={`nav-link ${view === 'settings' ? 'active' : ''}`} onClick={() => changeView('settings')}><SettingsIcon size={16} />{t.settings}</button>
        </nav>
        <div className="header-actions">
          <div className="lang-switch" aria-label="Language">
            <button className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')}>EN</button>
            <span />
            <button className={language === 'gu' ? 'selected' : ''} onClick={() => setLanguage('gu')}>ગુજ</button>
          </div>
          {installPrompt && <button className="install-cta" onClick={installApp}><Download size={14} />{language === 'gu' ? 'ઇન્સ્ટોલ' : 'Install app'}</button>}
          <button className="header-cta" onClick={() => changeView('identify')}>{t.start}<ArrowUpRight size={16} /></button>
          <button className="mobile-menu-btn" onClick={() => setMobileMenu((open) => !open)} aria-label={mobileMenu ? 'Close menu' : 'Open menu'}>{mobileMenu ? <X /> : <Menu />}</button>
        </div>
      </header>

      <main>
        {view === 'home' && <>
          <section className="hero-section wrap">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot" />{t.eyebrow}</div>
              <h1>{t.title1}<br /><span>{t.title2}</span></h1>
              <p className="hero-subtitle">{t.subtitle}</p>
              <div className="hero-buttons">
                <button className="button button-primary" onClick={() => changeView('identify')}><Mic size={17} />{t.start}<ArrowRight size={16} /></button>
                <button className="button button-secondary" onClick={() => changeView('guide')}>{t.learn}<ArrowUpRight size={16} /></button>
                <button className="button button-secondary nearby-hero-button" onClick={() => changeView('nearby')}><MapPin size={16} />{language === 'gu' ? 'નજીકનાં બગીચા' : 'Nearby gardens'}</button>
              </div>
              <div className="hero-promises">
                <div><span className="promise-icon"><WifiOff size={17} /></span><span><strong>{t.offline}</strong><small>No constant signal needed</small></span></div>
                <div><span className="promise-icon"><ShieldCheck size={17} /></span><span><strong>{t.private}</strong><small>Keep recordings under your control</small></span></div>
                <div><span className="promise-icon"><Languages size={17} /></span><span><strong>{t.guj}</strong><small>Learn in your language</small></span></div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-photo"><img src="/assets/bulbul-hero.jpg" alt="A red-vented bulbul perched on a branch among green leaves" /></div>
              <div className="photo-grain" />
              <div className="hero-photo-caption"><span className="caption-kicker">A NEIGHBOUR TO NOTICE</span><strong>Red-vented Bulbul</strong><span>લાલપૂંછ બુલબુલ</span></div>
              <div className="hero-note"><span className="note-icon"><Waves size={20} /></span><div><strong>Pause. Listen.</strong><small>Nature is closer than you think.</small></div></div>
              <div className="round-stamp"><Leaf size={21} /><span>TOUCH<br />GRASS</span></div>
            </div>
          </section>

          <section className="principles-strip wrap">
            <div><span className="strip-icon"><WifiOff size={19} /></span><span><strong>{t.offline}</strong><small>Local inference after setup</small></span></div>
            <div><span className="strip-icon"><LockKeyhole size={19} /></span><span><strong>{t.private}</strong><small>Your field notes stay local</small></span></div>
            <div><span className="strip-icon"><Globe2 size={19} /></span><span><strong>{t.guj}</strong><small>Designed for local discovery</small></span></div>
            <div><span className="strip-icon"><Footprints size={19} /></span><span><strong>{t.outside}</strong><small>Look up from your screen</small></span></div>
          </section>

          <section className="home-passport-teaser wrap">
            <div className="home-passport-icon"><Award size={24}/></div>
            <div className="home-passport-copy"><span className="eyebrow">{language === 'gu' ? 'તમારો પ્રકૃતિ પાસપોર્ટ' : 'YOUR NATURE PASSPORT'}</span><h2>{language === 'gu' ? 'દરેક બહારનો સમય એક સિદ્ધિ છે.' : 'Every little outing counts.'}</h2><p>{language === 'gu' ? 'નોંધો સાચવો, તમારી શોધો ટ્રેક કરો અને પ્રકૃતિના નવા બેજ મેળવો.' : 'Save field notes, track your discoveries, and earn nature badges through real activity.'}</p></div>
            <div className="home-passport-mini-stats"><span><strong>{sightings.length}</strong><small>{language === 'gu' ? 'નોંધો' : 'sightings'}</small></span><span><strong>{uniqueSpeciesCount}</strong><small>{language === 'gu' ? 'અલગ પક્ષીઓ' : 'unique birds'}</small></span><span><strong>{savedGreenSpaceCount}</strong><small>{language === 'gu' ? 'સાચવેલાં સ્થળો' : 'saved places'}</small></span></div>
            <button className="button button-primary" onClick={() => changeView('passport')}>{language === 'gu' ? 'પાસપોર્ટ ખોલો' : 'Open passport'}<ArrowRight size={15}/></button>
          </section>

          <section className="home-tools-grid wrap" aria-label={language === 'gu' ? 'ઝડપી શોધખોળ સાધનો' : 'Quick outdoor tools'}>
            <button className="home-tool-card" onClick={() => changeView('walk')}><span className="home-tool-icon"><Route size={21}/></span><span className="home-tool-copy"><strong>{language === 'gu' ? 'Nature Walk Planner' : 'Nature Walk Planner'}</strong><small>{language === 'gu' ? 'સમય અને નાના મિશન સાથે વોક બનાવો.' : 'Build a timed walk with simple nature missions.'}</small></span><ArrowUpRight size={17}/></button>
            <button className="home-tool-card" onClick={() => changeView('photo')}><span className="home-tool-icon"><Camera size={21}/></span><span className="home-tool-copy"><strong>{language === 'gu' ? 'ફોટાથી પક્ષી ઓળખો' : 'Bird photo ID'}</strong><small>{language === 'gu' ? 'સ્થાનિક open-weight AI થી ફોટો તપાસો.' : 'Analyse a bird photo with a local open-weight model.'}</small></span><ArrowUpRight size={17}/></button>
            <button className="home-tool-card" onClick={() => changeView('nearby')}><span className="home-tool-icon"><MapPinned size={21}/></span><span className="home-tool-copy"><strong>{language === 'gu' ? 'નજીકનાં બગીચા' : 'Nearby green spaces'}</strong><small>{language === 'gu' ? 'નજીકના outdoor સ્થળો શોધો.' : 'Find a real place to take your discovery outside.'}</small></span><ArrowUpRight size={17}/></button>
          </section>

          <section className="content-section wrap birds-section">
            <div className="section-heading">
              <div><span className="eyebrow">A LITTLE FIELD GUIDE</span><h2>{t.birds}</h2><p>{t.today}</p></div>
              <button className="text-button" onClick={() => changeView('guide')}>{t.viewAll}<ArrowRight size={16} /></button>
            </div>
            <div className="bird-grid">
              {BIRDS.slice(0, 3).map((bird, index) => <BirdCard key={bird.id} bird={bird} language={language} onOpen={() => { setExpandedBird(bird); setView('guide'); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} index={index} />)}
            </div>
          </section>

          <section className="content-section wrap why-section">
            <div className="why-heading"><span className="eyebrow">OPEN AI. OPEN AIR.</span><h2>{t.why}</h2><p>{t.whySub}</p></div>
            <div className="feature-grid">
              <FeatureCard number="01" icon={<Waves size={21} />} title={language === 'gu' ? 'સાંભળો, ફક્ત સ્ક્રોલ નહીં' : 'Listen, don’t just scroll'} copy={language === 'gu' ? 'ટૂંકું રેકોર્ડિંગ કરો અને પછી ફોન ખિસ્સામાં મૂકી આસપાસ જુઓ.' : 'Capture a short call, then put your phone away and notice what is around you.'} />
              <FeatureCard number="02" icon={<ShieldCheck size={21} />} title={language === 'gu' ? 'તમારા ડેટા પર તમારું નિયંત્રણ' : 'Your data, your call'} copy={language === 'gu' ? 'લોકલ બેકએન્ડમાં અવાજનું વિશ્લેષણ કરો; ક્લાઉડ API જરૂરી નથી.' : 'Run audio analysis through a local backend instead of a third-party cloud AI API.'} />
              <FeatureCard number="03" icon={<Leaf size={21} />} title={language === 'gu' ? 'પ્રકૃતિ માટે બનાવ્યું' : 'Made for the real world'} copy={language === 'gu' ? 'આગળ શું જોવું તે શીખો, પછી સ્ક્રીનથી દૂર રહી અનુભવ કરો.' : 'Learn what to look for, then spend more of the experience with your eyes up.'} />
            </div>
          </section>

          <section className="how-section wrap">
            <div className="how-intro"><span className="eyebrow">SIMPLE BY DESIGN</span><h2>{t.how}</h2><p>{t.howSub}</p><button className="button button-primary" onClick={() => changeView('identify')}>{t.start}<ArrowRight size={16} /></button></div>
            <div className="steps-list">
              {t.steps.map((step, index) => <div className="step-row" key={step}><div className="step-number">0{index + 1}</div><div className="step-symbol">{index === 0 ? <Mic size={21} /> : index === 1 ? <Sparkles size={21} /> : <Footprints size={21} />}</div><div><h3>{step}</h3><p>{t.stepDetail[index]}</p></div><ArrowRight className="step-arrow" size={19} /></div>)}
            </div>
          </section>

          <section className="open-ai-card wrap">
            <div className="ai-orbit"><Bird size={36} /><span /><span /><span /></div>
            <div className="ai-card-copy"><span className="eyebrow">OPEN-SOURCE AT THE CORE</span><h2>{t.built}</h2><p>{t.builtSub}</p><div className="ai-tags"><span><Check size={13} />Model can run locally</span><span><Check size={13} />No per-call API bill</span><span><Check size={13} />Swappable open tooling</span></div></div>
            <a className="github-link" href="https://github.com/birdnet-team/birdnet" target="_blank" rel="noreferrer">BirdNET project <ExternalLink size={15} /></a>
          </section>

          <section className="bottom-cta wrap"><div className="cta-leaf"><Leaf size={31} /></div><div><span className="eyebrow">YOUR NEXT DISCOVERY IS WAITING</span><h2>{t.discover}</h2><p>{t.discoverSub}</p></div><button className="button button-light" onClick={() => changeView('identify')}>{t.start}<ArrowRight size={16} /></button></section>
        </>}

        {view === 'nearby' && <Nearby language={language} />}
        {view === 'passport' && <Passport language={language} sightings={sightings} onNavigate={changeView} onExport={exportSightings} />}
        {view === 'walk' && <WalkPlanner language={language} onNearby={() => changeView('nearby')} onPhoto={() => changeView('photo')} />}
        {view === 'photo' && <PhotoIdentifier language={language} onGoSound={() => changeView('identify')} onSaveSighting={savePhotoSighting} />}

        {view === 'identify' && <section className="workspace wrap">
          <div className="page-title-row"><div><span className="eyebrow">FIELD LAB / 01</span><h1>{t.recordTitle}</h1><p>{t.recordSub}</p></div><div className="identify-page-actions"><div className={`connection-pill ${serviceOnline ? 'connected' : ''}`}><span />{serviceOnline ? t.aiReady : t.apiNote}</div><button className="button button-secondary photo-shortcut-button" onClick={() => changeView('photo')}><Camera size={15}/>{language === 'gu' ? 'ફોટાથી ઓળખો' : 'Photo ID'}</button></div></div>
          {!serviceOnline && <div className="notice-banner"><span className="notice-icon"><Info size={18} /></span><div><strong>{t.apiNote}</strong><p>{t.apiNoteSub}</p></div><button className="notice-action" onClick={runSample}>{t.sample}<ArrowRight size={14} /></button></div>}
          <div className="identify-layout">
            <div className="panel recording-panel">
              <div className="panel-topline"><span className="panel-index">01</span><span className="panel-status"><span className={isRecording ? 'live-dot' : ''} />{isRecording ? t.recording : t.ready}</span></div>
              <div className={`mic-stage ${isRecording ? 'recording' : ''}`}>
                <div className="mic-ripple ripple-one" /><div className="mic-ripple ripple-two" />
                <button className="big-mic-button" onClick={isRecording ? stopRecording : startRecording} aria-label={isRecording ? t.stop : t.record}>
                  {isRecording ? <CircleStop size={36} fill="currentColor" /> : <Mic size={35} />}
                </button>
                <div className="mic-wave"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
              </div>
              <h3 className="recording-heading">{isRecording ? t.recording : t.record}</h3>
              <p className="muted center-copy">{t.duration}</p>
              <div className="recording-actions">
                {isRecording ? <button className="button button-danger" onClick={stopRecording}><CircleStop size={17} />{t.stop}</button> : <button className="button button-primary" onClick={startRecording}><Mic size={17} />{t.record}</button>}
                <button className="button button-secondary" onClick={() => fileInputRef.current?.click()}><Upload size={16} />{t.upload}</button>
                <input ref={fileInputRef} className="visually-hidden" type="file" accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm,.flac" onChange={(event) => { handleAudioFile(event.target.files?.[0]); event.target.value = ''; }} />
              </div>
              {audioUrl && <div className="audio-ready"><div className="audio-file-icon"><FileAudio size={18} /></div><div className="audio-file-meta"><strong>{audioName || 'field-recording'}</strong><small>{t.fileReady}</small></div><audio controls src={audioUrl} /></div>}
              <div className="panel-divider" />
              <div className="tips-box"><span><Headphones size={17} /></span><div><strong>{language === 'gu' ? 'સારા પરિણામ માટે' : 'For a cleaner recording'}</strong><p>{language === 'gu' ? 'શાંત જગ્યાએ રહો, પવનથી માઇક બચાવો અને પક્ષીથી થોડું અંતર રાખો.' : 'Choose a quiet spot, shield the mic from wind, and keep a respectful distance from wildlife.'}</p></div></div>
              <button className="button button-primary analyze-button" onClick={analyseAudio} disabled={isAnalysing || isRecording || !audioBlob}>{isAnalysing ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}{isAnalysing ? t.working : t.analyse}<ArrowRight size={16} /></button>
              <button className="sample-link" onClick={runSample}>{t.sample}</button>
            </div>

            <div className="panel result-panel">
              <div className="panel-topline"><span className="panel-index">02</span><span className="result-label"><Sparkles size={14} />{t.result}</span></div>
              {!result ? <div className="empty-result"><div className="empty-illustration"><div className="empty-sun" /><div className="empty-hill hill-back" /><div className="empty-hill hill-front" /><Bird size={38} /></div><h3>{t.noResult}</h3><p>{t.noResultSub}</p><div className="empty-result-note"><ShieldCheck size={16} /><span>{t.privacyLine}</span></div></div> : <div className="result-content">
                <div className="result-photo-wrap">{resultBird.id === 'unknown' ? <div className="result-placeholder"><Bird size={62} strokeWidth={1.25} /><span>{language === 'gu' ? 'નવું પક્ષી' : 'New field match'}</span></div> : <img src={resultBird.image} alt={resultBird.name} />}<span className={`result-mode ${result.status === 'demo' ? 'is-demo' : ''}`}>{result.status === 'demo' ? t.demo : 'BirdNET AI'}</span><div className="confidence-badge"><strong>{resultConfidence}%</strong><small>{t.confidence}</small></div></div>
                {result.status === 'demo' && <div className="demo-warning"><Info size={15} /><span>{language === 'gu' ? 'આ નમૂનાનું પરિણામ છે—તમારી ઓડિયો ફાઇલનું AI વિશ્લેષણ નથી.' : 'Sample result only — this is not an AI analysis of your audio.'}</span></div>}
                <div className="result-name-row"><div><h2>{result.common_name || result.species_name || resultBird.name}</h2><p className="gujarati-name">{result.gujarati_name || resultBird.gu}</p><em>{result.scientific_name || resultBird.scientific}</em></div><button className="sound-button" aria-label="Play bird sound information" onClick={() => setToast(language === 'gu' ? 'આગામી આવૃત્તિમાં પક્ષીના અવાજનો નમૂનો ઉમેરાશે.' : 'Bird sound playback can be added in a future version.')}><Volume2 size={19} /></button></div>
                <div className="result-facts"><div><MapPin size={15} /><span><small>{t.habitat}</small><strong>{language === 'gu' ? resultBird.habitatGu : resultBird.habitat}</strong></span></div><div><Feather size={15} /><span><small>{t.scientific}</small><strong>{result.scientific_name || resultBird.scientific}</strong></span></div></div>
                <div className="fact-card"><span className="fact-icon"><Sparkles size={17} /></span><div><strong>{t.fact}</strong><p>{language === 'gu' ? resultBird.factGu : resultBird.fact}</p></div></div>
                <div className="field-note-editor">
                  <label htmlFor="sighting-note">{language === 'gu' ? 'ક્ષેત્ર નોંધ (વૈકલ્પિક)' : 'Field note (optional)'}</label>
                  <textarea id="sighting-note" value={sightingNote} onChange={(event) => setSightingNote(event.target.value)} maxLength={240} rows={2} placeholder={language === 'gu' ? 'ક્યાં જોયું? શું ખાસ ધ્યાનમાં આવ્યું?' : 'Where did you see it? What did you notice?'} />
                  <label className="location-opt-in"><input type="checkbox" checked={attachLocation} onChange={(event) => setAttachLocation(event.target.checked)} /><span><MapPin size={14}/>{language === 'gu' ? 'નોંધમાં અંદાજિત સ્થાન જોડો (મંજૂરી પૂછાશે)' : 'Attach approximate location (permission required)'}</span></label>
                </div>
                <button className="button button-primary save-result-button" onClick={() => saveSighting(result)}><Bookmark size={16} />{t.save}<ArrowRight size={16} /></button>
                <p className="model-disclaimer">{t.source}</p>
              </div>}
            </div>
          </div>
          <div className="privacy-footer-note"><LockKeyhole size={16} /><span>{t.privacyLine}</span></div>
        </section>}

        {view === 'guide' && <section className="workspace wrap guide-view">
          <div className="page-title-row"><div><span className="eyebrow">FIELD GUIDE / 02</span><h1>{t.guideTitle}</h1><p>{t.guideSub}</p></div><div className="guide-stat"><Bird size={20} /><span><strong>{BIRDS.length.toString().padStart(2, '0')}</strong><small>{language === 'gu' ? 'શરૂઆતના પક્ષીઓ' : 'starter species'}</small></span></div></div>
          <div className="guide-toolbar"><div className="search-box"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} aria-label={t.search} />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={16} /></button>}</div><div className="guide-filter-chips" aria-label={language === 'gu' ? 'પક્ષી ફિલ્ટર' : 'Bird filters'}>{[['All', language === 'gu' ? 'બધાં' : 'All'], ['Garden', language === 'gu' ? 'બગીચા' : 'Garden'], ['City', language === 'gu' ? 'શહેર' : 'City']].map(([id, label]) => <button type="button" key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}</div></div>
          {filteredBirds.length ? <div className="bird-grid guide-grid">{filteredBirds.map((bird, index) => <BirdCard key={bird.id} bird={bird} language={language} index={index} onOpen={() => setExpandedBird(expandedBird?.id === bird.id ? null : bird)} expanded={expandedBird?.id === bird.id} onIdentify={() => changeView('identify')} />)}</div> : <div className="empty-state"><Search size={26} /><h3>{t.noBirds}</h3><button className="button button-secondary" onClick={() => setSearch('')}>{t.retry}</button></div>}
          {expandedBird && <div className="bird-detail-panel"><button className="detail-close" onClick={() => setExpandedBird(null)} aria-label="Close detail"><X size={18} /></button><img src={expandedBird.image} alt={expandedBird.name} /><div><span className="eyebrow">BIRD NOTES</span><h2>{language === 'gu' ? expandedBird.gu : expandedBird.name}</h2><p><em>{expandedBird.scientific}</em></p><h4>{t.habitat}</h4><p>{language === 'gu' ? expandedBird.habitatGu : expandedBird.habitat}</p><h4>{t.fact}</h4><p>{language === 'gu' ? expandedBird.factGu : expandedBird.fact}</p><button className="button button-primary" onClick={() => changeView('identify')}><Mic size={16} />{t.start}</button></div></div>}
        </section>}

        {view === 'sightings' && <section className="workspace wrap sightings-view">
          <div className="page-title-row"><div><span className="eyebrow">YOUR FIELD NOTEBOOK / 03</span><h1>{t.sightsTitle}</h1><p>{t.sightsSub}</p></div><div className="sighting-count"><span className="count-icon"><Bookmark size={20} /></span><span><strong>{sightings.length.toString().padStart(2, '0')}</strong><small>{language === 'gu' ? 'સાચવેલી નોંધો' : 'saved sightings'}</small></span></div></div>
          <div className="notebook-summary"><div><span className="summary-label">{language === 'gu' ? 'તમારી શોધખોળ' : 'YOUR EXPLORATION'}</span><h2>{sightings.length === 1 ? (language === 'gu' ? 'એક નાની શોધ શરૂ થઈ.' : 'One little discovery.') : sightings.length > 1 ? (language === 'gu' ? 'સારી શરૂઆત. ચાલુ રાખો.' : 'A lovely start. Keep noticing.') : t.allSaved}</h2><p>{t.sightsSub}</p></div><div className="summary-illustration"><Trees size={55} strokeWidth={1.1} /><Bird size={25} /></div></div>
          {!!sightings.length && <div className="journal-export-toolbar"><span><LockKeyhole size={14}/>{language === 'gu' ? 'તમારી નોંધો ખાનગી છે; જરૂર પડે ત્યારે નકલ ડાઉનલોડ કરો.' : 'Your journal is private. Download a copy any time.'}</span><div><button className="button button-secondary" onClick={() => exportSightings('csv')}><FileText size={14}/>CSV</button><button className="button button-secondary" onClick={() => exportSightings('json')}><FileJson size={14}/>JSON</button></div></div>}
          {!sightings.length ? <div className="empty-state notebook-empty"><div className="empty-notebook-icon"><Bookmark size={25} /></div><h3>{t.empty}</h3><p>{t.emptySub}</p><button className="button button-primary" onClick={() => changeView('identify')}><Mic size={17} />{t.exploreNow}<ArrowRight size={16} /></button></div> : <div className="sightings-list">{sightings.map((sighting) => { const matchedBird = BIRDS.find((item) => item.id === sighting.birdId); const bird = matchedBird || BIRDS[0]; return <div className="sighting-row" key={sighting.id}>{matchedBird ? <img src={bird.image} alt={bird.name} /> : <div className="sighting-generic-thumb"><Camera size={20}/></div>}<div className="sighting-info"><strong>{language === 'gu' ? (sighting.gu || bird.gu) : sighting.name}</strong><em>{sighting.scientific || bird.scientific}</em><span><CalendarDays size={13} />{new Date(sighting.date).toLocaleString(language === 'gu' ? 'gu-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>{sighting.note && <p className="saved-field-note">{sighting.note}</p>}{sighting.location && <a className="saved-location-link" href={`https://www.google.com/maps/search/?api=1&query=${sighting.location.lat},${sighting.location.lon}`} target="_blank" rel="noreferrer"><MapPin size={12}/>{language === 'gu' ? 'સ્થાન ટૅગ જુઓ' : 'View location tag'}<ExternalLink size={11}/></a>}</div><div className="sighting-score"><strong>{Math.round((sighting.confidence > 1 ? sighting.confidence / 100 : sighting.confidence) * 100)}%</strong><small>{sighting.mode === 'demo' ? t.demo : sighting.mode === 'photo-ai' ? 'CLIP photo shortlist' : 'BirdNET'}</small></div><button className="icon-button remove-sighting" onClick={() => removeSighting(sighting.id)} aria-label={`${t.remove} ${sighting.name}`}><Trash2 size={17} /></button></div>; })}</div>}
          {!!sightings.length && <div className="notebook-actions"><span><LockKeyhole size={15} />{language === 'gu' ? 'આ નોંધો ફક્ત આ બ્રાઉઝરમાં છે.' : 'Stored in this browser only.'}</span><button className="text-button danger-text" onClick={clearSightings}><Trash2 size={15} />{t.clear}</button></div>}
        </section>}

        {view === 'settings' && <section className="workspace wrap settings-view">
          <div className="page-title-row"><div><span className="eyebrow">PREFERENCES / 04</span><h1>{t.settingsTitle}</h1><p>{t.settingsSub}</p></div><div className="settings-avatar"><SettingsIcon size={23} /></div></div>
          <div className="settings-layout"><div className="settings-main">
            <div className="settings-card"><div className="settings-section-icon"><Languages size={20} /></div><div className="settings-card-content"><h3>{t.language}</h3><p>{language === 'gu' ? 'તમારા માટે વધુ અનુકૂળ ભાષા પસંદ કરો.' : 'Choose the language that feels most natural to you.'}</p><div className="language-options"><button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}><span className="language-letter">EN</span><span><strong>English</strong><small>English interface</small></span>{language === 'en' && <CheckCircle2 size={19} />}</button><button className={language === 'gu' ? 'active' : ''} onClick={() => setLanguage('gu')}><span className="language-letter gu-letter">અ</span><span><strong>ગુજરાતી</strong><small>Gujarati interface</small></span>{language === 'gu' && <CheckCircle2 size={19} />}</button></div></div></div>
            <div className="settings-card"><div className="settings-section-icon"><ShieldCheck size={20} /></div><div className="settings-card-content"><h3>{t.local}</h3><p>{t.localSub}</p><div className="privacy-checklist"><div><CheckCircle2 size={17} /><span>{language === 'gu' ? 'નોંધો તમારા બ્રાઉઝરમાં સાચવાય છે' : 'Sightings are stored in this browser'}</span></div><div><CheckCircle2 size={17} /><span>{language === 'gu' ? 'ઓડિયો માટે લોકલ સર્વિસ વાપરી શકાય છે' : 'Audio can be analysed by a local service'}</span></div><div><CheckCircle2 size={17} /><span>{language === 'gu' ? 'રેકોર્ડિંગ મેન્યુઅલી અપલોડ કરવું પડે છે' : 'Audio is only analysed after you submit it'}</span></div></div></div></div>
            <div className="settings-card"><div className="settings-section-icon"><Sparkles size={20} /></div><div className="settings-card-content"><h3>{language === 'gu' ? 'AI મોડલ' : 'AI model'}</h3><p>{language === 'gu' ? 'પક્ષીના અવાજની ઓળખ માટે BirdNET વપરાય છે.' : 'BirdNET provides the open-source bird sound identification model.'}</p><a className="settings-external-link" href="https://github.com/birdnet-team/birdnet" target="_blank" rel="noreferrer">BirdNET on GitHub <ExternalLink size={14} /></a><div className="model-status-line"><span className={serviceOnline ? 'status-indicator green' : 'status-indicator'} />{serviceOnline ? t.aiReady : t.apiNote}</div></div></div>
          </div><aside className="settings-aside"><div className="aside-illustration"><div className="aside-leaf leaf-one" /><div className="aside-leaf leaf-two" /><Bird size={46} /></div><span className="eyebrow">A SMALL REMINDER</span><h3>{language === 'gu' ? 'ફોન સાધન છે, મંજિલ નહીં.' : 'The phone is a tool, not the destination.'}</h3><p>{language === 'gu' ? 'ઓળખો, શીખો અને પછી સ્ક્રીનથી દૂર રહી પક્ષીનો અવાજ માણો.' : 'Identify, learn, then put the screen away and enjoy the real birdsong.'}</p><div className="aside-line" /><strong>{language === 'gu' ? 'ઓપન AI · વધુ બહારનો સમય' : 'Open AI · More outdoor time'}</strong></aside></div>
          <div className="settings-danger-zone"><div><strong>{language === 'gu' ? 'સ્થાનિક ડેટા' : 'Local data'}</strong><p>{language === 'gu' ? 'તમારા ડિવાઇસમાંથી સાચવેલી નોંધો દૂર કરો.' : 'Remove saved sightings from this browser.'}</p></div><button className="button button-outline-danger" onClick={clearSightings}><Trash2 size={16} />{t.clear}</button></div>
        </section>}
      </main>

      <footer className="site-footer wrap"><button className="brand footer-brand" onClick={() => changeView('home')}><span className="brand-mark"><Bird size={21} /></span><span className="brand-copy"><strong>PankhiPath</strong><small>{t.footerSub}</small></span></button><p>{t.footer}</p><div className="footer-right"><span><Leaf size={14} />{t.footerAI}</span><span className="copyright">© 2026 PankhiPath</span></div></footer>
      {toast && <div className="toast-message" role="status"><CheckCircle2 size={17} />{toast}<button onClick={() => setToast('')} aria-label="Dismiss"><X size={15} /></button></div>}
    </div>
  );
}

function BirdCard({ bird, language, onOpen, index = 0, expanded = false, onIdentify }) {
  return <article className={`bird-card bird-card-${bird.color} ${expanded ? 'expanded' : ''}`} style={{ '--card-index': index }}>
    <button className="bird-card-image" onClick={onOpen} aria-label={`${language === 'gu' ? bird.gu : bird.name} details`}><img src={bird.image} alt={bird.name} loading="lazy" /><span className="bird-card-arrow"><ArrowUpRight size={17} /></span></button>
    <div className="bird-card-content"><div className="bird-type-row"><span className="bird-category">{language === 'gu' ? bird.categoryGu : bird.category}</span><span className="bird-sound-dash"><Waves size={14} /></span></div><button className="bird-name-button" onClick={onOpen}><h3>{language === 'gu' ? bird.gu : bird.name}</h3></button><p className="bird-scientific">{bird.scientific}</p><p className="bird-fact">{language === 'gu' ? bird.factGu : bird.fact}</p><div className="bird-card-footer"><button onClick={onOpen}>{language === 'gu' ? 'વધુ જાણો' : 'Learn more'}<ArrowRight size={14} /></button>{onIdentify && <button className="mini-identify" onClick={(event) => { event.stopPropagation(); onIdentify(); }}><Mic size={14} />{language === 'gu' ? 'ઓળખો' : 'Identify'}</button>}</div>
    </div>
  </article>;
}

function FeatureCard({ number, icon, title, copy }) {
  return <article className="feature-card"><div className="feature-card-top"><span className="feature-icon">{icon}</span><span className="feature-number">{number}</span></div><h3>{title}</h3><p>{copy}</p><div className="feature-bottom-line" /></article>;
}

export default App;
