-- Seed: First cassette + 26 songs
-- Run in Supabase SQL Editor

-- Insert cassette and all songs in one statement using a CTE
WITH new_cassette AS (
  INSERT INTO cassettes (name, start_date, end_date, duration_minutes, curator_name, active)
  VALUES ('Cassette Vol. 1', '2026-03-01', '2026-04-01', 90, 'Ruidozo MX', TRUE)
  RETURNING id
)
INSERT INTO songs (cassette_id, title, artist, duration_seconds, side, position, audio_url)
SELECT id, title, artist, duration_seconds, side::cassette_side, position, audio_url
FROM new_cassette,
(VALUES
  -- Side A
  ('Susana',                        'Andy Mountains Paulimorfa Alexis Ulises',    239, 'A',  1, '/songs/ANDY MOUNTAINS PAULIMORFA ALEXIS ULISES Susana.mp3'),
  ('Todavía DF',                    'Belafonte Sensacional',                      191, 'A',  2, '/songs/BELAFONTE SENSACIONAL_Todavia DF.mp3'),
  ('Paso a Paso',                   'Boyler',                                     189, 'A',  3, '/songs/BOYLER-Paso a paso.mp3'),
  ('Charlie Contra los Monjes',     'Cacomixtle',                                 192, 'A',  4, '/songs/CACOMIXTLE_charlie contra los monjes.mp3'),
  ('Morir Es Solo Despertar',       'Caminatas Nocturnas',                        200, 'A',  5, '/songs/CAMINATAS NOCTURNAS_Morir es solo despertar.mp3'),
  ('Mi Corset',                     'Carrion Kids',                               205, 'A',  6, '/songs/CARRION KIDS_Mi Corset.mp3'),
  ('ToxicoSaico',                   'Clothing',                                   170, 'A',  7, '/songs/CLOTHING_ToxicoSaico.mp3'),
  ('Quémenme',                      'Cuauh',                                      180, 'A',  8, '/songs/CUAUH_quemenme.mp3'),
  ('Tulipán',                       'D. Mantilla',                                137, 'A',  9, '/songs/D.MANTILLA_Tulipan.mp3'),
  ('Sonámbulo',                     'David Samuel y los Problemas de Macario',    457, 'A', 10, '/songs/DAVID SAMUEL Y LOS PROBLEMAS DE MACARIO_sonanmbulo.mp3'),
  ('Maldito Enamorado',             'Iván Ivengo',                                134, 'A', 11, '/songs/IVAN IVENGO_maldito enamorado.mp3'),
  ('La Candela Shikha',             'Koyel Basu',                                 322, 'A', 12, '/songs/KOYEL BASU_La Candela Shikha.mp3'),
  ('Estilo Mexa',                   'La Diabbla',                                 196, 'A', 13, '/songs/LA DIABBLA_EstiloMexa.mp3'),
  -- Side B
  ('Danza',                         'Linxe',                                      193, 'B',  1, '/songs/LINXE_danza.mp3'),
  ('No Regresaré',                  'Los Hidalgo',                                176, 'B',  2, '/songs/LOS HIDALGO_No RegresarE.mp3'),
  ('Momento',                       'Malcriada',                                  170, 'B',  3, '/songs/MALCRIADA_MOMENTO.mp3'),
  ('No Me Siento Como',             'Mi$ha',                                      156, 'B',  4, '/songs/MI$HA_NO ME SIENTO COMO.mp3'),
  ('Progreso',                      'Nina Fatal',                                 186, 'B',  5, '/songs/NINA FATAL_PROGRRESO.mp3'),
  ('Sheep en la Gran Ciudad',       'Perra Brava',                                213, 'B',  6, '/songs/PERRA BRAVA_Sheep en la gran Ciudad.mp3'),
  ('Vanilla Sky',                   'Rase X',                                     160, 'B',  7, '/songs/RASE X_Vanilla Sky.mp3'),
  ('Hadas en Greenscreen',          'Siglo Vacío',                                139, 'B',  8, '/songs/SIGLO VACIO_Hadasen greenscreen.mp3'),
  ('La Perra Más Bonita del Cielo', 'Sochi',                                      202, 'B',  9, '/songs/SOCHI_La Perra mas BonitadelCielo.mp3'),
  ('Las Nubes Caen',                'Timoti la Motocasco',                        329, 'B', 10, '/songs/TIMOTI LA MOTOCASCO_Lasnubes caen-2.mp3'),
  ('El Títere',                     'Títere Charro',                              177, 'B', 11, '/songs/TITERE CHARRO-El Titere .mp3'),
  ('M.F.C.',                        'Ulises Richards',                            194, 'B', 12, '/songs/ULISES RICHARDS_M.F.C..mp3'),
  ('Gato Negro',                    'Vilevo',                                     169, 'B', 13, '/songs/VILEVO_Gato Negro.mp3')
) AS t(title, artist, duration_seconds, side, position, audio_url);
