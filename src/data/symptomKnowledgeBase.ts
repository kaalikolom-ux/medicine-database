export interface RecommendedGeneric {
  genericName: string;
  roleBn: string;
  roleEn: string;
  typicalDosageBn: string;
  timingBn?: string;
}

export type TestCategory = 'blood' | 'urine_stool' | 'radiology' | 'cardiac' | 'specialized';
export type TestUrgency = 'routine' | 'if_persists' | 'immediate';

export interface RecommendedPathologyTest {
  testName: string;
  testCategory: TestCategory;
  categoryLabelBn: string;
  reasonBn: string;
  reasonEn: string;
  urgency: TestUrgency;
  urgencyLabelBn: string;
  preventsErrorBn: string;
}

export interface SymptomCondition {
  id: string;
  nameBn: string;
  nameEn: string;
  category: string;
  severity: 'mild' | 'moderate' | 'consult_doctor' | 'emergency';
  summaryBn: string;
  summaryEn: string;
  banglaKeywords: string[];
  englishKeywords: string[];
  recommendedGenerics: RecommendedGeneric[];
  recommendedTests: RecommendedPathologyTest[];
  lifestyleAdviceBn: string[];
  lifestyleAdviceEn: string[];
  warningsBn: string[];
  emergencyWarningBn?: string;
}

export const SYMPTOM_CONDITIONS: SymptomCondition[] = [
  // 1. Fever & Pain
  {
    id: 'fever_pain',
    nameBn: 'জ্বর, গা গরম ও শরীর ব্যথা',
    nameEn: 'Fever, Headache & Body Ache',
    category: 'Analgesics & Antipyretics',
    severity: 'mild',
    summaryBn: 'ভাইরাল ইনফেকশন, ঠাণ্ডা লাগা বা ব্যাকটেরিয়াল সংক্রমণের কারণে জ্বর ও গা ব্যথা হতে পারে।',
    summaryEn: 'Common fever, headache, and generalized body ache associated with viral infections or bacterial illness.',
    banglaKeywords: [
      'জ্বর', 'গা গরম', 'গায়ে জ্বর', 'জ্বর ভাব', 'মাথাব্যথা', 'মাথা ব্যথা', 'মাথা ধরেছে', 
      'শরীর ব্যথা', 'গা হাত পা ব্যথা', 'গা ব্যথা', 'কম্পন', 'হালকা জ্বর', 'তীব্র জ্বর', 
      'চোখ গরম', 'কপাল গরম'
    ],
    englishKeywords: [
      'fever', 'high temperature', 'feverish', 'headache', 'body ache', 'pain', 
      'temperature', 'chills', 'pyrexia', 'body pain', 'mild fever', 'severe headache'
    ],
    recommendedGenerics: [
      {
        genericName: 'Paracetamol',
        roleBn: 'জ্বর ও সাধারণ ব্যথা উপশমের প্রথম সারির নিরাপদ ওষুধ',
        roleEn: 'First-line medication for fever reduction and mild-to-moderate pain',
        typicalDosageBn: 'প্রাপ্তবয়স্ক: ৫০০ মি.গ্রা. থেকে ১০০০ মি.গ্রা. দিনে ৩-৪ বার (প্রয়োজনে)',
        timingBn: 'খাওয়ার পর (ভরা পেটে সেব্য)'
      }
    ],
    recommendedTests: [
      {
        testName: 'CBC with ESR',
        testCategory: 'blood',
        categoryLabelBn: 'রক্ত পরীক্ষা',
        reasonBn: 'শ্বেতকণিকা (WBC), নিউট্রোফিল ও প্লেটলেট কাউন্ট দেখে ভাইরাল নাকি ব্যাকটেরিয়াল সংক্রমণ তা নির্ণয়ে।',
        reasonEn: 'Assesses total leukocyte count, platelet count, and markers of active inflammation.',
        urgency: 'if_persists',
        urgencyLabelBn: 'জ্বর ৩+ দিন স্থায়ী হলে',
        preventsErrorBn: 'প্লেটলেট কাউন্ট পর্যবেক্ষণ করে ডেঙ্গু শক সিন্ড্রোম ও মারাত্মক সেপসিস মিস হওয়া রোধ করে।'
      },
      {
        testName: 'Dengue NS1 Antigen & Dengue IgM/IgG',
        testCategory: 'blood',
        categoryLabelBn: 'ডেঙ্গু স্ক্রিনিং',
        reasonBn: 'জ্বরের প্রথম ১ থেকে ৪ দিনের মধ্যে ডেঙ্গু ভাইরাস সংক্রমণ নিশ্চিতকরণের গোল্ড স্ট্যান্ডার্ড টেস্ট।',
        reasonEn: 'Early qualitative detection of Dengue viral antigen and antibodies.',
        urgency: 'immediate',
        urgencyLabelBn: 'তীব্র জ্বর বা ডেঙ্গু মৌসুমে জরুরি',
        preventsErrorBn: 'সাধারণ ফ্লু মনে করে ভুলবশত ব্যথানাশক (NSAIDs) প্রয়োগ বন্ধ করে প্রাণঘাতী অভ্যন্তরীণ রক্তপাত প্রতিরোধ করে।'
      },
      {
        testName: 'Widal Test / Blood Culture & Sensitivity (C/S)',
        testCategory: 'blood',
        categoryLabelBn: 'টাইফয়েড ও কালচার',
        reasonBn: 'জ্বর ৫-৭ দিনের বেশি স্থায়ী হলে এন্টেরিক ফিভার (টাইফয়েড) নিশ্চিতকরণ ও সঠিক অ্যান্টিবায়োটিক নির্বাচনে।',
        reasonEn: 'Diagnostic evaluation for Salmonella typhi and precise antimicrobial sensitivity.',
        urgency: 'if_persists',
        urgencyLabelBn: 'টানা ৫-৭ দিন জ্বর থাকলে',
        preventsErrorBn: 'অনুমাননির্ভর ভুল অ্যান্টিবায়োটিক ব্যবহার ও অ্যান্টিবায়োটিক রেজিস্ট্যান্সের ঝুঁকি কমায়।'
      },
      {
        testName: 'Urine R/M/E',
        testCategory: 'urine_stool',
        categoryLabelBn: 'প্রস্রাব পরীক্ষা',
        reasonBn: 'উপসর্গহীন মূত্রনালীর সংক্রমণ (UTI) জ্বরের সুপ্ত কারণ কিনা তা নিশ্চিত হতে।',
        reasonEn: 'Screens for occult urinary tract infection as the source of pyrexia.',
        urgency: 'routine',
        urgencyLabelBn: 'প্রাথমিক স্ক্রিনিং',
        preventsErrorBn: 'কিডনি বা মূত্রথলির ইনফেকশন ডায়াগনোসিস না করে ভুল চিকিৎসার সম্ভাবনা দূর করে।'
      }
    ],
    lifestyleAdviceBn: [
      'পর্যাপ্ত বিশ্রাম নিন ও প্রচুর তরল খাবার (পানি, ওরস্যালাইন, স্যুপ) পান করুন।',
      'মাথায় ভেজা কাপড়ের পট্টি দিন বা স্বাভাবিক তাপমাত্রার পানিতে শরীর স্পঞ্জ করুন।',
      'ঠাণ্ডা বা ভারী খাবার পরিহার করুন।'
    ],
    lifestyleAdviceEn: [
      'Get adequate rest and drink plenty of fluids (water, oral saline, clear soup).',
      'Use lukewarm sponge baths to help reduce body temperature.',
      'Wear light and comfortable clothing.'
    ],
    warningsBn: [
      'একবারে প্যারাসিটামলের সর্বোচ্চ মাত্রা ১০০০ মি.গ্রা. এবং ২৪ ঘণ্টায় ৪০০০ মি.গ্রা.-এর বেশি গ্রহণ করবেন না।',
      '৩ দিনের বেশি একটানা জ্বর থাকলে বা সাথে গায়ে লাল র‍্যাশ উঠলে ডেঙ্গু/টাইফয়েড পরীক্ষার জন্য ডাক্তারের পরামর্শ নিন।'
    ],
    emergencyWarningBn: '১০৩°F এর বেশি জ্বর, প্রলাপ বকা বা ঘাড় শক্ত হয়ে গেলে তাৎক্ষণিক হাসপাতালে যান।'
  },

  // 2. Gastric, Acidity, GERD & Bloating
  {
    id: 'gastric_acidity',
    nameBn: 'গ্যাস্ট্রিক, এসিডিটি, বুকজ্বালা ও বদহজম',
    nameEn: 'Gastric, Acidity, Heartburn & GERD',
    category: 'Proton Pump Inhibitor (PPI) & Antacid',
    severity: 'mild',
    summaryBn: 'পাকস্থলীতে অতিরিক্ত এসিড উৎপাদন বা তেল-মশলাযুক্ত খাবারের কারণে বুকজ্বালা ও পেট ফাঁপা হতে পারে।',
    summaryEn: 'Excess stomach acid production leading to heartburn, acid reflux, epigastric burning, or bloating.',
    banglaKeywords: [
      'গ্যাস্ট্রিক', 'এসিডিটি', 'বুক জ্বালা', 'বুকজ্বালা', 'বুক জ্বলে', 'বুক জ্বালাপোড়া', 
      'গলা জ্বলে', 'পেট ফাঁপা', 'ঢেকুর', 'টক ঢেকুর', 'পেট জ্বলে', 'বদহজম', 'পেট ফোলা', 
      'খাওয়ার পর পেট জ্বলে', 'গ্যাস', 'পেটে গ্যাস'
    ],
    englishKeywords: [
      'gastric', 'acidity', 'heartburn', 'acid reflux', 'gerd', 'stomach burning', 
      'bloating', 'indigestion', 'belching', 'gas', 'sour burp', 'stomach fullness'
    ],
    recommendedGenerics: [
      {
        genericName: 'Esomeprazole',
        roleBn: 'পাকস্থলীর অতিরিক্ত এসিড নিবারণ ও আলসার প্রতিরোধে কার্যকর',
        roleEn: 'Effective proton pump inhibitor that suppresses stomach acid production',
        typicalDosageBn: '২০ মি.গ্রা. বা ৪০ মি.গ্রা. দিনে ১-২ বার',
        timingBn: 'খাওয়ার ৩০ মিনিট পূর্বে (সকালে ও রাতে খালি পেটে)'
      },
      {
        genericName: 'Omeprazole',
        roleBn: 'দীর্ঘমেয়াদী বুকজ্বালা ও গ্যাস্ট্রিক আলসার চিকিৎসায় স্ট্যান্ডার্ড PPI',
        roleEn: 'Standard PPI for treatment of reflux esophagitis and peptic ulcers',
        typicalDosageBn: '২০ মি.গ্রা. দিনে ১-২ বার',
        timingBn: 'সকালে খাওয়ার পূর্বে খালি পেটে'
      },
      {
        genericName: 'Pantoprazole',
        roleBn: 'এসিড রিফ্লাক্স ও তীব্র গ্যাস্ট্রিকের লক্ষণ দ্রুত প্রশমনে সহায়ক',
        roleEn: 'Effective acid suppressor for gastroesophageal reflux disease',
        typicalDosageBn: '২০ মি.গ্রা. বা ৪০ মি.গ্রা. দিনে একবার',
        timingBn: 'সকালে খালি পেটে'
      }
    ],
    recommendedTests: [
      {
        testName: 'ECG (12 Lead)',
        testCategory: 'cardiac',
        categoryLabelBn: 'ইসিজি ও কার্ডিয়াক',
        reasonBn: 'বুকের মাঝখানে বা পেটের উপরিভাগে জ্বালাপোড়া বা অস্বস্তি হার্ট অ্যাটাকের লক্ষণ কিনা তা শতভাগ নিশ্চিত হতে।',
        reasonEn: 'Rules out inferior wall myocardial infarction presenting atypically as epigastric discomfort.',
        urgency: 'immediate',
        urgencyLabelBn: '৪০+ বয়স্ক বা বুকে চাপ থাকলে জরুরি',
        preventsErrorBn: 'চিকিৎসা বিজ্ঞানের সবচেয়ে মারাত্মক ভুল: হার্ট অ্যাটাককে সাধারণ গ্যাস্ট্রিক মনে করে চিকিৎসা করা প্রতিরোধ করে।'
      },
      {
        testName: 'USG of Whole Abdomen',
        testCategory: 'radiology',
        categoryLabelBn: 'আল্ট্রাসনোগ্রাম',
        reasonBn: 'পিত্তথলিতে পাথর (Gallstones), ফ্যাটি লিভার বা অগ্ন্যাশয়ের প্রদাহ শনাক্তে।',
        reasonEn: 'Screens for cholelithiasis, biliary colic, hepatic steatosis, and abdominal pathologies.',
        urgency: 'if_persists',
        urgencyLabelBn: 'ওষুধ সেবনেও পেটব্যথা না কমলে',
        preventsErrorBn: 'পিত্তথলির পাথরজনিত তীব্র কলিক ব্যথায় অযথা মাসের পর মাস গ্যাস্ট্রিকের ওষুধ চালিয়ে যাওয়ার অপচিকিৎসা রোধ করে।'
      },
      {
        testName: 'Upper GI Endoscopy',
        testCategory: 'specialized',
        categoryLabelBn: 'এন্ডোস্কোপি',
        reasonBn: 'পাকস্থলী ও খাদ্যনালীর অভ্যন্তরীণ দেয়ালের আলসার, ক্ষত বা রিফ্লাক্সের সঠিক গভীরতা দেখতে।',
        reasonEn: 'Direct visual inspection of mucosal erosion, peptic ulceration, and esophageal lesions.',
        urgency: 'if_persists',
        urgencyLabelBn: 'দীর্ঘস্থায়ী গ্যাস্ট্রিক বা ওজন কমলে',
        preventsErrorBn: 'পাকস্থলীর মারাত্মক ক্ষত বা ম্যালিগন্যান্সি প্রারম্ভিক পর্যায়েই ধরা নিশ্চিত করে।'
      },
      {
        testName: 'Serum Lipase & Amylase',
        testCategory: 'blood',
        categoryLabelBn: 'প্যানক্রিয়াস পরীক্ষা',
        reasonBn: 'তীব্র পেটে ব্যথা বা পিঠে ছড়িয়ে যাওয়া ব্যথায় অ্যাকিউট প্যানক্রিয়াটাইটিস বাদ দিতে।',
        reasonEn: 'Diagnostic enzymatic markers to exclude acute pancreatitis.',
        urgency: 'immediate',
        urgencyLabelBn: 'তীব্র পেটের ব্যথায় জরুরি',
        preventsErrorBn: 'অগ্ন্যাশয়ের প্রাণঘাতী প্রদাহকে সাধারণ এসিডিটি ভাবার বিভ্রান্তি রোধ করে।'
      }
    ],
    lifestyleAdviceBn: [
      'একসাথে বেশি না খেয়ে অল্প অল্প করে নির্দিষ্ট সময়ে খাবার গ্রহণ করুন।',
      'তৈলাক্ত, ভাজাপোড়া, অতিরিক্ত ঝাল ও কোমল পানীয় বর্জন করুন।',
      'খাওয়ার সাথে সাথেই ঘুমাতে যাবেন না; খাওয়ার অন্তত ২ ঘণ্টা পর বিছানায় যান।'
    ],
    lifestyleAdviceEn: [
      'Eat smaller, frequent meals rather than large heavy meals.',
      'Avoid oily, deep-fried, spicy foods, carbonated drinks, and smoking.',
      'Do not lie down immediately after meals; maintain a 2-hour gap before sleeping.'
    ],
    warningsBn: [
      'কালো পায়খানা বা রক্তবমি হলে গ্যাস্ট্রিকের ওষুধ না খেয়ে অবিলম্বে বিশেষজ্ঞ ডাক্তারের শরণাপন্ন হন।',
      'অতিরিক্ত ব্যথানাশক ওষুধ গ্রহণের কারণে গ্যাস্ট্রিকের তীব্রতা বেড়ে যেতে পারে।'
    ]
  },

  // 3. Nausea & Vomiting
  {
    id: 'nausea_vomiting',
    nameBn: 'বমি বমি ভাব ও বমি',
    nameEn: 'Nausea & Vomiting',
    category: 'Antiemetic & Gastroprokinetic',
    severity: 'moderate',
    summaryBn: 'খাবারের বিষক্রিয়া, গ্যাস্ট্রিক বা ইনফেকশনজনিত কারণে বমি বমি ভাব বা বমি হতে পারে।',
    summaryEn: 'Symptom caused by food poisoning, gastrointestinal distress, or infections.',
    banglaKeywords: [
      'বমি', 'বমি বমি ভাব', 'বমি ভাব', 'বমি হওয়া', 'বমি হচ্ছে', 'পেট গুলানো', 
      'খাবার খেতে পারি না', 'পেট মোচড়ানো'
    ],
    englishKeywords: [
      'vomiting', 'nausea', 'throwing up', 'queasy', 'nauseous', 'vomit', 
      'motion sickness', 'food poisoning'
    ],
    recommendedGenerics: [
      {
        genericName: 'Domperidone',
        roleBn: 'বমি ভাব দূর করে এবং খাদ্য পরিপাক নালীর স্বাভাবিক গতি নিশ্চিত করে',
        roleEn: 'Prokinetic and antiemetic relieving nausea, bloating, and vomiting',
        typicalDosageBn: '১০ মি.গ্রা. দিনে ২-৩ বার',
        timingBn: 'খাওয়ার ১৫-৩০ মিনিট পূর্বে'
      },
      {
        genericName: 'Ondansetron',
        roleBn: 'তীব্র বমি ও গ্যাস্ট্রোএন্টারাইটিস জনিত বমি নিয়ন্ত্রণে কার্যকর',
        roleEn: 'Potent 5-HT3 receptor antagonist for acute nausea and vomiting',
        typicalDosageBn: '৪ মি.গ্রা. বা ৮ মি.গ্রা. প্রয়োজন অনুযায়ী দিনে ২ বার',
        timingBn: 'খাওয়ার পূর্বে বা পরে'
      }
    ],
    recommendedTests: [
      {
        testName: 'Serum Electrolytes (Na+, K+, Cl-, HCO3-)',
        testCategory: 'blood',
        categoryLabelBn: 'ইলেকট্রোলাইট পরীক্ষা',
        reasonBn: 'ঘন ঘন বমির কারণে সোডিয়াম ও পটাশিয়ামের বিপজ্জনক হ্রাস (Hypokalemia) নির্ণয়ে।',
        reasonEn: 'Monitors electrolyte loss and prevents fatal hypokalemia or cardiac dysrhythmias.',
        urgency: 'immediate',
        urgencyLabelBn: 'ঘন ঘন বমি হলে জরুরি',
        preventsErrorBn: 'ইলেকট্রোলাইট ঘাটতি ও মেটাবলিক অ্যালকালসিস মিস হয়ে হৃদযন্ত্রের জটিলতা তৈরি হওয়া প্রতিরোধ করে।'
      },
      {
        testName: 'Serum Creatinine',
        testCategory: 'blood',
        categoryLabelBn: 'কিডনি ফাংশন',
        reasonBn: 'পানিশূন্যতার কারণে কিডনির কার্যকারিতায় টান (Acute Kidney Injury) পড়েছে কিনা যাচাইয়ে।',
        reasonEn: 'Assesses renal perfusion and prevents prerenal acute kidney injury.',
        urgency: 'immediate',
        urgencyLabelBn: 'পানিশূন্যতার লক্ষণ থাকলে',
        preventsErrorBn: 'কিডনির আকস্মিক বৈকল্য আগে থেকেই ধরে সময়মত আইভি ফ্লুইড থেরাপির মাত্রা নির্ধারণ নিশ্চিত করে।'
      },
      {
        testName: 'USG of Whole Abdomen',
        testCategory: 'radiology',
        categoryLabelBn: 'আল্ট্রাসনোগ্রাম',
        reasonBn: 'তীব্র বমির সাথে পেটব্যথায় অ্যাপেন্ডিসাইটিস, গলব্লাডারের পাথর বা অন্ত্রের ব্লকেজ শনাক্তে।',
        reasonEn: 'Identifies acute appendicitis, bowel obstruction, or biliary etiology.',
        urgency: 'immediate',
        urgencyLabelBn: 'পেটব্যথা থাকলে জরুরি',
        preventsErrorBn: 'জরুরি সার্জিক্যাল রোগকে কেবল সাধারণ গ্যাস্ট্রোএন্টারাইটিস ভাবার মারাত্মক ভুল ঠেকায়।'
      }
    ],
    lifestyleAdviceBn: [
      'বমি হলে সাথে সাথে ভারী খাবার খাবেন না, অল্প অল্প করে খাবার স্যালাইন বা ডাবের পানি পান করুন।',
      'তৈলাক্ত ও তীব্র গন্ধযুক্ত খাবার থেকে দূরে থাকুন।'
    ],
    lifestyleAdviceEn: [
      'Sip oral rehydration saline or coconut water slowly in small amounts.',
      'Avoid fatty, sweet, or strong-smelling foods.'
    ],
    warningsBn: [
      'একটানা ঘন ঘন বমি হলে পানিশূন্যতা রোধে স্যালাইন বজায় রাখুন এবং ডাক্তারের পরামর্শ নিন।'
    ]
  },

  // 4. Common Cold, Runny Nose, Sneezing & Nasal Congestion
  {
    id: 'cold_rhinitis',
    nameBn: 'সর্দি, নাক বন্ধ ও হাঁচি',
    nameEn: 'Common Cold, Runny Nose & Allergic Rhinitis',
    category: 'Antihistamines',
    severity: 'mild',
    summaryBn: 'মৌসুমি ঠাণ্ডা, ধুলোবালি বা অ্যালার্জির কারণে সর্দি, হাঁচি ও নাক বন্ধ হতে পারে।',
    summaryEn: 'Upper respiratory allergy or viral cold causing rhinorrhea, nasal blockage, and sneezing.',
    banglaKeywords: [
      'সর্দি', 'ঠাণ্ডা', 'ঠান্ডা', 'নাক দিয়ে পানি পড়ে', 'নাক বন্ধ', 'হাঁচি', 'নাক চুলকায়', 
      'মাথা ভারী', 'সর্দিকাশি', 'নাক দিয়ে পানি ঝরে'
    ],
    englishKeywords: [
      'cold', 'common cold', 'runny nose', 'blocked nose', 'nasal congestion', 
      'sneezing', 'allergic rhinitis', 'running nose', 'rhinorrhea', 'flu'
    ],
    recommendedGenerics: [
      {
        genericName: 'Fexofenadine',
        roleBn: 'দ্বিতীয় প্রজন্মের আধুনিক নন-সিডেটিভ অ্যান্টিহিস্টামিন (ঘুম কম হয়)',
        roleEn: 'Non-drowsy 2nd generation antihistamine for relief of sneezing and runny nose',
        typicalDosageBn: '১২০ মি.গ্রা. বা ১৮০ মি.গ্রা. দিনে একবার (রাত্রে)',
        timingBn: 'খাওয়ার পরে'
      },
      {
        genericName: 'Cetirizine',
        roleBn: 'সর্দি, তীব্র হাঁচি ও নাক চুলকানো দ্রুত উপশমকারী ওষুধ',
        roleEn: 'Reliable antihistamine for rapid relief of cold and allergy symptoms',
        typicalDosageBn: '১০ মি.গ্রা. দিনে একবার',
        timingBn: 'রাত্রে ঘুমানোর পূর্বে'
      },
      {
        genericName: 'Desloratadine',
        roleBn: 'দীর্ঘস্থায়ী অ্যালার্জি ও নাক বন্ধ উপশমে কার্যকর',
        roleEn: 'Long-acting antihistamine for rhinitis and nasal blockage',
        typicalDosageBn: '৫ মি.গ্রা. দিনে একবার',
        timingBn: 'প্রতিদিন নির্দিষ্ট সময়ে'
      }
    ],
    recommendedTests: [
      {
        testName: 'CBC with AEC (Absolute Eosinophil Count)',
        testCategory: 'blood',
        categoryLabelBn: 'রক্ত পরীক্ষা',
        reasonBn: 'রক্তে ইওসিনোফিল কাউন্ট পর্যবেক্ষণ করে অ্যালার্জির মাত্রা ও অন্তর্নিহিত কারণ নির্ণয়ে।',
        reasonEn: 'Evaluates allergic predisposition and screens for bacterial superinfection.',
        urgency: 'routine',
        urgencyLabelBn: 'প্রাথমিক স্ক্রিনিং',
        preventsErrorBn: 'সাধারণ সর্দি ও দীর্ঘমেয়াদী অ্যালার্জিক রাইনাইটিসের সঠিক চিকিৎসা নির্ধারণ করে।'
      },
      {
        testName: "X-Ray PNS (Water's View)",
        testCategory: 'radiology',
        categoryLabelBn: 'সাইনোসাইটিস এক্স-রে',
        reasonBn: 'মাথা ভার বা কপালে ব্যথায় সাইনাসে ফ্লুইড বা পুঁজ জমে সাইনোসাইটিস হয়েছে কিনা তা দেখতে।',
        reasonEn: 'Evaluates maxillary and frontal sinuses for fluid levels and mucosal thickening.',
        urgency: 'if_persists',
        urgencyLabelBn: 'মাথা ভার বা কপাল ব্যথায়',
        preventsErrorBn: 'ক্রনিক সাইনোসাইটিস মিস হয়ে দীর্ঘস্থায়ী মাথা ব্যথায় ভুল ব্যথানাশক সেবন বন্ধ করে।'
      }
    ],
    lifestyleAdviceBn: [
      'গরম পানির ভাপ (স্টিম ইনহেলেশন) নিন, এটি নাক পরিষ্কার করতে সাহায্য করে।',
      'কুসুম গরম পানি ও আদা-লেবু চা পান করুন।',
      'ধুলোবালি ও ধোঁয়াযুক্ত পরিবেশে মাস্ক ব্যবহার করুন।'
    ],
    lifestyleAdviceEn: [
      'Inhale steam from hot water to clear blocked nasal passages.',
      'Drink warm liquids like ginger tea and warm water.',
      'Wear a mask to protect against dust and smoke.'
    ],
    warningsBn: [
      'কিছু অ্যান্টিহিস্টামিন সেবনে হালকা ঝিমুনি হতে পারে, গাড়ি বা ভারী যন্ত্রপাতি চালানোর সময় সতর্কতা প্রয়োজন।'
    ]
  },

  // 5. Dry Cough & Productive Cough
  {
    id: 'cough',
    nameBn: 'শুকনো কাশি ও কফযুক্ত কাশি',
    nameEn: 'Dry Cough & Chest Congestion',
    category: 'Cough Suppressants & Expectorants',
    severity: 'mild',
    summaryBn: 'শ্বাসতন্ত্রের সংক্রমণ, দূষণ বা ব্যাকটেরিয়াল আক্রমণে শুকনো অথবা বুকে কফ জমা কাশি হতে পারে।',
    summaryEn: 'Respiratory tract irritation or infection causing dry cough or mucus-producing productive cough.',
    banglaKeywords: [
      'কাশি', 'শুকনো কাশি', 'খুকখুকে কাশি', 'গলা খুসখুস', 'কফ', 'বুকে কফ', 'কফযুক্ত কাশি', 
      'শ্লেষ্মা', 'কাশি হয়', 'রাতে কাশি বাড়ে'
    ],
    englishKeywords: [
      'cough', 'dry cough', 'wet cough', 'phlegm', 'chest congestion', 'mucus', 
      'productive cough', 'coughing', 'tickly cough'
    ],
    recommendedGenerics: [
      {
        genericName: 'Dextromethorphan',
        roleBn: 'শুকনো ও বিরক্তিকর কাশি দমনকারী (Cough Suppressant)',
        roleEn: 'Antitussive for suppressing dry, hacking cough',
        typicalDosageBn: '১০-১৫ মি.গ্রা. বা সিরাপ ১০ মিলি দিনে ৩ বার',
        timingBn: 'খাওয়ার পর'
      },
      {
        genericName: 'Ambroxol',
        roleBn: 'বুকে জমা ঘন কফ পাতলা করে সহজে বের করে দেয় (Mucolytic)',
        roleEn: 'Mucolytic agent that thins and loosens thick chest mucus',
        typicalDosageBn: '৩০ মি.গ্রা. ট্যাবলেট বা ৫ মিলি সিরাপ দিনে ৩ বার',
        timingBn: 'খাওয়ার পর পর্যাপ্ত পানি সহ'
      },
      {
        genericName: 'Guaifenesin',
        roleBn: 'ফুসফুস ও শ্বাসনালী থেকে কফ পরিষ্কারে সাহায্যকারী এক্সপেক্টোরেন্ট',
        roleEn: 'Expectorant aiding the clearance of mucus from respiratory tract',
        typicalDosageBn: 'সিরাপ ১০০-২০০ মি.গ্রা. প্রতি ৪ ঘণ্টা অন্তর',
        timingBn: 'খাওয়ার পর'
      }
    ],
    recommendedTests: [
      {
        testName: 'Chest X-Ray P/A View',
        testCategory: 'radiology',
        categoryLabelBn: 'বুকের এক্স-রে',
        reasonBn: 'ফুসফুসে কনসলিডেশন (নিউমোনিয়া), ব্রঙ্কাইটিস বা প্লুরাল ইফিউশন আছে কিনা দেখতে।',
        reasonEn: 'Detects pneumonia, pulmonary infiltration, pleural effusion, or lung lesions.',
        urgency: 'if_persists',
        urgencyLabelBn: 'কাশি ৭ দিনের বেশি হলে',
        preventsErrorBn: 'নিউমোনিয়া বা লাং ইনফেকশন মিস হয়ে রোগীর ফুসফুস মারাত্মক ক্ষতিগ্রস্ত হওয়া প্রতিরোধ করে।'
      },
      {
        testName: 'CBC with ESR',
        testCategory: 'blood',
        categoryLabelBn: 'রক্ত পরীক্ষা',
        reasonBn: 'লিউকোসাইটোসিস ও উচ্চ ইএসআর পর্যবেক্ষণ করে ব্যাকটেরিয়াল নিউমোনিয়া স্ক্রিনিং।',
        reasonEn: 'Screens for leukocytosis, neutrophil shift, and systemic bacterial burden.',
        urgency: 'routine',
        urgencyLabelBn: 'ইনফেকশন স্ক্রিনিং',
        preventsErrorBn: 'ভাইরাল কাশি ও ব্যাকটেরিয়াল সেকেন্ডারি সংক্রমণের মধ্যে পরিষ্কার বিভাজন করে।'
      },
      {
        testName: 'Sputum for GeneXpert / AFB (Tuberculosis)',
        testCategory: 'specialized',
        categoryLabelBn: 'কফ ও যক্ষ্মা পরীক্ষা',
        reasonBn: 'কাশি ২-৩ সপ্তাহের অধিক স্থায়ী হলে পালমোনারি টিউবারকিউলোসিস (যক্ষ্মা) পরীক্ষা।',
        reasonEn: 'Definitive molecular and smear diagnostic test for Mycobacterium tuberculosis.',
        urgency: 'if_persists',
        urgencyLabelBn: 'টানা ৩ সপ্তাহের কাশিতে বাধ্যতামূলক',
        preventsErrorBn: 'যক্ষ্মা প্রারম্ভিক পর্যায়ে মিস হওয়া শতভাগ রোধ করে পরিবারের অন্য সদস্যদের সংক্রমণ থেকে বাঁচায়।'
      }
    ],
    lifestyleAdviceBn: [
      'কুসুম গরম পানিতে মধু ও লেবুর রস মিশিয়ে পান করুন।',
      'ধূমপান ও পরোক্ষ ধূমপান থেকে সম্পূর্ণ দূরে থাকুন।'
    ],
    lifestyleAdviceEn: [
      'Drink warm water with honey and lemon to soothe throat irritation.',
      'Avoid smoking, cold drinks, and air pollution exposure.'
    ],
    warningsBn: [
      'কাশি দুই সপ্তাহের বেশি স্থায়ী হলে যক্ষ্মা বা ব্রঙ্কাইটিস পরীক্ষার জন্য চিকিৎসকের পরামর্শ নিন।',
      'কফের সাথে রক্ত গেলে কিংবা বুকব্যথা থাকলে তাৎক্ষণিক হাসপাতালে যোগাযোগ করুন।'
    ]
  },

  // 6. Sore Throat & Pharyngitis
  {
    id: 'sore_throat',
    nameBn: 'গলা ব্যথা, টনসিল ও ঢোক গিলতে কষ্ট',
    nameEn: 'Sore Throat & Tonsillitis',
    category: 'Mouthwash & Throat Antiseptic',
    severity: 'mild',
    summaryBn: 'ফ্যারিঞ্জাইটিস, টনসিলে প্রদাহ বা ব্যাকটেরিয়ার আক্রমণে গলায় তীব্র ব্যথা ও খাবার গিলতে কষ্ট হতে পারে।',
    summaryEn: 'Throat inflammation, tonsillitis, or pharyngitis causing irritation, pain, and difficulty swallowing.',
    banglaKeywords: [
      'গলা ব্যথা', 'গলাব্যাথা', 'টনসিল', 'ঢোক গিলতে কষ্ট', 'গলা জ্বালা', 'গলা ফোলা', 
      'গলায় কাঁটা ফোটার মত ব্যথা', 'কথা বলতে কষ্ট'
    ],
    englishKeywords: [
      'sore throat', 'throat pain', 'tonsillitis', 'pharyngitis', 'difficulty swallowing', 
      'scratchy throat', 'throat infection'
    ],
    recommendedGenerics: [
      {
        genericName: 'Povidone-Iodine',
        roleBn: 'মুখ ও গলার ক্ষতিকর ব্যাকটেরিয়া ও ভাইরাস ধ্বংসকারী মাউথওয়াশ/গার্গল',
        roleEn: 'Antiseptic gargle for combating throat and mouth pathogens',
        typicalDosageBn: '১% ওরাল সলিউশন সমপরিমাণ গরম পানির সাথে মিশিয়ে দিনে ৩-৪ বার কুলকুচি',
        timingBn: 'কুলকুচি করার পর ৩০ মিনিট কিছু খাওয়া বা পান করা থেকে বিরত থাকুন'
      },
      {
        genericName: 'Paracetamol',
        roleBn: 'গলা ব্যথার তীব্রতা ও তৎসংলগ্ন প্রদাহ কমাতে সহায়ক',
        roleEn: 'Relieves throat pain and associated fever',
        typicalDosageBn: '৫০০ মি.গ্রা. দিনে ৩ বার',
        timingBn: 'খাওয়ার পর'
      }
    ],
    recommendedTests: [
      {
        testName: 'Throat Swab for Gram Stain & C/S',
        testCategory: 'specialized',
        categoryLabelBn: 'গলার কালচার পরীক্ষা',
        reasonBn: 'গ্রুপ-এ বিটা-হিমোলাইটিক স্ট্রেপ্টোকক্কাস ব্যাকটেরিয়া শনাক্তকরণ ও সঠিক অ্যান্টিবায়োটিক নির্বাচন।',
        reasonEn: 'Identifies Group A beta-hemolytic Streptococcus and antibiotic sensitivities.',
        urgency: 'if_persists',
        urgencyLabelBn: 'জ্বর ও পুঁজযুক্ত টনসিলে',
        preventsErrorBn: 'অপ্রয়োজনীয় ব্রড-স্পেকট্রাম অ্যান্টিবায়োটিক ব্যবহার ও অ্যান্টিবায়োটিক রেজিস্ট্যান্স রোধ করে।'
      },
      {
        testName: 'CBC with ESR',
        testCategory: 'blood',
        categoryLabelBn: 'রক্ত পরীক্ষা',
        reasonBn: 'ইনফেকশনের তীব্রতা ও নিউট্রোফিলিক লিউকোসাইটোসিস পর্যবেক্ষণ।',
        reasonEn: 'Monitors acute inflammatory markers and bacterial response.',
        urgency: 'routine',
        urgencyLabelBn: 'রুটিন ইনফেকশন টেস্ট',
        preventsErrorBn: 'ভাইরাল ফ্যারিঞ্জাইটিস ও ব্যাকটেরিয়াল টনসিলাইটিস পৃথকীকরণে সহায়ক।'
      }
    ],
    lifestyleAdviceBn: [
      'কুসুম গরম পানিতে সামান্য লবণ দিয়ে দিনে অন্তত ৩ বার গার্গল (কুলকুচি) করুন।',
      'অতিরিক্ত ঠাণ্ডা পানি বা আইসক্রিম পরিহার করুন।'
    ],
    lifestyleAdviceEn: [
      'Gargle with warm salt water at least 3-4 times a day.',
      'Sip warm broths and avoid ice-cold drinks.'
    ],
    warningsBn: [
      'গলায় প্রচণ্ড ব্যথার সাথে নিঃশ্বাস নিতে কষ্ট হলে বা মুখ খুলতে না পারলে জরুরি ভিত্তিতে ইএনটি বিশেষজ্ঞ দেখান।'
    ]
  },

  // 7. Diarrhea, Loose Motion & Dehydration
  {
    id: 'diarrhea',
    nameBn: 'ডায়রিয়া, পাতলা পায়খানা ও পেটের অসুখ',
    nameEn: 'Diarrhea, Loose Stool & Dehydration',
    category: 'Electrolytes & Rehydration',
    severity: 'moderate',
    summaryBn: 'দূষিত খাবার বা পানিতে ব্যাকটেরিয়া বা ভাইরাসের আক্রমণে ঘন ঘন পাতলা পায়খানা হতে পারে।',
    summaryEn: 'Frequent watery bowel movements caused by viral or bacterial gastroenteritis.',
    banglaKeywords: [
      'ডায়রিয়া', 'ডায়েরিয়া', 'পাতলা পায়খানা', 'পেট খারাপ', 'ঘন ঘন পায়খানা', 'পাতলা মল', 
      'পেট কামড়ে পায়খানা', 'কলেরা'
    ],
    englishKeywords: [
      'diarrhea', 'loose motion', 'watery stool', 'dehydration', 'gastroenteritis', 
      'loose stools', 'stomach upset', 'food poisoning'
    ],
    recommendedGenerics: [
      {
        genericName: 'Oral Rehydration Salts (ORS)',
        roleBn: 'জীবন রক্ষাকারী স্যালাইন — শরীরের পানি ও ইলেকট্রোলাইটের ঘাটতি পূরণ করে',
        roleEn: 'Vital WHO formula replacing lost fluid and essential electrolytes',
        typicalDosageBn: 'প্রতিবার পাতলা পায়খানার পর ১ গ্লাস (২৫০ মিলি) ফ্রেশ স্যালাইন',
        timingBn: 'পায়খানার পরপরই ধীরে ধীরে চুমুক দিয়ে সেব্য'
      },
      {
        genericName: 'Zinc Sulfate',
        roleBn: 'অন্ত্রের আস্তরণ দ্রুত নিরাময় করে এবং ডায়রিয়ার সময়কাল কমায়',
        roleEn: 'Restores intestinal mucosal integrity and shortens diarrhea duration',
        typicalDosageBn: '১০-২০ মি.গ্রা. দিনে একবার (টানা ১০-১৪ দিন)',
        timingBn: 'খাওয়ার পর'
      }
    ],
    recommendedTests: [
      {
        testName: 'Stool R/M/E (Routine & Microscopic)',
        testCategory: 'urine_stool',
        categoryLabelBn: 'মল পরীক্ষা',
        reasonBn: 'মলে পুঁজ (Pus cells), রক্তকণিকা (RBC), অ্যামিবা বা সিস্টের উপস্থিতি শনাক্তে।',
        reasonEn: 'Identifies leukocytes, erythrocytes, amoebic trophozoites, and cysts.',
        urgency: 'immediate',
        urgencyLabelBn: 'তীব্র ডায়রিয়া বা আমাশয়ে জরুরি',
        preventsErrorBn: 'অ্যামিবিক ও ব্যাকটেরিয়াল ডায়রিয়ার মধ্যে পার্থক্য নিশ্চিত করে ভুল ওষুধের অপপ্রয়োগ ঠেকায়।'
      },
      {
        testName: 'Serum Electrolytes (Na+, K+, Cl-)',
        testCategory: 'blood',
        categoryLabelBn: 'ইলেকট্রোলাইট পরীক্ষা',
        reasonBn: 'মারাত্মক পটাশিয়াম হ্রাস (Hypokalemia) ও অ্যাসিডোসিস জটিলতা নিরূপণে।',
        reasonEn: 'Monitors potentially lethal hypokalemia and metabolic acidosis due to intestinal losses.',
        urgency: 'immediate',
        urgencyLabelBn: 'তীব্র পানিশূন্যতায় জরুরি',
        preventsErrorBn: 'কার্ডিয়াক অ্যারেস্ট বা প্যারালাইটিক ইলিউস হওয়া রোধ করে ফ্লুইডের নির্ভুল ডোজ ঠিক করে।'
      },
      {
        testName: 'Serum Creatinine',
        testCategory: 'blood',
        categoryLabelBn: 'কিডনি ফাংশন',
        reasonBn: 'ডিহাইড্রেশনজনিত রেনাল রক্তপ্রবাহের টান (Prerenal Acute Kidney Injury) মনিটরিং।',
        reasonEn: 'Assesses renal function to rule out prerenal azotemia secondary to hypovolemia.',
        urgency: 'immediate',
        urgencyLabelBn: 'প্রস্রাবের পরিমাণ কমে এলে',
        preventsErrorBn: 'অ্যাকিউট কিডনি ফেইলিউর (AKI) মিস হওয়ার ঝুঁকি শূন্যে নামায়।'
      }
    ],
    lifestyleAdviceBn: [
      'এক প্যাকেট ওরস্যালাইন সম্পূর্ণ আধা লিটার (৫০০ মিলি) বিশুদ্ধ পানিতে গুলিয়ে প্রস্তুত করুন।',
      'স্যালাইনের পাশাপাশি ডাবের পানি, ভাতের মাড়, কাঁচাকলার ঝোল ইত্যাদি তরল খাবার দিন।',
      'খাবারের পূর্বে সাবান দিয়ে হাত ধোয়ার অভ্যাস বজায় রাখুন।'
    ],
    lifestyleAdviceEn: [
      'Prepare 1 sachet of ORS in exactly 500 ml of pure drinking water.',
      'Drink fluids continuously to match fluid loss.',
      'Eat bland, easy-to-digest foods like bananas, rice, and toast.'
    ],
    warningsBn: [
      'অযথা চিকিৎসকের পরামর্শ ছাড়া অ্যান্টিবায়োটিক বা মেট্রোনিডাজল খাবেন না।',
      'পায়খানার সাথে রক্ত গেলে বা রোগী নিস্তেজ হয়ে পড়লে জরুরি হাসপাতালে ভর্তি করান।'
    ],
    emergencyWarningBn: 'চোখ গর্তে ঢুকে যাওয়া, প্রস্রাব বন্ধ হওয়া বা শরীর বরফের মত ঠাণ্ডা হওয়া তীব্র পানিশূন্যতার লক্ষণ — অবিলম্বে হাসপাতালে যান।'
  },

  // 8. Skin Allergy, Itching, Hives & Urticaria
  {
    id: 'skin_allergy',
    nameBn: 'অ্যালার্জি, চুলকানি, আমবাত ও ত্বকের লাল চাকা',
    nameEn: 'Skin Allergy, Itching & Urticaria',
    category: 'Antihistamines',
    severity: 'mild',
    summaryBn: 'কোনো খাবার, ওষুধ বা আবহাওয়ার পরিবর্তনের কারণে ত্বকে লালচে চাকা ও চুলকানি হতে পারে।',
    summaryEn: 'Cutaneous allergic response causing itchy wheals, hives, redness, and swelling.',
    banglaKeywords: [
      'এলার্জি', 'অ্যালার্জি', 'চুলকানি', 'গা চুলকায়', 'চুলকায়', 'আমবাত', 'লাল চাকা', 
      'ফুসকুড়ি', 'র‍্যাশ', 'চামড়া চুলকায়', 'চুলকিয়ে ঘা'
    ],
    englishKeywords: [
      'allergy', 'itching', 'skin rash', 'hives', 'urticaria', 'itchy skin', 
      'pruritus', 'skin allergy', 'rashes', 'red spots'
    ],
    recommendedGenerics: [
      {
        genericName: 'Bilastine',
        roleBn: 'আধুনিক শক্তিশালী অ্যান্টিহিস্টামিন যা চুলকানি ও আমবাত দ্রুত নিয়ন্ত্রণ করে',
        roleEn: 'Highly effective 2nd generation antihistamine for urticaria and allergic dermatitis',
        typicalDosageBn: '২০ মি.গ্রা. দিনে একবার',
        timingBn: 'খাওয়ার ১ ঘণ্টা পূর্বে বা খাওয়ার ২ ঘণ্টা পরে (খালি পেটে)'
      },
      {
        genericName: 'Fexofenadine',
        roleBn: 'চুলকানি ও অ্যালার্জিক র‍্যাশের দীর্ঘস্থায়ী উপশমে নিরাপদ ওষুধ',
        roleEn: 'Effective treatment for chronic idiopathic urticaria and skin itchiness',
        typicalDosageBn: '১২০ মি.গ্রা. বা ১৮০ মি.গ্রা. দিনে একবার',
        timingBn: 'খাওয়ার পর'
      },
      {
        genericName: 'Cetirizine',
        roleBn: 'তীব্র অ্যালার্জি ও চুলকানিতে দ্রুত আরাম প্রদানকারী',
        roleEn: 'Prompt relief from severe itching and allergic rash',
        typicalDosageBn: '১০ মি.গ্রা. রাতে একবার',
        timingBn: 'রাত্রে ঘুমানোর পূর্বে'
      }
    ],
    recommendedTests: [
      {
        testName: 'Complete Blood Count (CBC with AEC)',
        testCategory: 'blood',
        categoryLabelBn: 'রক্ত পরীক্ষা',
        reasonBn: 'রক্তে ইওসিনোফিল কাউন্ট বৃদ্ধির মাত্রা পরিমাপ করে সিস্টেমিক অ্যালার্জি বা প্যারাসাইটিক ইনফেকশন মূল্যায়ন।',
        reasonEn: 'Assesses blood eosinophilia associated with hypersensitivity or helminthic infection.',
        urgency: 'routine',
        urgencyLabelBn: 'প্রাথমিক স্ক্রিনিং',
        preventsErrorBn: 'চুলকানির নেপথ্যে কৃমি বা ইন্টারনাল প্যারাসাইট জনিত কারণ আলাদা করতে সহায়তা করে।'
      },
      {
        testName: 'Total Serum IgE',
        testCategory: 'blood',
        categoryLabelBn: 'আইজিই পরীক্ষা',
        reasonBn: 'এটোপিক ডার্মাটাইটিস ও দীর্ঘস্থায়ী ক্রনিক আর্টিকারিয়া নিশ্চিতকরণ।',
        reasonEn: 'Confirms atopic diathesis and guides long-term anti-allergy treatment.',
        urgency: 'if_persists',
        urgencyLabelBn: 'বারবার অ্যালার্জি দেখা দিলে',
        preventsErrorBn: 'ক্রনিক স্কিন কন্ডিশনে কার্যকর অ্যান্টি-অ্যালার্জি প্রটোকল প্ল্যান তৈরিতে সাহায্য করে।'
      }
    ],
    lifestyleAdviceBn: [
      'চুলকানির স্থানে নখ দিয়ে অতিরিক্ত ঘষাঘষি করবেন না, এতে ইনফেকশন হতে পারে।',
      'চিংড়ি, বোয়াল মাছ, গরুর মাংস, বেগুন, পুঁইশাক সাময়িকভাবে পরিহার করুন।',
      'সুতি ও ঢিলেঢালা পোশাক পরুন।'
    ],
    lifestyleAdviceEn: [
      'Avoid scratching to prevent secondary skin infections.',
      'Wear loose-fitting, soft cotton clothing.',
      'Temporarily avoid suspected allergy-triggering foods.'
    ],
    warningsBn: [
      'চুলকানির পাশাপাশি যদি ঠোঁট, জিহ্বা বা চোখ ফুলে যায় এবং শ্বাস নিতে কষ্ট হয় (অ্যানাফাইল্যাক্সিস) তবে এটি জরুরি বিপদচিহ্ন — দ্রুত হাসপাতালে যান।'
    ],
    emergencyWarningBn: 'অ্যালার্জির কারণে শ্বাসকষ্ট বা গলা ফুলে গেলে অবিলম্বে জরুরি চিকিৎসা নিন।'
  },

  // 9. Back Pain, Muscle Pain & Toothache
  {
    id: 'muscle_joint_pain',
    nameBn: 'কোমর ব্যথা, পেশী ব্যথা, বাতের ব্যথা ও দাঁতে ব্যথা',
    nameEn: 'Back Pain, Joint Pain, Muscle Sprain & Toothache',
    category: 'NSAIDs & Muscle Relaxants',
    severity: 'moderate',
    summaryBn: 'ভারী জিনিস তোলা বা পেশীর টানের কারণে কোমর, ঘাড় বা মাংসপেশীতে তীব্র ব্যথা হতে পারে।',
    summaryEn: 'Musculoskeletal discomfort, lumbago, joint inflammation, or dental pain.',
    banglaKeywords: [
      'কোমর ব্যথা', 'কোমড় ব্যথা', 'পিঠ ব্যথা', 'দাঁত ব্যথা', 'দাঁতে ব্যথা', 'দাঁতে যন্ত্রণা', 
      'হাড়ের ব্যথা', 'বাতের ব্যথা', 'পেশী ব্যথা', 'মাংসপেশিতে টান', 'ঘাড়ে ব্যথা', 'হাঁটু ব্যথা'
    ],
    englishKeywords: [
      'back pain', 'backache', 'joint pain', 'arthritis', 'toothache', 'muscle pain', 
      'sprain', 'knee pain', 'neck pain', 'muscle strain', 'lumbago'
    ],
    recommendedGenerics: [
      {
        genericName: 'Aceclofenac',
        roleBn: 'কোমর ব্যথা, বাত ও মাংশপেশীর ব্যথায় বহুল ব্যবহৃত কার্যকর ব্যথানাশক',
        roleEn: 'NSAID with superior gastrointestinal tolerance for arthritis and back pain',
        typicalDosageBn: '১০০ মি.গ্রা. দিনে ২ বার',
        timingBn: 'খাওয়ার পর (ভরা পেটে) — সাথে গ্যাস্ট্রিকের ওষুধ সেব্য'
      },
      {
        genericName: 'Naproxen Sodium',
        roleBn: 'অস্থিসন্ধি, দাঁতের ব্যথা ও আঘাতজনিত দীর্ঘস্থায়ী ব্যথায় কার্যকর',
        roleEn: 'Longer duration NSAID for musculoskeletal inflammation and dental pain',
        typicalDosageBn: '২৫০-৫০০ মি.গ্রা. দিনে ২ বার',
        timingBn: 'ভরা পেটে সেব্য'
      },
      {
        genericName: 'Ketorolac Tromethamine',
        roleBn: 'অপারেশন পরবর্তী বা তীব্র দাঁতের ব্যথায় স্বল্পমেয়াদী জরুরি ব্যথানাশক',
        roleEn: 'Potent non-narcotic analgesic for short-term management of acute severe pain',
        typicalDosageBn: '১০ মি.গ্রা. প্রতি ৪-৬ ঘণ্টা অন্তর (সর্বোচ্চ ৫ দিন)',
        timingBn: 'ভরা পেটে'
      }
    ],
    recommendedTests: [
      {
        testName: 'Serum Uric Acid',
        testCategory: 'blood',
        categoryLabelBn: 'ইউরিক এসিড',
        reasonBn: 'পায়ের বৃদ্ধাঙ্গুল বা যেকোনো জয়েন্টে তীব্র ব্যথায় গেঁটেবাত (Gout) নিশ্চিতকরণ।',
        reasonEn: 'Diagnostic evaluation for hyperuricemia and gouty arthritis.',
        urgency: 'routine',
        urgencyLabelBn: 'অস্থিসন্ধি ব্যথায়',
        preventsErrorBn: 'গাউটের প্রদাহকে ভুলবশত সাধারণ মচকে যাওয়া ভেবে ভুল চিকিৎসা রোধ করে।'
      },
      {
        testName: 'X-Ray Lumbo-Sacral (L/S) Spine (B/V)',
        testCategory: 'radiology',
        categoryLabelBn: 'মেরুদণ্ডের এক্স-রে',
        reasonBn: 'মেরুদণ্ডের হাড়ের ক্ষয় (Spondylosis), স্পেস রিডাকশন বা ডিস্ক স্থানচ্যুতি দেখতে।',
        reasonEn: 'Visualizes degenerative spinal changes, disc space narrowing, and alignment.',
        urgency: 'if_persists',
        urgencyLabelBn: 'ব্যথা পায়ে নামলে বা দীর্ঘস্থায়ী হলে',
        preventsErrorBn: 'পিএলআইডি (PLID) বা নার্ভ কম্প্রেশন মিস করে কেবল ব্যথানাশক দিয়ে কিডনি নষ্ট হওয়া ঠেকায়।'
      },
      {
        testName: 'Serum Calcium & Vitamin D3',
        testCategory: 'blood',
        categoryLabelBn: 'ক্যালসিয়াম ও ভিটামিন ডি',
        reasonBn: 'অস্টিওপেনিয়া, হাড়ের ঘনত্ব হ্রাস বা হাড়ের ব্যথা নিরূপণে।',
        reasonEn: 'Screens for hypocalcemia, osteomalacia, and bone demineralization.',
        urgency: 'routine',
        urgencyLabelBn: 'বয়স্ক রোগীদের জন্য',
        preventsErrorBn: 'হাড়ের ভঙ্গুরতা আগেভাগে ধরা পড়ায় ফ্র্যাকচার প্রতিরোধ সম্ভব হয়।'
      }
    ],
    lifestyleAdviceBn: [
      'ব্যথার জায়গায় গরম সেঁক বা বরফ সেঁক দিতে পারেন।',
      'ভারী জিনিস তোলা থেকে বিরত থাকুন এবং বসার সময় মেরুদণ্ড সোজা রাখুন।',
      'দাঁত ব্যথার ক্ষেত্রে কুসুম গরম পানিতে লবণ দিয়ে কুলকুচি করুন।'
    ],
    lifestyleAdviceEn: [
      'Apply hot compress or ice pack to the affected area.',
      'Maintain an upright posture and avoid lifting heavy weights.',
      'For toothache, rinse mouth with warm salt water.'
    ],
    warningsBn: [
      'ব্যথানাশক ওষুধ (NSAID) খালি পেটে খেলে আলসার বা রক্তক্ষরণ হতে পারে; অবশ্যই ভরা পেটে খাবেন এবং সাথে একটি PPI (যেমন: Esomeprazole) গ্রহণ করবেন।',
      'কিডনি বা লিভারের জটিল রোগে আক্রান্ত রোগীরা ডাক্তারের পরামর্শ ছাড়া ব্যথানাশক ওষুধ সেবন করবেন না।'
    ]
  },

  // 10. Asthma & Bronchospasm
  {
    id: 'asthma_wheezing',
    nameBn: 'অ্যাজমা, শ্বাসকষ্ট ও বুকে সাঁই-সাঁই শব্দ',
    nameEn: 'Asthma, Shortness of Breath & Wheezing',
    category: 'Bronchodilators & Antiasthmatics',
    severity: 'consult_doctor',
    summaryBn: 'শ্বাসনালীর প্রদাহ ও সংকুচিত হওয়ার কারণে শ্বাসকষ্ট, বুকে চাপ লাগা বা কাশি হতে পারে।',
    summaryEn: 'Chronic inflammation of the airways causing reversible bronchospasm, dyspnea, and wheezing.',
    banglaKeywords: [
      'শ্বাসকষ্ট', 'শ্বাস কষ্ট', 'হাঁপানি', 'অ্যাজমা', 'দম বন্ধ লাগে', 'শ্বাস নিতে কষ্ট', 
      'বুকে সাঁই সাঁই শব্দ', 'দম খাটো'
    ],
    englishKeywords: [
      'asthma', 'shortness of breath', 'breathing difficulty', 'wheezing', 'breathless', 
      'dyspnea', 'chest tightness', 'bronchospasm'
    ],
    recommendedGenerics: [
      {
        genericName: 'Salbutamol',
        roleBn: 'জরুরি মুহূর্তে সংকুচিত শ্বাসনালী দ্রুত প্রসারিত করে শ্বাসপ্রশ্বাস সহজ করে',
        roleEn: 'Fast-acting bronchodilator for prompt relief of acute bronchospasm',
        typicalDosageBn: '২ মি.গ্রা. বা ৪ মি.গ্রা. ট্যাবলেট অথবা ইনহেলার ২ পাফ',
        timingBn: 'শ্বাসকষ্টের সময় প্রয়োজনে'
      },
      {
        genericName: 'Montelukast',
        roleBn: 'অ্যালার্জিক হাঁপানি ও দীর্ঘমেয়াদী শ্বাসনালীর প্রদাহ নিয়ন্ত্রণকারী',
        roleEn: 'Leukotriene receptor antagonist preventing asthma attacks and nighttime symptoms',
        typicalDosageBn: '১০ মি.গ্রা. দিনে একবার (রাত্রে)',
        timingBn: 'রাত্রে নির্দিষ্ট সময়ে'
      }
    ],
    recommendedTests: [
      {
        testName: 'Spirometry with Reversibility Test / PFT',
        testCategory: 'specialized',
        categoryLabelBn: 'ফুসফুসের স্পাইরোমেট্রি',
        reasonBn: 'শ্বাসনালীর সংকোচন ও ব্রঙ্কোডাইলেটরে রিভার্সিবিলিটি মেপে অ্যাজমা বা সিওপিডি নিশ্চিতকরণ।',
        reasonEn: 'Gold-standard spirometric measurement of FEV1/FVC and airway obstruction reversibility.',
        urgency: 'if_persists',
        urgencyLabelBn: 'ডায়াগনোসিস নিশ্চিত করতে আবশ্যক',
        preventsErrorBn: 'সিওপিডি ও ব্রঙ্কিয়াল অ্যাজমার ভুল চিকিৎসা দূর করে সঠিক ইনহেলার স্টেরয়েড নির্ধারণ করে।'
      },
      {
        testName: 'Chest X-Ray P/A View',
        testCategory: 'radiology',
        categoryLabelBn: 'বুকের এক্স-রে',
        reasonBn: 'শ্বাসকষ্টের নেপথ্যে নিউমোথোরাক্স বা হার্ট ফেইলিউর (কার্ডিয়াক অ্যাজমা) বাদ দিতে।',
        reasonEn: 'Rules out pneumothorax, pulmonary edema, and pleural pathologies.',
        urgency: 'immediate',
        urgencyLabelBn: 'তীব্র শ্বাসকষ্টে জরুরি',
        preventsErrorBn: 'কার্ডিয়াক অ্যাজমা (হার্ট ফেইলিউর) ও রেসপিরেটরি অ্যাজমার মধ্যকার ভুল পার্থক্য রোধ করে।'
      }
    ],
    lifestyleAdviceBn: [
      'ধুলোবালি, ফুলের রেণু, ঘরের ঝুল ও পোষা প্রাণীর লোম থেকে দূরে থাকুন।',
      'বাইরে বের হলে সবসময় ধুলাবালি রোধে মাস্ক ব্যবহার করুন।',
      'ঠাণ্ডা বাতাস ও শীতকালে গরম কাপড় পরিধান করুন।'
    ],
    lifestyleAdviceEn: [
      'Identify and avoid known asthma triggers like dust, cold air, and pet dander.',
      'Keep rescue inhalers accessible at all times.',
      'Wear a protective mask outdoors.'
    ],
    warningsBn: [
      'অ্যাজমা বা হাঁপানির স্থায়ী ব্যবস্থাপনার জন্য একজন বক্ষব্যাধি বিশেষজ্ঞের তত্ত্বাবধানে থাকা আবশ্যক।'
    ],
    emergencyWarningBn: 'তীব্র শ্বাসকষ্ট, কথা বলতে না পারা বা নখ/ঠোঁট নীল হয়ে এলে অবিলম্বে জরুরি অক্সিজেন বা হাসপাতালে স্থানান্তর করুন।'
  },

  // 11. Hypertension & High Blood Pressure
  {
    id: 'hypertension',
    nameBn: 'উচ্চ রক্তচাপ ও বুক ধড়ফড়',
    nameEn: 'Hypertension & High Blood Pressure',
    category: 'Antihypertensive',
    severity: 'consult_doctor',
    summaryBn: 'রক্তনালীর ভেতর রক্তের অতিরিক্ত চাপের ফলে মাথা ঘোরা, ঘাড় ব্যথা বা বুক ধড়ফড় হতে পারে।',
    summaryEn: 'Persistent elevation of arterial blood pressure requiring cardiovascular monitoring.',
    banglaKeywords: [
      'উচ্চ রক্তচাপ', 'হাই প্রেশার', 'ব্লাড প্রেশার', 'প্রেশার বেশি', 'বুক ধড়ফড়', 'মাথা ঘোরা', 
      'ঘাড় ব্যথা', 'প্রেশার ওঠানামা'
    ],
    englishKeywords: [
      'hypertension', 'high blood pressure', 'high bp', 'palpitation', 'dizziness', 
      'elevated bp', 'hypertensive'
    ],
    recommendedGenerics: [
      {
        genericName: 'Amlodipine',
        roleBn: 'ক্যালসিয়াম চ্যানেল ব্লকার — রক্তনালী প্রসারিত করে রক্তচাপ স্বাভাবিক রাখে',
        roleEn: 'Calcium channel blocker reducing systemic vascular resistance',
        typicalDosageBn: '৫ মি.গ্রা. দিনে একবার',
        timingBn: 'সকালে বা রাতে প্রতিদিন একই সময়ে'
      },
      {
        genericName: 'Losartan Potassium',
        roleBn: 'অ্যাঞ্জিওটেনসিন রিসেপ্টর ব্লকার (ARB) — হার্ট ও কিডনি সুরক্ষায় কার্যকর',
        roleEn: 'Angiotensin II receptor antagonist controlling blood pressure safely',
        typicalDosageBn: '২৫ মি.গ্রা. বা ৫০ মি.গ্রা. দিনে একবার',
        timingBn: 'প্রতিদিন নির্দিষ্ট সময়ে'
      }
    ],
    recommendedTests: [
      {
        testName: 'ECG (12 Lead)',
        testCategory: 'cardiac',
        categoryLabelBn: 'ইসিজি',
        reasonBn: 'হার্টের মাংসপেশি মোটা হওয়া (Left Ventricular Hypertrophy - LVH), এরিদমিয়া ও ইস্কেমিয়া দেখতে।',
        reasonEn: 'Screens for left ventricular hypertrophy, conduction abnormalities, and silent ischemia.',
        urgency: 'routine',
        urgencyLabelBn: 'প্রাথমিক কার্ডিয়াক স্ক্রিনিং',
        preventsErrorBn: 'লুকায়িত সাইলেন্ট ইস্কেমিয়া ও হার্ট ফেইলিউরের ঝুঁকি আগে থেকেই শনাক্ত করে।'
      },
      {
        testName: 'Serum Creatinine & Electrolytes',
        testCategory: 'blood',
        categoryLabelBn: 'রেনাল প্রোফাইল',
        reasonBn: 'উচ্চ রক্তচাপের কিডনি প্রভাব ও রেনাল কারণ স্ক্রিনিং এবং নিরাপদ অ্যান্টিহাইপারটেনসিভ নির্বাচন।',
        reasonEn: 'Monitors baseline renal function and potassium before starting ACEi/ARB therapy.',
        urgency: 'routine',
        urgencyLabelBn: 'ঔষধ নির্বাচনের পূর্বে আবশ্যক',
        preventsErrorBn: 'কিডনি ফাংশন না জেনে ভুল ওষুধ ব্যবহারে হাইপারক্যালেমিয়া ও রেনাল ফেইলিউর রোধ করে।'
      },
      {
        testName: 'Lipid Profile',
        testCategory: 'blood',
        categoryLabelBn: 'রক্তের চর্বি',
        reasonBn: 'কোলেস্টেরলের মাত্রা ও রক্তনালী ব্লক হওয়ার ঝুঁকি মূল্যায়ন।',
        reasonEn: 'Evaluates atherogenic dyslipidemia and 10-year cardiovascular risk.',
        urgency: 'routine',
        urgencyLabelBn: 'রুটিন কার্ডিয়াক স্ক্রিনিং',
        preventsErrorBn: 'অ্যাথেরোস্ক্লেরোসিস ও স্ট্রোক প্রতিরোধে যথাসময়ে স্ট্যাটিন শুরু করতে নিশ্চিত করে।'
      }
    ],
    lifestyleAdviceBn: [
      'কাঁচা লবণ খাওয়া সম্পূর্ণ বন্ধ করুন এবং খাবারে লবণের পরিমাণ সীমিত রাখুন।',
      'প্রতিদিন অন্তত ৩০ মিনিট দ্রুত হাঁটা বা হালকা ব্যায়াম করুন।',
      'মানসিক চাপ কমান ও পর্যাপ্ত ঘুমান।'
    ],
    lifestyleAdviceEn: [
      'Strictly avoid adding raw salt to meals and limit dietary sodium intake.',
      'Exercise or brisk walk for at least 30 minutes daily.',
      'Manage stress and ensure 7-8 hours of sleep.'
    ],
    warningsBn: [
      'ভালো বোধ করলেও ডাক্তারের পরামর্শ ছাড়া কখনো রক্তচাপের ওষুধ খাওয়া বন্ধ বা ডোজ পরিবর্তন করবেন না।',
      'নিয়মিত ব্লাড প্রেশার মাপুন এবং চার্ট বজায় রাখুন।'
    ]
  },

  // 12. Diabetes & High Blood Sugar
  {
    id: 'diabetes',
    nameBn: 'ডায়াবেটিস ও রক্তের সুগার বৃদ্ধি',
    nameEn: 'Diabetes Mellitus & High Blood Sugar',
    category: 'Antidiabetic (Biguanide & DPP-4)',
    severity: 'consult_doctor',
    summaryBn: 'ইনসুলিনের স্বল্পতা বা অকার্যকারিতার কারণে রক্তে গ্লুকোজের মাত্রা স্বাভাবিকের চেয়ে বেড়ে যাওয়া।',
    summaryEn: 'Metabolic disorder characterized by elevated levels of blood glucose.',
    banglaKeywords: [
      'ডায়াবেটিস', 'ডায়াবেটিস', 'সুগার বেশি', 'রক্তে সুগার', 'ঘন ঘন প্রস্রাব', 'অতিরিক্ত তৃষ্ণা', 
      'চোখে ঝাপসা দেখা', 'হাত পা জ্বালা'
    ],
    englishKeywords: [
      'diabetes', 'high blood sugar', 'high glucose', 'hyperglycemia', 'sugar level', 
      'frequent urination', 'diabetic'
    ],
    recommendedGenerics: [
      {
        genericName: 'Metformin Hydrochloride',
        roleBn: 'টাইপ-২ ডায়াবেটিসের প্রথম সারির ভিত্তি ওষুধ — ইনসুলিন সংবেদনশীলতা বাড়ায়',
        roleEn: 'First-line biguanide antidiabetic improving insulin sensitivity',
        typicalDosageBn: '৫০০ মি.গ্রা. বা ৮৫০ মি.গ্রা. দিনে ১-২ বার',
        timingBn: 'খাবার খাওয়ার সাথে সাথে বা খাবারের ঠিক পর'
      },
      {
        genericName: 'Linagliptin',
        roleBn: 'আধুনিক DPP-4 ইনহিবিটর — কিডনি রোগীদের ক্ষেত্রেও নিরাপদ',
        roleEn: 'DPP-4 inhibitor regulating glucose without renal dose adjustment',
        typicalDosageBn: '৫ মি.গ্রা. দিনে একবার',
        timingBn: 'প্রতিদিন নির্দিষ্ট সময়ে খাবারের সাথে বা ছাড়া'
      }
    ],
    recommendedTests: [
      {
        testName: 'HbA1c (Glycated Hemoglobin)',
        testCategory: 'blood',
        categoryLabelBn: 'এইচবিএ১সি পরীক্ষা',
        reasonBn: 'বিগত ৩ মাসের গড় রক্তে গ্লুকোজ নিয়ন্ত্রণ ও ডায়াবেটিসের নিশ্চিত ডায়াগনোসিস।',
        reasonEn: 'Gold standard index of 3-month glycemic control and diagnostic confirmation.',
        urgency: 'routine',
        urgencyLabelBn: 'ডায়াগনোসিস ও মনিটরিংয়ে গোল্ড স্ট্যান্ডার্ড',
        preventsErrorBn: 'সাময়িক খাদ্যাভ্যাসের পরিবর্তনে রক্ত সুগারের বিভ্রান্তিকর রিডিংয়ের ভুল ডায়াগনোসিস রোধ করে।'
      },
      {
        testName: 'FBS & 2HABF (Fasting & 2h After Breakfast)',
        testCategory: 'blood',
        categoryLabelBn: 'ফাস্টিং ও পোস্ট-মিল সুগার',
        reasonBn: 'খালি পেটে ও খাবারের ২ ঘণ্টা পর গ্লুকোজের তাৎক্ষণিক মাত্রা নিরূপণ ও ওষুধের মাত্রা সমন্বয়ে।',
        reasonEn: 'Monitors acute fasting and post-prandial glycemic excursions.',
        urgency: 'routine',
        urgencyLabelBn: 'প্রাথমিক স্ক্রিনিং',
        preventsErrorBn: 'হাইপোগ্লাইসেমিয়া বা মারাত্মক হাইপারগ্লাইসেমিয়া থেকে রোগীকে নিরাপদে রাখে।'
      },
      {
        testName: 'Serum Creatinine & Urine for Microalbumin (ACR)',
        testCategory: 'blood',
        categoryLabelBn: 'ডায়াবেটিক কিডনি পরীক্ষা',
        reasonBn: 'ডায়াবেটিক নেফ্রোপ্যাথির প্রথম ধাপেই প্রোটিন লিকেজ ধরা ও কিডনি সুরক্ষা নিশ্চিত করা।',
        reasonEn: 'Early detection of diabetic nephropathy via microalbuminuria assessment.',
        urgency: 'routine',
        urgencyLabelBn: 'বাৎসরিক স্ক্রিনিং',
        preventsErrorBn: 'কিডনি বিকল হওয়ার পূর্বে ডায়াবেটিসের ওষুধ (যেমন মেটফরমিন) নিরাপদে টাইট্রেট করতে সহায়তা করে।'
      }
    ],
    lifestyleAdviceBn: [
      'চিনি, মিষ্টি, সফট ড্রিংকস ও অতিরিক্ত শর্করাযুক্ত খাবার এড়িয়ে চলুন।',
      'নিয়মিত খালি পেটে (FBS) এবং খাওয়ার ২ ঘণ্টা পরে রক্তের গ্লুকোজ মাপুন।'
    ],
    lifestyleAdviceEn: [
      'Avoid refined sugars, sweets, and high-glycemic carbohydrates.',
      'Monitor blood sugar levels regularly with a glucometer.'
    ],
    warningsBn: [
      'ডায়াবেটিসের ওষুধ অবশ্যই রেজিস্ট্রার্ড চিকিৎসকের পরীক্ষা-নিরীক্ষা ও প্রেসক্রিপশন অনুযায়ী সেবন করতে হবে।'
    ]
  },

  // 13. Eye Irritation, Red Eyes & Conjunctivitis
  {
    id: 'eye_irritation',
    nameBn: 'চোখ লাল হওয়া, চুলকানি, চোখ ওঠা ও খচখচ করা',
    nameEn: 'Eye Irritation, Red Eyes & Conjunctivitis',
    category: 'Ophthalmic Lubricants & Antiseptics',
    severity: 'mild',
    summaryBn: 'ধুলোবালি, অ্যালার্জি বা জীবাণু সংক্রমণের কারণে চোখ লাল ও খচখচ করতে পারে।',
    summaryEn: 'Conjunctival irritation, dry eyes, allergic reaction, or viral conjunctivitis.',
    banglaKeywords: [
      'চোখ লাল', 'চোখ ওঠা', 'চোখ চুলকায়', 'চোখ দিয়ে পানি পড়ে', 'চোখ জ্বালাপোড়া', 
      'চোখ খচখচ করে', 'শুষ্ক চোখ', 'চোখে আলো সহ্য হয় না'
    ],
    englishKeywords: [
      'red eyes', 'eye irritation', 'dry eyes', 'conjunctivitis', 'watery eyes', 
      'itchy eyes', 'eye burning', 'pink eye'
    ],
    recommendedGenerics: [
      {
        genericName: 'Carboxymethylcellulose',
        roleBn: 'কৃত্রিম চোখের জল (Artificial Tears) — চোখের খচখচে ভাব ও শুষ্কতা দূর করে',
        roleEn: 'Ophthalmic lubricant soothing dry, tired, and irritated eyes',
        typicalDosageBn: '১-২ ফোঁটা আক্রান্ত চোখে দিনে ৩-৪ বার',
        timingBn: 'প্রয়োজন অনুযায়ী'
      },
      {
        genericName: 'Olopatadine',
        roleBn: 'চোখের অ্যালার্জি ও চুলকানি নিরাময়ের নিরাপদ ড্রপ',
        roleEn: 'Antihistamine eye drops for allergic conjunctivitis and itching',
        typicalDosageBn: '১ ফোঁটা দিনে ১-২ বার',
        timingBn: 'চোখে ড্রপ দেওয়ার পর কিছুক্ষণ চোখ বন্ধ রাখুন'
      }
    ],
    recommendedTests: [
      {
        testName: 'Slit Lamp Biomicroscopy & Fluorescein Staining',
        testCategory: 'specialized',
        categoryLabelBn: 'স্লিট ল্যাম্প ও কর্নিয়া টেস্ট',
        reasonBn: 'চোখের কর্নিয়াতে ক্ষত (Corneal Ulcer) বা বাহ্যিক কণা (Foreign Body) আছে কিনা নিশ্চিত করতে।',
        reasonEn: 'Detects corneal epithelial defects, ulceration, or foreign bodies under cobalt blue light.',
        urgency: 'immediate',
        urgencyLabelBn: 'তীব্র আলো সহ্য না হলে জরুরি',
        preventsErrorBn: 'ভুলবশত কর্নিয়াল আলসারে স্টেরয়েড আই ড্রপ প্রয়োগ করে রোগীর স্থায়ী অন্ধত্ব ডেকে আনা রোধ করে।'
      }
    ],
    lifestyleAdviceBn: [
      'হাত দিয়ে চোখ চুলকাবেন না বা ঘষবেন না।',
      'মোবাইল বা কম্পিউটারের দিকে একটানা তাকিয়ে না থেকে ২০ মিনিট পর পর দূরে তাকান।',
      'বাইরে বের হলে সানগ্লাস ব্যবহার করুন।'
    ],
    lifestyleAdviceEn: [
      'Never rub your eyes with unwashed hands.',
      'Follow the 20-20-20 rule during screen use.',
      'Wear sunglasses outdoors to protect from glare and dust.'
    ],
    warningsBn: [
      'চোখে তীব্র ব্যথা, দৃষ্টি ঝাপসা হওয়া বা পুঁজ বের হলে অবিলম্বে চক্ষু বিশেষজ্ঞ দেখান।'
    ]
  },

  // 14. Fungal Infection, Ringworm & Scabies
  {
    id: 'fungal_infection',
    nameBn: 'দাউদ, ছত্রাক সংক্রমণ ও খোসপাঁচড়া',
    nameEn: 'Fungal Skin Infection & Ringworm (Tinea)',
    category: 'Antifungal',
    severity: 'mild',
    summaryBn: 'আর্দ্রতা, ঘাম বা ভেজা কাপড়ের কারণে ত্বকে গোল গোল চাকা (দাউদ) বা ফাঙ্গাল ইনফেকশন হয়।',
    summaryEn: 'Superficial dermatophyte fungal infection like tinea corporis, ringworm, or candidiasis.',
    banglaKeywords: [
      'দাউদ', 'দাদ', 'ছত্রাক', 'খোসপাঁচড়া', 'আঙ্গুলের ফাঁকে ঘা', 'ফাঙ্গাল ইনফেকশন', 
      'কুঁচকিতে চুলকানি', 'ঘামে চুলকানি'
    ],
    englishKeywords: [
      'fungal infection', 'ringworm', 'tinea', 'fungus', 'athlete foot', 
      'itchy groin', 'skin fungus', 'scabies'
    ],
    recommendedGenerics: [
      {
        genericName: 'Clotrimazole',
        roleBn: 'ছত্রাক ও দাউদের চিকিৎসায় বহুল প্রচলিত নিরাপদ অ্যান্টিফাঙ্গাল ক্রিম',
        roleEn: 'Broad-spectrum topical antifungal cream treating ringworm and skin candidiasis',
        typicalDosageBn: 'আক্রান্ত স্থানে পরিষ্কার করে শুকিয়ে দিনে ২ বার হালকাভাবে লাগাতে হবে',
        timingBn: 'টানা ২-৪ সপ্তাহ ব্যবহার্য'
      },
      {
        genericName: 'Ketoconazole',
        roleBn: 'তীব্র ফাঙ্গাল সংক্রমণ ও খুশকির কার্যকর অ্যান্টিফাঙ্গাল সমাধান',
        roleEn: 'Potent imidazole antifungal for dermatophyte infections and seborrhea',
        typicalDosageBn: 'ক্রিম দিনে ১-২ বার আক্রান্ত ত্বকে ব্যবহার্য',
        timingBn: 'লক্ষণ ভালো হওয়ার পরও ১ সপ্তাহ ব্যবহার করুন'
      }
    ],
    recommendedTests: [
      {
        testName: 'Skin Scraping for KOH Mount & Microscopy',
        testCategory: 'specialized',
        categoryLabelBn: 'কে-ও-এইচ মাউন্ট টেস্ট',
        reasonBn: 'মাইক্রোস্কোপের নিচে ফাঙ্গাল হাইফি সরাসরি শনাক্ত করে দাউদ বা টিনিয়া নিশ্চিতকরণ।',
        reasonEn: 'Microscopic identification of fungal hyphae and spores in keratinized tissue.',
        urgency: 'routine',
        urgencyLabelBn: 'স্কিন ডায়াগনোসিস',
        preventsErrorBn: 'একজিমা ও ফাঙ্গাল ইনফেকশনের বিভ্রান্তিকর লক্ষণ আলাদা করে ভুল স্টেরয়েড প্রয়োগ ঠেকায়।'
      }
    ],
    lifestyleAdviceBn: [
      'আক্রান্ত স্থান সবসময় শুষ্ক ও পরিষ্কার রাখুন। গোসলের পর ভালো করে মুছে নিন।',
      'অন্যের ব্যবহৃত তোয়ালে, গামছা বা কাপড় শেয়ার করবেন না।',
      'সুতির ঢিলেঢালা অন্তর্বাস পরিধান করুন এবং নিয়মিত রোদে শুকান।'
    ],
    lifestyleAdviceEn: [
      'Keep the infected area completely dry and clean.',
      'Do not share personal items like towels, combs, or clothes.',
      'Wear loose cotton undergarments.'
    ],
    warningsBn: [
      'দাউদ বা ফাঙ্গাসে স্টেরয়েডযুক্ত মলম (যেমন বেটনোভেট ইত্যাদি) লাগাবেন না, এতে রোগ মারাত্মক রূপ নিতে পারে।'
    ]
  },

  // 15. Constipation & Irregular Bowel
  {
    id: 'constipation',
    nameBn: 'কোষ্ঠকাঠিন্য ও মলত্যাগে কষ্ট',
    nameEn: 'Constipation & Hard Stool',
    category: 'Laxatives & Stool Softeners',
    severity: 'mild',
    summaryBn: 'কম পানি পান, আঁশহীন খাবার বা কায়িক পরিশ্রমের অভাবে মল শক্ত হয়ে কোষ্ঠকাঠিন্য দেখা দেয়।',
    summaryEn: 'Infrequent or difficult evacuation of the bowels due to lack of dietary fiber.',
    banglaKeywords: [
      'কোষ্ঠকাঠিন্য', 'মল শক্ত', 'পায়খানা পরিষ্কার হয় না', 'পায়খানায় কষ্ট', 'পায়খানা কষা', 
      'মলত্যাগে ব্যথা', 'কষা পায়খানা'
    ],
    englishKeywords: [
      'constipation', 'hard stool', 'bowel trouble', 'cannot pass stool', 'irregular bowel', 
      'straining', 'difficulty passing stool'
    ],
    recommendedGenerics: [
      {
        genericName: 'Lactulose',
        roleBn: 'অসমোটিক ল্যাক্সেটিভ — অন্ত্রে পানি ধরে রেখে মল নরম ও মসৃণ করে',
        roleEn: 'Osmotic laxative softening stools and stimulating physiological peristalsis',
        typicalDosageBn: '১৫-৩০ মিলি সিরাপ দিনে একবার',
        timingBn: 'সকালে বা রাতে এক গ্লাস পানি সহ'
      },
      {
        genericName: 'Ispagula Husk',
        roleBn: 'ইসবগুলের ভুসি — প্রাকৃতিক খাদ্য আঁশ যা স্বাভাবিক কোষ্ঠ পরিষ্কার করে',
        roleEn: 'Natural bulk-forming dietary fiber for regular bowel movements',
        typicalDosageBn: '১-২ চামচ এক গ্লাস পানিতে গুলিয়ে অবিলম্বে সেব্য',
        timingBn: 'রাত্রে ঘুমানোর পূর্বে'
      }
    ],
    recommendedTests: [
      {
        testName: 'Stool for Occult Blood Test (FOBT)',
        testCategory: 'urine_stool',
        categoryLabelBn: 'লুকায়িত রক্ত পরীক্ষা',
        reasonBn: 'মলে খালি চোখে অদৃশ্য রক্তপাত শনাক্ত করে কোলোরেক্টাল পলিপ বা আলসার নির্ণয়ে।',
        reasonEn: 'Screens for microscopic gastrointestinal bleeding and colorectal neoplasia.',
        urgency: 'if_persists',
        urgencyLabelBn: 'বয়স্ক রোগীদের ক্ষেত্রে বা ওজন কমলে',
        preventsErrorBn: 'কোলন ক্যান্সার বা কোলাইটিসকে কেবল সাধারণ কোষ্ঠকাঠিন্য ভেবে অবহেলা করা রোধ করে।'
      },
      {
        testName: 'Serum TSH (Thyroid Stimulating Hormone)',
        testCategory: 'blood',
        categoryLabelBn: 'থাইরয়েড হরমোন',
        reasonBn: 'হাইপোথাইরয়েডিজম অন্ত্রের গতি ধীর করে কোষ্ঠকাঠিন্যের কারণ তৈরি করেছে কিনা যাচাইয়ে।',
        reasonEn: 'Identifies systemic hypothyroidism causing reduced colonic transit time.',
        urgency: 'routine',
        urgencyLabelBn: 'মেটাবলিক কারণ নির্ণয়',
        preventsErrorBn: 'থাইরয়েড হরমোনের ঘাটতি মিস হওয়া ঠেকিয়ে রোগের মূল শিকড়ের সমাধান দেয়।'
      }
    ],
    lifestyleAdviceBn: [
      'প্রতিদিন অন্তত ৩ লিটার পানি পান করুন।',
      'প্রচুর শাকসবজি, ফলমূল, লাল আটা ও আঁশযুক্ত খাবার গ্রহণ করুন।',
      'নিয়মিত হাঁটাচলা ও শরীরচর্চা করুন।'
    ],
    lifestyleAdviceEn: [
      'Drink at least 8-10 glasses of water daily.',
      'Increase intake of fiber-rich fruits, vegetables, and whole grains.',
      'Engage in regular physical activity to stimulate bowel motility.'
    ],
    warningsBn: [
      'টানা কয়েক সপ্তাহ ধরে কোষ্ঠকাঠিন্য থাকলে বা মলের সাথে রক্ত পড়লে কোলন বিশেষজ্ঞ দেখান।'
    ]
  },

  // 16. Weakness, Fatigue & Vitamin Deficiency
  {
    id: 'weakness_fatigue',
    nameBn: 'শারীরিক দুর্বলতা, ক্লান্তি ও পুষ্টিহীনতা',
    nameEn: 'General Weakness, Fatigue & Nutritional Deficiency',
    category: 'Vitamins & Minerals',
    severity: 'mild',
    summaryBn: 'অপুষ্টি, দীর্ঘ অসুস্থতা বা ভিটামিনের অভাবে অবসাদ ও দুর্বলতা অনুভূত হতে পারে।',
    summaryEn: 'Persistent low energy, malaise, or post-illness fatigue.',
    banglaKeywords: [
      'দুর্বলতা', 'ক্লান্তি', 'গায়ে শক্তি পাই না', 'দুর্বল লাগে', 'ভিটামিনের অভাব', 
      'মাথা ঝিমঝিম', 'অল্পতে হাঁপিয়ে যাই', 'হাত পা কাঁপে'
    ],
    englishKeywords: [
      'weakness', 'fatigue', 'tiredness', 'lack of energy', 'exhaustion', 
      'vitamin deficiency', 'lethargy'
    ],
    recommendedGenerics: [
      {
        genericName: 'Vitamin B Complex',
        roleBn: 'স্নায়ুতন্ত্র সুস্থ রাখে এবং খাদ্য থেকে শক্তি উৎপাদনে সাহায্য করে',
        roleEn: 'Essential B-vitamins supporting cellular metabolism and nerve health',
        typicalDosageBn: '১টি ট্যাবলেট দিনে ১-২ বার',
        timingBn: 'খাওয়ার পর'
      },
      {
        genericName: 'Calcium + Vitamin D3',
        roleBn: 'হাড় ও পেশীর শক্তি বজায় রাখে এবং ক্লান্তি দূর করে',
        roleEn: 'Essential minerals for bone density and muscle endurance',
        typicalDosageBn: '১টি ট্যাবলেট দিনে একবার',
        timingBn: 'দুপুরে বা রাতে খাওয়ার পর'
      }
    ],
    recommendedTests: [
      {
        testName: 'Complete Blood Count (CBC with PBF)',
        testCategory: 'blood',
        categoryLabelBn: 'রক্তস্বল্পতা পরীক্ষা',
        reasonBn: 'হিমোগ্লোবিনের মাত্রা ও লোহিত রক্তকণিকার আকার দেখে অ্যানিমিয়া বা রক্তস্বল্পতা শনাক্তকরণ।',
        reasonEn: 'Screens for microcytic, normocytic, or macrocytic anemia and hemoglobin level.',
        urgency: 'routine',
        urgencyLabelBn: 'প্রাথমিক টেস্ট',
        preventsErrorBn: 'রক্তস্বল্পতা মিস করে অপ্রয়োজনীয় সাধারণ টনিক দিয়ে সময় নষ্ট করা প্রতিরোধ করে।'
      },
      {
        testName: 'Serum Ferritin & Iron Profile',
        testCategory: 'blood',
        categoryLabelBn: 'আয়রন রিজার্ভ পরীক্ষা',
        reasonBn: 'শরীরের আয়রন সঞ্চয় মাপা ও আয়রন ডেফিসিয়েন্সি অ্যানিমিয়া নিশ্চিতকরণ।',
        reasonEn: 'Evaluates total body iron stores and distinguishes from thalassemia trait.',
        urgency: 'routine',
        urgencyLabelBn: 'নিশ্চিতকরণ পরীক্ষা',
        preventsErrorBn: 'থ্যালাসেমিয়া ট্রেইট ও আয়রন ঘাটতির মারাত্মক ভুল চিকিৎসায় আয়রন ওভারলোড হওয়া থেকে বাঁচায়।'
      },
      {
        testName: 'Serum TSH & RBS',
        testCategory: 'blood',
        categoryLabelBn: 'হরমোন ও সুগার',
        reasonBn: 'ক্লান্তির অন্তর্নিহিত কারণ হিসেবে হাইপোথাইরয়েডিজম বা অনির্ণীত ডায়াবেটিস বাদ দিতে।',
        reasonEn: 'Excludes endocrine etiologies like hypothyroidism or diabetes mellitus.',
        urgency: 'routine',
        urgencyLabelBn: 'মেটাবলিক স্ক্রিনিং',
        preventsErrorBn: 'সাইলেন্ট ডায়াবেটিস বা মেটাবলিক স্লথনেস দ্রুত শনাক্ত করে।'
      }
    ],
    lifestyleAdviceBn: [
      'পুষ্টিকর খাবার, ডিম, দুধ, ফলমূল ও পর্যাপ্ত প্রোটিন গ্রহণ করুন।',
      'দিনে অন্তত ৭-৮ ঘণ্টা নিয়মিত ঘুমান।'
    ],
    lifestyleAdviceEn: [
      'Eat a balanced diet rich in proteins, vegetables, and dairy products.',
      'Ensure 7-8 hours of sound sleep daily.'
    ],
    warningsBn: [
      'দীর্ঘমেয়াদী ক্লান্তির পেছনে রক্তস্বল্পতা (Anemia) বা থাইরয়েডের সমস্যা থাকতে পারে; ডাক্তারের কাছে রক্ত পরীক্ষা করিয়ে নেওয়া ভালো।'
    ]
  },

  // 17. Chest Pain, Pressure & Acute Coronary Syndrome
  {
    id: 'chest_pain_cardiac',
    nameBn: 'বুকে তীব্র চাপ, বুকব্যথা ও হৃদরোগের ঝুঁকি',
    nameEn: 'Chest Pain, Angina & Acute Coronary Syndrome',
    category: 'Cardiovascular & Emergency',
    severity: 'emergency',
    summaryBn: 'বুকের মাঝখানে ভারী পাথর চেপে বসার মত ব্যথা, বাম হাতে বা চোয়ালে ছড়িয়ে যাওয়া এবং ঘাম হওয়া হার্ট অ্যাটাকের লক্ষণ হতে পারে।',
    summaryEn: 'Central crushing chest pain, radiating to left arm or jaw with diaphoresis, indicating possible myocardial ischemia or infarction.',
    banglaKeywords: [
      'বুকে ব্যথা', 'বুক ব্যথা', 'বুকের চাপ', 'বুক চেপে ধরে', 'হার্ট অ্যাটাক', 'হার্টের সমস্যা', 
      'বুকে পাথর', 'বাম হাত ব্যথা', 'বুকে তীব্র যন্ত্রণা', 'শ্বাস নিতে বুক ব্যথা'
    ],
    englishKeywords: [
      'chest pain', 'angina', 'heart attack', 'cardiac pain', 'chest pressure', 
      'myocardial infarction', 'radiating pain', 'crushing chest pain'
    ],
    recommendedGenerics: [
      {
        genericName: 'Glyceryl Trinitrate',
        roleBn: 'হৃদপিন্ডের ধমনী দ্রুত প্রসারিত করে বুকে ব্যথার তীব্রতা কমায় (জরুরি নাইট্রোগ্লিসারিন স্প্রে/ট্যাবলেট)',
        roleEn: 'Sublingual vasodilator relieving acute anginal ischemic pain',
        typicalDosageBn: '১-২ পাফ জিহ্বার নিচে স্প্রে অথবা ১টি ট্যাবলেট জিহ্বার নিচে',
        timingBn: 'বুকে ব্যথার সময় অবিলম্বে (বসা অবস্থায়)'
      },
      {
        genericName: 'Aspirin',
        roleBn: 'রক্তনালীতে রক্ত জমাট বাঁধা ঠেকিয়ে হার্ট অ্যাটাকের ক্ষতি সীমিত রাখে',
        roleEn: 'Antiplatelet agent preventing propagation of intracoronary thrombus',
        typicalDosageBn: '৩০০ মি.গ্রা. জরুরি অবস্থায় চিবিয়ে সেব্য',
        timingBn: 'তাৎক্ষণিক চিবিয়ে সেব্য'
      },
      {
        genericName: 'Clopidogrel',
        roleBn: 'দ্বিতীয় অ্যান্টিপ্লাটিলেট — রক্তনালী খোলা রাখতে ডুয়াল অ্যান্টিপ্লাটিলেট থেরাপির অংশ',
        roleEn: 'P2Y12 inhibitor complementing aspirin in acute coronary syndrome',
        typicalDosageBn: '৩০০ মি.গ্রা. লোডিং ডোজ',
        timingBn: 'জরুরি নির্দেশনায়'
      }
    ],
    recommendedTests: [
      {
        testName: 'ECG (12 Lead)',
        testCategory: 'cardiac',
        categoryLabelBn: 'জরুরি ইসিজি',
        reasonBn: 'এসটি এলিভেশন (STEMI) বা তীব্র ইস্কেমিক পরিবর্তন তাৎক্ষণিক নির্ণয়ে প্রথম ও প্রধান টেস্ট।',
        reasonEn: 'Immediate diagnostic test to detect ST-elevation myocardial infarction and arrhythmias.',
        urgency: 'immediate',
        urgencyLabelBn: 'তাৎক্ষণিক আবশ্যক (Immediate)',
        preventsErrorBn: 'হার্ট অ্যাটাককে সাধারণ গ্যাস্ট্রিক মনে করার মারাত্মক ভুল ঠেকিয়ে জীবন রক্ষা করে।'
      },
      {
        testName: 'Serum Troponin-I (High Sensitivity)',
        testCategory: 'blood',
        categoryLabelBn: 'কার্ডিয়াক এনজাইম',
        reasonBn: 'হার্টের মাংসপেশির ক্ষতি নিশ্চিতকরণের গোল্ড স্ট্যান্ডার্ড বায়োমার্কার।',
        reasonEn: 'Definitive gold-standard biomarker of myocardial necrosis and injury.',
        urgency: 'immediate',
        urgencyLabelBn: 'তৎক্ষণাৎ আবশ্যক',
        preventsErrorBn: 'নন-এসটিএমআই (NSTEMI) হার্ট অ্যাটাক মিস হওয়া সম্পূর্ণ রোধ করে।'
      },
      {
        testName: 'Echocardiography (2D / Color Doppler)',
        testCategory: 'cardiac',
        categoryLabelBn: 'ইকোকার্ডিওগ্রাফি',
        reasonBn: 'হার্টের পাম্পিং ক্ষমতা (Ejection Fraction) ও প্রাচীরের গতিবিধি (RWMA) মূল্যায়নে।',
        reasonEn: 'Assesses regional wall motion abnormality and left ventricular ejection fraction.',
        urgency: 'immediate',
        urgencyLabelBn: 'জরুরি কার্ডিয়াক অ্যাসেসমেন্ট',
        preventsErrorBn: 'হার্ট ফেইলিউর বা ভালভের গুরুতর ত্রুটি আগে থেকেই শনাক্ত করে সঠিক চিকিৎসা দেয়।'
      },
      {
        testName: 'Lipid Profile',
        testCategory: 'blood',
        categoryLabelBn: 'রক্তের চর্বি',
        reasonBn: 'রক্তনালীতে কোলেস্টেরল ব্লকেজ ও ভবিষ্যৎ স্ট্রোক/হার্ট অ্যাটাক ঝুঁকি নিরূপণে।',
        reasonEn: 'Evaluates atherogenic dyslipidemia for long-term secondary prevention.',
        urgency: 'routine',
        urgencyLabelBn: 'রুটিন পরীক্ষা',
        preventsErrorBn: 'হাই-ইনটেনসিটি স্ট্যাটিন থেরাপির সঠিক মাত্রা নির্ধারণে সহায়তা করে।'
      }
    ],
    lifestyleAdviceBn: [
      'বুকে তীব্র চাপ হলে কোনো কায়িক পরিশ্রম না করে শান্ত হয়ে বসে থাকুন।',
      'বিলম্ব না করে নিকটস্থ হাসপাতালে যান; নিজে গাড়ি চালাবেন না।'
    ],
    lifestyleAdviceEn: [
      'Sit down and rest immediately; avoid any physical exertion.',
      'Call emergency services or reach a cardiac hospital immediately.'
    ],
    warningsBn: [
      'বুকে ব্যথা যদি চোয়ালে, ঘাড়ে বা পিঠে ছড়িয়ে যায় এবং ঠান্ডা ঘাম দেয় তবে এটি নিশ্চিত কার্ডিয়াক রেড ফ্ল্যাগ।'
    ],
    emergencyWarningBn: 'বুকে তীব্র পাথর চেপে বসার মত ব্যথা, ঘাম ও শ্বাসকষ্ট — জরুরি কার্ডিয়াক ইমার্জেন্সি! অবিলম্বে কার্ডিয়াক বা জরুরি হাসপাতালে স্থানান্তর করুন।'
  },

  // 18. Urinary Tract Infection (UTI) & Burning Micturition
  {
    id: 'uti_urinary',
    nameBn: 'প্রস্রাবে জ্বালাপোড়া ও ঘন ঘন প্রস্রাবের বেগ (UTI)',
    nameEn: 'Urinary Tract Infection (UTI) & Burning Micturition',
    category: 'Urological & Antibacterial',
    severity: 'moderate',
    summaryBn: 'মূত্রনালী বা ব্লাডারে ব্যাকটেরিয়া সংক্রমণের কারণে প্রস্রাবের সময় তীব্র জ্বালাপোড়া, তলপেটে ব্যথা বা ঘন ঘন বেগ হতে পারে।',
    summaryEn: 'Bacterial infection of the bladder or urethra causing dysuria, frequency, and suprapubic discomfort.',
    banglaKeywords: [
      'প্রস্রাবে জ্বালা', 'প্রস্রাবে জ্বালাপোড়া', 'ইউটিআই', 'ঘন ঘন প্রস্রাব', 'তলপেটে ব্যথা', 
      'প্রস্রাব আটকে থাকে', 'প্রস্রাবে দুর্গন্ধ', 'প্রস্রাবে রক্ত', 'পেসাবে জ্বালা'
    ],
    englishKeywords: [
      'uti', 'urinary tract infection', 'burning urine', 'dysuria', 'frequent urination', 
      'urine burning', 'cloudy urine', 'bladder infection'
    ],
    recommendedGenerics: [
      {
        genericName: 'Cefixime',
        roleBn: 'মূত্রতন্ত্রের ব্যাকটেরিয়াল ইনফেকশনের চিকিৎসায় বহুল কার্যকর সেফালোস্পোরিন অ্যান্টিবায়োটিক',
        roleEn: 'Third-generation cephalosporin for uncomplicated urinary tract infection',
        typicalDosageBn: '২০০ মি.গ্রা. বা ৪০০ মি.গ্রা. দিনে ১-২ বার (টানা ৭-১৪ দিন)',
        timingBn: 'খাওয়ার পর'
      },
      {
        genericName: 'Nitrofurantoin',
        roleBn: 'মূত্রথলিতে উচ্চ ঘনমাত্রায় কাজ করে ইউটিআই নিরাময়কারী ফার্স্ট-লাইন ওষুধ',
        roleEn: 'First-line antimicrobial concentrating specifically in the urinary tract',
        typicalDosageBn: '১০০ মি.গ্রা. দিনে ২ বার (খাবারের সাথে)',
        timingBn: 'ভরা পেটে সেব্য'
      },
      {
        genericName: 'Sodium Citrate',
        roleBn: 'ইউরিন অ্যালকালাইজার — প্রস্রাবের এসিডিটি কমিয়ে তাৎক্ষণিক জ্বালাপোড়া প্রশমিত করে',
        roleEn: 'Urinary alkalinizer relieving dysuria and reducing urinary acidity',
        typicalDosageBn: 'সিরাপ ২-৩ চামচ আধা গ্লাস পানিতে মিশিয়ে দিনে ৩ বার',
        timingBn: 'খাওয়ার পর'
      }
    ],
    recommendedTests: [
      {
        testName: 'Urine R/M/E (Routine & Microscopic Examination)',
        testCategory: 'urine_stool',
        categoryLabelBn: 'প্রস্রাবের রুটিন টেস্ট',
        reasonBn: 'প্রস্রাবে পুঁজকণিকা (Pus Cells), লোহিতকণিকা (RBC) ও ব্যাকটেরিয়ার উপস্থিতি তাৎক্ষণিক নিশ্চিতকরণে।',
        reasonEn: 'Detects pyuria, hematuria, bacteriuria, and casts confirming active urinary infection.',
        urgency: 'immediate',
        urgencyLabelBn: 'তাৎক্ষণিক আবশ্যক',
        preventsErrorBn: 'ইউরিনারি ইনফেকশন নিশ্চিত না হয়েই অপ্রয়োজনীয় অ্যান্টিবায়োটিক প্রয়োগের বিভ্রান্তি দূর করে।'
      },
      {
        testName: 'Urine Culture & Sensitivity (C/S)',
        testCategory: 'urine_stool',
        categoryLabelBn: 'ইউরিন কালচার ও সেনসিটিভিটি',
        reasonBn: 'সুনির্দিষ্ট ব্যাকটেরিয়া (যেমন E. coli) শনাক্তকরণ এবং ঠিক কোন অ্যান্টিবায়োটিক কাজ করবে তা নিশ্চিত করতে।',
        reasonEn: 'Isolates causative organism and determines precise antimicrobial susceptibility.',
        urgency: 'if_persists',
        urgencyLabelBn: 'অ্যান্টিবায়োটিক শুরুর পূর্বে বা বারবার হলে',
        preventsErrorBn: 'অ্যান্টিবায়োটিক রেজিস্ট্যান্স রোধ করে এবং ভুল অ্যান্টিবায়োটিকের কারণে ইনফেকশন কিডনিতে (Pyelonephritis) ছড়ানো ঠেকায়।'
      },
      {
        testName: 'USG of KUB & Prostate',
        testCategory: 'radiology',
        categoryLabelBn: 'আল্ট্রাসনোগ্রাম (কে-ইউ-বি)',
        reasonBn: 'কিডনিতে পাথর, মূত্রনালীর ব্লকেজ বা পুরুষদের ক্ষেত্রে প্রোস্টেট গ্রন্থির বৃদ্ধি শনাক্ত করতে।',
        reasonEn: 'Screens for renal calculi, hydronephrosis, urinary retention, and benign prostatic hyperplasia.',
        urgency: 'if_persists',
        urgencyLabelBn: 'বারবার প্রস্রাবে ইনফেকশন হলে',
        preventsErrorBn: 'পাথর বা প্রোস্টেটের প্রতিবন্ধকতা মিস করে কেবল ওষুধ দিয়ে চিকিৎসা চালানোর পুনরাবৃত্তি বন্ধ করে।'
      },
      {
        testName: 'Serum Creatinine',
        testCategory: 'blood',
        categoryLabelBn: 'কিডনি ফাংশন',
        reasonBn: 'ইনফেকশন কিডনিতে ছড়িয়ে পাইলোনেফ্রাইটিস বা কিডনির কার্যক্ষমতার ক্ষতি করেছে কিনা তা যাচাইয়ে।',
        reasonEn: 'Excludes ascending upper urinary tract infection and renal impairment.',
        urgency: 'routine',
        urgencyLabelBn: 'জ্বর বা কোমর ব্যথায় জরুরি',
        preventsErrorBn: 'কিডনির অবনতি প্রাথমিক অবস্থাতেই শনাক্ত করে রোগীকে সুরক্ষিত রাখে।'
      }
    ],
    lifestyleAdviceBn: [
      'প্রতিদিন অন্তত ৩ থেকে ৪ লিটার বিশুদ্ধ পানি পান করুন যাতে ব্যাকটেরিয়া ধুয়ে বের হয়ে যায়।',
      'প্রস্রাবের বেগ আটকে রাখবেন না; বেগ এলেই অবিলম্বে প্রস্রাব করুন।',
      'প্রস্রাব করার পর পরিষ্কার পানি দিয়ে পরিষ্কার-পরিচ্ছন্নতা বজায় রাখুন।'
    ],
    lifestyleAdviceEn: [
      'Drink 3-4 liters of water daily to flush bacteria from the urinary system.',
      'Do not delay or hold urine when the urge arises.',
      'Maintain proper hygiene.'
    ],
    warningsBn: [
      'প্রস্রাবে জ্বালাপোড়ার সাথে যদি কাঁপুনি দিয়ে তীব্র জ্বর বা কোমরের পেছনে ব্যথা থাকে তবে ইনফেকশন কিডনিতে পৌঁছানোর ঝুঁকি রয়েছে — দ্রুত চিকিৎসকের কাছে যান।'
    ],
    emergencyWarningBn: 'প্রস্রাবের সাথে লাল রক্ত যাওয়া বা প্রস্রাব সম্পূর্ণ বন্ধ হয়ে গেলে অবিলম্বে জরুরি বিভাগে যোগাযোগ করুন।'
  },

  // 19. Jaundice, Yellow Eyes & Hepatic Distress
  {
    id: 'jaundice_liver',
    nameBn: 'জন্ডিস, চোখ ও প্রস্রাব হলুদ হওয়া ও লিভারের সমস্যা',
    nameEn: 'Jaundice, Yellow Sclera & Hepatic Inflammation',
    category: 'Hepatoprotective & Gastrointestinal',
    severity: 'consult_doctor',
    summaryBn: 'রক্তে বিলিরুবিনের মাত্রা বৃদ্ধি, হেপাটাইটিস ভাইরাসের আক্রমণ বা পিত্তনালীর বাধার কারণে চোখ ও প্রস্রাব হলুদ হতে পারে।',
    summaryEn: 'Hyperbilirubinemia leading to yellowing of sclera and skin caused by acute hepatitis, hemolysis, or biliary obstruction.',
    banglaKeywords: [
      'জন্ডিস', 'চোখ হলুদ', 'প্রস্রাব হলুদ', 'গা হলুদ', 'লিভারের সমস্যা', 'লিভার ফোলা', 
      'খাবারে অরুচি জন্ডিস', 'পেটে পানি', 'বিলিরুবিন বেশি'
    ],
    englishKeywords: [
      'jaundice', 'yellow eyes', 'yellow urine', 'hepatitis', 'bilirubin', 
      'liver disease', 'liver inflammation', 'icterus'
    ],
    recommendedGenerics: [
      {
        genericName: 'Ursodeoxycholic Acid',
        roleBn: 'পিত্ত প্রবাহ সচল করে এবং লিভারের কোষগুলোকে বিষাক্ত পিত্ত এসিডের ক্ষতি থেকে রক্ষা করে',
        roleEn: 'Hepatoprotective agent promoting biliary flow and cellular protection',
        typicalDosageBn: '২৫০ মি.গ্রা. বা ৩০০ মি.গ্রা. দিনে ২-৩ বার',
        timingBn: 'খাবারের সাথে বা খাওয়ার পর'
      },
      {
        genericName: 'Silymarin',
        roleBn: 'প্রাকৃতিক মিল্ক থিসল উপাদান — লিভার কোষের পুনরুজ্জীবনে সহায়ক সাপ্লিমেন্ট',
        roleEn: 'Antioxidant flavonoid protecting hepatocytes from membrane peroxidation',
        typicalDosageBn: '১৪০ মি.গ্রা. দিনে ২-৩ বার',
        timingBn: 'খাওয়ার পর'
      }
    ],
    recommendedTests: [
      {
        testName: 'Serum Bilirubin (Total, Direct & Indirect)',
        testCategory: 'blood',
        categoryLabelBn: 'বিলিরুবিন পরীক্ষা',
        reasonBn: 'রক্তে জন্ডিসের সঠিক মাত্রা এবং এটি হেপাটিক নাকি অবস্ট্রাক্টিভ (পিত্তনালীর ব্লকেজ) তা নির্ণয়ে।',
        reasonEn: 'Measures total, conjugated, and unconjugated bilirubin to identify etiology of jaundice.',
        urgency: 'immediate',
        urgencyLabelBn: 'তাৎক্ষণিক আবশ্যক',
        preventsErrorBn: 'হিমোলাইটিক ও অবস্ট্রাক্টিভ জন্ডিসের মধ্যকার মারাত্মক ভুল পার্থক্য নির্মূল করে।'
      },
      {
        testName: 'SGPT / ALT & SGOT / AST',
        testCategory: 'blood',
        categoryLabelBn: 'লিভার এনজাইম',
        reasonBn: 'লিভার কোষে তীব্র প্রদাহ (Acute Hepatitis) বা ক্ষতির মাত্রা সরাসরি নিরূপণে।',
        reasonEn: 'Key transaminases indicating acute hepatocyte injury and necrosis.',
        urgency: 'immediate',
        urgencyLabelBn: 'প্রাথমিক লিভার পরীক্ষা',
        preventsErrorBn: 'লিভারের ক্ষতের তীব্রতা না বুঝে প্যারাসিটামল বা লিভার-টক্সিক ওষুধ সেবনের ঝুঁকি প্রতিরোধ করে।'
      },
      {
        testName: 'USG of Hepatobiliary System (HBS)',
        testCategory: 'radiology',
        categoryLabelBn: 'হেপাটোবিলিয়ারি আল্ট্রাসনোগ্রাম',
        reasonBn: 'পিত্তথলি বা পিত্তনালীতে পাথর আটকে অবস্ট্রাক্টিভ জন্ডিস হয়েছে কিনা তা দেখতে।',
        reasonEn: 'Visualizes biliary tree dilatation, choledocholithiasis, and hepatic parenchyma.',
        urgency: 'immediate',
        urgencyLabelBn: 'জরুরি ইমেজিং',
        preventsErrorBn: 'সার্জিক্যাল অবস্ট্রাকশন মিস করে রোগীকে সেপসিসে চলে যাওয়া থেকে বাঁচায়।'
      },
      {
        testName: 'Viral Hepatitis Panel (HBsAg, Anti-HCV, IgM Anti-HAV, IgM Anti-HEV)',
        testCategory: 'blood',
        categoryLabelBn: 'হেপাটাইটিস ভাইরাস স্ক্রিনিং',
        reasonBn: 'জন্ডিসের পেছনে হেপাটাইটিস এ, ই, বি বা সি ভাইরাসের আক্রমণ রয়েছে কিনা তা নিশ্চিত হতে।',
        reasonEn: 'Differentiates feco-oral hepatitis (A, E) from blood-borne chronic hepatitis (B, C).',
        urgency: 'if_persists',
        urgencyLabelBn: 'কারণ নিশ্চিতকরণে আবশ্যক',
        preventsErrorBn: 'ক্রনিক হেপাটাইটিস বি/সি মিস হয়ে ভবিষ্যতে লিভার সিরোসিস হওয়া প্রতিরোধ করে।'
      }
    ],
    lifestyleAdviceBn: [
      'সম্পূর্ণ বিশ্রাম নিন; জন্ডিস চলাকালীন ভারী কায়িক পরিশ্রম ও দৌড়াদৌড়ি কঠোরভাবে নিষিদ্ধ।',
      'বাইরের খোলা খাবার, তেল-মশলা ও কোমল পানীয় সম্পূর্ণ বর্জন করুন।',
      'পর্যাপ্ত বিশুদ্ধ পানি ও শর্করাযুক্ত সহজপাচ্য খাবার গ্রহণ করুন।'
    ],
    lifestyleAdviceEn: [
      'Maintain strict bed rest during acute jaundice.',
      'Avoid oily, greasy foods, fast food, and alcohol completely.',
      'Drink boiled pure water and eat light, easily digestible carbohydrates.'
    ],
    warningsBn: [
      'কবিরাজি বা ঝাড়ফুঁকের ওষুধ খাবেন না; এতে লিভার ফেইলিউর হয়ে মৃত্যুর ঝুঁকি থাকে।'
    ],
    emergencyWarningBn: 'রোগী যদি প্রলাপ বকে, ঘুম ঘুম ভাব বা অস্বাভাবিক আচরণ করে তবে তা একিউট লিভার ফেইলিউরের লক্ষণ — অবিলম্বে আইসিইউ সুবিধাযুক্ত হাসপাতালে নিন।'
  }
];
