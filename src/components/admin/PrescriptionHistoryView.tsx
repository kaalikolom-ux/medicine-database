import { useState } from 'react';
import { Search, Printer, Edit3, Trash2, Calendar, User, FileText } from 'lucide-react';
import type { PrescriptionData } from '../../types/prescription.types';


interface PrescriptionHistoryViewProps {
  prescriptions: PrescriptionData[];
  onSelectPrint: (prescription: PrescriptionData) => void;
  onEditPrescription: (prescription: PrescriptionData) => void;
  onDeletePrescription: (id: string) => void;
}

export function PrescriptionHistoryView({
  prescriptions,
  onSelectPrint,
  onEditPrescription,
  onDeletePrescription,
}: PrescriptionHistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = prescriptions.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.patient.name.toLowerCase().includes(q) ||
      (item.patient.phone && item.patient.phone.includes(q)) ||
      item.id.toLowerCase().includes(q) ||
      (item.clinicalDiagnosis && item.clinicalDiagnosis.toLowerCase().includes(q)) ||
      item.medicines.some((m) => m.brandName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Search & Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>সংরক্ষিত প্রেসক্রিপশন হিস্ট্রি ({prescriptions.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            পূর্বে তৈরি করা রোগীর প্রেসক্রিপশন পুনরায় দেখুন, প্রিন্ট করুন বা সম্পাদন করুন।
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="রোগীর নাম বা মোবাইল দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* List of Prescriptions */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center border border-slate-200 rounded-2xl shadow-sm text-slate-400 space-y-2">
          <FileText className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">কোনো সংরক্ষিত প্রেসক্রিপশন পাওয়া যায়নি</p>
          <p className="text-xs text-slate-400">নতুন প্রেসক্রিপশন তৈরি করে 'Save' বাটনে ক্লিক করলে তা এখানে দেখতে পাবেন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((rx) => (
            <div
              key={rx.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
            >
              <div>
                {/* Header Strip */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 block mb-1">
                      #{rx.id}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{rx.patient.name}</span>
                    </h3>
                  </div>

                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{rx.patient.date}</span>
                  </span>
                </div>

                {/* Patient Summary */}
                <div className="pt-2 flex flex-wrap gap-3 text-xs text-slate-600">
                  <span><strong>বয়স:</strong> {rx.patient.age ? `${rx.patient.age} বছর` : 'N/A'}</span>
                  <span><strong>লিঙ্গ:</strong> {rx.patient.gender}</span>
                  {rx.patient.phone && <span><strong>মোবাইল:</strong> {rx.patient.phone}</span>}
                  {rx.vitals.bloodPressure && <span><strong>BP:</strong> {rx.vitals.bloodPressure}</span>}
                </div>

                {/* Diagnosis / Complaints */}
                {rx.clinicalDiagnosis && (
                  <p className="text-xs text-emerald-900 font-semibold bg-emerald-50/50 p-2 rounded-lg mt-2">
                    <strong>Dx:</strong> {rx.clinicalDiagnosis}
                  </p>
                )}

                {/* Medicines List Preview */}
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">
                    ওষুধসমূহ ({rx.medicines.length} টি):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rx.medicines.map((m) => (
                      <span
                        key={m.id}
                        className="bg-slate-100 text-slate-800 text-[11px] font-medium px-2 py-0.5 rounded-md"
                      >
                        {m.brandName} ({m.dosageFrequency})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onDeletePrescription(rx.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  title="Delete prescription"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditPrescription(rx)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>এডিট (Edit)</span>
                  </button>

                  <button
                    onClick={() => onSelectPrint(rx)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>প্রিন্ট (Print)</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
