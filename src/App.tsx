import { useState } from 'react';
import { Bot, Search, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeProfession, generateImage, type AnalysisResult } from './services/ai';

export default function App() {
  const [profession, setProfession] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!profession.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setImageSrc(null);

    try {
      // 1. Analyze text
      const analysis = await analyzeProfession(profession);
      setResult(analysis);

      // 2. Generate image based on the prompt from analysis
      const img = await generateImage(analysis.imagePrompt);
      setImageSrc(img);
    } catch (err) {
      console.error(err);
      setError('Произошла ошибка при анализе. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 transform rotate-3">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            AI vs Профессии
          </h1>
          <p className="text-lg text-slate-600 max-w-lg mx-auto">
            Напиши профессию, которую Искусственный Интеллект не сможет заменить... или сможет?
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-2 transition-all focus-within:ring-4 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
          <input
            type="text"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="Введите профессию (например: Дизайнер)"
            className="flex-1 border-none bg-transparent px-4 py-3 text-lg focus:ring-0 placeholder:text-slate-400"
            disabled={loading}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !profession.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Анализировать</span>
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
            >
              <div className={`p-1 h-2 w-full ${result.replaceable ? 'bg-red-500' : 'bg-emerald-500'}`} />
              
              <div className="p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {result.replaceable ? 'ИИ может заменить!' : 'ИИ не справится!'}
                    </h2>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                      result.replaceable 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {result.replaceable ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      {result.replaceable ? 'Высокий риск' : 'Низкий риск'}
                    </div>
                  </div>
                </div>

                <p className="text-lg text-slate-700 leading-relaxed">
                  {result.explanation}
                </p>

                {/* Image Section */}
                <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-square relative group">
                  {imageSrc ? (
                    <img 
                      src={imageSrc} 
                      alt="AI generated illustration" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-sm font-medium">Генерируем иллюстрацию...</span>
                    </div>
                  )}
                  
                  {/* Overlay Label */}
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full">
                    Generated by Gemini
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
