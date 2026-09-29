import { useState } from 'react';
import { History, UserCog, Database, Stethoscope } from 'lucide-react';

import { PrescriptionBuilder } from './PrescriptionBuilder';
import { PrescriptionHistoryView } from './PrescriptionHistoryView';
import { DoctorProfileSettings } from './DoctorProfileSettings';
import { PrescriptionPrintView } from './PrescriptionPrintView';
import { 
  type DoctorProfile, 
  type PrescriptionData, 
  DEFAULT_DOCTOR_PROFILE 
} from '../../types/prescription.types';

type AdminTab = 'builder' | 'history' | 'profile' | 'stats';

export function AdminView() {
  const [activeTab, setActiveTab] = useState<AdminTab>('builder');

  // Doctor Profile (persisted in localStorage)
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>(() => {
    try {
      const stored = localStorage.getItem('doctor_profile_v1');
      return stored ? JSON.parse(stored) : DEFAULT_DOCTOR_PROFILE;
    } catch {
      return DEFAULT_DOCTOR_PROFILE;
    }
  });

  // Prescriptions History (persisted in localStorage)
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>(() => {
    try {
      const stored = localStorage.getItem('saved_prescriptions_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Print Preview state
  const [printablePrescription, setPrintablePrescription] = useState<PrescriptionData | null>(null);

  // Editing Prescription state
  const [editingPrescription, setEditingPrescription] = useState<PrescriptionData | null>(null);

  const handleSaveProfile = (updated: DoctorProfile) => {
    setDoctorProfile(updated);
    try {
      localStorage.setItem('doctor_profile_v1', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save doctor profile:', err);
    }
  };

  const handleSavePrescription = (rx: PrescriptionData) => {
    setPrescriptions((prev) => {
      // If already exists, update it, otherwise prepend
      const existingIdx = prev.findIndex((p) => p.id === rx.id);
      let updated;
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = rx;
      } else {
        updated = [rx, ...prev];
      }
      try {
        localStorage.setItem('saved_prescriptions_v1', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save prescription to localStorage:', err);
      }
      return updated;
    });
  };

  const handleDeletePrescription = (id: string) => {
    if (window.confirm('আপনি কি এই প্রেসক্রিপশনটি মুছে ফেলতে চান?')) {
      setPrescriptions((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        try {
          localStorage.setItem('saved_prescriptions_v1', JSON.stringify(updated));
        } catch (err) {
          console.error('Failed to update localStorage:', err);
        }
        return updated;
      });
    }
  };

  const handleEditPrescription = (rx: PrescriptionData) => {
    setEditingPrescription(rx);
    setActiveTab('builder');
  };

  const handlePrintPreview = (rx: PrescriptionData) => {
    setPrintablePrescription(rx);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#fbf8f2] text-stone-800 flex flex-col">
      {/* Sub-navigation Tabs */}
      <div className="bg-[#f5efe4]/95 backdrop-blur-md border-b border-[#dfd0b8] sticky top-[57px] z-20 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between overflow-x-auto no-scrollbar py-2.5 gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setEditingPrescription(null);
                setActiveTab('builder');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'builder'
                  ? 'bg-[#0f4c42] text-white shadow-sm'
                  : 'text-stone-700 hover:bg-[#ede3d3] hover:text-[#1c1710]'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>প্রেসক্রিপশন তৈরি (Rx Pad)</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap relative cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#0f4c42] text-white shadow-sm'
                  : 'text-stone-700 hover:bg-[#ede3d3] hover:text-[#1c1710]'
              }`}
            >
              <History className="w-4 h-4" />
              <span>প্রেসক্রিপশন হিস্ট্রি (History)</span>
              {prescriptions.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-[#ede3d3] text-[#0f4c42] border border-[#dfd0b8]'
                }`}>
                  {prescriptions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#0f4c42] text-white shadow-sm'
                  : 'text-stone-700 hover:bg-[#ede3d3] hover:text-[#1c1710]'
              }`}
            >
              <UserCog className="w-4 h-4" />
              <span>ডাক্তার ও চেম্বার সেটিংস</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-[#0f4c42] text-white shadow-sm'
                  : 'text-stone-700 hover:bg-[#ede3d3] hover:text-[#1c1710]'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>ডাটাবেজ ওভারভিউ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">
        {activeTab === 'builder' && (
          <PrescriptionBuilder
            doctorProfile={doctorProfile}
            onPrintPreview={handlePrintPreview}
            onSavePrescription={handleSavePrescription}
            initialData={editingPrescription}
          />
        )}

        {activeTab === 'history' && (
          <PrescriptionHistoryView
            prescriptions={prescriptions}
            onSelectPrint={handlePrintPreview}
            onEditPrescription={handleEditPrescription}
            onDeletePrescription={handleDeletePrescription}
          />
        )}

        {activeTab === 'profile' && (
          <DoctorProfileSettings
            profile={doctorProfile}
            onSave={handleSaveProfile}
          />
        )}

        {activeTab === 'stats' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#dfd0b8] shadow-sm">
              <h2 className="text-base font-bold text-[#1c1710] flex items-center gap-2 border-b border-[#ede3d3] pb-3">
                <Database className="w-5 h-5 text-[#0f4c42]" />
                <span>সেন্ট্রাল মেডিসিন ডাটাবেজ স্ট্যাটাস (Database Overview)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-[#f8f4ec] border border-[#ede3d3] p-5 rounded-xl text-center">
                  <span className="text-3xl font-black text-[#0f4c42] block">২১,৯০৫+</span>
                  <span className="text-xs font-bold text-stone-800 uppercase mt-1 block">নিবন্ধিত ওষুধ (Medicines)</span>
                  <p className="text-[11px] text-stone-600 mt-1">সব থেরাপিউটিক ক্লাসের ট্যাবলেট, সিরাপ, ইনজেকশন</p>
                </div>

                <div className="bg-[#f8f4ec] border border-[#ede3d3] p-5 rounded-xl text-center">
                  <span className="text-3xl font-black text-teal-700 block">১,৭৪৪</span>
                  <span className="text-xs font-bold text-stone-800 uppercase mt-1 block">জেনেরিক উপাদান (Generics)</span>
                  <p className="text-[11px] text-stone-600 mt-1">পূর্ণাঙ্গ রাসায়নিক ফর্মুলেশন ও ক্লিনিক্যাল তথ্য</p>
                </div>

                <div className="bg-[#f8f4ec] border border-[#ede3d3] p-5 rounded-xl text-center">
                  <span className="text-3xl font-black text-emerald-700 block">৩১৩</span>
                  <span className="text-xs font-bold text-stone-800 uppercase mt-1 block">কোম্পানি (Producers)</span>
                  <p className="text-[11px] text-stone-600 mt-1">স্কয়ার, অপসোনিন, বেক্সিমকো, ইনসেপ্টা ইত্যাদি</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#dfd0b8] shadow-sm space-y-3 text-xs text-stone-700">
              <h3 className="font-bold text-sm text-[#1c1710]">⚡ ডাটাবেজ ও প্রেসক্রিপশন ইন্টিগ্রেশন বৈশিষ্ট্য:</h3>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong className="text-[#1c1710]">Multi-Token Smart Search:</strong> যে কোনো ব্র্যান্ডের নাম, স্ট্রেন্থ বা ফর্ম (যেমন: <em>Fusid Plus 40</em>, <em>Cardex 6.25</em>, <em>Napa Extra</em>) লিখে সার্চ করা যায়।</li>
                <li><strong className="text-[#1c1710]">Cloudflare Edge Caching & Offline DB:</strong> মিলিসেকেন্ডে প্রেসক্রিপশন অটো-কমপ্লিট রেসপন্স।</li>
                <li><strong className="text-[#1c1710]">সরাসরি A4 প্রিন্ট:</strong> যেকোনো স্ট্যান্ডার্ড প্রিন্টার বা 'Save as PDF' অপশন দিয়ে প্রফেশনাল প্রেসক্রিপশন প্রিন্ট করা সম্ভব।</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Printable Modal (Active when printablePrescription is set) */}
      {printablePrescription && (
        <PrescriptionPrintView
          prescription={printablePrescription}
          onClose={() => setPrintablePrescription(null)}
        />
      )}
    </div>
  );
}
