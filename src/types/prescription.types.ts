export interface DoctorProfile {
  name: string;
  degrees: string;
  specialization: string;
  bmdcRegNo: string;
  designation: string;
  workplace: string;
  chamberName: string;
  chamberAddress: string;
  chamberPhone: string;
  visitingHours: string;
}

export interface PatientVitals {
  bloodPressure?: string;   // e.g. "120/80 mmHg"
  pulse?: string;           // e.g. "72 bpm"
  weight?: string;          // e.g. "65 kg"
  temperature?: string;     // e.g. "98.6 °F"
}

export interface PrescribedMedicine {
  id: string;               // Unique id for this line item in the prescription
  medicineId?: string;      // Supabase medicine_id if selected from database
  brandName: string;        // e.g. "Fusid Plus"
  dosageForm: string;       // e.g. "Tablet", "Capsule", "Syrup", "Injection", "Ointment"
  strength: string;          // e.g. "40 mg+50 mg"
  genericName: string;      // e.g. "Furosemide + Spironolactone"
  producerName?: string;    // e.g. "Square Pharmaceuticals Ltd."
  dosageFrequency: string;  // e.g. "১ + ০ + ১" (সকাল + দুপুর + রাত)
  timing: string;           // e.g. "খাওয়ার পর" or "খাওয়ার আগে"
  duration: string;         // e.g. "৭ দিন" or "চলবে"
  specialInstructions?: string; // e.g. "কুসুম গরম পানিতে খাবেন"
}

export interface PrescriptionData {
  id: string;               // Unique prescription ID, e.g. "RX-20260920-ABCD"
  createdAt: string;        // ISO timestamp
  doctor: DoctorProfile;
  patient: {
    name: string;
    age: string;
    gender: 'Male' | 'Female' | 'Other' | string;
    phone?: string;
    address?: string;
    date: string;
  };
  vitals: PatientVitals;
  chiefComplaints: string;  // C/C
  clinicalDiagnosis: string;// Dx
  investigations: string[]; // Lab tests advised (e.g. CBC, RBS, Serum Creatinine)
  medicines: PrescribedMedicine[];
  advice: string[];         // General advice / পরামর্শ
  followUpDate?: string;    // Next appointment / পরবর্তী সাক্ষাত
}

export const DEFAULT_DOCTOR_PROFILE: DoctorProfile = {
  name: 'Dr. Mohammad Abdullah',
  degrees: 'MBBS (DMC), FCPS (Medicine), MACP (USA)',
  specialization: 'Medicine & Cardiovascular Specialist',
  bmdcRegNo: 'A-54321',
  designation: 'Associate Professor, Department of Medicine',
  workplace: 'Dhaka Medical College & Hospital',
  chamberName: 'Popular Diagnostic Centre, Dhanmondi',
  chamberAddress: 'House #16, Road #2, Dhanmondi, Dhaka-1205',
  chamberPhone: '+880 1711-000000',
  visitingHours: 'Daily 5:00 PM - 9:00 PM (Friday Closed)',
};
