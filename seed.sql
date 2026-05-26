-- ==========================================
-- AQUAFLOW - DANE TESTOWE (POLIGON DOŚWIADCZALNY)
-- ==========================================

-- 1. UPRAWNIENIA (Pełen słownik dla autoryzacji w API)
INSERT INTO permissions (name, description) VALUES 
('manage:users', 'Zarządzanie kontami mieszkańców i inkasentów'),
('manage:invoices', 'Wystawianie i korekta faktur'),
('read:invoices', 'Przeglądanie własnych faktur (e-BOK)'),
('manage:incidents', 'Aktualizacja statusów awarii i wysyłanie ekip'),
('report:incidents', 'Zgłaszanie nowych awarii z aplikacji mobilnej'),
('manage:readings', 'Weryfikacja i dodawanie odczytów z terenu'),
('read:map', 'Dostęp do mapy infrastruktury i tras odczytowych'),
('manage:announcements', 'Rozsyłanie komunikatów o przerwach w dostawie');

-- 2. ROLE
INSERT INTO roles (name, description) VALUES 
('admin', 'Administrator Systemu (Urząd)'),
('inkasent', 'Pracownik Terenowy (Wodociągi)'),
('resident', 'Mieszkaniec (Użytkownik e-BOK)');

-- 3. PRZYPISANIE UPRAWNIEŃ DO RÓL
-- Admin ma wszystko (1 do 8)
INSERT INTO role_permissions (role_id, permission_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8);

-- Inkasent ma dostęp do mapy, awarii i odczytów
INSERT INTO role_permissions (role_id, permission_id) VALUES 
(2, 4), (2, 6), (2, 7);

-- Mieszkaniec widzi swoje faktury i może zgłaszać awarie
INSERT INTO role_permissions (role_id, permission_id) VALUES 
(3, 3), (3, 5);

-- 4. UŻYTKOWNICY (Hasło dla wszystkich to: haslo123)
INSERT INTO users (email, password_hash, role_id) VALUES 
('dyrektor@aquaflow.jaworzno.pl', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 1), -- ID 1
('inkasent.terenowy@aquaflow.jaworzno.pl', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 2),  -- ID 2
('jan.nowak@gmail.com', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 3),     -- ID 3
('anna.kowalska@gmail.com', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 3), -- ID 4
('piotr.wisniewski@gmail.com', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 3); -- ID 5

-- 5. TARYFIKATOR WODY (Dla testowania logiki księgowej)
INSERT INTO water_rates (name, price_per_m3, valid_from, valid_to) VALUES 
('Taryfa Gminna 2025', 4.80, '2025-01-01', '2025-12-31'),
('Taryfa Gminna 2026', 5.50, '2026-01-01', NULL); -- Aktualnie obowiązująca

-- 6. SEKTORY (Strefy z podziałem np. na dzielnice Jaworzna)
INSERT INTO sectors (name, geom, is_active) VALUES 
('Śródmieście', ST_GeomFromText('POLYGON((19.26 50.21, 19.28 50.21, 19.28 50.19, 19.26 50.19, 19.26 50.21))', 4326), TRUE),
('Szczakowa', ST_GeomFromText('POLYGON((19.25 50.24, 19.29 50.24, 19.29 50.22, 19.25 50.22, 19.25 50.24))', 4326), TRUE),
('Podłęże (Zlikwidowany)', ST_GeomFromText('POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))', 4326), FALSE); -- Do testowania Soft Delete!

-- 7. KOMUNIKATY I OGŁOSZENIA (Do wyświetlenia na tablicy w e-BOK)
INSERT INTO announcements (title, content, created_by, valid_to, geom) VALUES 
('Płukanie sieci wodociągowej', 'W nocy z piątku na sobotę w rejonie Śródmieścia może wystąpić rdzawa woda.', 1, CURRENT_DATE + INTERVAL '3 days', ST_GeomFromText('POLYGON((19.26 50.21, 19.28 50.21, 19.28 50.19, 19.26 50.19, 19.26 50.21))', 4326)),
('Wesołych Świąt!', 'Życzymy wszystkim mieszkańcom spokojnych świąt. BOK czynny krócej.', 1, CURRENT_DATE - INTERVAL '10 days', NULL); -- Przeterminowane (Frontend powinien to ukryć)

-- 8. LICZNIKI (Główne i przydomowe z pinezkami na mapie)
INSERT INTO meters (user_id, sector_id, serial_number, address, geom, is_main_meter) VALUES 
(NULL, 1, 'MAIN-SROD-01', 'Stacja Pomp Śródmieście', ST_GeomFromText('POINT(19.27 50.20)', 4326), TRUE), -- ID 1
(NULL, 2, 'MAIN-SZCZ-01', 'Węzeł Szczakowa', ST_GeomFromText('POINT(19.27 50.23)', 4326), TRUE),     -- ID 2
(3, 1, 'M-NOWAK-001', 'ul. Grunwaldzka 12', ST_GeomFromText('POINT(19.265 50.195)', 4326), FALSE),     -- ID 3
(4, 1, 'M-KOWALSKA-001', 'ul. Mickiewicza 5', ST_GeomFromText('POINT(19.275 50.205)', 4326), FALSE),   -- ID 4
(5, 2, 'M-WISNIEW-001', 'ul. Kolejarzy 18', ST_GeomFromText('POINT(19.280 50.235)', 4326), FALSE);     -- ID 5

-- 9. ODCZYTY (Zachowujące ścisłą chronologię dla Triggera)
-- BAZA STARTOWA (Miesiąc temu)
INSERT INTO readings (meter_id, value, reading_date, is_verified) VALUES 
(1, 10000.00, DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month', TRUE),
(2, 5000.00,  DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month', TRUE),
(3, 150.00,   DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month', TRUE),
(4, 220.00,   DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month', TRUE),
(5, 80.00,    DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month', TRUE);

-- OBECNY MIESIĄC (Daje nam deltę zużycia dla widoku analitycznego)
INSERT INTO readings (meter_id, value, reading_date, is_verified) VALUES 
(1, 12000.00, DATE_TRUNC('month', CURRENT_DATE), TRUE),  -- Śródmieście: Wtłoczono 2000
(2, 6000.00,  DATE_TRUNC('month', CURRENT_DATE), TRUE),  -- Szczakowa: Wtłoczono 1000
(3, 165.00,   DATE_TRUNC('month', CURRENT_DATE), TRUE),  -- Nowak zużył 15
(4, 230.00,   DATE_TRUNC('month', CURRENT_DATE), TRUE),  -- Kowalska zużyła 10 (Suma w Śródmieściu 25 -> Gigantyczny wyciek!)
(5, 92.00,    DATE_TRUNC('month', CURRENT_DATE), FALSE); -- Wiśniewski zużył 12 (Odczyt jeszcze niezweryfikowany)

-- 10. FAKTURY (Bez kolumny 'amount', bo baza mnoży to sama!)
-- Frontend dostaje pełen wachlarz statusów do stylowania (Zielony, Żółty, Czerwony)
INSERT INTO invoices (user_id, meter_id, period_start, period_end, consumption_m3, price_per_m3, status, due_date) VALUES 
-- Zaległa faktura (Do wyświetlenia na czerwono!)
(3, 3, CURRENT_DATE - INTERVAL '3 months', CURRENT_DATE - INTERVAL '2 months', 15.00, 5.50, 'overdue', CURRENT_DATE - INTERVAL '10 days'),
-- Opłacona faktura z zeszłego miesiąca (Zielona)
(4, 4, CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE - INTERVAL '1 month', 10.00, 5.50, 'paid', CURRENT_DATE + INTERVAL '5 days'),
-- Bieżąca, jeszcze nieopłacona (Żółta)
(5, 5, CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE - INTERVAL '1 day', 12.00, 5.50, 'unpaid', CURRENT_DATE + INTERVAL '14 days');

-- 11. AWARIE (Pinezki do mapy i oś czasu)
-- Awaria 1: W trakcie naprawy
INSERT INTO incidents (reported_by, geom, current_status) VALUES 
(4, ST_GeomFromText('POINT(19.272 50.202)', 4326), 'in_progress');

INSERT INTO incident_updates (incident_id, updated_by, description) VALUES 
(1, 4, 'Brak wody w kranie, słychać huk na ulicy.'),
(1, 2, 'Koparka na miejscu, uszkodzona magistrala. Szacowany czas naprawy: 4 godziny.');

-- Awaria 2: Oczekująca (Nowa)
INSERT INTO incidents (reported_by, geom, current_status) VALUES 
(5, ST_GeomFromText('POINT(19.281 50.236)', 4326), 'reported');

INSERT INTO incident_updates (incident_id, updated_by, description) VALUES 
(2, 5, 'Spod studzienki wybija woda na jezdnię.');

-- Awaria 3: Rozwiązana
INSERT INTO incidents (reported_by, geom, current_status) VALUES 
(3, ST_GeomFromText('POINT(19.266 50.196)', 4326), 'resolved');

INSERT INTO incident_updates (incident_id, updated_by, description) VALUES 
(3, 3, 'Woda ma brązowy kolor.'),
(3, 1, 'Wykonano płukanie hydrantów. Parametry wody wróciły do normy. Zgłoszenie zamknięte.');