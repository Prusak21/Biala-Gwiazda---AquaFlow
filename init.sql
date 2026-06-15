CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE role_permissions (
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    valid_to DATE NOT NULL,
    geom GEOMETRY(Polygon, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    geom GEOMETRY(Polygon, 4326),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Liczniki
CREATE TABLE meters (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    sector_id INT REFERENCES sectors(id) ON DELETE RESTRICT,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    is_main_meter BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    installation_date DATE DEFAULT CURRENT_DATE
);

-- Odczyt z zabezpieczeniami
CREATE TABLE readings (
    id SERIAL PRIMARY KEY,
    meter_id INT REFERENCES meters(id) ON DELETE RESTRICT,
    value DECIMAL(10, 2) NOT NULL,
    reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
    photo_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION check_reading_increment()
RETURNS TRIGGER AS $$
BEGIN
    -- Blokada przed wpisaniem mniejszego odczytu od poprzedniego
    IF EXISTS (
        SELECT 1 FROM readings 
        WHERE meter_id = NEW.meter_id 
          AND reading_date <= NEW.reading_date 
          AND value > NEW.value
          AND id IS DISTINCT FROM NEW.id
    ) THEN
        RAISE EXCEPTION 'Nowy odczyt nie może być mniejszy niż poprzedni (ID Licznika: %)', NEW.meter_id;
    END IF;

    -- Blokada przed wstawieniem odczytu z data wczesniejsza ktory bylby wiekszy do tego istniejacego z data pozniejsza
    IF EXISTS (
        SELECT 1 FROM readings 
        WHERE meter_id = NEW.meter_id 
          AND reading_date > NEW.reading_date 
          AND value < NEW.value
          AND id IS DISTINCT FROM NEW.id
    ) THEN
        RAISE EXCEPTION 'Wprowadzany odczyt wsteczny powoduje nielogiczny spadek wartosci w kolejnych dniach (ID Licznika: %)', NEW.meter_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_reading
BEFORE INSERT OR UPDATE ON readings
FOR EACH ROW EXECUTE FUNCTION check_reading_increment();

-- 8. Taryfikator (Cennik wody z zabezpieczeniem dat)
CREATE TABLE water_rates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price_per_m3 DECIMAL(10, 2) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (valid_to IS NULL OR valid_to >= valid_from)
);

-- 9. Szczegółowe Faktury z automatycznym wyliczaniem kwoty (GENERATED ALWAYS AS)
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE RESTRICT,
    meter_id INT REFERENCES meters(id) ON DELETE RESTRICT,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    consumption_m3 DECIMAL(10, 2) NOT NULL,
    price_per_m3 DECIMAL(10, 2) NOT NULL,
    -- Kuloodporne wyliczenie wartości na poziomie silnika bazy danych
    amount DECIMAL(10, 2) GENERATED ALWAYS AS (consumption_m3 * price_per_m3) STORED,
    status VARCHAR(50) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue')),
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (period_start < period_end),
    CHECK (due_date >= period_end),
    CHECK (consumption_m3 >= 0),
    CHECK (price_per_m3 >= 0),
    CONSTRAINT uq_invoices_meter_period UNIQUE (meter_id, period_start, period_end)
);

-- 10. Awarie i Historia Zgłoszeń
CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    reported_by INT REFERENCES users(id) ON DELETE SET NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    current_status VARCHAR(50) DEFAULT 'reported' CHECK (current_status IN ('reported', 'in_progress', 'resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incident_updates (
    id SERIAL PRIMARY KEY,
    incident_id INT REFERENCES incidents(id) ON DELETE CASCADE,
    updated_by INT REFERENCES users(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pomocnicze
CREATE OR REPLACE VIEW v_water_balance AS
WITH reading_deltas AS (
    SELECT 
        r.meter_id, m.sector_id, m.is_main_meter, r.reading_date,
        (r.value - LAG(r.value) OVER (PARTITION BY r.meter_id ORDER BY r.reading_date, r.created_at)) AS consumption
    FROM readings r
    JOIN meters m ON r.meter_id = m.id
),
monthly_aggregated AS (
    SELECT 
        sector_id, is_main_meter, DATE_TRUNC('month', reading_date) AS billing_month, SUM(consumption) AS total_consumption
    FROM reading_deltas
    WHERE consumption IS NOT NULL
    GROUP BY sector_id, is_main_meter, DATE_TRUNC('month', reading_date)
),
combined_months AS (
    SELECT 
        COALESCE(m.sector_id, r.sector_id) AS sector_id,
        COALESCE(m.billing_month, r.billing_month) AS billing_month,
        COALESCE(m.total_consumption, 0) AS main_consumption,
        COALESCE(r.total_consumption, 0) AS res_consumption
    FROM (SELECT * FROM monthly_aggregated WHERE is_main_meter = TRUE) m
    FULL OUTER JOIN (SELECT * FROM monthly_aggregated WHERE is_main_meter = FALSE) r
    ON m.sector_id = r.sector_id AND m.billing_month = r.billing_month
)
SELECT 
    s.name AS sektor,
    cm.billing_month AS miesiac_rozliczeniowy,
    COALESCE(cm.main_consumption, 0) AS woda_wtloczona,
    COALESCE(cm.res_consumption, 0) AS woda_zuzyta,
    (COALESCE(cm.main_consumption, 0) - COALESCE(cm.res_consumption, 0)) AS strata_m3,
    CASE 
        WHEN COALESCE(cm.main_consumption, 0) = 0 THEN 0 
        ELSE ROUND(((COALESCE(cm.main_consumption, 0) - COALESCE(cm.res_consumption, 0)) / cm.main_consumption * 100), 2) 
    END AS procent_strat
FROM sectors s
LEFT JOIN combined_months cm ON s.id = cm.sector_id
WHERE cm.billing_month IS NOT NULL; -- Eliminacja pustych sektorow bez historii wpisow

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_incidents_status ON incidents(current_status);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_incidents_geom ON incidents USING GIST (geom);
CREATE INDEX idx_sectors_geom ON sectors USING GIST (geom);
CREATE INDEX idx_meters_geom ON meters USING GIST (geom);
CREATE INDEX idx_announcements_geom ON announcements USING GIST (geom);

CREATE INDEX idx_meters_user_id ON meters(user_id);
CREATE INDEX idx_meters_sector_id ON meters(sector_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_incident_updates_incident_id ON incident_updates(incident_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX idx_invoices_meter_id ON invoices(meter_id);

CREATE INDEX idx_readings_reading_date ON readings(reading_date);
CREATE INDEX idx_incidents_created_at ON incidents(created_at);
CREATE INDEX idx_announcements_valid_to ON announcements(valid_to);
CREATE INDEX idx_water_rates_dates ON water_rates(valid_from, valid_to);
CREATE INDEX idx_incidents_reported_by ON incidents(reported_by);

CREATE INDEX idx_invoices_due_unpaid ON invoices(due_date) WHERE status = 'unpaid';

CREATE INDEX idx_readings_analytics ON readings(meter_id, reading_date, created_at, value);