-- Seed some mock flights
insert into public.flights (airline, flight_number, origin, destination, departure_time, arrival_time, price, seats_available) values
  ('LATAM Airlines', 'LA3501', 'São Paulo (GRU)', 'Rio de Janeiro (GIG)', '2026-02-15 08:00:00', '2026-02-15 09:15:00', 450.00, 120),
  ('Gol Linhas Aéreas', 'G31045', 'São Paulo (GRU)', 'Rio de Janeiro (GIG)', '2026-02-15 12:00:00', '2026-02-15 13:15:00', 380.00, 150),
  ('Azul Airlines', 'AD4521', 'São Paulo (GRU)', 'Rio de Janeiro (GIG)', '2026-02-15 16:30:00', '2026-02-15 17:45:00', 420.00, 100),
  ('LATAM Airlines', 'LA3420', 'Rio de Janeiro (GIG)', 'São Paulo (GRU)', '2026-02-15 10:00:00', '2026-02-15 11:15:00', 450.00, 110),
  ('Gol Linhas Aéreas', 'G31012', 'Rio de Janeiro (GIG)', 'São Paulo (GRU)', '2026-02-15 14:00:00', '2026-02-15 15:15:00', 390.00, 140),
  ('Azul Airlines', 'AD2541', 'Rio de Janeiro (GIG)', 'São Paulo (GRU)', '2026-02-15 18:00:00', '2026-02-15 19:15:00', 410.00, 95),
  
  ('LATAM Airlines', 'LA3102', 'São Paulo (GRU)', 'Salvador (SSA)', '2026-02-20 07:00:00', '2026-02-20 09:30:00', 680.00, 130),
  ('Gol Linhas Aéreas', 'G31521', 'São Paulo (GRU)', 'Salvador (SSA)', '2026-02-20 13:00:00', '2026-02-20 15:30:00', 620.00, 145),
  ('Azul Airlines', 'AD5102', 'São Paulo (GRU)', 'Salvador (SSA)', '2026-02-20 17:00:00', '2026-02-20 19:30:00', 650.00, 110),
  
  ('LATAM Airlines', 'LA4521', 'São Paulo (GRU)', 'Brasília (BSB)', '2026-02-18 09:00:00', '2026-02-18 10:45:00', 520.00, 125),
  ('Gol Linhas Aéreas', 'G32104', 'São Paulo (GRU)', 'Brasília (BSB)', '2026-02-18 15:00:00', '2026-02-18 16:45:00', 480.00, 135),
  ('Azul Airlines', 'AD6214', 'São Paulo (GRU)', 'Brasília (BSB)', '2026-02-18 19:00:00', '2026-02-18 20:45:00', 510.00, 105),
  
  ('LATAM Airlines', 'LA8401', 'Rio de Janeiro (GIG)', 'Brasília (BSB)', '2026-02-22 08:30:00', '2026-02-22 10:30:00', 540.00, 115),
  ('Gol Linhas Aéreas', 'G33210', 'Rio de Janeiro (GIG)', 'Brasília (BSB)', '2026-02-22 14:30:00', '2026-02-22 16:30:00', 500.00, 140),
  ('Azul Airlines', 'AD7310', 'Rio de Janeiro (GIG)', 'Brasília (BSB)', '2026-02-22 18:30:00', '2026-02-22 20:30:00', 530.00, 100),
  
  ('LATAM Airlines', 'LA9102', 'São Paulo (GRU)', 'Fortaleza (FOR)', '2026-02-25 06:00:00', '2026-02-25 09:45:00', 780.00, 120),
  ('Gol Linhas Aéreas', 'G34101', 'São Paulo (GRU)', 'Fortaleza (FOR)', '2026-02-25 12:00:00', '2026-02-25 15:45:00', 720.00, 150),
  ('Azul Airlines', 'AD8201', 'São Paulo (GRU)', 'Fortaleza (FOR)', '2026-02-25 16:00:00', '2026-02-25 19:45:00', 750.00, 110),
  
  ('LATAM Airlines', 'LA6210', 'Brasília (BSB)', 'Salvador (SSA)', '2026-02-28 10:00:00', '2026-02-28 11:45:00', 460.00, 130),
  ('Gol Linhas Aéreas', 'G35142', 'Brasília (BSB)', 'Salvador (SSA)', '2026-02-28 16:00:00', '2026-02-28 17:45:00', 420.00, 145);
