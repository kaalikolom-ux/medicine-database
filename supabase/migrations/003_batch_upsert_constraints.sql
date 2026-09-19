-- ==============================================================================
-- Worldwide Medicine Database: Migration 003
-- Purpose: Unique Constraints & Deduplication for High-Throughput Batch Upsert
-- ==============================================================================

-- 1. Ensure unique constraint on producers (name, country)
CREATE UNIQUE INDEX IF NOT EXISTS uq_producers_name_country 
ON producers (LOWER(TRIM(name)), LOWER(TRIM(country)));

-- 2. Ensure unique composite constraint on medicines
CREATE UNIQUE INDEX IF NOT EXISTS uq_medicines_composite 
ON medicines (LOWER(TRIM(brand_name)), producer_id, LOWER(TRIM(strength)), LOWER(TRIM(dosage_form)));

-- 3. Stored Procedure for High-Performance Atomic Batch Upsert
CREATE OR REPLACE FUNCTION upsert_medicine_record(
    p_brand_name VARCHAR,
    p_generic_name VARCHAR,
    p_producer_name VARCHAR,
    p_producer_country VARCHAR,
    p_dosage_form VARCHAR,
    p_strength VARCHAR,
    p_price NUMERIC DEFAULT NULL,
    p_currency VARCHAR DEFAULT 'BDT',
    p_package_info VARCHAR DEFAULT NULL,
    p_therapeutic_class VARCHAR DEFAULT NULL,
    p_indications TEXT DEFAULT NULL,
    p_dosage_and_administration TEXT DEFAULT NULL,
    p_side_effects TEXT DEFAULT NULL,
    p_precautions TEXT DEFAULT NULL,
    p_producer_website VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_generic_id UUID;
    v_producer_id UUID;
    v_medicine_id UUID;
    v_clean_country VARCHAR;
BEGIN
    -- Standardize country: trim and ensure title case
    v_clean_country := TRIM(p_producer_country);
    IF LOWER(v_clean_country) = 'bangladesh' OR LOWER(v_clean_country) = 'bd' THEN
        v_clean_country := 'Bangladesh';
    END IF;

    -- 1. Upsert Generic
    INSERT INTO generics (name, therapeutic_class, indications, dosage_and_administration, side_effects, precautions)
    VALUES (
        TRIM(p_generic_name),
        NULLIF(TRIM(p_therapeutic_class), ''),
        NULLIF(TRIM(p_indications), ''),
        NULLIF(TRIM(p_dosage_and_administration), ''),
        NULLIF(TRIM(p_side_effects), ''),
        NULLIF(TRIM(p_precautions), '')
    )
    ON CONFLICT (name) DO UPDATE SET
        therapeutic_class = COALESCE(NULLIF(EXCLUDED.therapeutic_class, ''), generics.therapeutic_class),
        indications = COALESCE(NULLIF(EXCLUDED.indications, ''), generics.indications),
        dosage_and_administration = COALESCE(NULLIF(EXCLUDED.dosage_and_administration, ''), generics.dosage_and_administration),
        side_effects = COALESCE(NULLIF(EXCLUDED.side_effects, ''), generics.side_effects),
        precautions = COALESCE(NULLIF(EXCLUDED.precautions, ''), generics.precautions),
        updated_at = NOW()
    RETURNING id INTO v_generic_id;

    -- 2. Upsert Producer
    SELECT id INTO v_producer_id 
    FROM producers 
    WHERE LOWER(TRIM(name)) = LOWER(TRIM(p_producer_name)) 
      AND LOWER(TRIM(country)) = LOWER(v_clean_country)
    LIMIT 1;

    IF v_producer_id IS NULL THEN
        INSERT INTO producers (name, country, website)
        VALUES (
            TRIM(p_producer_name),
            v_clean_country,
            NULLIF(TRIM(p_producer_website), '')
        )
        RETURNING id INTO v_producer_id;
    ELSE
        IF p_producer_website IS NOT NULL AND TRIM(p_producer_website) <> '' THEN
            UPDATE producers 
            SET website = TRIM(p_producer_website), updated_at = NOW() 
            WHERE id = v_producer_id AND (website IS NULL OR website = '');
        END IF;
    END IF;

    -- 3. Upsert Medicine
    SELECT id INTO v_medicine_id 
    FROM medicines 
    WHERE LOWER(TRIM(brand_name)) = LOWER(TRIM(p_brand_name))
      AND producer_id = v_producer_id
      AND LOWER(TRIM(strength)) = LOWER(TRIM(p_strength))
      AND LOWER(TRIM(dosage_form)) = LOWER(TRIM(p_dosage_form))
    LIMIT 1;

    IF v_medicine_id IS NULL THEN
        INSERT INTO medicines (
            brand_name, generic_id, producer_id, dosage_form, strength, price, currency, package_info
        )
        VALUES (
            TRIM(p_brand_name),
            v_generic_id,
            v_producer_id,
            TRIM(p_dosage_form),
            TRIM(p_strength),
            p_price,
            COALESCE(NULLIF(TRIM(p_currency), ''), 'BDT'),
            NULLIF(TRIM(p_package_info), '')
        )
        RETURNING id INTO v_medicine_id;
    ELSE
        UPDATE medicines
        SET 
            generic_id = v_generic_id,
            price = COALESCE(p_price, medicines.price),
            currency = COALESCE(NULLIF(TRIM(p_currency), ''), medicines.currency),
            package_info = COALESCE(NULLIF(TRIM(p_package_info), ''), medicines.package_info),
            updated_at = NOW()
        WHERE id = v_medicine_id;
    END IF;

    RETURN v_medicine_id;
END;
$$ LANGUAGE plpgsql;
