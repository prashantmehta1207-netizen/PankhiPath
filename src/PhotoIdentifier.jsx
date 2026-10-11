import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Bird, Camera, CheckCircle2, ImagePlus, LoaderCircle, Mic, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import './photoidentifier.css';

export default function PhotoIdentifier({ language = 'en', onGoSound, onSaveSighting }) {
  const gu = language === 'gu';
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file) { setPreviewUrl(''); return undefined; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const chooseFile = (nextFile) => {
    if (!nextFile) return;
    if (!nextFile.type.startsWith('image/')) {
      setError(gu ? 'કૃપા કરીને JPG, PNG અથવા WebP ફોટો પસંદ કરો.' : 'Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      setError(gu ? 'ફોટો 10 MB કરતાં નાનો હોવો જોઈએ.' : 'Please choose an image smaller than 10 MB.');
      return;
    }
    setFile(nextFile);
    setResult(null);
    setSaved(false);
    setError('');
  };

  async function identifyPhoto() {
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const form = new FormData();
      form.append('image', file, file.name || 'bird-photo.jpg');
      const response = await fetch('/api/identify-image', { method: 'POST', body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = typeof data.detail === 'string' ? data.detail : '';
        if (response.status === 503 && detail.toLowerCase().includes('install')) {
          throw new Error(gu ? 'ફોટો AI માટે backend પર optional dependencies ઇન્સ્ટોલ કરો. README માં સૂચનાઓ છે.' : 'Photo AI dependencies are not installed in the backend yet. Follow the Photo AI setup in README.');
        }
        throw new Error(detail || (gu ? 'ફોટો તપાસી શકાયો નહીં. ફરી પ્રયાસ કરો.' : 'The photo could not be analysed. Please try again.'));
      }
      setResult(data);
      setSaved(false);
    } catch (err) {
      setError(err?.message || (gu ? 'સ્થાનિક AI સાથે જોડાઈ શકાયું નહીં.' : 'Could not connect to the local AI service.'));
    } finally { setLoading(false); }
  }

  const top = result?.candidates?.[0];

  return <section className="workspace wrap photo-identifier-view">
    <div className="page-title-row"><div><span className="eyebrow">{gu ? 'લોકલ વિઝન લેબ' : 'LOCAL VISION LAB / 02'}</span><h1>{gu ? 'ફોટાથી પક્ષી ઓળખો.' : 'Identify a bird from a photo.'}</h1><p>{gu ? 'ફોટો તમારા કમ્પ્યુટર પર ચાલતા સ્થાનિક AI મોડલથી તપાસાશે.' : 'Your image is analysed by an open-weight vision model on your own computer.'}</p></div><div className="photo-local-pill"><ShieldCheck size={16}/>{gu ? 'સ્થાનિક વિશ્લેષણ' : 'Local analysis'}</div></div>

    <div className="photo-id-layout">
      <div className="photo-input-column">
        <div className={`photo-drop-zone ${previewUrl ? 'has-photo' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files?.[0]); }}>
          {previewUrl ? <img className="photo-preview-image" src={previewUrl} alt={gu ? 'પસંદ કરેલો પક્ષીનો ફોટો' : 'Selected bird photo preview'} /> : <div className="photo-drop-empty"><span className="photo-drop-icon"><Camera size={27}/></span><h2>{gu ? 'પક્ષીનો ફોટો અહીં મૂકો' : 'Add a bird photo'}</h2><p>{gu ? 'ફોટો ખેંચીને અહીં મૂકો અથવા તમારા ડિવાઇસમાંથી પસંદ કરો.' : 'Drag a photo here, or choose one from your device.'}</p><button className="button button-secondary" onClick={() => inputRef.current?.click()}><ImagePlus size={16}/>{gu ? 'ફોટો પસંદ કરો' : 'Choose a photo'}</button><small>JPG · PNG · WebP · up to 10 MB</small></div>}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => chooseFile(event.target.files?.[0])}/>
          {previewUrl && <div className="photo-preview-actions"><span><CheckCircle2 size={14}/>{gu ? 'ફોટો તૈયાર છે' : 'Photo ready'}</span><button onClick={() => { setFile(null); setResult(null); setError(''); if (inputRef.current) inputRef.current.value = ''; }}><RotateCcw size={14}/>{gu ? 'બદલો' : 'Change photo'}</button></div>}
        </div>
        {error && <div className="photo-error" role="alert"><AlertCircle size={17}/><span>{error}</span></div>}
        <button className="button button-primary photo-identify-button" onClick={identifyPhoto} disabled={!file || loading}>{loading ? <><LoaderCircle size={17} className="spin"/>{gu ? 'AI ફોટો તપાસે છે…' : 'Analysing photo…'}</> : <><Sparkles size={17}/>{gu ? 'સ્થાનિક AI થી ઓળખો' : 'Identify with local AI'}<ArrowRight size={15}/></>}</button>
        <div className="photo-privacy-note"><ShieldCheck size={16}/><div><strong>{gu ? 'તમારો ફોટો તમારા કમ્પ્યુટર પર જ રહે છે' : 'Your photo stays on your computer'}</strong><p>{gu ? 'ફોટો localhost પરના backend પર મોકલાય છે, કોઈ cloud AI API પર નહીં. પ્રથમ વખત model download કરવા internet જરૂરી છે.' : 'The image is sent only to the local backend at localhost, not to a cloud AI API. An internet connection is needed to download the model the first time.'}</p></div></div>
      </div>

      <aside className="photo-result-column">
        {!result && !loading && <div className="photo-result-empty"><div className="photo-result-orbit"><Bird size={36}/><span/><span/></div><span className="eyebrow">{gu ? 'સંભવિત ઓળખ' : 'POSSIBLE IDENTIFICATION'}</span><h2>{gu ? 'પરિણામ અહીં દેખાશે' : 'Your result will appear here'}</h2><p>{gu ? 'સ્પષ્ટ ફોટો પસંદ કરો જેમાં પક્ષીનો આકાર અને રંગ દેખાય.' : 'Choose a clear photo where the bird shape and markings are visible.'}</p><div className="photo-tip"><Sparkles size={16}/><span>{gu ? 'શરીર, ચાંચ અને પૂંછડી સ્પષ્ટ દેખાતાં હોય તેવો ફોટો શ્રેષ્ઠ રહેશે.' : 'A side view with the body, beak, and tail visible is a useful starting point.'}</span></div></div>}
        {loading && <div className="photo-result-empty photo-result-loading"><LoaderCircle size={34} className="spin"/><h2>{gu ? 'ફોટો તપાસી રહ્યું છે…' : 'Looking at the photo…'}</h2><p>{gu ? 'પહેલી વાર model load થવામાં વધારે સમય લાગી શકે છે.' : 'The first run may take longer while the model loads.'}</p></div>}
        {result && <div className="photo-result-card"><div className="photo-result-header"><span className="result-label"><CheckCircle2 size={15}/>{gu ? 'AI સૂચન' : 'AI SUGGESTION'}</span><span className="photo-model-tag">{result.model || 'OpenAI CLIP'}</span></div>{top ? <><div className="photo-top-match"><div className="photo-top-bird-icon"><Bird size={23}/></div><div className="photo-top-copy"><span>{gu ? 'શ્રેષ્ઠ મેળ' : 'TOP MATCH'}</span><h2>{gu ? (top.gujarati_name || top.common_name) : top.common_name}</h2><em>{top.scientific_name || (gu ? 'વૈજ્ઞાનિક નામ ઉપલબ્ધ નથી' : 'Scientific name unavailable')}</em></div></div><div className="photo-match-score"><div><span>{gu ? 'શોર્ટલિસ્ટમાં સંબંધિત મેળ' : 'Relative match in shortlist'}</span><strong>{Math.round((top.score || 0) * 100)}%</strong></div><div className="photo-score-track"><span style={{ width: `${Math.min(100, Math.max(0, (top.score || 0) * 100))}%` }}/></div></div><div className="photo-candidates"><h3>{gu ? 'બીજા સંભવિત મેળ' : 'Other possible matches'}</h3>{result.candidates.slice(1, 5).map((candidate, index) => <div className="photo-candidate-row" key={`${candidate.common_name}-${index}`}><span className="photo-candidate-rank">{index + 2}</span><span className="photo-candidate-name"><strong>{gu ? (candidate.gujarati_name || candidate.common_name) : candidate.common_name}</strong><em>{candidate.scientific_name}</em></span><span className="photo-candidate-score">{Math.round((candidate.score || 0) * 100)}%</span></div>)}</div><div className="photo-result-warning"><AlertCircle size={16}/><p>{gu ? 'આ સામાન્ય vision model નો પ્રયોગાત્મક પરિણામ છે. સ્કોર આ યાદીના પક્ષીઓ વચ્ચેનો સંબંધિત સ્કોર છે—સાચી સંભાવના નહીં. પક્ષીની ઓળખ નિષ્ણાત માર્ગદર્શિકા સાથે ચકાસો.' : 'This is an experimental shortlist from a general vision-language model. Scores are relative across these labels, not calibrated probabilities. Verify the species with a trusted field guide; lookalike birds can be confused.'}</p></div><button className="button button-primary photo-save-button" onClick={() => { onSaveSighting?.(top); setSaved(true); }} disabled={saved || !onSaveSighting}>{saved ? <CheckCircle2 size={15}/> : <Bird size={15}/>} {saved ? (gu ? 'નોંધ સાચવી' : 'Saved to field journal') : (gu ? 'નોંધમાં સાચવો' : 'Save as a sighting')}</button></> : <div className="photo-no-match"><h2>{gu ? 'સ્પષ્ટ મેળ મળ્યો નથી' : 'No useful match found'}</h2><p>{result.message || (gu ? 'વધુ સ્પષ્ટ ફોટો અજમાવો.' : 'Try a clearer photo with the bird visible.')}</p></div>}<button className="button button-secondary photo-sound-link" onClick={onGoSound}><Mic size={15}/>{gu ? 'અવાજથી પણ ઓળખો' : 'Try sound identification'}<ArrowRight size={14}/></button></div>}
      </aside>
    </div>
    <div className="photo-model-note"><Sparkles size={16}/><p><strong>{gu ? 'Open-weight AI:' : 'Open-weight AI:'}</strong> {gu ? 'OpenAI CLIP image-text model સ્થાનિક inference માટે વપરાય છે. Model card તેની fine-grained ઓળખમાં મર્યાદા દર્શાવે છે, તેથી આ feature ને સહાયક અંદાજ તરીકે જ વાપરવું.' : 'This uses the open-weight OpenAI CLIP image-text model for local inference. Its model card notes fine-grained classification limitations, so treat results as a helper rather than a definitive species ID.'} <a href="https://huggingface.co/openai/clip-vit-base-patch32" target="_blank" rel="noreferrer">{gu ? 'Model card જુઓ' : 'View model card'}</a>.</p></div>
  </section>;
}
