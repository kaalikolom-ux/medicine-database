import { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Printer, Save, Search, Pill, Sparkles, 
  RotateCcw, User, HeartPulse, FileText, CheckCircle2
} from 'lucide-react';
import { searchMedicines } from '../../services/medicineService';
import type { MedicineDirectoryItem } from '../../types/database.types';
import type { 
  DoctorProfile, 
  PrescriptionData, 
  PrescribedMedicine 
} from '../../types/prescription.types';


interface PrescriptionBuilderProps {
  doctorProfile: DoctorProfile;
  onPrintPreview: (data: PrescriptionData) => void;
  onSavePrescription: (data: PrescriptionData) => void;
  initialData?: PrescriptionData | null;
}

const COMMON_INVESTIGATIONS = [
  'CBC with ESR',
  'RBS (Random Blood Sugar)',
  'FBS (Fasting Blood Sugar)',
  'Serum Creatinine',
  'Lipid Profile',
  'SGPT / ALT',
  'Urine R/M/E',
  'ECG (12 Lead)',
  'Chest X-Ray P/A View',
  'USG of Whole Abdomen',
  'Serum Uric Acid',
  'HbA1c'
];

const COMMON_ADVICES = [
  'পর্যাপ্ত পানি পান করুন (দৈনিক ৩-৪ লিটার)',
  'তৈলাক্ত, ভাজাপোড়া ও অতিরিক্ত মশলাযুক্ত খাবার পরিহার করুন',
  'ধূমপান ও তামাক জাতীয় দ্রব্য সম্পূর্ণ বর্জন করুন',
  'প্রতিদিন অন্তত ৩০ মিনিট দ্রুত হাঁটুন বা হালকা ব্যায়াম করুন',
  'অতিরিক্ত লবণ ও কাঁচা লবণ খাওয়া বন্ধ করুন',
  'পর্যাপ্ত ঘুমান ও মানসিক চাপমুক্ত থাকার চেষ্টা করুন',
  'কোনো সমস্যা হলে তাৎক্ষণিক যোগাযোগ করুন'
];

const DOSAGE_FREQUENCIES = [
  '১ + ০ + ১',
  '১ + ১ + ১',
  '০ + ০ + ১',
  '১ + ০ + ০',
  '০ + ১ + ০',
  '১ + ১ + ১ + ১',
  'প্রয়োজনে (SOS)'
];

const MEAL_TIMINGS = [
  'খাওয়ার পর (After meal)',
  'খাওয়ার আগে (Before meal)',
  'ভরা পেটে',
  'খাওয়ার মাঝে'
];

const DURATIONS = [
  '৩ দিন',
  '৫ দিন',
  '৭ দিন',
  '১০ দিন',
  '১৪ দিন',
  '১ মাস',
  'চলবে (Continue)'
];

export function PrescriptionBuilder({
  doctorProfile,
  onPrintPreview,
  onSavePrescription,
  initialData
}: PrescriptionBuilderProps) {
  // Patient State
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientPhone, setPatientPhone] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Vitals & Clinical
  const [bp, setBp] = useState('');
  const [pulse, setPulse] = useState('');
  const [weight, setWeight] = useState('');
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState('');

  // Medicines
  const [medicinesList, setMedicinesList] = useState<PrescribedMedicine[]>([]);

  // Medicine Search & Current Line Item Inputs
  const [medSearchTerm, setMedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MedicineDirectoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [currentBrand, setCurrentBrand] = useState('');
  const [currentDosageForm, setCurrentDosageForm] = useState('Tab');
  const [currentStrength, setCurrentStrength] = useState('');
  const [currentGeneric, setCurrentGeneric] = useState('');
  const [currentProducer, setCurrentProducer] = useState('');
  const [currentFrequency, setCurrentFrequency] = useState('১ + ০ + ১');
  const [currentTiming, setCurrentTiming] = useState('খাওয়ার পর (After meal)');
  const [currentDuration, setCurrentDuration] = useState('৭ দিন');
  const [currentInstructions, setCurrentInstructions] = useState('');

  // Investigations & Advice
  const [selectedInvestigations, setSelectedInvestigations] = useState<string[]>([]);
  const [customInvestigation, setCustomInvestigation] = useState('');
  const [selectedAdvices, setSelectedAdvices] = useState<string[]>([]);
  const [customAdvice, setCustomAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const [saveToast, setSaveToast] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      setPatientName(initialData.patient.name || '');
      setPatientAge(initialData.patient.age || '');
      setPatientGender((initialData.patient.gender as any) || 'Male');
      setPatientPhone(initialData.patient.phone || '');
      setPrescriptionDate(initialData.patient.date || new Date().toISOString().split('T')[0]);
      setBp(initialData.vitals.bloodPressure || '');
      setPulse(initialData.vitals.pulse || '');
      setWeight(initialData.vitals.weight || '');
      setChiefComplaints(initialData.chiefComplaints || '');
      setClinicalDiagnosis(initialData.clinicalDiagnosis || '');
      setMedicinesList(initialData.medicines || []);
      setSelectedInvestigations(initialData.investigations || []);
      setSelectedAdvices(initialData.advice || []);
      setFollowUpDate(initialData.followUpDate || '');
    }
  }, [initialData]);

  // Live medicine search against 22,000+ DB
  useEffect(() => {
    if (!medSearchTerm.trim() || medSearchTerm.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchMedicines({
          searchQuery: medSearchTerm,
          pageSize: 15,
        });
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.error('Medicine autocomplete error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [medSearchTerm]);

  const handleSelectMedicine = (med: MedicineDirectoryItem) => {
    setCurrentBrand(med.brand_name);
    setCurrentDosageForm(med.dosage_form || 'Tab');
    setCurrentStrength(med.strength || '');
    setCurrentGeneric(med.generic_name || '');
    setCurrentProducer(med.producer_name || '');
    setMedSearchTerm(med.brand_name);
    setShowDropdown(false);
  };

  const handleAddMedicine = () => {
    if (!currentBrand.trim()) return;

    const newMed: PrescribedMedicine = {
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      brandName: currentBrand.trim(),
      dosageForm: currentDosageForm.trim() || 'Tab',
      strength: currentStrength.trim(),
      genericName: currentGeneric.trim(),
      producerName: currentProducer.trim(),
      dosageFrequency: currentFrequency,
      timing: currentTiming,
      duration: currentDuration,
      specialInstructions: currentInstructions.trim(),
    };

    setMedicinesList((prev) => [...prev, newMed]);

    // Reset input fields
    setMedSearchTerm('');
    setCurrentBrand('');
    setCurrentDosageForm('Tab');
    setCurrentStrength('');
    setCurrentGeneric('');
    setCurrentProducer('');
    setCurrentInstructions('');
    searchInputRef.current?.focus();
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicinesList((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleInvestigation = (test: string) => {
    setSelectedInvestigations((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  const handleAddCustomInvestigation = () => {
    if (customInvestigation.trim()) {
      setSelectedInvestigations((prev) => [...prev, customInvestigation.trim()]);
      setCustomInvestigation('');
    }
  };

  const toggleAdvice = (adv: string) => {
    setSelectedAdvices((prev) =>
      prev.includes(adv) ? prev.filter((a) => a !== adv) : [...prev, adv]
    );
  };

  const handleAddCustomAdvice = () => {
    if (customAdvice.trim()) {
      setSelectedAdvices((prev) => [...prev, customAdvice.trim()]);
      setCustomAdvice('');
    }
  };

  const buildPrescriptionObject = (): PrescriptionData => {
    return {
      id: initialData?.id || `RX-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      doctor: doctorProfile,
      patient: {
        name: patientName.trim() || 'Anonymous Patient',
        age: patientAge.trim(),
        gender: patientGender,
        phone: patientPhone.trim(),
        date: prescriptionDate,
      },
      vitals: {
        bloodPressure: bp.trim() || undefined,
        pulse: pulse.trim() || undefined,
        weight: weight.trim() || undefined,
      },
      chiefComplaints: chiefComplaints.trim(),
      clinicalDiagnosis: clinicalDiagnosis.trim(),
      investigations: selectedInvestigations,
      medicines: medicinesList,
      advice: selectedAdvices,
      followUpDate: followUpDate.trim() || undefined,
    };
  };

  const handlePrintClick = () => {
    const rx = buildPrescriptionObject();
    onPrintPreview(rx);
  };

  const handleSaveClick = () => {
    const rx = buildPrescriptionObject();
    onSavePrescription(rx);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('নতুন প্রেসক্রিপশন শুরু করবেন? বর্তমান ফরম খালি হয়ে যাবে।')) {
      setPatientName('');
      setPatientAge('');
      setPatientGender('Male');
      setPatientPhone('');
      setBp('');
      setPulse('');
      setWeight('');
      setChiefComplaints('');
      setClinicalDiagnosis('');
      setMedicinesList([]);
      setSelectedInvestigations([]);
      setSelectedAdvices([]);
      setFollowUpDate('');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Action Header Banner */}
      <div className="bg-emerald-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <span>ডিজিটাল প্রেসক্রিপশন প্যাড (Prescription Maker)</span>
          </h2>
          <p className="text-xs text-emerald-200">
            ২২,০০০+ ওষুধের ডাটাবেজ থেকে সহজে ওষুধ সিলেক্ট করুন এবং সরাসরি প্রিন্ট বা PDF তৈরি করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded-xl text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট (New)</span>
          </button>

          <button
            onClick={handleSaveClick}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Save className="w-4 h-4 text-emerald-700" />
            <span>সংরক্ষণ (Save)</span>
          </button>

          <button
            onClick={handlePrintClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs sm:text-sm font-black shadow transition"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>প্রেসক্রিপশন সফলভাবে হিস্ট্রিতে সংরক্ষণ করা হয়েছে!</span>
        </div>
      )}

      {/* 1. Patient Demographics & Vitals */}
      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <User className="w-4 h-4 text-emerald-600" />
          <span>১. রোগীর তথ্য ও শারীরিক পরীক্ষা (Patient Info & Vitals)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">রোগীর নাম (Patient Name) *</label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Md. Kamal Hossain"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">বয়স (Age)</label>
            <input
              type="text"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              placeholder="e.g. 45"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">লিঙ্গ (Gender)</label>
            <select
              value={patientGender}
              onChange={(e) => setPatientGender(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Male">পুরুষ (Male)</option>
              <option value="Female">মহিলা (Female)</option>
              <option value="Other">অন্যান্য (Other)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর (Phone)</label>
            <input
              type="text"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              placeholder="e.g. 01700-000000"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">তারিখ (Date)</label>
            <input
              type="date"
              value={prescriptionDate}
              onChange={(e) => setPrescriptionDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">রক্তচাপ (BP)</label>
            <input
              type="text"
              value={bp}
              onChange={(e) => setBp(e.target.value)}
              placeholder="e.g. 130/85 mmHg"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">নাড়ির গতি ও ওজন (Pulse / Weight)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="76 bpm"
                className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="68 kg"
                className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Complaints & Diagnosis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">রোগের প্রধান উপসর্গ (Chief Complaints - C/C)</label>
            <textarea
              rows={2}
              value={chiefComplaints}
              onChange={(e) => setChiefComplaints(e.target.value)}
              placeholder="e.g. জ্বর ও শরীর ব্যথা (৩ দিন), পেট ফাঁপা ও এসিডিটি"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ক্লিনিক্যাল ডায়াগনোসিস (Diagnosis - Dx)</label>
            <textarea
              rows={2}
              value={clinicalDiagnosis}
              onChange={(e) => setClinicalDiagnosis(e.target.value)}
              placeholder="e.g. Essential Hypertension, Acute Gastritis"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 2. Medicine Selection & Rx (Live 22k Meds Integration) */}
      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="flex items-center gap-1.5 text-emerald-800 font-black">
            <Pill className="w-4 h-4 text-emerald-600" />
            <span>২. ওষুধ সংযোজন (Prescribe Medicines - Rx)</span>
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            Connected to 22,000+ Medicine Database
          </span>
        </h3>

        {/* Add Medicine Box */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          {/* Autocomplete Search Bar */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ওষুধ খুঁজুন (Search 22k+ Medicines by Brand, Generic or Strength)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={medSearchTerm}
                onChange={(e) => {
                  setMedSearchTerm(e.target.value);
                  setCurrentBrand(e.target.value);
                }}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                placeholder="Type brand e.g. Fusid Plus, Cardex 6.25, Seclo 20, Napa Extra..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              {isSearching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 animate-pulse">
                  Searching...
                </span>
              )}
            </div>

            {/* Dropdown Suggestions */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                {searchResults.map((item) => (
                  <div
                    key={item.medicine_id}
                    onClick={() => handleSelectMedicine(item)}
                    className="p-2.5 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                          {item.dosage_form || 'Tab'}
                        </span>
                        <strong className="text-xs font-bold text-slate-900">{item.brand_name}</strong>
                        {item.strength && (
                          <span className="text-xs text-slate-600 font-semibold">({item.strength})</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{item.generic_name} • {item.producer_name}</p>
                    </div>

                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded">
                      Select
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Medicine Details Details Line */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold">Dosage Form</span>
              <input
                type="text"
                value={currentDosageForm}
                onChange={(e) => setCurrentDosageForm(e.target.value)}
                placeholder="Tab / Cap / Syr"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold">Brand Name</span>
              <input
                type="text"
                value={currentBrand}
                onChange={(e) => setCurrentBrand(e.target.value)}
                placeholder="Brand name"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold">Strength</span>
              <input
                type="text"
                value={currentStrength}
                onChange={(e) => setCurrentStrength(e.target.value)}
                placeholder="500 mg, 20 mg"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold">Generic Name</span>
              <input
                type="text"
                value={currentGeneric}
                onChange={(e) => setCurrentGeneric(e.target.value)}
                placeholder="Chemical generic"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Clinical Dosing Schedule Quick-Picks */}
          <div className="space-y-2 pt-1">
            {/* Frequency Chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-600 block mb-1">
                খাওয়ার নিয়ম / Frequency (মাত্রা):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DOSAGE_FREQUENCIES.map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setCurrentFrequency(freq)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                      currentFrequency === freq
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Timing Chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-600 block mb-1">
                খাওয়ার সময় (Timing):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {MEAL_TIMINGS.map((timing) => (
                  <button
                    key={timing}
                    type="button"
                    onClick={() => setCurrentTiming(timing)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                      currentTiming === timing
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {timing}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-600 block mb-1">
                কত দিন চলবে (Duration):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setCurrentDuration(dur)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                      currentDuration === dur
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions & Add Button */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={currentInstructions}
                onChange={(e) => setCurrentInstructions(e.target.value)}
                placeholder="বিশেষ পরামর্শ (Optional, e.g. কুসুম গরম পানিতে খাবেন)"
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={handleAddMedicine}
                disabled={!currentBrand.trim()}
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-xs shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span>প্রেসক্রিপশনে যুক্ত করুন (Add)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Added Medicines Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700">
            প্রেসক্রিপশনভুক্ত ওষুধসমূহ ({medicinesList.length} টি ওষুধ যুক্ত করা হয়েছে):
          </h4>

          {medicinesList.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
              উপরের সার্চ বক্স থেকে ওষুধ খুঁজে প্রেসক্রিপশনে যুক্ত করুন
            </div>
          ) : (
            <div className="space-y-2">
              {medicinesList.map((m, idx) => (
                <div
                  key={m.id}
                  className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-500">{idx + 1}.</span>
                      <span className="font-semibold text-emerald-800">{m.dosageForm}.</span>
                      <strong className="text-slate-900 font-bold text-sm">{m.brandName}</strong>
                      {m.strength && <span className="font-semibold text-slate-600">({m.strength})</span>}
                    </div>
                    {m.genericName && (
                      <p className="text-[11px] text-slate-500 pl-4">{m.genericName}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pl-4 text-slate-700">
                      <span className="font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[11px]">
                        {m.dosageFrequency}
                      </span>
                      <span>— {m.timing}</span>
                      <span className="font-semibold bg-slate-200/70 px-1.5 py-0.5 rounded text-[11px]">
                        ({m.duration})
                      </span>
                      {m.specialInstructions && (
                        <span className="text-amber-800 italic">• {m.specialInstructions}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveMedicine(m.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Remove medicine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Investigations (পরীক্ষাসমূহ) */}
      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <HeartPulse className="w-4 h-4 text-emerald-600" />
          <span>৩. ল্যাব টেস্ট ও পরীক্ষা (Investigations Advised)</span>
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {COMMON_INVESTIGATIONS.map((test) => {
            const isSelected = selectedInvestigations.includes(test);
            return (
              <button
                key={test}
                type="button"
                onClick={() => toggleInvestigation(test)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {isSelected ? `✓ ${test}` : `+ ${test}`}
              </button>
            );
          })}
        </div>

        {/* Custom Test Adder */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={customInvestigation}
            onChange={(e) => setCustomInvestigation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomInvestigation();
              }
            }}
            placeholder="অন্য কোনো পরীক্ষা যুক্ত করুন (Type other test)..."
            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddCustomInvestigation}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
          >
            যোগ করুন
          </button>
        </div>
      </section>

      {/* 4. Advice & Next Visit (পরামর্শ ও পরবর্তী সাক্ষাৎ) */}
      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>৪. উপদেশ ও পরবর্তী সাক্ষাত (Advice & Follow-up)</span>
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {COMMON_ADVICES.map((adv) => {
            const isSelected = selectedAdvices.includes(adv);
            return (
              <button
                key={adv}
                type="button"
                onClick={() => toggleAdvice(adv)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {isSelected ? `✓ ${adv}` : `+ ${adv}`}
              </button>
            );
          })}
        </div>

        {/* Custom Advice Input */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={customAdvice}
            onChange={(e) => setCustomAdvice(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomAdvice();
              }
            }}
            placeholder="অন্য কোনো উপদেশ লিখুন..."
            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddCustomAdvice}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
          >
            যোগ করুন
          </button>
        </div>

        {/* Follow-up Date */}
        <div className="pt-2 sm:w-72">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            পরবর্তী সাক্ষাত (Next Visit / Follow-up)
          </label>
          <input
            type="text"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            placeholder="e.g. ৭ দিন পর / রিপোর্টসহ ২ দিন পর"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </section>

      {/* Bottom Action Floating Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleSaveClick}
          className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition"
        >
          <Save className="w-4 h-4 text-emerald-700" />
          <span>সংরক্ষণ করুন (Save)</span>
        </button>

        <button
          onClick={handlePrintClick}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition"
        >
          <Printer className="w-4 h-4" />
          <span>প্রিন্ট প্রিভিউ ও PDF (Print / PDF)</span>
        </button>
      </div>
    </div>
  );
}
