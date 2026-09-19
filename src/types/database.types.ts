export interface Generic {
  id: string;
  name: string;
  therapeutic_class?: string;
  description?: string;
  indications?: string;
  dosage_and_administration?: string;
  side_effects?: string;
  precautions?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Producer {
  id: string;
  name: string;
  country: string;
  website?: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Medicine {
  id: string;
  brand_name: string;
  generic_id: string;
  producer_id: string;
  dosage_form: string;
  strength: string;
  price?: number;
  currency?: string;
  package_info?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MedicineDirectoryItem {
  medicine_id: string;
  brand_name: string;
  dosage_form: string;
  strength: string;
  price: number | null;
  currency: string;
  package_info: string | null;
  generic_name: string;
  therapeutic_class?: string;
  producer_name: string;
  producer_country: string;
  priority_group?: number;
}

export interface MedicineSearchParams {
  searchQuery?: string;
  country?: string | null;
  genericId?: string | null;
  page?: number;
  pageSize?: number;
}
