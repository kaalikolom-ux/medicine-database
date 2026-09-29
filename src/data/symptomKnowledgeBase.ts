export interface RecommendedGeneric {
  genericName: string;
  roleBn: string;
  roleEn: string;
  typicalDosageBn: string;
  timingBn?: string;
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
    summaryBn: 'ভাইরাল ইনফেকশন, ঠাণ্ডা লাগা বা ক্লান্তির কারণে জ্বর ও মাথা/শরীর ব্যথা হতে পারে।',
    summaryEn: 'Common fever, headache, and generalized body ache usually associated with viral infections or physical exhaustion.',
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
    summaryBn: 'পাকস্থলীতে অতিরিক্ত এসিড উৎপাদন, অনিয়মিত খাওয়া-দাওয়া বা অতিরিক্ত তেল-মশলাযুক্ত খাবারের কারণে বুকজ্বালা ও পেট ফাঁপা হতে পারে।',
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
    summaryBn: 'খাবারের বিষক্রিয়া, গ্যাস্ট্রিক, গাড়িতে ওঠার অস্বস্তি বা ইনফেকশনজনিত কারণে বমি বমি ভাব বা বমি হতে পারে।',
    summaryEn: 'Symptom caused by food poisoning, gastrointestinal distress, motion sickness, or infections.',
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
    summaryEn: 'Upper respiratory allergy or viral cold causing rhinorrhea, nasal blockage, sneezing, and ocular itchiness.',
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
    summaryBn: 'শ্বাসতন্ত্রের সংক্রমণ, দূষণ বা অ্যালার্জির কারণে শুকনো অথবা বুকে কফ জমা কাশি হতে পারে।',
    summaryEn: 'Respiratory tract irritation or infection causing dry tickly cough or mucus-producing productive cough.',
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
    summaryBn: 'ফ্যারিঞ্জাইটিস, টনসিলে প্রদাহ বা ভাইরাসের আক্রমণে গলায় তীব্র ব্যথা ও খাবার গিলতে কষ্ট হতে পারে।',
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
    summaryBn: 'দূষিত পানি বা বাসি খাবার গ্রহণের ফলে পেটে ব্যাকটেরিয়া বা ভাইরাসের আক্রমণে ঘন ঘন পাতলা পায়খানা হতে পারে।',
    summaryEn: 'Frequent watery bowel movements caused by viral gastroenteritis, contaminated food or water, leading to dehydration.',
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
        roleBn: 'অন্ত্রের আস্তরণ দ্রুত নিরাময় করে এবং ডায়রিয়ার সময়কাল কমায় (বিশেষ করে শিশুদের জন্য)',
        roleEn: 'Restores intestinal mucosal integrity and shortens diarrhea duration',
        typicalDosageBn: '১০-২০ মি.গ্রা. দিনে একবার (টানা ১০-১৪ দিন)',
        timingBn: 'খাওয়ার পর'
      }
    ],
    lifestyleAdviceBn: [
      'এক প্যাকেট ওরস্যালাইন সম্পূর্ণ আধা লিটার (৫০০ মিলি) বিশুদ্ধ পানিতে গুলিয়ে প্রস্তুত করুন। কম বা বেশি পানিতে গুলানো যাবে না।',
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
    summaryBn: 'কোনো নির্দিষ্ট খাবার, ওষুধ, পোকামাকড়ের কামড় বা আবহাওয়ার পরিবর্তনের কারণে ত্বকে লালচে চাকা ও চুলকানি হতে পারে।',
    summaryEn: 'Cutaneous allergic response causing itchy wheals, hives, redness, and swelling on the skin.',
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
    summaryBn: 'ভারী জিনিস তোলা, ভুল ভঙ্গিমায় বসা বা পেশীর টানের কারণে কোমর, ঘাড় বা মাংসপেশীতে তীব্র ব্যথা হতে পারে।',
    summaryEn: 'Musculoskeletal discomfort, lumbago, joint inflammation, or dental pain requiring analgesic support.',
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
    summaryEn: 'Chronic inflammation of the airways causing reversible bronchospasm, shortness of breath, and wheezing.',
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
    summaryEn: 'Persistent elevation of arterial blood pressure requiring lifelong cardiovascular monitoring.',
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
    summaryEn: 'Metabolic disorder characterized by elevated levels of blood glucose due to insulin resistance or deficiency.',
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
    summaryBn: 'ধুলোবালি, অ্যালার্জি, দীর্ঘক্ষণ স্ক্রিন দেখা বা জীবাণু সংক্রমণের কারণে চোখ লাল ও খচখচ করতে পারে।',
    summaryEn: 'Conjunctival irritation, dry eyes, allergic reaction, or viral conjunctivitis causing redness and discharge.',
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
    summaryBn: 'আর্দ্রতা, ঘাম বা ভেজা কাপড়ের কারণে ত্বকে গোল গোল চাকা (দাউদ), চুলকানি বা ফাঙ্গাল ইনফেকশন হয়।',
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
    summaryEn: 'Infrequent or difficult evacuation of the bowels due to lack of dietary fiber, inadequate fluids, or sluggish gut motility.',
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
    summaryEn: 'Persistent low energy, malaise, or post-illness fatigue related to inadequate nutritional intake or micronutrient deficiency.',
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
  }
];
