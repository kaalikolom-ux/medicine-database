import { useState, useMemo } from 'react';
import { 
  Stethoscope, Sparkles, AlertTriangle, 
  Pill, ShieldCheck, HeartPulse, CheckCircle2, 
  HelpCircle, RotateCcw, ChevronRight, Bookmark,
  FlaskConical, Microscope, Plus, Check, FileText
} from 'lucide-react';
import { analyzeSymptoms, type SymptomAnalysisResult } from '../../services/symptomAnalyzer';
import type { MedicineDirectoryItem } from '../../types/database.types';

interface SymptomMedicineFinderProps {
  onSelectMedicine: (medicine: MedicineDirectoryItem) => void;
  onOpenRxPad?: () => void;
  savedIds?: Set<string>;
  onToggleSave?: (medicine: MedicineDirectoryItem, e: React.MouseEvent) => void;
  onAddTestToRx?: (testName: string) => void;
  onAddBatchTestsToRx?: (testNames: string[]) => void;
}

const SAMPLE_SYMPTOMS = [
  { label: 'জ্বর ও শরীর ব্যথা', text: 'আমার গা গরম, হালকা জ্বর এবং তীব্র মাথা ও শরীর ব্যথা' },
  { label: 'গ্যাস্ট্রিক ও বুকজ্বালা', text: 'পেটে গ্যাস, পেট ফাঁপা এবং খাওয়ার পর বুক জ্বালাপোড়া করে' },
  { label: 'বুকে তীব্র চাপ ও ব্যথা', text: 'বুকের মাঝখানে ভারী পাথর চেপে বসার মত ব্যথা ও বাম হাতে টান' },
  { label: 'সর্দি ও হাঁচি', text: 'নাক দিয়ে পানি পড়ে, ঘন ঘন হাঁচি ও মাথা ভার হয়ে আছে' },
  { label: 'বুকে কফ ও কাশি', text: 'শুকনো কাশি ও বুকে কফ জমে আছে, রাতে কাশি বাড়ে' },
  { label: 'পাতলা পায়খানা / ডায়রিয়া', text: 'পেট খারাপ, বারবার পাতলা পায়খানা হচ্ছে এবং বমি বমি ভাব' },
  { label: 'প্রস্রাবে তীব্র জ্বালাপোড়া', text: 'প্রস্রাবের সময় প্রচণ্ড জ্বালাপোড়া করে এবং তলপেটে ব্যথা' },
  { label: 'জন্ডিস ও চোখ হলুদ', text: 'চোখ ও প্রস্রাব হলুদ হয়ে গেছে এবং খাবারে তীব্র অরুচি' },
  { label: 'অ্যালার্জি ও গা চুলকানি', text: 'ত্বকে লাল চাকা উঠেছে এবং তীব্র চুলকানি হচ্ছে' },
  { label: 'কোমর ও পেশী ব্যথা', text: 'কোমরে তীব্র ব্যথা এবং মাংশপেশিতে টান লেগেছে' },
  { label: 'শ্বাসকষ্ট ও হাঁপানি', text: 'বুকে সাঁই সাঁই শব্দ এবং নিঃশ্বাস নিতে বেশ কষ্ট হচ্ছে' },
  { label: 'দুর্বলতা ও রক্তস্বল্পতা', text: 'শরীর দুর্বল লাগে, অল্পতেই হাঁপিয়ে যাই ও মাথা ঝিমঝিম করে' }
];

export function SymptomMedicineFinder({
  onSelectMedicine,
  onOpenRxPad,
  savedIds = new Set(),
  onToggleSave,
  onAddTestToRx,
  onAddBatchTestsToRx,
}: SymptomMedicineFinderProps) {
  const [inputText, setInputText] = useState('');
  const [activeAnalysisQuery, setActiveAnalysisQuery] = useState('');

  // Persistent pending tests for Prescription Pad
  const [rxTests, setRxTests] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('pending_rx_investigations');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleToggleRxTest = (testName: string) => {
    setRxTests((prev) => {
      const next = new Set(prev);
      if (next.has(testName)) {
        next.delete(testName);
      } else {
        next.add(testName);
      }
      try {
        localStorage.setItem('pending_rx_investigations', JSON.stringify(Array.from(next)));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
    onAddTestToRx?.(testName);
  };

  const handleAddBatchTests = (testNames: string[]) => {
    setRxTests((prev) => {
      const next = new Set(prev);
      testNames.forEach((t) => next.add(t));
      try {
        localStorage.setItem('pending_rx_investigations', JSON.stringify(Array.from(next)));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
    onAddBatchTestsToRx?.(testNames);
  };

  // Perform analysis whenever user submits or clicks a preset
  const analysisResult: SymptomAnalysisResult | null = useMemo(() => {
    if (!activeAnalysisQuery.trim()) return null;
    return analyzeSymptoms(activeAnalysisQuery);
  }, [activeAnalysisQuery]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputText.trim()) {
      setActiveAnalysisQuery(inputText.trim());
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setInputText(sampleText);
    setActiveAnalysisQuery(sampleText);
  };

  const handleReset = () => {
    setInputText('');
    setActiveAnalysisQuery('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 text-stone-800">
      {/* Top Banner & Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#ede3d3] text-[#0f4c42] border border-[#dfd0b8]">
          <HeartPulse className="w-4 h-4 text-[#0f4c42]" />
          <span>দ্বিভাষিক ক্লিনিক্যাল লক্ষণ ও ডায়াগনস্টিক সহকারী (Clinical Decision Support)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1710] tracking-tight">
          অসুখের বিবরণ দিয়ে ওষুধ ও প্যাথলজিক্যাল টেস্ট জানুন
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          আপনার যেকোনো শারীরিক উপসর্গ বা অসুখের কথা <strong>বাংলা বা ইংরেজিতে</strong> লিখুন। আমাদের ক্লিনিক্যাল ইঞ্জিন সম্ভাব্য রোগ, প্রয়োজনীয় <strong>প্যাথলজিক্যাল/ল্যাব টেস্টের কারণ ও ভুল ডায়াগনোসিস রোধের নির্দেশিকা</strong> এবং ২১,৬০০+ ডাটাবেজ থেকে শীর্ষ বাংলাদেশি ওষুধ প্রদর্শন করবে।
        </p>
      </div>

      {/* Symptom Input Form */}
      <div className="bg-white border border-[#dfd0b8] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="symptom-input" className="block text-xs font-bold text-stone-700">
            আপনার শারীরিক সমস্যা বা লক্ষণের বিবরণ লিখুন (Describe symptoms in Bangla or English):
          </label>

          <div className="relative">
            <textarea
              id="symptom-input"
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="উদাহরণ: ৩ দিন ধরে তীব্র জ্বর ও শরীর ব্যথা... অথবা: I have severe chest pain and left arm ache..."
              className="w-full p-3.5 bg-[#fdfbf7] border border-[#dfd0b8] rounded-xl text-xs sm:text-sm text-[#1c1710] placeholder-stone-400 focus:ring-2 focus:ring-[#0f4c42] focus:outline-none transition leading-relaxed resize-none shadow-inner"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 text-xs px-2 py-0.5 rounded-md hover:bg-stone-100 transition cursor-pointer"
              >
                মুছুন
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 py-2.5 bg-[#0f4c42] hover:bg-[#0c3c34] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>লক্ষণ ও টেস্ট বিশ্লেষণ করুন (Analyze)</span>
              </button>

              {activeAnalysisQuery && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 text-stone-600 hover:text-stone-900 text-xs font-semibold rounded-xl hover:bg-[#f5efe4] transition flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>রিসেট</span>
                </button>
              )}
            </div>

            {onOpenRxPad && (
              <button
                type="button"
                onClick={onOpenRxPad}
                className="text-xs font-bold text-[#0f4c42] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>প্রেসক্রিপশন প্যাড খুলুন ({rxTests.size}টি টেস্ট যুক্ত) &rarr;</span>
              </button>
            )}
          </div>
        </form>

        {/* Quick Symptom Chips */}
        <div className="pt-2 border-t border-[#ede3d3] space-y-1.5">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            দ্রুত অনুসন্ধানের জন্য ক্লিক করুন (Quick Samples):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_SYMPTOMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSelectSample(item.text)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-[#f5efe4] hover:bg-[#ede3d3] border border-[#dfd0b8] hover:border-[#0f4c42]/50 text-stone-800 transition cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Rx Tests Notice Bar */}
      {rxTests.size > 0 && (
        <div className="p-3 bg-[#ede3d3] border border-[#dfd0b8] rounded-2xl flex items-center justify-between text-xs text-[#1c1710] shadow-2xs">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0f4c42]" />
            <span>
              প্রেসক্রিপশনের জন্য <strong className="text-[#0f4c42]">{rxTests.size}টি প্যাথলজিক্যাল টেস্ট</strong> নির্বাচিত রয়েছে।
            </span>
          </div>
          {onOpenRxPad && (
            <button
              type="button"
              onClick={onOpenRxPad}
              className="px-3 py-1 bg-[#0f4c42] hover:bg-[#0c3c34] text-white rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <span>প্রেসক্রিপশন প্যাডে যান &rarr;</span>
            </button>
          )}
        </div>
      )}

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Emergency Alert if applicable */}
          {analysisResult.hasEmergencyWarning && analysisResult.emergencyMessage && (
            <div className="bg-rose-50 border-2 border-rose-300 p-4 rounded-2xl flex items-start gap-3 text-rose-950 shadow-sm animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-rose-900 text-sm">জরুরি সতর্কবার্তা (Emergency Red Flag):</h4>
                <p className="leading-relaxed">{analysisResult.emergencyMessage}</p>
                <p className="font-semibold text-rose-900">বিলম্ব না করে নিকটস্থ সরকারি বা বেসরকারি হাসপাতালের জরুরি বিভাগে যোগাযোগ করুন।</p>
              </div>
            </div>
          )}

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between px-1 text-xs text-stone-600">
            <span className="font-medium">
              বিশ্লেষিত অনুসন্ধান: <strong className="text-[#1c1710]">"{analysisResult.query}"</strong>
            </span>
            <span className="font-bold text-[#0f4c42]">
              {analysisResult.matchedConditions.length > 0
                ? `${analysisResult.matchedConditions.length}টি রোগের সাথে লক্ষণ মিলেছে`
                : 'কোনো নির্দিষ্ট রোগের সাথে মেলেনি'}
            </span>
          </div>

          {/* Fallback Indication Results if no direct condition matched */}
          {analysisResult.matchedConditions.length === 0 && (
            <div className="bg-white border border-[#dfd0b8] p-6 rounded-2xl text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-base font-bold text-[#1c1710]">নির্দিষ্ট কোনো সাধারণ রোগ সরাসরি শনাক্ত করা যায়নি</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                আপনার দেওয়া লক্ষণের সাথে মিল রেখে আমাদের ২১,৬০০+ ওষুধের ডাটাবেজের <em>Indications</em> ও <em>Therapeutic Class</em>-এ অনুসন্ধান করা হয়েছে।
              </p>

              {analysisResult.fallbackMedicines.length > 0 && (
                <div className="pt-4 space-y-3 text-left">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    লক্ষণ সংশ্লিষ্ট সম্ভাব্য ওষুধসমূহ:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {analysisResult.fallbackMedicines.map((med) => {
                      const isSaved = savedIds.has(med.medicine_id);
                      return (
                        <div
                          key={med.medicine_id}
                          onClick={() => onSelectMedicine(med)}
                          className="p-3 bg-[#fdfbf7] hover:bg-white border border-[#dfd0b8] hover:border-[#0f4c42] rounded-xl transition cursor-pointer shadow-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h5 className="font-bold text-sm text-[#1c1710]">{med.brand_name}</h5>
                              <span className="text-[10px] font-bold text-[#0f4c42] bg-[#f5efe4] px-1.5 py-0.5 rounded border border-[#dfd0b8]">
                                {med.strength}
                              </span>
                            </div>
                            <p className="text-xs text-[#0f4c42] font-medium mt-0.5">{med.generic_name}</p>
                            <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">{med.indications || med.therapeutic_class}</p>
                          </div>
                          <div className="pt-2 mt-2 border-t border-[#ede3d3] flex items-center justify-between text-[11px]">
                            <span className="text-stone-600 truncate max-w-[120px]">{med.producer_name}</span>
                            <div className="flex items-center gap-1.5">
                              {onToggleSave && (
                                <button
                                  type="button"
                                  onClick={(e) => onToggleSave(med, e)}
                                  className={`p-1 rounded-md transition ${
                                    isSaved 
                                      ? 'text-[#0f4c42] bg-[#0f4c42]/10' 
                                      : 'text-stone-400 hover:text-[#0f4c42] hover:bg-stone-100'
                                  }`}
                                  title={isSaved ? "বুকমার্ক মুছে ফেলুন" : "বুকমার্ক করুন"}
                                >
                                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                                </button>
                              )}
                              <span className="font-bold text-[#0f4c42] flex items-center">
                                বিস্তারিত <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Matched Conditions Cards */}
          {analysisResult.matchedConditions.map(({ condition, matchedKeywords, genericsWithMedicines }) => (
            <div
              key={condition.id}
              className="bg-white border border-[#dfd0b8] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 hover:border-[#0f4c42]/50 transition-all"
            >
              {/* Condition Title & Urgency Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#ede3d3]">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#ede3d3] text-[#0f4c42]">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1c1710]">
                      {condition.nameBn}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 ml-7">
                    {condition.nameEn} &bull; শ্রেণি: <strong>{condition.category}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    condition.severity === 'emergency'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : condition.severity === 'consult_doctor'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}>
                    {condition.severity === 'emergency' 
                      ? '⚠️ জরুরি চিকিৎসা প্রয়োজন' 
                      : condition.severity === 'consult_doctor' 
                        ? '👨‍⚕️ ডাক্তারের পরামর্শ আবশ্যক' 
                        : '✅ প্রাথমিক ব্যবস্থাপনা সম্ভব'}
                  </span>
                </div>
              </div>

              {/* Matched Keywords Tags */}
              {matchedKeywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-stone-500 font-medium">শনাক্তকৃত লক্ষণ:</span>
                  {matchedKeywords.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 rounded-md bg-[#f5efe4] text-[#0f4c42] border border-[#dfd0b8] font-semibold text-[11px]">
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Clinical Summary */}
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-[#f8f4ec] p-3 rounded-xl border border-[#ede3d3]">
                {condition.summaryBn}
              </p>

              {/* 1. PATHOLOGICAL & DIAGNOSTIC TESTS SUGGESTIONS (DOCTOR DECISION SUPPORT) */}
              {condition.recommendedTests && condition.recommendedTests.length > 0 && (
                <div className="bg-[#fcfaf6] border border-[#dfd0b8] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ede3d3] pb-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-[#0f4c42]/10 text-[#0f4c42] shrink-0 mt-0.5">
                        <FlaskConical className="w-5 h-5 text-[#0f4c42]" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-[#1c1710] flex items-center gap-1.5">
                          <span>প্রয়োজনীয় প্যাথলজিক্যাল টেস্ট ও পরীক্ষা (Diagnostic Investigations):</span>
                        </h4>
                        <p className="text-[11px] text-stone-600 mt-0.5">
                          ডাক্তারের মানসিক চাপ কমাতে ও ভুল ডায়াগনোসিস রোধে রোগ নিশ্চিতকরণ পরীক্ষাসমূহ
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddBatchTests(condition.recommendedTests.map((t) => t.testName))}
                      className="px-3 py-1.5 bg-[#ede3d3] hover:bg-[#0f4c42] text-[#0f4c42] hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer border border-[#dfd0b8] shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>সব টেস্ট প্রেসক্রিপশনে নিন</span>
                    </button>
                  </div>

                  {/* Grid of Recommended Tests */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {condition.recommendedTests.map((test) => {
                      const isAdded = rxTests.has(test.testName);

                      return (
                        <div
                          key={test.testName}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                            isAdded
                              ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                              : 'bg-white border-[#dfd0b8] hover:border-[#0f4c42]/60 shadow-2xs'
                          }`}
                        >
                          <div className="space-y-2">
                            {/* Test Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <span className="font-extrabold text-xs sm:text-sm text-[#1c1710] flex items-center gap-1.5">
                                  <Microscope className="w-3.5 h-3.5 text-[#0f4c42] shrink-0" />
                                  <span>{test.testName}</span>
                                </span>
                                <span className="inline-block text-[10px] font-semibold text-stone-600 bg-[#f5efe4] px-1.5 py-0.5 rounded border border-[#dfd0b8]">
                                  {test.categoryLabelBn}
                                </span>
                              </div>

                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                test.urgency === 'immediate'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : test.urgency === 'if_persists'
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}>
                                {test.urgency === 'immediate' && '🚨 '}
                                {test.urgency === 'if_persists' && '⏳ '}
                                {test.urgency === 'routine' && '📋 '}
                                {test.urgencyLabelBn}
                              </span>
                            </div>

                            {/* Medical Reason */}
                            <p className="text-xs text-stone-700 leading-relaxed bg-[#fbf9f4] p-2 rounded-lg border border-[#ede3d3]">
                              <strong className="text-stone-900 font-semibold">ক্লিনিক্যাল উদ্দেশ্য:</strong> {test.reasonBn}
                            </p>

                            {/* Error Prevention Alert Box */}
                            <div className="text-[11px] text-amber-950 bg-amber-50/90 border border-amber-200 p-2 rounded-lg leading-relaxed flex items-start gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-amber-900">ভুল ডায়াগনোসিস রোধ: </span>
                                <span>{test.preventsErrorBn}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button: Add to Rx Pad */}
                          <div className="pt-2.5 mt-2.5 border-t border-[#ede3d3] flex items-center justify-between">
                            <span className="text-[10px] text-stone-500 italic">
                              {isAdded ? 'প্রেসক্রিপশনভুক্ত হয়েছে' : 'প্রেসক্রিপশনে যোগ করতে পারেন'}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleToggleRxTest(test.testName)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                isAdded
                                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                  : 'bg-[#0f4c42] hover:bg-[#0c3c34] text-white shadow-2xs'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>যুক্ত রয়েছে</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>+ প্রেসক্রিপশনে নিন</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. RECOMMENDED GENERICS & MATCHING 21K DATABASE MEDICINES */}
              <div className="space-y-4 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-[#0f4c42]" />
                  <span>চিকিৎসায় ব্যবহৃত প্রধান জেনেরিক ও শীর্ষ বাংলাদেশি ওষুধ (Medicines):</span>
                </h4>

                <div className="space-y-4">
                  {genericsWithMedicines.map(({ generic, medicines }) => (
                    <div
                      key={generic.genericName}
                      className="bg-[#fdfbf7] border border-[#dfd0b8] p-4 rounded-xl space-y-3 shadow-2xs"
                    >
                      {/* Generic Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#ede3d3] pb-2">
                        <div>
                          <span className="font-extrabold text-[#0f4c42] text-sm">
                            {generic.genericName}
                          </span>
                          <span className="text-xs text-stone-600 block sm:inline sm:ml-2">
                            ({generic.roleBn})
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-stone-600">
                          {generic.typicalDosageBn} {generic.timingBn && `• ${generic.timingBn}`}
                        </div>
                      </div>

                      {/* Matching Top Medicines Cards */}
                      {medicines.length > 0 ? (
                        <div>
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                            প্রচলিত শীর্ষ ব্র্যান্ড (২১,৬০০+ ডাটাবেজ থেকে):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                            {medicines.map((med) => {
                              const isBd = med.producer_country.toLowerCase() === 'bangladesh';
                              const isSaved = savedIds.has(med.medicine_id);

                              return (
                                <div
                                  key={med.medicine_id}
                                  onClick={() => onSelectMedicine(med)}
                                  className="p-2.5 bg-white border border-[#dfd0b8] hover:border-[#0f4c42] rounded-xl transition cursor-pointer shadow-2xs hover:shadow-xs flex flex-col justify-between group"
                                >
                                  <div>
                                    <div className="flex items-start justify-between gap-1">
                                      <h6 className="font-bold text-xs text-[#1c1710] group-hover:text-[#0f4c42] transition truncate">
                                        {med.brand_name}
                                      </h6>
                                      <span className="text-[9px] font-bold text-[#0f4c42] bg-[#f5efe4] px-1 py-0.2 rounded border border-[#dfd0b8] shrink-0">
                                        {med.strength}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-stone-500 truncate mt-0.5">{med.producer_name}</p>
                                  </div>

                                  <div className="pt-1.5 mt-2 border-t border-[#ede3d3] flex items-center justify-between text-[10px]">
                                    {isBd ? (
                                      <span className="font-bold text-emerald-800 bg-emerald-50 px-1 rounded border border-emerald-200">
                                        🇧🇩 BD
                                      </span>
                                    ) : (
                                      <span className="text-stone-500">{med.producer_country}</span>
                                    )}

                                    <div className="flex items-center gap-1.5">
                                      {onToggleSave && (
                                        <button
                                          type="button"
                                          onClick={(e) => onToggleSave(med, e)}
                                          className={`p-1 rounded transition ${
                                            isSaved 
                                              ? 'text-[#0f4c42] bg-[#0f4c42]/10' 
                                              : 'text-stone-400 hover:text-[#0f4c42] hover:bg-stone-100'
                                          }`}
                                          title={isSaved ? "বুকমার্ক মুছে ফেলুন" : "বুকমার্ক করুন"}
                                        >
                                          <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
                                        </button>
                                      )}
                                      {med.price !== null && (
                                        <span className="font-extrabold text-[#b45309]">
                                          ৳ {med.price.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-stone-500 italic">
                          এই জেনেরিকের ব্র্যান্ড বিস্তারিত জানতে মূল সার্চবারে খুঁজুন।
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. LIFESTYLE & DIETARY ADVICE */}
              {condition.lifestyleAdviceBn.length > 0 && (
                <div className="bg-[#f5efe4] p-3.5 rounded-xl border border-[#dfd0b8] space-y-1.5 text-xs text-stone-700">
                  <h5 className="font-bold text-[#1c1710] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0f4c42]" />
                    <span>পথ্য ও জীবনযাপন পরামর্শ (Lifestyle & Home Care):</span>
                  </h5>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    {condition.lifestyleAdviceBn.map((adv, idx) => (
                      <li key={idx} className="leading-relaxed">{adv}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 4. IMPORTANT MEDICAL WARNINGS */}
              {condition.warningsBn.length > 0 && (
                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-300 space-y-1 text-xs text-amber-950">
                  <h5 className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    <span>জরুরি সতর্কতা (Important Warnings):</span>
                  </h5>
                  <ul className="list-disc list-inside space-y-0.5 pl-1">
                    {condition.warningsBn.map((warn, idx) => (
                      <li key={idx} className="leading-relaxed">{warn}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* Legal & Medical Disclaimer Box */}
          <div className="p-4 bg-white border border-[#dfd0b8] rounded-2xl shadow-xs text-xs text-stone-600 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#0f4c42] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-[#1c1710]">চিকিৎসাগত ও আইনি দায়মুক্তি (Medical Disclaimer):</h5>
              <p className="leading-relaxed">{analysisResult.disclaimerBn}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
