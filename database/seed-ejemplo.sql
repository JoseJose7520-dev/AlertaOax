-- ============================================================
-- AlertaOax — Datos de EJEMPLO para pruebas y demostración.
-- Albergues y zonas ficticios con coordenadas aproximadas de cada localidad.
-- NO son datos oficiales. Se carga con: npm run db:ejemplo
-- ============================================================

INSERT INTO albergues (region_id, nombre, direccion, latitud, longitud, capacidad, ocupacion) VALUES
  ((SELECT id FROM regiones WHERE nombre = 'Costa'), 'Escuela Primaria Benito Juárez', 'Centro, San Pedro Pochutla', 15.7445, -96.4660, 180, 45),
  ((SELECT id FROM regiones WHERE nombre = 'Costa'), 'Auditorio Municipal de Pochutla', 'Calle Guadalupe, San Pedro Pochutla', 15.7470, -96.4632, 250, 210),
  ((SELECT id FROM regiones WHERE nombre = 'Costa'), 'Unidad Deportiva de Puerto Escondido', 'Puerto Escondido, San Pedro Mixtepec', 15.8640, -97.0700, 300, 60),
  ((SELECT id FROM regiones WHERE nombre = 'Costa'), 'Casa de la Cultura de Pochutla', 'Av. Lázaro Cárdenas, San Pedro Pochutla', 15.7428, -96.4685, 120, 120),
  ((SELECT id FROM regiones WHERE nombre = 'Valles Centrales'), 'Gimnasio Municipal de Oaxaca', 'Centro, Oaxaca de Juárez', 17.0650, -96.7230, 400, 0),
  ((SELECT id FROM regiones WHERE nombre = 'Valles Centrales'), 'Escuela Secundaria Técnica 1', 'Santa Lucía del Camino', 17.0610, -96.6960, 200, 0),
  ((SELECT id FROM regiones WHERE nombre = 'Istmo'), 'Casa de la Cultura de Juchitán', 'Centro, Juchitán de Zaragoza', 16.4330, -95.0190, 220, 30),
  ((SELECT id FROM regiones WHERE nombre = 'Sierra Sur'), 'Salón Ejidal de Miahuatlán', 'Miahuatlán de Porfirio Díaz', 16.3290, -96.5960, 150, 0)
ON CONFLICT (region_id, nombre) DO NOTHING;

INSERT INTO zonas_riesgo (region_id, nombre, tipo, nivel, latitud, longitud, radio_m) VALUES
  ((SELECT id FROM regiones WHERE nombre = 'Costa'), 'Ribera del río Tonameca', 'inundacion', 'critico', 15.7390, -96.4720, 900),
  ((SELECT id FROM regiones WHERE nombre = 'Costa'), 'Playa Zicatela', 'huracan', 'alto', 15.8550, -97.0560, 1200),
  ((SELECT id FROM regiones WHERE nombre = 'Valles Centrales'), 'Márgenes del río Atoyac', 'inundacion', 'alto', 17.0480, -96.7300, 1500),
  ((SELECT id FROM regiones WHERE nombre = 'Istmo'), 'Laguna Superior', 'huracan', 'medio', 16.3700, -94.9700, 3000),
  ((SELECT id FROM regiones WHERE nombre = 'Sierra Sur'), 'Ladera de la carretera 175', 'deslizamiento', 'medio', 16.3400, -96.5900, 800)
ON CONFLICT (region_id, nombre) DO NOTHING;
