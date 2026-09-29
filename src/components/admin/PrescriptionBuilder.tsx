import { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Printer, Save, Search, Pill, Sparkles, 
  RotateCcw, User, HeartPulse, FileText, CheckCircle2,
  FlaskConical, Microscope
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

export const CLINICAL_TEST_PRESETS = [
  {
    category: 'জ্বর / ডেঙ্গু / টাইফয়েড',
    description: 'সংক্রমণের উৎস ও প্লেটলেট নিরূপণে',
    tests: ['CBC with ESR', 'Dengue NS1 Antigen & Dengue IgM/IgG', 'Widal Test / Blood C/S', 'Urine R/M/E']
  },
  {
    category: 'বুকব্যথা / কার্ডিয়াক (Heart)',
    description: 'হার্ট অ্যাটাক ও ইস্কেমিক ঝুঁকি বাদ দিতে',
    tests: ['ECG (12 Lead)', 'Serum Troponin-I', 'Lipid Profile', 'Echocardiography']
  },
  {
    category: 'গ্যাস্ট্রিক / পেটব্যথা / প্যানক্রিয়াস',
    description: 'আলসার, পাথর ও প্যানক্রিয়াটাইটিস নির্ণয়ে',
    tests: ['ECG (12 Lead)', 'USG of Whole Abdomen', 'Serum Lipase & Amylase', 'Upper GI Endoscopy']
  },
  {
    category: 'কাশি / ফুসফুস / টিবি (Chest)',
    description: 'নিউমোনিয়া ও যক্ষ্মা স্ক্রিনিংয়ে',
    tests: ['Chest X-Ray P/A View', 'CBC with ESR', 'Sputum for GeneXpert / AFB']
  },
  {
    category: 'প্রস্রাবে জ্বালা (UTI) / কিডনি',
    description: 'ব্যাকটেরিয়াল ইউটিআই ও কিডনি সুরক্ষা',
    tests: ['Urine R/M/E', 'Urine Culture & Sensitivity (C/S)', 'USG of KUB & Prostate', 'Serum Creatinine']
  },
  {
    category: 'ডায়াবেটিস ও রক্তের সুগার',
    description: '৩ মাসের গড় সুগার ও কিডনি মার্কার',
    tests: ['HbA1c', 'FBS & 2HABF', 'Serum Creatinine', 'Lipid Profile', 'Urine for Microalbumin']
  },
  {
    category: 'জন্ডিস / লিভার ফাংশন',
    description: 'হেপাটাইটিস ও পিত্তনালী অবস্ট্রাকশন',
    tests: ['Serum Bilirubin (Total & Direct)', 'SGPT / ALT', 'USG of Hepatobiliary System', 'HBsAg & Anti-HCV']
  },
  {
    category: 'দুর্বলতা / রক্তস্বল্পতা (Anemia)',
    description: 'হিমোগ্লোবিন, আয়রন ও থাইরয়েড ঘাটতি',
    tests: ['Complete Blood Count (CBC with PBF)', 'Serum Ferritin', 'Serum TSH', 'RBS']
  }
];

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
  const [selectedInvestigations, setSelectedInvestigations] = useState<string[]>(() => {
    if (initialData?.investigations && initialData.investigations.length > 0) {
      return initialData.investigations;
    }
    try {
      const pending = localStorage.getItem('pending_rx_investigations');
      return pending ? JSON.parse(pending) : [];
    } catch {
      return [];
    }
  });
  const [customInvestigation, setCustomInvestigation] = useState('');
  const [selectedTestPreset, setSelectedTestPreset] = useState<number | null>(0);
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
    setSelectedInvestigations((prev) => {
      const updated = prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test];
      try {
        localStorage.setItem('pending_rx_investigations', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  const handleAddBatchPresetTests = (tests: string[]) => {
    setSelectedInvestigations((prev) => {
      const next = Array.from(new Set([...prev, ...tests]));
      try {
        localStorage.setItem('pending_rx_investigations', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  const handleAddCustomInvestigation = () => {
    if (customInvestigation.trim()) {
      const trimmed = customInvestigation.trim();
      setSelectedInvestigations((prev) => {
        const updated = [...prev, trimmed];
        try {
          localStorage.setItem('pending_rx_investigations', JSON.stringify(updated));
        } catch (err) {
          console.error(err);
        }
        return updated;
      });
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
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-navy-300" />
            <span>ডিজিটাল প্রেসক্রিপশন প্যাড (Prescription Maker)</span>
          </h2>
          <p className="text-xs text-navy-200">
            ২২,০০০+ ওষুধের ডাটাবেজ থেকে সহজে ওষুধ সিলেক্ট করুন এবং সরাসরি প্রিন্ট বা PDF তৈরি করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-navy-800 hover:bg-navy-700 text-navy-100 rounded-xl text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট (New)</span>
          </button>

          <button
            onClick={handleSaveClick}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-navy-950 hover:bg-navy-50 rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Save className="w-4 h-4 text-navy-700" />
            <span>সংরক্ষণ (Save)</span>
          </button>

          <button
            onClick={handlePrintClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-navy-600 hover:bg-navy-500 text-white rounded-xl text-xs sm:text-sm font-black shadow transition cursor-pointer"
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
          <User className="w-4 h-4 text-navy-700" />
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">বয়স (Age)</label>
            <input
              type="text"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              placeholder="e.g. 45"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">লিঙ্গ (Gender)</label>
            <select
              value={patientGender}
              onChange={(e) => setPatientGender(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">তারিখ (Date)</label>
            <input
              type="date"
              value={prescriptionDate}
              onChange={(e) => setPrescriptionDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">রক্তচাপ (BP)</label>
            <input
              type="text"
              value={bp}
              onChange={(e) => setBp(e.target.value)}
              placeholder="e.g. 130/85 mmHg"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
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
                className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy-500 focus:outline-none"
              />
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="68 kg"
                className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy-500 focus:outline-none"
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ক্লিনিক্যাল ডায়াগনোসিস (Diagnosis - Dx)</label>
            <textarea
              rows={2}
              value={clinicalDiagnosis}
              onChange={(e) => setClinicalDiagnosis(e.target.value)}
              placeholder="e.g. Essential Hypertension, Acute Gastritis"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 2. Medicine Selection & Rx (Live 22k Meds Integration) */}
      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="flex items-center gap-1.5 text-navy-800 font-black">
            <Pill className="w-4 h-4 text-navy-700" />
            <span>২. ওষুধ সংযোজন (Prescribe Medicines - Rx)</span>
          </span>
          <span className="text-[11px] font-semibold text-navy-700 bg-navy-50 px-2 py-0.5 rounded">
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
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-navy-500 focus:outline-none"
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
                    className="p-2.5 hover:bg-navy-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-navy-800 bg-navy-100/60 px-1.5 py-0.5 rounded">
                          {item.dosage_form || 'Tab'}
                        </span>
                        <strong className="text-xs font-bold text-slate-900">{item.brand_name}</strong>
                        {item.strength && (
                          <span className="text-xs text-slate-600 font-semibold">({item.strength})</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{item.generic_name} • {item.producer_name}</p>
                    </div>

                    <span className="text-[10px] text-navy-700 font-bold bg-navy-50 px-2 py-1 rounded">
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
                        ? 'bg-navy-800 text-white border-navy-900 shadow-sm'
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
                        ? 'bg-navy-800 text-white border-navy-900 shadow-sm'
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
                        ? 'bg-navy-800 text-white border-navy-900 shadow-sm'
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
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={handleAddMedicine}
                disabled={!currentBrand.trim()}
                className="flex items-center justify-center gap-1.5 bg-navy-800 hover:bg-navy-900 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-xs shadow transition cursor-pointer"
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
                      <span className="font-semibold text-navy-800">{m.dosageForm}.</span>
                      <strong className="text-slate-900 font-bold text-sm">{m.brandName}</strong>
                      {m.strength && <span className="font-semibold text-slate-600">({m.strength})</span>}
                    </div>
                    {m.genericName && (
                      <p className="text-[11px] text-slate-500 pl-4">{m.genericName}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pl-4 text-slate-700">
                      <span className="font-bold text-navy-800 bg-navy-100/70 px-1.5 py-0.5 rounded text-[11px]">
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
      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-navy-700" />
            <span>৩. ল্যাব টেস্ট ও পরীক্ষা (Investigations Advised)</span>
          </h3>

          <span className="text-xs font-semibold text-navy-800 bg-navy-50 px-2.5 py-0.5 rounded-full border border-navy-200 self-start sm:self-auto">
            {selectedInvestigations.length}টি পরীক্ষা সংযুক্ত
          </span>
        </div>

        {/* CLINICAL DECISION SUPPORT: SMART TEST ASSISTANT FOR DOCTORS */}
        <div className="bg-[#fcfaf6] border border-[#dfd0b8] rounded-xl p-3.5 sm:p-4 space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-[#0f4c42]" />
              <div>
                <span className="text-xs font-extrabold text-[#1c1710] block sm:inline">
                  ক্লিনিক্যাল টেস্ট অ্যাসিস্ট্যান্ট (Smart Suggestions):
                </span>
                <span className="text-[11px] text-stone-500 sm:ml-2">
                  ভুল ডায়াগনোসিস রোধে রোগের ক্যাটাগরি অনুযায়ী স্ট্যান্ডার্ড টেস্ট
                </span>
              </div>
            </div>

            {selectedTestPreset !== null && (
              <button
                type="button"
                onClick={() => handleAddBatchPresetTests(CLINICAL_TEST_PRESETS[selectedTestPreset].tests)}
                className="px-2.5 py-1 bg-[#0f4c42] hover:bg-[#0c3c34] text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs self-start sm:self-auto"
              >
                <Plus className="w-3 h-3" />
                <span>এই গ্রুপের সব টেস্ট নিন</span>
              </button>
            )}
          </div>

          {/* Preset Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {CLINICAL_TEST_PRESETS.map((preset, idx) => {
              const isActive = selectedTestPreset === idx;
              return (
                <button
                  key={preset.category}
                  type="button"
                  onClick={() => setSelectedTestPreset(isActive ? null : idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 border cursor-pointer ${
                    isActive
                      ? 'bg-[#0f4c42] text-white border-[#0f4c42] shadow-xs'
                      : 'bg-white hover:bg-[#ede3d3] text-stone-700 border-[#dfd0b8]'
                  }`}
                >
                  {preset.category}
                </button>
              );
            })}
          </div>

          {/* Active Preset's Tests Display */}
          {selectedTestPreset !== null && (
            <div className="pt-2 border-t border-[#ede3d3] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-600 font-semibold">
                  উদ্দেশ্য: {CLINICAL_TEST_PRESETS[selectedTestPreset].description}
                </span>
                <span className="text-stone-500">ক্লিক করে যুক্ত বা বাদ দিন</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {CLINICAL_TEST_PRESETS[selectedTestPreset].tests.map((t) => {
                  const isChecked = selectedInvestigations.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleInvestigation(t)}
                      className={`px-3 py-1 rounded-xl text-xs font-medium transition border flex items-center gap-1 cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs font-bold'
                          : 'bg-white hover:bg-[#f5efe4] text-stone-800 border-[#dfd0b8]'
                      }`}
                    >
                      {isChecked ? <CheckCircle2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      <span>{t}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected Tests Pills (Already added to prescription) */}
        {selectedInvestigations.length > 0 && (
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              <span>প্রেসক্রিপশনে সংযুক্ত টেস্টসমূহ ({selectedInvestigations.length}টি):</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedInvestigations([]);
                  try {
                    localStorage.removeItem('pending_rx_investigations');
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="text-red-600 hover:underline cursor-pointer"
              >
                সব মুছুন
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedInvestigations.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-navy-800 text-white rounded-lg text-xs font-semibold shadow-2xs"
                >
                  <Microscope className="w-3 h-3 text-cyan-300" />
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => toggleInvestigation(t)}
                    className="ml-1 hover:text-red-300 cursor-pointer"
                    title="Remove"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* General Common Investigations Chips */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            অন্যান্য সাধারণ টেস্ট (Common Quick Selector):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_INVESTIGATIONS.map((test) => {
              const isSelected = selectedInvestigations.includes(test);
              return (
                <button
                  key={test}
                  type="button"
                  onClick={() => toggleInvestigation(test)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition border cursor-pointer ${
                    isSelected
                      ? 'bg-navy-800 text-white border-navy-900 shadow-sm font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isSelected ? `✓ ${test}` : `+ ${test}`}
                </button>
              );
            })}
          </div>
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
            placeholder="অন্য কোনো পরীক্ষা লিখুন (Type custom lab test)..."
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddCustomInvestigation}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            যোগ করুন
          </button>
        </div>
      </section>

      {/* 4. Advice & Next Visit (পরামর্শ ও পরবর্তী সাক্ষাৎ) */}
      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <FileText className="w-4 h-4 text-navy-700" />
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
                    ? 'bg-navy-800 text-white border-navy-900 shadow-sm font-bold'
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
            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy-500 focus:outline-none"
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
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy-500 focus:outline-none"
          />
        </div>
      </section>

      {/* Bottom Action Floating Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleSaveClick}
          className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition cursor-pointer"
        >
          <Save className="w-4 h-4 text-navy-700" />
          <span>সংরক্ষণ করুন (Save)</span>
        </button>

        <button
          onClick={handlePrintClick}
          className="flex items-center gap-2 bg-navy-800 hover:bg-navy-900 text-white font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>প্রিন্ট প্রিভিউ ও PDF (Print / PDF)</span>
        </button>
      </div>
    </div>
  );
}
