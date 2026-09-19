-- ==============================================================================
-- Worldwide Medicine Database: Migration 002
-- Purpose: Advanced Filtering & Full Clinical Details Support
-- ==============================================================================

-- 1. Additional Indexes for Advanced Filtering Performance
CREATE INDEX IF NOT EXISTS idx_medicines_dosage_form ON medicines (dosage_form);
CREATE INDEX IF NOT EXISTS idx_generics_therapeutic_class ON generics (therapeutic_class);
CREATE INDEX IF NOT EXISTS idx_medicines_price ON medicines (price);

-- 2. Drop existing view and function to allow schema changes
DROP VIEW IF EXISTS view_medicines_directory CASCADE;
DROP FUNCTION IF EXISTS search_medicines(TEXT, TEXT, UUID, INT, INT);
DROP FUNCTION IF EXISTS search_medicines(TEXT, TEXT, UUID, TEXT, TEXT, NUMERIC, NUMERIC, INT, INT);

-- 3. Enhanced Unified Medicine Directory View
CREATE OR REPLACE VIEW view_medicines_directory AS
SELECT 
    m.id AS medicine_id,
    m.brand_name,
    m.dosage_form,
    m.strength,
    m.price,
    m.currency,
    m.package_info,
    m.is_active,
    m.created_at,
    g.id AS generic_id,
    g.name AS generic_name,
    g.therapeutic_class,
    g.indications,
    g.dosage_and_administration,
    g.side_effects,
    g.precautions,
    p.id AS producer_id,
    p.name AS producer_name,
    p.country AS producer_country,
    p.website AS producer_website,
    CASE 
        WHEN LOWER(TRIM(p.country)) = 'bangladesh' THEN 0 
        ELSE 1 
    END AS priority_group
FROM medicines m
JOIN generics g ON m.generic_id = g.id
JOIN producers p ON m.producer_id = p.id
WHERE m.is_active = TRUE;

-- 4. Enhanced Search & Multi-Filter RPC Function
CREATE OR REPLACE FUNCTION search_medicines(
    search_query TEXT DEFAULT '',
    filter_country TEXT DEFAULT NULL,
    filter_generic_id UUID DEFAULT NULL,
    filter_dosage_form TEXT DEFAULT NULL,
    filter_therapeutic_class TEXT DEFAULT NULL,
    min_price NUMERIC DEFAULT NULL,
    max_price NUMERIC DEFAULT NULL,
    limit_count INT DEFAULT 40,
    offset_count INT DEFAULT 0
)
RETURNS TABLE (
    medicine_id UUID,
    brand_name VARCHAR,
    dosage_form VARCHAR,
    strength VARCHAR,
    price NUMERIC,
    currency VARCHAR,
    package_info VARCHAR,
    generic_name VARCHAR,
    therapeutic_class VARCHAR,
    indications TEXT,
    dosage_and_administration TEXT,
    side_effects TEXT,
    precautions TEXT,
    producer_name VARCHAR,
    producer_country VARCHAR,
    producer_website VARCHAR,
    priority_group INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.medicine_id,
        v.brand_name,
        v.dosage_form,
        v.strength,
        v.price,
        v.currency,
        v.package_info,
        v.generic_name,
        v.therapeutic_class,
        v.indications,
        v.dosage_and_administration,
        v.side_effects,
        v.precautions,
        v.producer_name,
        v.producer_country,
        v.producer_website,
        v.priority_group
    FROM view_medicines_directory v
    WHERE 
        (
            search_query IS NULL 
            OR search_query = '' 
            OR v.brand_name ILIKE '%' || search_query || '%' 
            OR v.generic_name ILIKE '%' || search_query || '%'
            OR v.producer_name ILIKE '%' || search_query || '%'
        )
        AND (filter_country IS NULL OR filter_country = '' OR v.producer_country ILIKE filter_country)
        AND (filter_generic_id IS NULL OR v.generic_id = filter_generic_id)
        AND (filter_dosage_form IS NULL OR filter_dosage_form = '' OR v.dosage_form ILIKE filter_dosage_form)
        AND (filter_therapeutic_class IS NULL OR filter_therapeutic_class = '' OR v.therapeutic_class ILIKE filter_therapeutic_class)
        AND (min_price IS NULL OR v.price >= min_price)
        AND (max_price IS NULL OR v.price <= max_price)
    ORDER BY 
        v.priority_group ASC,         -- Bangladesh first (priority 0)
        v.producer_country ASC,       -- Other countries alphabetically A to Z
        v.brand_name ASC              -- Brand name alphabetically A to Z
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;
