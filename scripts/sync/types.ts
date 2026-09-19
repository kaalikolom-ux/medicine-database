export interface NormalizedMedicine {
  brand_name: string;
  generic_name: string;
  producer_name: string;
  producer_country: string;
  producer_website?: string;
  dosage_form: string;
  strength: string;
  price?: number | null;
  currency?: string;
  package_info?: string;
  therapeutic_class?: string;
  indications?: string;
  dosage_and_administration?: string;
  side_effects?: string;
  precautions?: string;
  source: 'DGDA' | 'openFDA' | 'WHO_ATC' | 'MANUAL';
}

export interface DgdaRawRecord {
  brand_name?: string;
  brandName?: string;
  name?: string;
  generic_name?: string;
  genericName?: string;
  dosage_form?: string;
  form?: string;
  strength?: string;
  manufacturer?: string;
  company?: string;
  company_name?: string;
  price?: number | string;
  unit_price?: number | string;
  pack_size?: string;
  package_info?: string;
  therapeutic_class?: string;
  indications?: string;
  dosage?: string;
  side_effects?: string;
}

export interface OpenFdaRawRecord {
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    substance_name?: string[];
    dosage_form?: string[];
    route?: string[];
    product_type?: string[];
  };
  brand_name?: string;
  generic_name?: string;
  manufacturer_name?: string;
  country?: string;
  active_ingredient?: string[];
  dosage_form?: string;
  strength?: string;
  purpose?: string[];
  indications_and_usage?: string[];
  dosage_and_administration?: string[];
  warnings?: string[];
  adverse_reactions?: string[];
  atc_code?: string;
  therapeutic_class?: string;
}

export interface SyncStats {
  totalProcessed: number;
  bangladeshCount: number;
  internationalCount: number;
  successfulUpserts: number;
  failedUpserts: number;
  errors: Array<{ item: string; error: string }>;
  durationSeconds: number;
}
