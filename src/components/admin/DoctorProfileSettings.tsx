import { useState } from 'react';
import { Save, Check, User, Building } from 'lucide-react';

import type { DoctorProfile } from '../../types/prescription.types';

interface DoctorProfileSettingsProps {
  profile: DoctorProfile;
  onSave: (updated: DoctorProfile) => void;
}

export function DoctorProfileSettings({ profile, onSave }: DoctorProfileSettingsProps) {
  const [formData, setFormData] = useState<DoctorProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-navy-700" />
          <span>ডাক্তার ও চেম্বার প্রোফাইল (Doctor & Chamber Letterhead)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          এখানে দেওয়া তথ্যগুলো আপনার প্রিন্ট হওয়া প্রেসক্রিপশনের হেডার ও প্যাডে প্রদর্শিত হবে।
        </p>
      </div>

      {/* Doctor Credentials */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          ১. ডাক্তারের ব্যক্তিগত ও পেশাগত তথ্য
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ডাক্তারের নাম (Doctor Full Name) *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
              placeholder="e.g. Dr. Mohammad Abdullah"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ডিগ্রি ও শিক্ষাগত যোগ্যতা (Degrees) *
            </label>
            <input
              type="text"
              required
              value={formData.degrees}
              onChange={(e) => setFormData({ ...formData, degrees: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
              placeholder="e.g. MBBS (DMC), FCPS (Medicine)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              বিশেষজ্ঞ ক্ষেত্র (Specialization)
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
              placeholder="e.g. Medicine & Cardiovascular Specialist"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              BMDC রেজিস্ট্রেশন নম্বর (BMDC Reg. No.) *
            </label>
            <input
              type="text"
              required
              value={formData.bmdcRegNo}
              onChange={(e) => setFormData({ ...formData, bmdcRegNo: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
              placeholder="e.g. A-54321"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              পদবী (Designation)
            </label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
              placeholder="e.g. Associate Professor"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              কর্মস্থল / হাসপাতাল (Hospital / Institution)
            </label>
            <input
              type="text"
              value={formData.workplace}
              onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
              placeholder="e.g. Dhaka Medical College & Hospital"
            />
          </div>
        </div>
      </div>

      {/* Chamber Info */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Building className="w-4 h-4 text-navy-700" />
          <span>২. চেম্বার ও সিরিয়ালের তথ্য</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              চেম্বারের নাম (Chamber / Hospital Name)
            </label>
            <input
              type="text"
              value={formData.chamberName}
              onChange={(e) => setFormData({ ...formData, chamberName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
              placeholder="e.g. Popular Diagnostic Centre"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              সিরিয়াল / মোবাইল নম্বর (Serial / Phone)
            </label>
            <input
              type="text"
              value={formData.chamberPhone}
              onChange={(e) => setFormData({ ...formData, chamberPhone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
              placeholder="e.g. +880 1711-000000"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              চেম্বারের ঠিকানা (Chamber Full Address)
            </label>
            <input
              type="text"
              value={formData.chamberAddress}
              onChange={(e) => setFormData({ ...formData, chamberAddress: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
              placeholder="e.g. House #16, Road #2, Dhanmondi, Dhaka"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              রোগী দেখার সময়সূচী (Visiting Hours)
            </label>
            <input
              type="text"
              value={formData.visitingHours}
              onChange={(e) => setFormData({ ...formData, visitingHours: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
              placeholder="e.g. প্রতিদিন বিকাল ৫টা - রাত ৯টা (শুক্রবার বন্ধ)"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 flex items-center justify-between">
        {savedSuccess ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>প্রোফাইল সফলভাবে সংরক্ষণ করা হয়েছে!</span>
          </div>
        ) : <div />}

        <button
          type="submit"
          className="flex items-center gap-2 bg-navy-800 hover:bg-navy-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>সেভ করুন (Save Changes)</span>
        </button>
      </div>
    </form>
  );
}
