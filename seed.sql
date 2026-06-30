-- ==========================================
-- AQUAFLOW - DANE TESTOWE (GIGANTYCZNY POLIGON DOŚWIADCZALNY)
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
-- Personel Urzędu
INSERT INTO users (email, password_hash, status) VALUES 
('dyrektor@aquaflow.jaworzno.pl', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 'active'), -- ID 1
('inkasent.terenowy@aquaflow.jaworzno.pl', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 'active');  -- ID 2

-- Mieszkańcy (Zwiększona pula 13 mieszkańców do testów)
INSERT INTO users (email, password_hash, status) VALUES 
('jan.nowak@gmail.com', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 'active'),     -- ID 3
('anna.kowalska@gmail.com', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 'active'), -- ID 4
('piotr.wisniewski@gmail.com', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 'active'), -- ID 5
('marek.nowicki@gmail.com', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 'active'), -- ID 6
('katarzyna.lis@gmail.com', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 'active'), -- ID 7
('tomasz.wojcik@gmail.com', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 'active'), -- ID 8
('magdalena.mazur@gmail.com', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 'active'), -- ID 9
('kamil.krawczyk@gmail.com', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 'active'), -- ID 10
('agnieszka.krol@gmail.com', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 'active'), -- ID 11
('michal.wieczorek@gmail.com', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 'active'), -- ID 12
('patrycja.stepien@gmail.com', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 'suspended'), -- ID 13 (Zawieszone konto!)
('grzegorz.duda@gmail.com', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 'pending'), -- ID 14 (Oczekuje na akceptację!)
('ewa.zalewska@gmail.com', '$2b$12$i7NNiO4Dwb8kGeS/MlrExOggVwZ8v2RXfcqrPHz57enzIMlvXmlSm', 'active'); -- ID 15

-- Mapowanie ról Wiele-do-Wielu
INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 1), (1, 3), -- Dyrektor to Admin + Mieszkaniec
(2, 2);         -- Inkasent

-- Mapowanie mieszkańców w pętli
INSERT INTO user_roles (user_id, role_id) 
SELECT id, 3 FROM users WHERE id >= 3;

-- 5. TARYFIKATOR WODY (Dla testowania logiki księgowej)
INSERT INTO water_rates (name, price_per_m3, valid_from, valid_to) VALUES 
('Taryfa Gminna 2025', 4.80, '2025-01-01', '2025-12-31'),
('Taryfa Gminna 2026', 5.50, '2026-01-01', NULL);

-- 6. SEKTORY (Strefy z podziałem np. na dzielnice Jaworzna - 5 dużych stref do PostGIS)
INSERT INTO sectors (name, geom, is_active) VALUES 
('Śródmieście', ST_GeomFromText('POLYGON((19.26 50.21, 19.28 50.21, 19.28 50.19, 19.26 50.19, 19.26 50.21))', 4326), TRUE),
('Szczakowa', ST_GeomFromText('POLYGON((19.25 50.24, 19.29 50.24, 19.29 50.22, 19.25 50.22, 19.25 50.24))', 4326), TRUE),
('Podłęże (Zlikwidowany)', ST_GeomFromText('POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))', 4326), FALSE),
('Osiedle Stałe', ST_GeomFromText('POLYGON((19.22 50.21, 19.25 50.21, 19.25 50.19, 19.22 50.19, 19.22 50.21))', 4326), TRUE),
('Bory', ST_GeomFromText('POLYGON((19.28 50.18, 19.31 50.18, 19.31 50.16, 19.28 50.16, 19.28 50.18))', 4326), TRUE);

-- 7. KOMUNIKATY I OGŁOSZENIA (Bogata tablica ogłoszeń)
INSERT INTO announcements (title, content, created_by, valid_to, geom) VALUES 
('Płukanie sieci wodociągowej', 'W nocy z piątku na sobotę w rejonie Śródmieścia może wystąpić rdzawa woda.', 1, CURRENT_DATE + INTERVAL '3 days', ST_GeomFromText('POLYGON((19.26 50.21, 19.28 50.21, 19.28 50.19, 19.26 50.19, 19.26 50.21))', 4326)),
('Wesołych Świąt!', 'Życzymy wszystkim mieszkańcom spokojnych świąt. BOK czynny krócej.', 1, CURRENT_DATE - INTERVAL '10 days', NULL),
('Ostrzeżenie o oszustach', 'Uważajcie na osoby podające się za inkasentów żądające zapłaty gotówką.', 1, CURRENT_DATE + INTERVAL '30 days', NULL),
('Zakończenie modernizacji', 'Stacja pomp na Osiedlu Stałym pracuje już z pełną mocą.', 1, CURRENT_DATE + INTERVAL '7 days', NULL),
('Zmiana regulaminu e-BOK', 'Prosimy o zapoznanie się z nowym regulaminem portalu.', 1, CURRENT_DATE + INTERVAL '14 days', NULL);

-- 8. LICZNIKI (17 wodomierzy rozrzuconych po Jaworznie dla Inkasenta!)
-- Liczniki główne wtłaczające wodę do dzielnic
INSERT INTO meters (user_id, sector_id, serial_number, address, geom, is_main_meter) VALUES 
(NULL, 1, 'MAIN-SROD-01', 'Stacja Pomp Śródmieście', ST_GeomFromText('POINT(19.270 50.200)', 4326), TRUE), -- ID 1
(NULL, 2, 'MAIN-SZCZ-01', 'Węzeł Szczakowa', ST_GeomFromText('POINT(19.270 50.230)', 4326), TRUE),     -- ID 2
(NULL, 4, 'MAIN-OSST-01', 'Zbiornik Osiedle Stałe', ST_GeomFromText('POINT(19.235 50.200)', 4326), TRUE), -- ID 3
(NULL, 5, 'MAIN-BORY-01', 'Pompownia Bory', ST_GeomFromText('POINT(19.295 50.170)', 4326), TRUE);         -- ID 4

-- Liczniki mieszkańców (Przypisane konkretnym użytkownikom w danych sektorach)
INSERT INTO meters (user_id, sector_id, serial_number, address, geom, is_main_meter) VALUES 
(3, 1, 'M-NOWAK-001', 'ul. Grunwaldzka 12, Śródmieście', ST_GeomFromText('POINT(19.265 50.195)', 4326), FALSE),   -- ID 5
(4, 1, 'M-KOWAL-001', 'ul. Mickiewicza 5, Śródmieście', ST_GeomFromText('POINT(19.275 50.205)', 4326), FALSE),    -- ID 6
(5, 2, 'M-WISNI-001', 'ul. Kolejarzy 18, Szczakowa', ST_GeomFromText('POINT(19.280 50.235)', 4326), FALSE),       -- ID 7
(6, 4, 'M-NOWIC-001', 'ul. Inwalidów Wojennych 2, Os. Stałe', ST_GeomFromText('POINT(19.230 50.205)', 4326), FALSE), -- ID 8
(7, 4, 'M-LISKA-001', 'ul. Armii Krajowej 10, Os. Stałe', ST_GeomFromText('POINT(19.240 50.195)', 4326), FALSE),     -- ID 9
(8, 5, 'M-WOJCI-001', 'ul. Tetmajera 4, Bory', ST_GeomFromText('POINT(19.290 50.175)', 4326), FALSE),             -- ID 10
(9, 5, 'M-MAZUR-001', 'ul. Bielańska 8, Bory', ST_GeomFromText('POINT(19.300 50.165)', 4326), FALSE),             -- ID 11
(10, 1, 'M-KRAWC-001', 'ul. Paderewskiego 1, Śródmieście', ST_GeomFromText('POINT(19.270 50.208)', 4326), FALSE),    -- ID 12
(11, 2, 'M-KROLA-001', 'ul. Jagiellońska 22, Szczakowa', ST_GeomFromText('POINT(19.260 50.225)', 4326), FALSE),      -- ID 13
(12, 4, 'M-WIECZ-001', 'ul. Kolbego 14, Os. Stałe', ST_GeomFromText('POINT(19.245 50.200)', 4326), FALSE),           -- ID 14
(13, 1, 'M-STEPI-001', 'ul. Krótka 3, Śródmieście', ST_GeomFromText('POINT(19.268 50.198)', 4326), FALSE),           -- ID 15
(14, 5, 'M-DUDA-001', 'ul. Leśna 15, Bory', ST_GeomFromText('POINT(19.285 50.168)', 4326), FALSE),                   -- ID 16
(1, 1, 'M-DYREK-001', 'ul. Sienkiewicza 50 (Dom Dyrektora)', ST_GeomFromText('POINT(19.275 50.192)', 4326), FALSE); -- ID 17

-- 9. ODCZYTY (Pełna historia 4 miesięcy wstecz dla wszystkich liczników! Wykresy będą pełne!)
-- UWAGA: Trigger bazy jest bezlitosny, odczyty ułożone chronologicznie i ze wzrostem wartości!

-- BAZA: 3 MIESIĄCE TEMU
INSERT INTO readings (meter_id, value, reading_date, is_verified)
SELECT id, (id * 1000) + 100.00, DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '3 months', TRUE FROM meters;

-- ODCZYTY: 2 MIESIĄCE TEMU (+ Małe zużycie)
INSERT INTO readings (meter_id, value, reading_date, is_verified)
SELECT id, (id * 1000) + 115.50, DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 months', TRUE FROM meters WHERE is_main_meter = FALSE;
INSERT INTO readings (meter_id, value, reading_date, is_verified)
SELECT id, (id * 1000) + 2100.00, DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 months', TRUE FROM meters WHERE is_main_meter = TRUE;

-- ODCZYTY: 1 MIESIĄC TEMU (+ Kolejne zużycie)
INSERT INTO readings (meter_id, value, reading_date, is_verified)
SELECT id, (id * 1000) + 128.00, DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month', TRUE FROM meters WHERE is_main_meter = FALSE;
INSERT INTO readings (meter_id, value, reading_date, is_verified)
SELECT id, (id * 1000) + 4300.00, DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month', TRUE FROM meters WHERE is_main_meter = TRUE;

-- ODCZYTY BIEŻĄCE (Ten miesiąc, połowa jeszcze nie zweryfikowana przez Inkasenta)
--INSERT INTO readings (meter_id, value, reading_date, is_verified)
--SELECT id, (id * 1000) + 142.50, DATE_TRUNC('month', CURRENT_DATE), (id % 2 = 0) FROM meters WHERE is_main_meter = FALSE;
--INSERT INTO readings (meter_id, value, reading_date, is_verified)
--SELECT id, (id * 1000) + 6500.00, DATE_TRUNC('month', CURRENT_DATE), TRUE FROM meters WHERE is_main_meter = TRUE;

-- 10. FAKTURY (Automatycznie przeliczane przez PostgreSQL - potężny materiał testowy dla e-BOKa)
-- Generujemy faktury za 2 miesiące wstecz (Dawno OPŁACONE - Na zielono)
INSERT INTO invoices (user_id, meter_id, period_start, period_end, consumption_m3, price_per_m3, status, due_date)
SELECT user_id, id, 
       DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '3 months', 
       DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 months', 
       15.50, 5.50, 'paid', 
       DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 months' + INTERVAL '14 days'
FROM meters WHERE is_main_meter = FALSE AND user_id IS NOT NULL;

-- Generujemy faktury za 1 miesiąc wstecz (Niektórzy opłacili, niektórzy mają ZALEGŁOŚCI - Na czerwono)
INSERT INTO invoices (user_id, meter_id, period_start, period_end, consumption_m3, price_per_m3, status, due_date)
SELECT user_id, id, 
       DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 months', 
       DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month', 
       12.50, 5.50, 
       CASE WHEN id % 3 = 0 THEN 'overdue' ELSE 'paid' END, -- Co trzecia faktura spóźniona!
       DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' + INTERVAL '14 days'
FROM meters WHERE is_main_meter = FALSE AND user_id IS NOT NULL;

-- Generujemy faktury bieżące (Świeżo wystawione, OCZEKUJĄCE - Na żółto)
INSERT INTO invoices (user_id, meter_id, period_start, period_end, consumption_m3, price_per_m3, status, due_date)
SELECT user_id, id, 
       DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month', 
       DATE_TRUNC('month', CURRENT_DATE), 
       14.50, 5.50, 'unpaid', 
       DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '14 days'
FROM meters WHERE is_main_meter = FALSE AND user_id IS NOT NULL AND id % 2 = 0; -- Wystawiono tylko dla połowy liczników

-- 11. AWARIE (10 Zgłoszeń na mapę z kolorowymi pinezkami dla Inkasenta i Urzędu)
INSERT INTO incidents (reported_by, geom, current_status, created_at) VALUES 
-- Zgłoszone dzisiaj (Nowe, Czerwone)
(6, ST_GeomFromText('POINT(19.231 50.206)', 4326), 'reported', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(10, ST_GeomFromText('POINT(19.271 50.209)', 4326), 'reported', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
(14, ST_GeomFromText('POINT(19.286 50.169)', 4326), 'reported', CURRENT_TIMESTAMP - INTERVAL '10 hours'),
-- W trakcie (Wysłana ekipa, Żółte)
(4, ST_GeomFromText('POINT(19.272 50.202)', 4326), 'in_progress', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(8, ST_GeomFromText('POINT(19.292 50.176)', 4326), 'in_progress', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(12, ST_GeomFromText('POINT(19.246 50.201)', 4326), 'in_progress', CURRENT_TIMESTAMP - INTERVAL '3 days'),
-- Rozwiązane z przeszłości (Zielone / Ukryte)
(3, ST_GeomFromText('POINT(19.266 50.196)', 4326), 'resolved', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(7, ST_GeomFromText('POINT(19.241 50.196)', 4326), 'resolved', CURRENT_TIMESTAMP - INTERVAL '14 days'),
(11, ST_GeomFromText('POINT(19.261 50.226)', 4326), 'resolved', CURRENT_TIMESTAMP - INTERVAL '20 days'),
(5, ST_GeomFromText('POINT(19.281 50.236)', 4326), 'resolved', CURRENT_TIMESTAMP - INTERVAL '30 days');

-- Historia aktualizacji do awarii (Oś czasu czatu)
INSERT INTO incident_updates (incident_id, updated_by, description, created_at) VALUES 
(4, 4, 'Mieszkaniec: Woda wybiła na chodnik, woda leje się strumieniem.', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(4, 2, 'Inkasent Terenowy: Zabezpieczono teren barierkami. Oczekujemy na ciężki sprzęt.', CURRENT_TIMESTAMP - INTERVAL '23 hours'),
(5, 8, 'Mieszkaniec: Niskie ciśnienie wody od rana.', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(5, 2, 'Inkasent Terenowy: Trwa płukanie sieci. Ciśnienie powinno wrócić do 2h.', CURRENT_TIMESTAMP - INTERVAL '47 hours'),
(6, 12, 'Mieszkaniec: Rdzawa woda, nie nadaje się do prania.', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(7, 3, 'Zgłaszam uszkodzony hydrant.', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(7, 1, 'Admin: Zlecono naprawę firmie zewnętrznej.', CURRENT_TIMESTAMP - INTERVAL '9 days'),
(7, 2, 'Inkasent Terenowy: Hydrant wymieniony na nowy. Zamykam zgłoszenie.', CURRENT_TIMESTAMP - INTERVAL '8 days');