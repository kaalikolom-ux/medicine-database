-- ==============================================================================
-- Worldwide Medicine Database: Initial Schema & Sorting Logic
-- Target Platform: Supabase (PostgreSQL)
-- Priority Rule: Bangladesh Pharmaceuticals first, then country A-Z, then brand A-Z
-- ==============================================================================

-- 1. Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Generics Table
CREATE TABLE IF NOT EXISTS generics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    therapeutic_class VARCHAR(255),
    description TEXT,
    indications TEXT,
    dosage_and_administration TEXT,
    side_effects TEXT,
    precautions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Producers Table (Pharmaceutical Companies & Countries)
CREATE TABLE IF NOT EXISTS producers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Bangladesh',
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Medicines Table (Brand Formulations)
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_name VARCHAR(255) NOT NULL,
    generic_id UUID NOT NULL REFERENCES generics(id) ON DELETE CASCADE,
    producer_id UUID NOT NULL REFERENCES producers(id) ON DELETE CASCADE,
    dosage_form VARCHAR(100) NOT NULL,      -- e.g. Tablet, Capsule, Syrup, Suspension, Injection
    strength VARCHAR(100) NOT NULL,         -- e.g. 500 mg, 20 mg, 10 mg/5 ml
    price NUMERIC(10, 2),
    currency VARCHAR(10) DEFAULT 'BDT',
    package_info VARCHAR(255),              -- e.g. '10 strips x 10 tablets'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Indexes for Ultra-Fast Querying & Fuzzy Search
-- GIN Indexes using trigram matching (pg_trgm) for instant search
CREATE INDEX IF NOT EXISTS idx_medicines_brand_name_trgm ON medicines USING gin (brand_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_generics_name_trgm ON generics USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_producers_name_trgm ON producers USING gin (name gin_trgm_ops);

-- B-Tree Indexes for Foreign Keys & Country Lookups
CREATE INDEX IF NOT EXISTS idx_medicines_generic_id ON medicines (generic_id);
CREATE INDEX IF NOT EXISTS idx_medicines_producer_id ON medicines (producer_id);
CREATE INDEX IF NOT EXISTS idx_producers_country ON producers (country);
CREATE INDEX IF NOT EXISTS idx_medicines_active ON medicines (is_active);

-- 6. Unified Medicine Directory View (With Built-in Priority Sorting)
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
    p.id AS producer_id,
    p.name AS producer_name,
    p.country AS producer_country,
    CASE 
        WHEN LOWER(TRIM(p.country)) = 'bangladesh' THEN 0 
        ELSE 1 
    END AS priority_group
FROM medicines m
JOIN generics g ON m.generic_id = g.id
JOIN producers p ON m.producer_id = p.id
WHERE m.is_active = TRUE;

-- 7. Optimized RPC Function for Fast Fuzzy Search + Custom Sorting
CREATE OR REPLACE FUNCTION search_medicines(
    search_query TEXT DEFAULT '',
    filter_country TEXT DEFAULT NULL,
    filter_generic_id UUID DEFAULT NULL,
    limit_count INT DEFAULT 20,
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
    producer_name VARCHAR,
    producer_country VARCHAR,
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
        v.producer_name,
        v.producer_country,
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
        AND (filter_country IS NULL OR v.producer_country ILIKE filter_country)
        AND (filter_generic_id IS NULL OR v.generic_id = filter_generic_id)
    ORDER BY 
        v.priority_group ASC,         -- Bangladesh first (priority 0)
        v.producer_country ASC,       -- Other countries alphabetically A to Z
        v.brand_name ASC              -- Brand name alphabetically A to Z
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- 8. Row Level Security (RLS) Policies (Public Read Access)
ALTER TABLE generics ENABLE ROW LEVEL SECURITY;
ALTER TABLE producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users read-only access (for public medicine directory)
CREATE POLICY "Allow public read access on generics" 
ON generics FOR SELECT USING (true);

CREATE POLICY "Allow public read access on producers" 
ON producers FOR SELECT USING (true);

CREATE POLICY "Allow public read access on medicines" 
ON medicines FOR SELECT USING (true);

-- 9. Initial Seed Data (For immediate verification and testing)
INSERT INTO generics (id, name, therapeutic_class, description, indications) VALUES
('11111111-1111-1111-1111-111111111111', 'Paracetamol', 'Analgesics & Antipyretics', 'Widely used pain reliever and fever reducer.', 'Fever, headache, toothache, mild to moderate pain.'),
('22222222-2222-2222-2222-222222222222', 'Omeprazole', 'Proton Pump Inhibitor (PPI)', 'Reduces stomach acid production.', 'GERD, peptic ulcer, acid reflux.'),
('33333333-3333-3333-3333-333333333333', 'Azithromycin', 'Macrolide Antibiotic', 'Broad-spectrum antibiotic.', 'Respiratory tract infections, skin infections.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO producers (id, name, country, website) VALUES
('44444444-4444-4444-4444-444444444444', 'Square Pharmaceuticals PLC', 'Bangladesh', 'https://www.squarepharma.com.bd'),
('55555555-5555-5555-5555-555555555555', 'Beximco Pharmaceuticals Ltd.', 'Bangladesh', 'https://www.beximcopharma.com'),
('66666666-6666-6666-6666-666666666666', 'Incepta Pharmaceuticals Ltd.', 'Bangladesh', 'https://www.inceptapharma.com'),
('77777777-7777-7777-7777-777777777777', 'Sun Pharmaceutical Industries', 'India', 'https://www.sunpharma.com'),
('88888888-8888-8888-8888-888888888888', 'GlaxoSmithKline (GSK)', 'United Kingdom', 'https://www.gsk.com'),
('99999999-9999-9999-9999-999999999999', 'Pfizer Inc.', 'United States', 'https://www.pfizer.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medicines (brand_name, generic_id, producer_id, dosage_form, strength, price, currency, package_info) VALUES
-- Bangladesh: Square
('Ace', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Tablet', '500 mg', 1.20, 'BDT', '10 x 50 tablets'),
('Ace Plus', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Tablet', '500 mg + 65 mg', 2.50, 'BDT', '10 x 20 tablets'),
('Seclo', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Capsule', '20 mg', 5.00, 'BDT', '10 x 10 capsules'),
-- Bangladesh: Beximco
('Napa', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Tablet', '500 mg', 1.20, 'BDT', '10 x 50 tablets'),
('Napa Extra', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Tablet', '500 mg + 65 mg', 2.50, 'BDT', '10 x 20 tablets'),
-- Bangladesh: Incepta
('Osartil', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Tablet', '50 mg', 8.00, 'BDT', '3 x 10 tablets'),
-- India: Sun Pharma
('Pantocid', '22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', 'Tablet', '40 mg', 15.00, 'INR', '1 x 15 tablets'),
-- United Kingdom: GSK
('Panadol', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', 'Tablet', '500 mg', 3.50, 'GBP', '2 x 12 tablets'),
-- United States: Pfizer
('Zithromax', '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 'Tablet', '250 mg', 25.00, 'USD', '6 tablets bottle');
