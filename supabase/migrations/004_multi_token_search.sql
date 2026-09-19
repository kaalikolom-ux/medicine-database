-- ==============================================================================
-- Migration 004: Multi-Token Smart Search (Brand + Strength + Generic + Form)
-- Enables queries like: 'fusid 40 plus', 'napa 500', 'seclo 20', 'cardex 6.25'
-- Target: Supabase PostgreSQL
-- ==============================================================================

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
DECLARE
    clean_query TEXT := TRIM(COALESCE(search_query, ''));
    tokens TEXT[];
BEGIN
    IF clean_query <> '' THEN
        tokens := regexp_split_to_array(clean_query, '\s+');
    ELSE
        tokens := ARRAY[]::TEXT[];
    END IF;

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
            clean_query = ''
            -- 1. Direct contiguous match across combined medicine fields
            OR concat_ws(' ', v.brand_name, v.strength, v.dosage_form, v.generic_name, v.producer_name) ILIKE '%' || clean_query || '%'
            -- 2. Multi-token match: every word in the query must match somewhere in the medicine record
            OR (
                cardinality(tokens) > 0 AND NOT EXISTS (
                    SELECT 1 
                    FROM unnest(tokens) token
                    WHERE token <> '' 
                      AND NOT (
                          v.brand_name ILIKE '%' || token || '%'
                          OR v.strength ILIKE '%' || token || '%'
                          OR v.dosage_form ILIKE '%' || token || '%'
                          OR v.generic_name ILIKE '%' || token || '%'
                          OR v.producer_name ILIKE '%' || token || '%'
                      )
                )
            )
        )
        AND (filter_country IS NULL OR filter_country = '' OR v.producer_country ILIKE filter_country)
        AND (filter_generic_id IS NULL OR v.generic_id = filter_generic_id)
        AND (filter_dosage_form IS NULL OR filter_dosage_form = '' OR v.dosage_form ILIKE filter_dosage_form)
        AND (filter_therapeutic_class IS NULL OR filter_therapeutic_class = '' OR v.therapeutic_class ILIKE filter_therapeutic_class)
        AND (min_price IS NULL OR v.price >= min_price)
        AND (max_price IS NULL OR v.price <= max_price)
    ORDER BY 
        v.priority_group ASC,         -- Bangladesh first (priority 0)
        -- Exact brand match ranked higher
        CASE WHEN LOWER(v.brand_name) = LOWER(clean_query) THEN 0 ELSE 1 END ASC,
        v.producer_country ASC,       -- Other countries alphabetically A to Z
        v.brand_name ASC              -- Brand name alphabetically A to Z
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;
