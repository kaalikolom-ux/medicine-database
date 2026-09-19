-- ==============================================================================
-- Migration 003: Performance Tuning & Search Optimization
-- Worldwide Medicine Database (22,000+ items)
-- Run this in Supabase Dashboard -> SQL Editor (Optional but Recommended)
-- ==============================================================================

-- 1. Ensure pg_trgm extension is active for lightning-fast substring ILIKE searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. GIN Trigram Indexes (Speeds up '%term%' brand, generic, and company search to 2-5ms)
CREATE INDEX IF NOT EXISTS idx_medicines_brand_name_gin ON medicines USING gin (brand_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_generics_name_gin ON generics USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_producers_name_gin ON producers USING gin (name gin_trgm_ops);

-- 3. Composite & Ordering B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_medicines_brand_name_asc ON medicines (brand_name ASC);
CREATE INDEX IF NOT EXISTS idx_medicines_generic_producer ON medicines (generic_id, producer_id);
CREATE INDEX IF NOT EXISTS idx_producers_country_lower ON producers (LOWER(country));
CREATE INDEX IF NOT EXISTS idx_medicines_active_form ON medicines (is_active, dosage_form);

-- 4. Update table statistics so PostgreSQL query optimizer picks the fastest index
ANALYZE medicines;
ANALYZE generics;
ANALYZE producers;
