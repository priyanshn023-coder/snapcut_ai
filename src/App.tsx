import { ChangeEvent, DragEvent, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  FileImage,
  History as HistoryIcon,
  Image as ImageIcon,
  LockKeyhole,
  Menu,
  MousePointer2,
  Play,
  RotateCcw,
  Scissors,
  Sparkles,
  Moon,
  Sun,
  Upload,
  X,
  Zap,
} from 'lucide-react';

const logoSrc = '/ChatGPT Image Aug 24, 2026, 03_40_08 PM.png';
const maxFileSize = 10 * 1024 * 1024;
const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];

type Page = 'home' | 'workspace' | 'history' | 'pricing' | 'login';
type UploadState = 'empty' | 'selected' | 'processing' | 'result';
type HistoryItem = { id: string; filename: string; createdAt: string; url: string };
const historyStorageKey = 'snapcut-history';
let currentOriginalPreview = '';

function getHistory(): HistoryItem[] {
  try { return JSON.parse(localStorage.getItem(historyStorageKey) || '[]') as HistoryItem[]; } catch { return []; }
}

function addHistoryItem(item: HistoryItem) {
  localStorage.setItem(historyStorageKey, JSON.stringify([item, ...getHistory()]));
}

const features = [
  { icon: MousePointer2, title: 'One click is all it takes', text: 'No brush tools or complicated settings. Upload, tap, and get a clean cutout.' },
  { icon: Sparkles, title: 'AI that sees the subject', text: 'Smart detection keeps people, products, and fine edges looking natural.' },
  { icon: FileImage, title: 'Transparent PNG output', text: 'Download a ready-to-use cutout for your store, campaign, or next design.' },
  { icon: Zap, title: 'Fast by design', text: 'A focused workflow gets you from upload to usable result in seconds.' },
];

const useCases = [
  ['E-commerce', 'Create clean product listings without a photo studio.'],
  ['Social media', 'Make scroll-stopping posts with subjects that pop.'],
  ['Marketing', 'Build campaign assets faster, from anywhere.'],
  ['Small business', 'Give every product a polished, professional finish.'],
  ['Graphic design', 'Drop isolated subjects straight into your next composition.'],
  ['Students', 'Finish presentations and projects without learning complex software.'],
];

const faqs = [
  ['How does SnapCut AI remove backgrounds?', 'Upload a JPG, PNG, or WEBP and our AI identifies the main subject, separates it from the background, and prepares a transparent PNG.'],
  ['Which image formats are supported?', 'SnapCut AI supports JPG, JPEG, PNG, and WEBP files up to 10 MB.'],
  ['Are my images stored permanently?', 'No. Images are handled for processing and are not intended to be stored permanently.'],
  ['Is there a free plan?', 'Yes. The free plan includes three background removals per day. Paid plans and credits can extend your usage.'],
  ['Can I download transparent PNGs?', 'Yes. Every completed result is prepared as a transparent PNG for download.'],
];

function App() {
  const [page, setPage] = useState<Page>(() => getPageFromPath());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('snapcut-theme') === 'dark');

  const toggleDarkMode = () => setDarkMode((enabled) => {
    const nextValue = !enabled;
    localStorage.setItem('snapcut-theme', nextValue ? 'dark' : 'light');
    return nextValue;
  });

  const navigate = (nextPage: Page) => {
    const path = nextPage === 'home' ? '/' : `/${nextPage === 'workspace' ? 'remove-background' : nextPage}`;
    window.history.pushState({}, '', path);
    setPage(nextPage);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useMemo(() => {
    const onPopState = () => setPage(getPageFromPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-[#f8faff] text-[#101a3a]`}>
      <Navbar page={page} navigate={navigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      {page === 'workspace' ? <Workspace navigate={navigate} /> : page === 'history' ? <History /> : page === 'pricing' ? <Pricing navigate={navigate} /> : page === 'login' ? <Login navigate={navigate} /> : <Home navigate={navigate} />}
      {page !== 'workspace' && page !== 'history' && page !== 'login' && <Footer navigate={navigate} />}
    </div>
  );
}

function getPageFromPath(): Page {
  if (window.location.pathname === '/remove-background') return 'workspace';
  if (window.location.pathname === '/history') return 'history';
  if (window.location.pathname === '/pricing') return 'pricing';
  if (window.location.pathname === '/login') return 'login';
  return 'home';
}

function Navbar({ page, navigate, mobileOpen, setMobileOpen, darkMode, toggleDarkMode }: { page: Page; navigate: (page: Page) => void; mobileOpen: boolean; setMobileOpen: (open: boolean) => void; darkMode: boolean; toggleDarkMode: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e5e7f2]/80 bg-[#f8faff]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <button aria-label="SnapCut AI home" onClick={() => navigate('home')} className="flex h-14 w-[142px] items-center overflow-hidden">
          <img src={logoSrc} alt="SnapCut AI" className="h-[92px] w-full object-contain" />
        </button>
        <nav className="hidden items-center gap-8 lg:flex">
          <a href="#how-it-works" className="nav-link">How it works</a>
          <a href="#features" className="nav-link">Features</a>
          <button className={`nav-link ${page === 'pricing' ? 'text-[#5b2dff]' : ''}`} onClick={() => navigate('pricing')}>Pricing</button>
          <button className={`nav-link flex items-center gap-1.5 ${page === 'history' ? 'text-[#5b2dff]' : ''}`} onClick={() => navigate('history')}><HistoryIcon size={15} /> History</button>
          <a href="#faq" className="nav-link">FAQ</a>
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <button aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleDarkMode} className="theme-toggle">{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button>
          <button className="button-ghost" onClick={() => navigate('login')}>Log in</button>
          <button className="button-primary px-5" onClick={() => navigate('workspace')}>Get started <ArrowRight size={16} /></button>
        </div>
        <button aria-label="Toggle navigation" onClick={() => setMobileOpen(!mobileOpen)} className="rounded-xl p-2 text-[#101a3a] hover:bg-white lg:hidden">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="border-t border-[#e5e7f2] bg-white px-5 py-5 lg:hidden">
          <div className="flex flex-col gap-4 text-sm font-semibold">
            <a href="#how-it-works" onClick={() => setMobileOpen(false)}>How it works</a>
            <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
            <button className="text-left" onClick={() => navigate('pricing')}>Pricing</button>
            <button className="flex items-center gap-2 text-left" onClick={() => navigate('history')}><HistoryIcon size={16} /> History</button>
            <a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
            <div className="flex items-center gap-3 border-t border-[#e5e7f2] pt-4"><button aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleDarkMode} className="theme-toggle">{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button><button className="button-ghost" onClick={() => navigate('login')}>Log in</button><button className="button-primary flex-1" onClick={() => navigate('workspace')}>Get started <ArrowRight size={16} /></button></div>
          </div>
        </div>
      )}
    </header>
  );
}

function Home({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <main>
      <section className="hero-shell overflow-hidden">
        <div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 pb-24 pt-16 sm:px-8 lg:grid-cols-[.92fr_1.08fr] lg:pb-32 lg:pt-24">
          <div className="relative z-10 max-w-2xl">
            <h1 className="display-heading mt-6">Remove backgrounds <span className="gradient-text">in one click.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5d6681] sm:text-xl">Upload an image and let AI automatically remove the background in seconds. Clean cutouts, ready for wherever your idea goes next.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><button className="button-primary px-6 py-4 text-base" onClick={() => navigate('workspace')}>Remove background <ArrowRight size={18} /></button><a href="#how-it-works" className="button-secondary px-6 py-4 text-base">See how it works <Play size={16} fill="currentColor" /></a></div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#69738f]"><span className="flex items-center gap-2"><Check size={16} className="text-[#16a4a2]" /> No design skills needed</span><span className="flex items-center gap-2"><Check size={16} className="text-[#16a4a2]" /> PNG-ready results</span></div>
          </div>
          <DemoCard />
        </div>
      </section>
      <TrustStrip />
      <HowItWorks />
      <Features />
      <UseCases />
      <Comparison />
      <FAQ />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24"><div className="cta-panel"><div className="relative z-10 max-w-2xl"><div className="eyebrow eyebrow-light"><Sparkles size={14} /> Start with a clean canvas</div><h2 className="section-heading mt-5 text-white">Ready to remove your first background?</h2><p className="mt-4 text-base leading-7 text-white/70">Turn one image into a polished asset in a few seconds.</p><button className="button-white mt-8" onClick={() => navigate('workspace')}>Remove background <ArrowRight size={17} /></button></div><div className="cta-grid" /></div></section>
    </main>
  );
}

function DemoCard() {
  return <div className="relative mx-auto w-full max-w-[580px] lg:ml-auto"><div className="demo-card"><div className="flex items-center justify-between border-b border-[#e7eaf3] px-5 py-4"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#16c8e8]" /><span className="text-xs font-bold uppercase tracking-[.16em] text-[#77809a]">Live preview</span></div><span className="rounded-full bg-[#edf8f8] px-3 py-1 text-xs font-semibold text-[#157d80]">AI ready</span></div><div className="grid grid-cols-2 gap-3 p-4"><div className="demo-photo demo-photo-before"><span>Before</span><div className="demo-bottle" /></div><div className="demo-photo checkerboard"><span>After</span><div className="demo-bottle clean" /></div></div><div className="flex items-center justify-between px-5 pb-5 pt-2"><div><p className="text-sm font-bold">Product-shot.png</p><p className="mt-1 text-xs text-[#7e879e]">Transparent PNG · 2048 × 2048</p></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0edff] text-[#5b2dff]"><Download size={18} /></div></div></div><div className="float-note note-one"><Scissors size={15} /> <span>Edges kept clean</span></div><div className="float-note note-two"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#16c8e8] text-white"><Check size={12} /></span><span>Ready to use</span></div></div>;
}

function TrustStrip() { return <div className="border-y border-[#e5e7f2] bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 py-5 text-sm font-semibold text-[#7a849d] sm:px-8"><span className="flex items-center gap-2"><LockKeyhole size={16} /> Secure temporary processing</span><span className="hidden h-4 w-px bg-[#dfe3ee] sm:block" /><span className="flex items-center gap-2"><Clock3 size={16} /> Built for speed</span><span className="hidden h-4 w-px bg-[#dfe3ee] sm:block" /><span className="flex items-center gap-2"><ImageIcon size={16} /> JPG · PNG · WEBP</span></div></div> }

function HowItWorks() { return <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28"><div className="max-w-2xl"><p className="kicker">How it works</p><h2 className="section-heading mt-3">From image to cutout, without the learning curve.</h2><p className="mt-5 text-lg leading-8 text-[#69738f]">A focused three-step workflow that keeps your attention on the image, not the software.</p></div><div className="mt-14 grid gap-5 md:grid-cols-3">{[['01','Upload','Choose or drag your image into the workspace.'],['02','AI removes the background','SnapCut detects the subject and separates it cleanly.'],['03','Download','Preview the result and download your transparent PNG.']].map(([num,title,text]) => <div className="step-card" key={num}><span className="step-number">{num}</span><div className="mt-14 h-px w-full bg-[#e6e9f2]" /><h3 className="mt-6 text-xl font-bold tracking-tight">{title}</h3><p className="mt-3 leading-7 text-[#6b748d]">{text}</p><ChevronRight className="mt-8 text-[#b5bdd0]" size={19} /></div>)}</div></section> }

function Features() { return <section id="features" className="bg-white py-20 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="text-center"><p className="kicker">Made for the moment</p><h2 className="section-heading mt-3">Everything you need. Nothing you don't.</h2></div><div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{features.map(({icon: Icon,title,text}) => <div className="feature-card" key={title}><div className="icon-box"><Icon size={20} /></div><h3 className="mt-6 text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-[#6d7690]">{text}</p></div>)}</div></div></section> }

function UseCases() { return <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div className="max-w-2xl"><p className="kicker">Built for your workflow</p><h2 className="section-heading mt-3">One clean cutout. Countless ways to use it.</h2></div><p className="max-w-sm text-base leading-7 text-[#69738f]">Whether you sell, design, teach, or create, start with a subject that stands on its own.</p></div><div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{useCases.map(([title,text], index) => <div className="use-case" key={title}><span className="text-xs font-bold tracking-[.16em] text-[#a2abc0]">0{index + 1}</span><h3 className="mt-12 text-lg font-bold">{title}</h3><p className="mt-2 max-w-[240px] text-sm leading-6 text-[#6d7690]">{text}</p><ArrowRight size={17} className="mt-7 text-[#5b2dff]" /></div>)}</div></section> }

function Comparison() { const [position, setPosition] = useState(53); return <section className="bg-[#101a3a] py-20 sm:py-28"><div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[.82fr_1.18fr]"><div><p className="kicker text-[#8feaf1]">See the difference</p><h2 className="section-heading mt-3 text-white">Give your subject the spotlight.</h2><p className="mt-5 text-lg leading-8 text-white/65">Drag the slider to see how a busy image becomes a flexible, transparent asset.</p><div className="mt-8 flex items-start gap-3 text-sm leading-6 text-white/60"><Check className="mt-1 shrink-0 text-[#16c8e8]" size={17} /> Keep the original visual quality while removing distractions.</div></div><div className="comparison-wrap"><div className="comparison-base checkerboard"><div className="comparison-subject" /><span className="comparison-label right">After</span></div><div className="comparison-before" style={{ width: `${position}%` }}><div className="comparison-scene"><div className="comparison-subject" /></div><span className="comparison-label left">Before</span></div><input aria-label="Before and after comparison" type="range" min="8" max="92" value={position} onChange={(event) => setPosition(Number(event.target.value))} className="comparison-range" /><div className="comparison-handle" style={{ left: `${position}%` }}><ChevronRight size={14} /><ChevronRight size={14} /></div></div></div></section> }

function FAQ() { const [open, setOpen] = useState(0); return <section id="faq" className="mx-auto max-w-4xl px-5 py-20 sm:px-8 lg:py-28"><div className="text-center"><p className="kicker">FAQ</p><h2 className="section-heading mt-3">Questions, answered clearly.</h2></div><div className="mt-12 border-t border-[#e2e6f0]">{faqs.map(([question,answer], index) => <div className="border-b border-[#e2e6f0]" key={question}><button className="flex w-full items-center justify-between gap-6 py-6 text-left text-base font-bold" onClick={() => setOpen(open === index ? -1 : index)}><span>{question}</span><ChevronDown className={`shrink-0 text-[#8992a8] transition-transform ${open === index ? 'rotate-180' : ''}`} size={19} /></button>{open === index && <p className="max-w-3xl pb-6 pr-8 text-sm leading-7 text-[#6b748d]">{answer}</p>}</div>)}</div></section> }

function Workspace({ navigate }: { navigate: (page: Page) => void }) { const [state, setState] = useState<UploadState>('empty'); const [file, setFile] = useState<File | null>(null); const [originalPreview, setOriginalPreview] = useState(''); const [preview, setPreview] = useState(''); const [error, setError] = useState(''); const inputRef = useRef<HTMLInputElement>(null);
  const chooseFile = (candidate: File | undefined) => { if (!candidate) return; setError(''); if (!acceptedTypes.includes(candidate.type)) { setError('Please choose a JPG, PNG, or WEBP image.'); return; } if (candidate.size > maxFileSize) { setError('That image is larger than 10 MB. Choose a smaller file to continue.'); return; } const originalUrl = URL.createObjectURL(candidate); currentOriginalPreview = originalUrl; setFile(candidate); setOriginalPreview(originalUrl); setPreview(originalUrl); setState('selected'); };
  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); chooseFile(event.dataTransfer.files[0]); };
  const reset = () => { setFile(null); setOriginalPreview(''); setPreview(''); setError(''); setState('empty'); if (inputRef.current) inputRef.current.value = ''; };
  const process = async () => { if (!file) return; setError(''); setState('processing'); try { const response = await fetch('https://priyansh-23.app.n8n.cloud/webhook/remove-background', { method: 'POST', headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-File-Name': encodeURIComponent(file.name) }, body: file }); if (!response.ok) throw new Error(`Webhook returned ${response.status}`); const result = await response.json() as { url?: unknown }; if (typeof result.url !== 'string' || !result.url) throw new Error('Webhook response did not include a valid image URL.'); addHistoryItem({ id: crypto.randomUUID(), filename: file.name, createdAt: new Date().toISOString(), url: result.url }); setPreview(result.url); setState('result'); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Could not remove the background. Please try again.'); setState('selected'); } };
  return <main className="workspace-bg min-h-[calc(100vh-76px)]"><div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16"><div className="mx-auto max-w-2xl text-center"><div className="eyebrow justify-center"><Sparkles size={14} /> Background remover</div><h1 className="mt-5 text-4xl font-extrabold tracking-[-.04em] sm:text-5xl">Make the background disappear.</h1><p className="mt-4 text-base leading-7 text-[#6b748d]">Upload an image and get a clean, transparent cutout ready to download.</p></div><div className="mx-auto mt-10 max-w-4xl">{state === 'empty' && <div onDrop={onDrop} onDragOver={(event) => event.preventDefault()} className="upload-zone" onClick={() => inputRef.current?.click()}><input ref={inputRef} className="hidden" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(event: ChangeEvent<HTMLInputElement>) => chooseFile(event.target.files?.[0])} /><div className="upload-icon"><Upload size={25} /></div><h2 className="mt-6 text-xl font-bold">Drop your image here</h2><p className="mt-2 text-sm text-[#707a94]">or <span className="font-bold text-[#5b2dff]">click to browse</span></p><p className="mt-7 text-xs font-semibold text-[#9199ab]">JPG, JPEG, PNG, WEBP <span className="mx-2 text-[#d2d6e0]">·</span> Up to 10 MB</p><p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#8b94a9]"><LockKeyhole size={13} /> Your image is processed securely</p></div>}{state === 'selected' && <SelectedFile file={file} preview={preview} reset={reset} process={process} />}{state === 'processing' && <Processing preview={preview} />}{state === 'result' && <Result preview={preview} reset={reset} navigate={navigate} />} {error && <div role="alert" className="mx-auto mt-4 flex max-w-xl items-center gap-3 rounded-xl border border-[#f4c8d2] bg-[#fff5f7] px-4 py-3 text-sm font-semibold text-[#b4234d]"><CircleHelp size={17} />{error}</div>}<p className="mt-7 text-center text-xs text-[#8992a8]">By uploading, you agree that your image is used only to provide the requested processing.</p></div><div className="mx-auto mt-16 grid max-w-3xl gap-4 border-t border-[#e4e7f0] pt-8 sm:grid-cols-3"><div className="flex gap-3"><div className="mini-icon"><Check size={15} /></div><div><p className="text-sm font-bold">Instant preview</p><p className="mt-1 text-xs leading-5 text-[#7b859d]">See your result before downloading.</p></div></div><div className="flex gap-3"><div className="mini-icon"><LockKeyhole size={15} /></div><div><p className="text-sm font-bold">Private by design</p><p className="mt-1 text-xs leading-5 text-[#7b859d]">Temporary processing, no permanent gallery.</p></div></div><div className="flex gap-3"><div className="mini-icon"><Download size={15} /></div><div><p className="text-sm font-bold">Transparent PNG</p><p className="mt-1 text-xs leading-5 text-[#7b859d]">Ready for your next project.</p></div></div></div></div></main> }

function SelectedFile({ file, preview, reset, process }: { file: File | null; preview: string; reset: () => void; process: () => void }) { return <div className="workspace-card p-4 sm:p-6"><div className="grid gap-6 md:grid-cols-[1fr_280px] md:items-center"><div className="preview-frame"><img src={preview} alt="Selected preview" /></div><div><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold">{file?.name}</p><p className="mt-1 text-xs text-[#7c859d]">{file ? formatBytes(file.size) : ''}</p></div><button aria-label="Remove selected image" onClick={reset} className="rounded-lg p-1.5 text-[#8b94a8] hover:bg-[#f0f2f8] hover:text-[#101a3a]"><X size={18} /></button></div><button className="button-primary mt-8 w-full py-3.5" onClick={process}>Remove background <ArrowRight size={17} /></button><button className="mt-3 flex w-full items-center justify-center gap-2 py-2 text-sm font-bold text-[#6b748d] hover:text-[#5b2dff]" onClick={reset}><RotateCcw size={15} /> Choose another image</button></div></div></div> }

function Processing({ preview }: { preview: string }) { return <div className="workspace-card p-4 sm:p-6"><div className="grid gap-6 md:grid-cols-2 md:items-center"><div className="preview-frame processing-frame"><img src={preview} alt="Image being processed" /><div className="processing-sheen" /></div><div className="py-4 md:px-5"><div className="processing-pulse"><Sparkles size={18} /></div><h2 className="mt-5 text-xl font-bold">Creating your cutout</h2><p className="mt-2 text-sm leading-6 text-[#6b748d]">Our AI is detecting the subject and carefully removing the background.</p><div className="mt-7 space-y-3 text-sm font-semibold"><div className="flex items-center gap-3 text-[#5b2dff]"><span className="loader-dot" /> Detecting subject...</div><div className="flex items-center gap-3 text-[#7d879f]"><span className="h-2 w-2 rounded-full bg-[#d5d9e5]" /> Removing background</div><div className="flex items-center gap-3 text-[#a1a8b9]"><span className="h-2 w-2 rounded-full bg-[#e2e5ed]" /> Preparing result</div></div></div></div></div> }

function Result({ originalPreview = currentOriginalPreview, preview, reset, navigate }: { originalPreview?: string; preview: string; reset: () => void; navigate: (page: Page) => void }) {
  const [saved, setSaved] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const downloadImage = async () => { try { setDownloadError(''); const response = await fetch(preview); if (!response.ok) throw new Error('Download failed.'); const blob = await response.blob(); const downloadUrl = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = downloadUrl; link.download = 'snapcut-result.png'; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(downloadUrl); } catch { setDownloadError('Could not download the image. Please try again.'); } };
  const recordJob = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaved(true); return; }
    await supabase.from('processing_jobs').insert({ original_filename: 'workspace-upload', input_format: 'image/png', input_size: 0, status: 'completed', provider: 'demo', processing_duration: 1 });
    await supabase.from('usage').upsert({ user_id: user.id, usage_date: new Date().toISOString().slice(0, 10), images_processed: 1 }, { onConflict: 'user_id,usage_date' });
    setSaved(true);
  };
  if (!saved) recordJob();
  return <div className="workspace-card p-4 sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#16b8a7]" /><p className="text-sm font-bold text-[#168576]">Background removed</p></div><h2 className="mt-2 text-2xl font-bold">Your cutout is ready.</h2></div><button className="text-sm font-bold text-[#69738f] hover:text-[#5b2dff]" onClick={reset}>Remove another</button></div><div className="mt-6 grid gap-4 md:grid-cols-2"><div className="result-pane"><span className="result-label">Before</span><img src={originalPreview} alt="Original uploaded image" /></div><div className="result-pane checkerboard"><span className="result-label">After</span><img src={preview} alt="Processed transparent result" className="result-cutout" /></div></div><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button className="button-secondary" onClick={() => navigate('home')}>Back to home</button><button className="button-primary" onClick={downloadImage}>Download PNG <Download size={17} /></button></div>{downloadError && <p role="alert" className="mt-4 text-center text-sm font-semibold text-[#b4234d]">{downloadError}</p>}<p className="mt-5 text-center text-xs text-[#8b94a8]">Your processed image is saved in local history.</p></div> }

function History() {
  const [items, setItems] = useState<HistoryItem[]>(getHistory);
  const [error, setError] = useState('');
  const downloadImage = async (url: string) => { try { setError(''); const response = await fetch(url); if (!response.ok) throw new Error(); const blob = await response.blob(); const downloadUrl = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = downloadUrl; link.download = 'snapcut-result.png'; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(downloadUrl); } catch { setError('Could not download the image. Please try again.'); } };
  const clearHistory = () => { localStorage.removeItem(historyStorageKey); setItems([]); };
  return <main className="workspace-bg min-h-[calc(100vh-76px)]"><div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="eyebrow"><HistoryIcon size={14} /> Local history</div><h1 className="mt-5 text-4xl font-extrabold tracking-[-.04em] sm:text-5xl">Your cutouts.</h1><p className="mt-4 text-base leading-7 text-[#6b748d]">Every background removal stays available on this device.</p></div>{items.length > 0 && <button className="button-secondary self-start sm:self-auto" onClick={clearHistory}>Clear history</button>}</div>{error && <p role="alert" className="mt-5 text-sm font-semibold text-[#b4234d]">{error}</p>}{items.length === 0 ? <div className="workspace-card mt-10 flex min-h-[300px] flex-col items-center justify-center p-8 text-center"><div className="upload-icon"><HistoryIcon size={25} /></div><h2 className="mt-6 text-xl font-bold">No processed images yet</h2><p className="mt-2 text-sm text-[#707a94]">Your completed background removals will appear here.</p></div> : <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map(item => <article className="workspace-card overflow-hidden" key={item.id}><div className="result-pane checkerboard min-h-[250px] rounded-none"><img src={item.url} alt={`Processed ${item.filename}`} className="result-cutout max-h-[250px]" /></div><div className="p-4"><p className="truncate text-sm font-bold" title={item.filename}>{item.filename}</p><p className="mt-1 text-xs text-[#7c859d]">{new Date(item.createdAt).toLocaleString()}</p><button className="button-primary mt-4 w-full" onClick={() => downloadImage(item.url)}>Download PNG <Download size={16} /></button></div></article>)}</div>}</div></main> }

function Pricing({ navigate }: { navigate: (page: Page) => void }) { return <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24"><div className="mx-auto max-w-2xl text-center"><p className="kicker">Simple plans</p><h1 className="section-heading mt-3">Start free. Scale when you need to.</h1><p className="mt-5 text-lg leading-8 text-[#69738f]">Choose the level of background removal that fits your workflow. Pricing can be configured for your market.</p></div><div className="mx-auto mt-14 grid max-w-5xl gap-5 lg:grid-cols-3">{[['Free','For trying the workflow',['3 removals per day','Standard processing','Transparent PNG']],['Pro','For creators and sellers',['Higher usage limits','Faster processing','Priority support']],['Business','For teams with volume',['Large usage limits','Priority processing','API-ready architecture']]].map(([name,desc,items], index) => <div className={`price-card ${index === 1 ? 'price-featured' : ''}`} key={name as string}>{index === 1 && <span className="popular-tag">Most flexible</span>}<p className="text-sm font-bold text-[#5b2dff]">{name}</p><h2 className="mt-5 text-2xl font-bold">{desc}</h2><div className="my-8 h-px bg-[#e7eaf2]" />{(items as string[]).map(item => <p className="mb-4 flex items-center gap-3 text-sm text-[#606a84]" key={item}><Check size={16} className="text-[#16a4a2]" />{item}</p>)}<button className={index === 1 ? 'button-primary mt-8 w-full' : 'button-secondary mt-8 w-full'} onClick={() => navigate('workspace')}>{index === 0 ? 'Try for free' : 'Get started'} <ArrowRight size={16} /></button></div>)}</div><p className="mt-8 text-center text-sm text-[#8a93a8]">No fake discounts. Payment options will be available when billing is connected.</p></main> }

function Login({ navigate }: { navigate: (page: Page) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const result = mode === 'login' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (result.error) { setMessage(result.error.message); return; }
    if (mode === 'signup') { setMessage('Account created. You can now use your workspace.'); }
    navigate('workspace');
  };
  return <main className="flex min-h-[calc(100vh-76px)] items-center justify-center px-5 py-12"><div className="auth-card"><div className="mx-auto flex h-14 w-24 items-center overflow-hidden"><img src={logoSrc} alt="SnapCut AI" className="h-20 w-full object-contain" /></div><h1 className="mt-7 text-center text-2xl font-bold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1><p className="mt-2 text-center text-sm text-[#6f7891]">{mode === 'login' ? 'Sign in to keep your workspace and usage together.' : 'Start with a free workspace and three daily removals.'}</p><form className="mt-8 space-y-4" onSubmit={submit}><label className="field-label">Email<input className="field-input" value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" required /></label><label className="field-label">Password<input className="field-input" value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="At least 6 characters" minLength={6} required /></label>{message && <p role="alert" className="rounded-lg bg-[#fff5f7] px-3 py-2 text-sm text-[#b4234d]">{message}</p>}<button className="button-primary w-full py-3.5" type="submit" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'} {!busy && <ArrowRight size={17} />}</button></form><p className="mt-7 text-center text-sm text-[#747d94]">{mode === 'login' ? 'New to SnapCut?' : 'Already have an account?'} <button className="font-bold text-[#5b2dff]" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Create an account' : 'Log in'}</button></p><button className="mt-4 block w-full text-center text-sm font-semibold text-[#747d94] hover:text-[#5b2dff]" onClick={() => navigate('workspace')}>Continue without an account</button></div></main>
}

function Footer({ navigate }: { navigate: (page: Page) => void }) { return <footer className="border-t border-[#e5e7f2] bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between"><div><button onClick={() => navigate('home')} className="flex h-12 w-32 items-center overflow-hidden"><img src={logoSrc} alt="SnapCut AI" className="h-20 w-full object-contain" /></button><p className="mt-3 max-w-xs text-sm leading-6 text-[#7b849b]">One focused tool for clean, confident image cutouts.</p></div><div className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-[#69738f]"><button onClick={() => navigate('workspace')}>Remove background</button><button onClick={() => navigate('pricing')}>Pricing</button><a href="#faq">FAQ</a><a href="#features">Features</a></div><p className="text-xs text-[#9aa2b3]">© 2026 SnapCut AI</p></div></footer> }

function formatBytes(bytes: number) { if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`; return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }

export default App;
