
import React, { useState } from 'react';
import { VocabItem, ScriptOutput, RelatedSuggestion } from './types';
import { 
  generateVideoScript, 
  analyzeImageThemes, 
  generateVocabFromContext,
  ThemeSuggestion 
} from './services/geminiService';
import { 
  Camera, 
  Trash2, 
  Sparkles, 
  Image as ImageIcon, 
  Loader2, 
  Languages,
  Clock,
  Mic2,
  Film,
  Lightbulb,
  ArrowRight,
  Monitor,
  Copy,
  ClipboardCheck,
  Type as FontIcon,
  Zap,
  Layout,
  Heart,
  Baby,
  Star,
  Sun,
  Cloud,
  Palette
} from 'lucide-react';

const App: React.FC = () => {
  const [vocabList, setVocabList] = useState<VocabItem[]>(Array(5).fill({ vi: '', en: '', ipa: '', sentence: '' }));
  const [context, setContext] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loadingScript, setLoadingScript] = useState(false);
  const [loadingVocab, setLoadingVocab] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [themeSuggestions, setThemeSuggestions] = useState<ThemeSuggestion[]>([]);
  const [result, setResult] = useState<ScriptOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleVocabChange = (index: number, field: keyof VocabItem, value: string) => {
    const newList = [...vocabList];
    newList[index] = { ...newList[index], [field]: value };
    setVocabList(newList);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImage(base64);
        setAnalyzingImage(true);
        setError(null);
        try {
          const themes = await analyzeImageThemes(base64);
          setThemeSuggestions(themes);
        } catch (err: any) {
          setError("Bạn ơi, ảnh này hơi khó xem một chút, thử lại nhé!");
        } finally {
          setAnalyzingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVocab = async () => {
    if (!context) {
      setError("Hãy chọn chủ đề hoặc nhập ý tưởng của bạn vào ô 'Bối cảnh' nhé!");
      return;
    }
    setLoadingVocab(true);
    setError(null);
    try {
      const vocabs = await generateVocabFromContext(context, image || undefined);
      setVocabList(vocabs);
    } catch (err: any) {
      setError("Có lỗi khi tạo từ vựng rồi, hãy thử lại bạn nhé!");
    } finally {
      setLoadingVocab(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!vocabList.some(v => v.en)) {
      setError("Vui lòng nhập từ vựng trước khi tạo kịch bản nha!");
      return;
    }
    setLoadingScript(true);
    setError(null);
    try {
      const script = await generateVideoScript(vocabList, context, image || undefined);
      setResult(script);
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err: any) {
      setError("Kịch bản đang gặp chút trục trặc, hãy thử lại xem sao!");
    } finally {
      setLoadingScript(false);
    }
  };

  const applyTheme = (theme: ThemeSuggestion | RelatedSuggestion) => {
    setContext(theme.context);
    setResult(null);
  };

  return (
    <div className="min-h-screen pb-24 selection:bg-pink-200">
      {/* Playful Floating Elements */}
      <div className="fixed top-20 left-10 text-yellow-300 opacity-20 animate-pulse pointer-events-none">
        <Sun size={120} />
      </div>
      <div className="fixed bottom-20 right-10 text-blue-300 opacity-20 animate-bounce pointer-events-none">
        <Cloud size={100} />
      </div>

      <header className="bg-white/80 backdrop-blur-md border-b-8 border-yellow-300 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-pink-500 p-4 rounded-3xl text-white shadow-xl shadow-pink-100 -rotate-6 transform hover:rotate-0 transition-all cursor-pointer">
              <Baby size={32} />
            </div>
            <div>
              <h1 className="font-playful font-black text-3xl text-indigo-900 tracking-tight leading-none">Ms Ly AI</h1>
              <span className="text-[11px] font-black text-pink-500 uppercase tracking-[0.3em] mt-2 block">Kịch Bản Học Tiếng Anh</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleGenerateVocab}
              disabled={loadingVocab || !context}
              className="bg-white border-4 border-yellow-200 hover:border-yellow-400 text-indigo-900 px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 active:scale-95"
            >
              {loadingVocab ? <Loader2 className="animate-spin" size={18} /> : <Palette size={18} className="text-yellow-500" />}
              TẠO TỪ VỰNG
            </button>
            <button
              onClick={handleGenerateScript}
              disabled={loadingScript || !vocabList[0].en}
              className="bg-pink-500 hover:bg-pink-600 disabled:bg-slate-300 text-white px-10 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-xl shadow-pink-100 active:scale-95"
            >
              {loadingScript ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
              XUẤT KỊCH BẢN
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-10">
          {/* Step 1: Image Reference */}
          <section className="child-card p-10 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 bg-blue-50 w-32 h-32 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="bg-blue-500 p-3 rounded-2xl text-white">
                <Camera size={20} />
              </div>
              <h2 className="font-playful font-black text-lg text-indigo-900 tracking-tight">1. Hình ảnh Mẹ & Bé</h2>
            </div>
            
            {image ? (
              <div className="relative h-80 rounded-[2.5rem] overflow-hidden shadow-inner ring-8 ring-blue-50 group">
                <img src={image} alt="Ref" className="w-full h-full object-cover" />
                <button onClick={() => {setImage(null); setThemeSuggestions([]);}} className="absolute top-5 right-5 bg-white/95 p-4 rounded-full text-red-500 shadow-2xl hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={24} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-80 rounded-[2.5rem] border-8 border-dashed border-blue-50 hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer group">
                <div className="bg-blue-50 p-6 rounded-3xl mb-4 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                  <ImageIcon className="text-blue-300 group-hover:text-blue-500" size={48} />
                </div>
                <span className="font-playful font-bold text-slate-500 text-sm">Tải ảnh đại diện Mẹ & Bé</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            )}

            {analyzingImage && (
              <div className="mt-8 flex items-center justify-center gap-3 text-indigo-500 font-bold animate-bounce">
                <Loader2 className="animate-spin" size={20} />
                <span>AI Đang ngắm ảnh...</span>
              </div>
            )}

            {themeSuggestions.length > 0 && (
              <div className="mt-10 space-y-4">
                <p className="font-playful font-black text-pink-500 text-sm flex items-center gap-2">
                  <Sparkles size={16} fill="currentColor" /> Chủ đề gợi ý cho bạn:
                </p>
                <div className="space-y-3">
                  {themeSuggestions.map((s, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => applyTheme(s)} 
                      className={`w-full text-left px-8 py-5 rounded-3xl text-sm font-bold border-4 transition-all transform active:scale-95 ${
                        context === s.context 
                        ? 'bg-blue-500 text-white border-blue-500 shadow-xl shadow-blue-100' 
                        : 'bg-white text-slate-600 border-blue-50 hover:border-blue-200'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Step 2: Context */}
          <section className="child-card p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-yellow-400 p-3 rounded-2xl text-white">
                <Layout size={20} />
              </div>
              <h2 className="font-playful font-black text-lg text-indigo-900 tracking-tight">2. Bối cảnh bài học</h2>
            </div>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Ví dụ: Bé và mẹ đi siêu thị, Bé tập làm bánh..."
              className="w-full h-32 p-8 rounded-[2.5rem] bg-yellow-50/50 border-none focus:ring-8 focus:ring-yellow-400/20 transition-all font-bold text-sm resize-none placeholder:text-slate-400"
            />
          </section>

          {/* Step 3: Vocab */}
          <section className="child-card p-10 relative">
             {loadingVocab && (
               <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center rounded-[3rem] backdrop-blur-md">
                 <Loader2 className="animate-spin text-pink-500 mb-4" size={50} />
                 <span className="font-playful font-black text-pink-500">Đang soạn bài học...</span>
               </div>
             )}
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-green-400 p-3 rounded-2xl text-white">
                <Languages size={20} />
              </div>
              <h2 className="font-playful font-black text-lg text-indigo-900 tracking-tight">3. Danh sách từ mới</h2>
            </div>
            <div className="space-y-6">
              {vocabList.map((v, i) => (
                <div key={i} className="p-6 rounded-[2.5rem] bg-slate-50/80 border-4 border-slate-50 hover:bg-white hover:border-green-100 transition-all space-y-4 group">
                  <div className="flex gap-4">
                    <input 
                      placeholder="English" 
                      value={v.en} 
                      onChange={(e) => handleVocabChange(i, 'en', e.target.value)} 
                      className="flex-1 text-sm p-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-green-400 outline-none font-black text-green-600 shadow-sm" 
                    />
                    <input 
                      placeholder="Nghĩa" 
                      value={v.vi} 
                      onChange={(e) => handleVocabChange(i, 'vi', e.target.value)} 
                      className="flex-1 text-sm p-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-green-400 outline-none font-bold text-slate-700 shadow-sm" 
                    />
                  </div>
                  <input 
                    placeholder="Câu ví dụ ngắn..." 
                    value={v.sentence} 
                    onChange={(e) => handleVocabChange(i, 'sentence', e.target.value)} 
                    className="w-full text-xs p-4 rounded-2xl bg-white border-2 border-slate-100 text-slate-500 shadow-sm" 
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-8" id="result-section">
          {error && (
            <div className="bg-red-100 border-4 border-white text-red-600 px-10 py-6 rounded-[3rem] mb-12 flex items-center justify-between shadow-2xl animate-bounce">
              <div className="flex items-center gap-4">
                <div className="bg-red-500 text-white p-2 rounded-full"><Star size={16} fill="currentColor" /></div>
                <p className="font-playful font-black text-lg">{error}</p>
              </div>
              <button onClick={() => setError(null)}><Trash2 className="rotate-45" size={32} /></button>
            </div>
          )}

          {result ? (
            <div className="space-y-20 animate-in fade-in slide-in-from-bottom-20 duration-1000">
              {/* Project Title Card */}
              <div className="bg-indigo-900 text-white p-20 rounded-[5rem] shadow-[0_40px_100px_-20px_rgba(49,46,129,0.3)] relative overflow-hidden ring-[16px] ring-white">
                <div className="absolute -top-20 -right-20 p-20 opacity-20 rotate-12 transition-transform duration-1000 group-hover:rotate-45 pointer-events-none">
                  <Sparkles size={300} />
                </div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 bg-pink-500/90 px-8 py-3 rounded-full mb-10 shadow-lg">
                    <Star size={20} fill="#fff" className="text-white" />
                    <span className="font-playful font-black text-sm uppercase tracking-[0.2em]">Kịch bản đã sẵn sàng!</span>
                  </div>
                  <h2 className="font-playful text-7xl font-black tracking-tight mb-12 leading-tight uppercase italic drop-shadow-2xl">
                    {result.project_title}
                  </h2>
                  <div className="flex flex-wrap gap-6">
                    <div className="bg-white/10 px-10 py-5 rounded-[2rem] border-2 border-white/20 font-black text-sm flex items-center gap-4 backdrop-blur-md">
                      <Clock size={24} className="text-yellow-400" /> 40 GIÂY PHIM
                    </div>
                    <div className="bg-white/10 px-10 py-5 rounded-[2rem] border-2 border-white/20 font-black text-sm flex items-center gap-4 backdrop-blur-md">
                      <Zap size={24} className="text-blue-400" fill="currentColor" /> CHÂN THỰC 4K
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Scenes */}
              {result.scenes.map((scene, idx) => {
                const combinedDialogue = scene.dialogue.map(d => `${d.speaker === 'MOTHER' ? 'MẸ' : 'BÉ'}: "${d.text}"`).join('\n');
                const copyPayload = `IMAGE PROMPT:\n${scene.image_prompt}\n\nVIDEO PROMPT:\n${scene.video_prompt}\n\nDIALOGUE:\n${combinedDialogue}`;

                return (
                  <div key={idx} className="child-card overflow-hidden group border-[8px] border-white">
                    <div className="bg-slate-50 px-14 py-12 border-b-4 border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-10">
                        <div className="bg-pink-500 text-white w-24 h-24 flex items-center justify-center rounded-[3rem] font-black text-5xl shadow-2xl shadow-pink-100 transform group-hover:scale-110 group-hover:rotate-12 transition-all">
                          {scene.scene_number}
                        </div>
                        <div>
                          <h3 className="font-playful text-5xl font-black text-indigo-900 tracking-tight italic uppercase">{scene.vocab.en}</h3>
                          <p className="font-playful font-bold text-pink-400 text-sm mt-3 flex items-center gap-2 tracking-widest uppercase">
                            <Sparkles size={16} /> Cảnh phim số {scene.scene_number}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(copyPayload, `all-${idx}`)}
                        className="flex items-center gap-4 bg-white px-10 py-5 rounded-[2rem] border-4 border-indigo-100 font-playful font-black text-indigo-600 hover:bg-indigo-600 hover:text-white hover:shadow-2xl transition-all active:scale-95"
                      >
                        {copiedId === `all-${idx}` ? <ClipboardCheck size={24} className="text-green-500" /> : <Copy size={24} />}
                        COPY CẢ BỘ CÂU LỆNH
                      </button>
                    </div>

                    <div className="p-16 space-y-16">
                      {/* Prompts Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-3 text-blue-500 font-black text-sm uppercase tracking-widest">
                              <ImageIcon size={22} /> Prompt Tạo Ảnh
                            </div>
                            <button onClick={() => copyToClipboard(scene.image_prompt, `img-${idx}`)} className="text-slate-300 hover:text-blue-500 transition-colors">
                              {copiedId === `img-${idx}` ? <ClipboardCheck size={22} /> : <Copy size={22} />}
                            </button>
                          </div>
                          <div className="bg-blue-50/30 p-10 rounded-[3rem] text-sm font-bold text-slate-700 leading-relaxed border-4 border-blue-50/50 h-56 overflow-y-auto custom-scrollbar italic shadow-inner">
                            {scene.image_prompt}
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-3 text-indigo-500 font-black text-sm uppercase tracking-widest">
                              <Film size={22} /> Prompt Tạo Video
                            </div>
                            <button onClick={() => copyToClipboard(scene.video_prompt, `vid-${idx}`)} className="text-slate-300 hover:text-indigo-500 transition-colors">
                              {copiedId === `vid-${idx}` ? <ClipboardCheck size={22} /> : <Copy size={22} />}
                            </button>
                          </div>
                          <div className="bg-indigo-50/30 p-10 rounded-[3rem] text-sm font-bold text-indigo-800 leading-relaxed border-4 border-indigo-50/50 h-56 overflow-y-auto custom-scrollbar italic shadow-inner">
                            {scene.video_prompt}
                          </div>
                        </div>
                      </div>

                      {/* Dialogue Pipeline */}
                      <div className="space-y-10">
                        <div className="flex items-center gap-4 text-pink-500 font-playful font-black text-lg px-6">
                          <Mic2 size={24} /> Kịch bản lời thoại (Song ngữ)
                        </div>
                        <div className="space-y-10 relative px-6">
                          <div className="absolute left-[4.5rem] top-6 bottom-6 w-2 bg-slate-100 rounded-full" />
                          {scene.dialogue.map((d, dIdx) => (
                            <div key={dIdx} className={`relative flex items-start gap-10 ${d.speaker === 'MOTHER' ? 'flex-row' : 'flex-row-reverse'}`}>
                              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center font-playful font-black text-sm flex-shrink-0 shadow-2xl relative z-10 transition-transform group-hover:scale-105 ${
                                d.speaker === 'MOTHER' ? 'bg-pink-500 text-white shadow-pink-100' : 'bg-blue-500 text-white shadow-blue-100'
                              }`}>
                                {d.speaker === 'MOTHER' ? 'MẸ' : 'BÉ'}
                              </div>
                              <div className={`flex-1 p-10 transition-all shadow-md ${
                                d.speaker === 'MOTHER' 
                                ? 'bubble-mother text-slate-800 font-bold text-base' 
                                : 'bubble-child text-indigo-900 font-black italic text-lg'
                              }`}>
                                {d.text}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full min-h-[700px] flex flex-col items-center justify-center text-center p-24 bg-white rounded-[6rem] border-8 border-dashed border-indigo-50 group transition-all hover:border-indigo-200 shadow-inner overflow-hidden relative">
               <div className="absolute top-10 left-10 text-pink-100 rotate-12"><Heart size={80} /></div>
               <div className="absolute bottom-10 right-10 text-yellow-100 -rotate-12"><Star size={80} /></div>
               
               <div className="w-40 h-40 bg-indigo-50 rounded-[4rem] flex items-center justify-center mb-12 relative group-hover:scale-110 group-hover:bg-indigo-500 group-hover:rotate-12 transition-all duration-700 shadow-2xl shadow-indigo-50">
                  <Sparkles className="text-indigo-400 group-hover:text-white transition-colors" size={80} />
                  {loadingScript && <div className="absolute -inset-6 rounded-[5rem] border-8 border-pink-500 border-t-transparent animate-spin" />}
               </div>
               <h3 className="font-playful text-6xl font-black text-indigo-900 tracking-tighter mb-8 italic">Máy tạo kịch bản Ms Ly AI</h3>
               <p className="font-playful font-bold text-slate-400 max-w-lg text-lg leading-relaxed uppercase tracking-widest opacity-80">
                 {loadingScript ? 'Đang chuẩn bị những cảnh phim tuyệt vời nhất...' : 'Tải ảnh, chọn chủ đề và xem phép màu xảy ra nhé!'}
               </p>
            </div>
          )}
        </div>
      </main>

      {/* Branded Footer */}
      <footer className="mt-40 bg-white/50 backdrop-blur-sm border-t-8 border-yellow-300 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="flex flex-wrap gap-20 p-10 justify-center">
            {Array(10).fill(0).map((_, i) => <Baby key={i} size={40} />)}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="bg-pink-500 p-4 rounded-3xl text-white shadow-2xl animate-bounce">
              <Heart size={32} fill="white" />
            </div>
            <p className="font-playful font-black text-indigo-900 text-3xl tracking-tight leading-none">
              sản phẩm độc quyền của <span className="text-pink-500">Ms Ly AI</span>
            </p>
          </div>
          <div className="h-1 w-24 bg-indigo-100 mx-auto mb-10 rounded-full"></div>
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em]">Premium AI Content Pipeline © 2025</p>
          <div className="mt-12 flex justify-center gap-8 opacity-30">
             <Star size={24} /> <Sun size={24} /> <Cloud size={24} /> <Baby size={24} />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
