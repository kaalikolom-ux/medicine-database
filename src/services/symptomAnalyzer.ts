import { SYMPTOM_CONDITIONS, type SymptomCondition, type RecommendedGeneric } from '../data/symptomKnowledgeBase';
import { getLocalMedicines } from './medicineService';
import type { MedicineDirectoryItem } from '../types/database.types';

export interface GenericRecommendation {
  generic: RecommendedGeneric;
  medicines: MedicineDirectoryItem[];
}

export interface MatchedConditionResult {
  condition: SymptomCondition;
  score: number;
  matchedKeywords: string[];
  genericsWithMedicines: GenericRecommendation[];
}

export interface SymptomAnalysisResult {
  query: string;
  matchedConditions: MatchedConditionResult[];
  fallbackMedicines: MedicineDirectoryItem[];
  urgencyLevel: 'mild' | 'moderate' | 'consult_doctor' | 'emergency';
  hasEmergencyWarning: boolean;
  emergencyMessage?: string;
  disclaimerBn: string;
}

// Common Bengali & English stop words for cleaner matching
const STOP_WORDS = new Set([
  'আমার', 'খুব', 'একটু', 'হয়েছে', 'হয়', 'হচ্ছে', 'লাগে', 'থাকে', 'করে', 'দিন', 
  'ধরে', 'সাথে', 'এবং', 'ও', 'আর', 'কিংবা', 'বা', 'না', 'কি', 'কোন', 'ঔষধ', 
  'ওষুধ', 'ঔষধের', 'নাম', 'বলুন', 'দরকার', 'লাগল', 'লাগছে', 'বলো', 'দাও',
  'i', 'have', 'had', 'feel', 'feeling', 'got', 'am', 'is', 'are', 'was', 
  'a', 'an', 'the', 'and', 'or', 'with', 'for', 'since', 'days', 'hours', 
  'medicine', 'tablet', 'syrup', 'please', 'suggest', 'help', 'need'
]);

/**
 * Normalize and tokenize text supporting both Bengali and English
 */
function normalizeAndTokenize(input: string): { normalized: string; tokens: string[] } {
  const normalized = input
    .toLowerCase()
    .replace(/[।.,?!;:'"()\[\]{}\/\\+*&^%$#@~`_—–-]/g, ' ')
    .trim();

  const rawTokens = normalized.split(/\s+/).filter(Boolean);
  const meaningfulTokens = rawTokens.filter((t) => !STOP_WORDS.has(t) && t.length > 1);

  return { normalized, tokens: meaningfulTokens };
}

/**
 * Retrieve top medicines from local database for a given generic name, prioritizing Bangladesh
 */
function getTopMedicinesForGeneric(genericName: string, limit = 4): MedicineDirectoryItem[] {
  const allMeds = getLocalMedicines();
  const target = genericName.trim().toLowerCase();

  const matching = allMeds.filter((m) => {
    const gen = m.generic_name.trim().toLowerCase();
    return gen.includes(target) || target.includes(gen);
  });

  // Sort: Bangladesh First, then Brand name
  matching.sort((a, b) => {
    const aIsBd = a.producer_country.toLowerCase() === 'bangladesh' ? 0 : 1;
    const bIsBd = b.producer_country.toLowerCase() === 'bangladesh' ? 0 : 1;
    if (aIsBd !== bIsBd) return aIsBd - bIsBd;
    return a.brand_name.localeCompare(b.brand_name);
  });

  return matching.slice(0, limit);
}

/**
 * Main Analyzer: Evaluates user symptom description in Bengali or English
 */
export function analyzeSymptoms(query: string): SymptomAnalysisResult {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      query: '',
      matchedConditions: [],
      fallbackMedicines: [],
      urgencyLevel: 'mild',
      hasEmergencyWarning: false,
      disclaimerBn: 'অনুগ্রহ করে আপনার অসুস্থতা বা শারীরিক উপসর্গের বিবরণ লিখুন।'
    };
  }

  const { normalized, tokens } = normalizeAndTokenize(trimmed);
  const matchedConditions: MatchedConditionResult[] = [];

  for (const condition of SYMPTOM_CONDITIONS) {
    let score = 0;
    const matchedKeywords: string[] = [];

    // 1. Check Bengali Keywords & Phrases
    for (const kw of condition.banglaKeywords) {
      const kwNorm = kw.toLowerCase().trim();
      if (kwNorm.includes(' ')) {
        // Multi-word phrase exact check in string
        if (normalized.includes(kwNorm)) {
          score += 15;
          matchedKeywords.push(kw);
        }
      } else {
        // Single word token check or substring check
        if (tokens.some((t) => t === kwNorm || t.includes(kwNorm) || kwNorm.includes(t))) {
          score += 8;
          matchedKeywords.push(kw);
        } else if (normalized.includes(kwNorm)) {
          score += 5;
          matchedKeywords.push(kw);
        }
      }
    }

    // 2. Check English Keywords & Phrases
    for (const kw of condition.englishKeywords) {
      const kwNorm = kw.toLowerCase().trim();
      if (kwNorm.includes(' ')) {
        if (normalized.includes(kwNorm)) {
          score += 15;
          matchedKeywords.push(kw);
        }
      } else {
        if (tokens.some((t) => t === kwNorm || t.includes(kwNorm) || kwNorm.includes(t))) {
          score += 8;
          matchedKeywords.push(kw);
        } else if (normalized.includes(kwNorm)) {
          score += 5;
          matchedKeywords.push(kw);
        }
      }
    }

    // If score is high enough to consider a match
    if (score >= 5) {
      // Find real matching medicines for each recommended generic
      const genericsWithMedicines: GenericRecommendation[] = condition.recommendedGenerics.map((rg) => ({
        generic: rg,
        medicines: getTopMedicinesForGeneric(rg.genericName, 4)
      }));

      matchedConditions.push({
        condition,
        score,
        matchedKeywords: Array.from(new Set(matchedKeywords)),
        genericsWithMedicines
      });
    }
  }

  // Sort conditions by match score descending
  matchedConditions.sort((a, b) => b.score - a.score);

  // If no direct clinical condition matched, perform indication search over 21k medicines
  let fallbackMedicines: MedicineDirectoryItem[] = [];
  if (matchedConditions.length === 0 && tokens.length > 0) {
    const allMeds = getLocalMedicines();
    fallbackMedicines = allMeds
      .filter((m) => {
        const ind = (m.indications || '').toLowerCase();
        const tc = (m.therapeutic_class || '').toLowerCase();
        const gen = m.generic_name.toLowerCase();

        return tokens.some((token) => ind.includes(token) || tc.includes(token) || gen.includes(token));
      })
      .sort((a, b) => {
        const aIsBd = a.producer_country.toLowerCase() === 'bangladesh' ? 0 : 1;
        const bIsBd = b.producer_country.toLowerCase() === 'bangladesh' ? 0 : 1;
        if (aIsBd !== bIsBd) return aIsBd - bIsBd;
        return a.brand_name.localeCompare(b.brand_name);
      })
      .slice(0, 12);
  }

  // Determine overall urgency
  let highestUrgency: 'mild' | 'moderate' | 'consult_doctor' | 'emergency' = 'mild';
  let hasEmergencyWarning = false;
  let emergencyMessage: string | undefined;

  for (const m of matchedConditions) {
    if (m.condition.emergencyWarningBn && (normalized.includes('তীব্র') || normalized.includes('শ্বাস') || normalized.includes('রক্ত') || normalized.includes('severe') || normalized.includes('emergency'))) {
      hasEmergencyWarning = true;
      emergencyMessage = m.condition.emergencyWarningBn;
      highestUrgency = 'emergency';
      break;
    }
    if (m.condition.severity === 'emergency') highestUrgency = 'emergency';
    else if (m.condition.severity === 'consult_doctor' && highestUrgency !== 'emergency') highestUrgency = 'consult_doctor';
    else if (m.condition.severity === 'moderate' && highestUrgency === 'mild') highestUrgency = 'moderate';
  }

  const disclaimerBn = 'সতর্কতা: এই তথ্য শুধুমাত্র প্রাথমিক ধারণা ও স্বাস্থ্য সচেতনতার জন্য তৈরি। যেকোনো ওষুধ সেবনের পূর্বে একজন রেজিস্ট্রার্ড চিকিৎসকের (MBBS) ব্যবস্থাপত্র ও সঠিক মাত্রা নিশ্চিত করুন। বিশেষ করে শিশু, গর্ভবতী ও জটিল রোগীদের ক্ষেত্রে চিকিৎসকের পরামর্শ ব্যতিরেকে কোনো ওষুধ দেওয়া সম্পূর্ণ নিষিদ্ধ।';

  return {
    query: trimmed,
    matchedConditions: matchedConditions.slice(0, 3), // Return top 3 matched categories
    fallbackMedicines,
    urgencyLevel: highestUrgency,
    hasEmergencyWarning,
    emergencyMessage,
    disclaimerBn
  };
}
