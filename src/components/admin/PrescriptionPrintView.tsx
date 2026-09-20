import { Printer, X } from 'lucide-react';
import type { PrescriptionData } from '../../types/prescription.types';


interface PrescriptionPrintViewProps {
  prescription: PrescriptionData;
  onClose: () => void;
}

export function PrescriptionPrintView({ prescription, onClose }: PrescriptionPrintViewProps) {
  const { doctor, patient, vitals, chiefComplaints, clinicalDiagnosis, investigations, medicines, advice, followUpDate, id } = prescription;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2 print:hidden bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-navy-800 hover:bg-navy-900 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>প্রিন্ট / PDF সেভ করুন (Print / PDF)</span>
        </button>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* A4 Printable Prescription Sheet */}
      <div 
        id="printable-prescription"
        className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-2xl print:shadow-none print:rounded-none print:p-6 print:m-0 print:w-full print:min-h-0 flex flex-col justify-between"
      >
        <div>
          {/* 1. Doctor & Chamber Header */}
          <header className="border-b-2 border-navy-900 pb-4 mb-4 flex flex-col sm:flex-row justify-between gap-4">
            {/* Left: Doctor Credentials */}
            <div className="space-y-1 max-w-sm">
              <h1 className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight">
                {doctor.name || 'Dr. Physician Name'}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                {doctor.degrees}
              </p>
              <p className="text-xs text-navy-700 font-bold">
                {doctor.specialization}
              </p>
              <p className="text-[11px] text-slate-600">
                {doctor.designation}
              </p>
              <p className="text-[11px] text-slate-600">
                {doctor.workplace}
              </p>
              <div className="pt-1">
                <span className="inline-block bg-navy-50 text-navy-900 text-[10px] font-bold px-2 py-0.5 rounded border border-navy-200">
                  BMDC Reg. No: {doctor.bmdcRegNo || 'Pending'}
                </span>
              </div>
            </div>

            {/* Right: Chamber Details */}
            <div className="text-left sm:text-right space-y-1 max-w-xs text-xs text-slate-700">
              <h2 className="font-bold text-sm text-slate-900">
                {doctor.chamberName || 'Medical Chamber'}
              </h2>
              <p className="text-[11px] leading-relaxed">
                {doctor.chamberAddress}
              </p>
              {doctor.chamberPhone && (
                <p className="text-[11px] font-semibold text-slate-800">
                  Serial / Hot Line: {doctor.chamberPhone}
                </p>
              )}
              {doctor.visitingHours && (
                <p className="text-[11px] text-navy-800 font-medium">
                  {doctor.visitingHours}
                </p>
              )}
            </div>
          </header>

          {/* 2. Patient Demographics & Vitals Strip */}
          <section className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Patient Name (রোগীর নাম)</span>
              <strong className="text-slate-900 text-sm">{patient.name || 'Anonymous Patient'}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Age / Sex (বয়স / লিঙ্গ)</span>
              <span className="font-semibold text-slate-800">
                {patient.age ? `${patient.age} yrs` : 'N/A'} • {patient.gender || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Date & Rx No. (তারিখ)</span>
              <span className="font-semibold text-slate-800">
                {patient.date || new Date().toLocaleDateString('en-GB')}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">#{id}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Vitals (BP / Pulse / Wt)</span>
              <span className="font-semibold text-slate-800">
                {vitals.bloodPressure ? `BP: ${vitals.bloodPressure}` : ''}
                {vitals.pulse ? ` • P: ${vitals.pulse}` : ''}
                {vitals.weight ? ` • Wt: ${vitals.weight}` : ''}
                {!vitals.bloodPressure && !vitals.pulse && !vitals.weight && '—'}
              </span>
            </div>
          </section>

          {/* 3. Prescription Main Body (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[420px]">
            {/* Left Column: Complaints, Diagnosis & Investigations (4 cols) */}
            <aside className="md:col-span-4 border-r-0 md:border-r border-slate-200 pr-0 md:pr-5 space-y-5">
              {/* Chief Complaints */}
              {chiefComplaints && (
                <div>
                  <h3 className="text-[11px] uppercase font-black tracking-wider text-navy-900 border-b border-navy-100 pb-1 mb-1.5">
                    Chief Complaints (C/C)
                  </h3>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {chiefComplaints}
                  </p>
                </div>
              )}

              {/* Diagnosis */}
              {clinicalDiagnosis && (
                <div>
                  <h3 className="text-[11px] uppercase font-black tracking-wider text-navy-900 border-b border-navy-100 pb-1 mb-1.5">
                    Diagnosis (Dx)
                  </h3>
                  <p className="text-xs font-semibold text-slate-800">
                    {clinicalDiagnosis}
                  </p>
                </div>
              )}

              {/* Investigations Advised */}
              {investigations && investigations.length > 0 && (
                <div>
                  <h3 className="text-[11px] uppercase font-black tracking-wider text-navy-900 border-b border-navy-100 pb-1 mb-1.5">
                    Investigations (পরীক্ষাসমূহ)
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                    {investigations.map((test, i) => (
                      <li key={i} className="leading-snug">{test}</li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>

            {/* Right Column: Rx & Medicines List (8 cols) */}
            <main className="md:col-span-8 pl-0 md:pl-2">
              {/* Prominent Rx Symbol */}
              <div className="flex items-center gap-2 mb-4 pb-1 border-b border-slate-200">
                <span className="text-3xl font-serif font-black text-navy-900 leading-none">℞</span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Medicines & Dosing Instructions</span>
              </div>

              {/* Medicine List */}
              {medicines.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-8">কোনো ওষুধ যুক্ত করা হয়নি (No medicines added yet)</p>
              ) : (
                <div className="space-y-4">
                  {medicines.map((med, index) => {
                    const formPrefix = med.dosageForm ? `${med.dosageForm}.` : 'Tab.';
                    return (
                      <div key={med.id} className="pb-3 border-b border-slate-100 last:border-0">
                        {/* Medicine Title */}
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-bold text-slate-500">{index + 1}.</span>
                            <span className="text-xs font-semibold text-navy-950">{formPrefix}</span>
                            <strong className="text-sm font-black text-slate-900">{med.brandName}</strong>
                            {med.strength && (
                              <span className="text-xs font-bold text-navy-700 ml-1">
                                ({med.strength})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Generic Name */}
                        {med.genericName && (
                          <p className="text-[11px] text-slate-500 pl-4 italic">
                            {med.genericName}
                          </p>
                        )}

                        {/* Dosing, Timing & Duration */}
                        <div className="flex flex-wrap items-center gap-2 pl-4 mt-1 text-xs text-slate-800">
                          {med.dosageFrequency && (
                            <span className="font-bold text-navy-800 bg-navy-50 px-2 py-0.5 rounded border border-navy-100">
                              {med.dosageFrequency}
                            </span>
                          )}
                          {med.timing && (
                            <span className="font-medium text-slate-700">
                              — {med.timing}
                            </span>
                          )}
                          {med.duration && (
                            <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                              ({med.duration})
                            </span>
                          )}
                        </div>

                        {/* Special Instructions */}
                        {med.specialInstructions && (
                          <p className="text-[11px] text-amber-900 bg-amber-50/70 border border-amber-100 rounded px-2 py-0.5 mt-1 ml-4 inline-block">
                            💡 {med.specialInstructions}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        </div>

        {/* 4. Advice, Follow-up & Doctor Signature Footer */}
        <footer className="mt-8 pt-4 border-t-2 border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            {/* Advice & Follow-up */}
            <div className="sm:col-span-8 space-y-2">
              {advice && advice.length > 0 && (
                <div>
                  <h4 className="text-[11px] uppercase font-bold text-slate-700">
                    Advice / পরামর্শ:
                  </h4>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {advice.join(' • ')}
                  </p>
                </div>
              )}

              {followUpDate && (
                <p className="text-xs font-bold text-navy-800">
                  📅 পরবর্তী সাক্ষাত (Next Visit): {followUpDate}
                </p>
              )}

              <p className="text-[9px] text-slate-400 italic pt-1">
                * কম্পিউটারাইজড প্রেসক্রিপশন। চিকিৎসকের অনুমতি ছাড়া কোনো ওষুধ পরিবর্তন বা বন্ধ করবেন না।
              </p>
            </div>

            {/* Doctor Signature Box */}
            <div className="sm:col-span-4 text-center sm:text-right pt-6 sm:pt-0">
              <div className="inline-block text-center border-t border-slate-400 pt-1.5 px-6">
                <p className="text-xs font-bold text-slate-900">{doctor.name}</p>
                <p className="text-[10px] text-slate-500">Authorized Signature</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
