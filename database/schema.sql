-- ============================================================
-- AlertaOax — Esquema de base de datos (PostgreSQL)
-- AO-101: tablas base y datos semilla de regiones.
-- Es idempotente: se puede ejecutar varias veces sin duplicar datos.
-- (Albergues, zonas de riesgo y reportes se agregan en AO-301.)
-- ============================================================

-- Las 8 regiones de Oaxaca
CREATE TABLE IF NOT EXISTS regiones (
  id      SERIAL PRIMARY KEY,
  nombre  VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuarios (
  id             SERIAL PRIMARY KEY,
  nombre         VARCHAR(120) NOT NULL,
  correo         VARCHAR(160) NOT NULL UNIQUE,
  password_hash  VARCHAR(100) NOT NULL,
  rol            VARCHAR(20)  NOT NULL
                 CHECK (rol IN ('ciudadano', 'autoridad', 'administrador')),
  region_id      INTEGER REFERENCES regiones (id),
  activo         BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Datos extra de las cuentas con rol "autoridad".
-- Una autoridad no puede iniciar sesión hasta que el administrador la apruebe.
CREATE TABLE IF NOT EXISTS autoridades (
  usuario_id         INTEGER PRIMARY KEY REFERENCES usuarios (id) ON DELETE CASCADE,
  institucion        VARCHAR(160) NOT NULL,
  estado_validacion  VARCHAR(20)  NOT NULL DEFAULT 'pendiente'
                     CHECK (estado_validacion IN ('pendiente', 'aprobada', 'rechazada')),
  validada_por       INTEGER REFERENCES usuarios (id),
  validada_en        TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS alertas (
  id             SERIAL PRIMARY KEY,
  autoridad_id   INTEGER      NOT NULL REFERENCES usuarios (id),
  region_id      INTEGER      NOT NULL REFERENCES regiones (id),
  tipo           VARCHAR(20)  NOT NULL
                 CHECK (tipo IN ('sismo', 'huracan', 'inundacion', 'deslizamiento', 'otro')),
  nivel          VARCHAR(12)  NOT NULL
                 CHECK (nivel IN ('critico', 'alto', 'medio', 'vigilancia')),
  titulo         VARCHAR(200) NOT NULL,
  descripcion    TEXT         NOT NULL,
  emitida_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  vigente_hasta  TIMESTAMPTZ  NOT NULL,
  CHECK (vigente_hasta > emitida_en)
);

CREATE TABLE IF NOT EXISTS notificaciones (
  id          SERIAL PRIMARY KEY,
  usuario_id  INTEGER     NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  alerta_id   INTEGER     NOT NULL REFERENCES alertas (id)  ON DELETE CASCADE,
  leida       BOOLEAN     NOT NULL DEFAULT FALSE,
  creada_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, alerta_id)
);

-- Índices para las consultas más frecuentes
CREATE INDEX IF NOT EXISTS idx_usuarios_region      ON usuarios (region_id);
CREATE INDEX IF NOT EXISTS idx_alertas_region_vigencia ON alertas (region_id, vigente_hasta);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario  ON notificaciones (usuario_id, leida);

-- Datos semilla: regiones
INSERT INTO regiones (nombre) VALUES
  ('Cañada'),
  ('Costa'),
  ('Istmo'),
  ('Mixteca'),
  ('Papaloapan'),
  ('Sierra Norte'),
  ('Sierra Sur'),
  ('Valles Centrales')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- AO-301 / AO-305 / AO-304: albergues, zonas de riesgo, reportes ciudadanos y plan familiar
-- ============================================================

CREATE TABLE IF NOT EXISTS albergues (
  id          SERIAL PRIMARY KEY,
  region_id   INTEGER       NOT NULL REFERENCES regiones (id),
  nombre      VARCHAR(160)  NOT NULL,
  direccion   VARCHAR(250)  NOT NULL,
  latitud     NUMERIC(9, 6) NOT NULL CHECK (latitud BETWEEN -90 AND 90),
  longitud    NUMERIC(9, 6) NOT NULL CHECK (longitud BETWEEN -180 AND 180),
  capacidad   INTEGER       NOT NULL CHECK (capacidad > 0),
  ocupacion   INTEGER       NOT NULL DEFAULT 0,
  abierto     BOOLEAN       NOT NULL DEFAULT TRUE,
  telefono    VARCHAR(20),
  CHECK (ocupacion BETWEEN 0 AND capacidad),
  UNIQUE (region_id, nombre)
);

-- Zona de riesgo como círculo (centro + radio en metros): suficiente para el mapa con Leaflet
CREATE TABLE IF NOT EXISTS zonas_riesgo (
  id          SERIAL PRIMARY KEY,
  region_id   INTEGER       NOT NULL REFERENCES regiones (id),
  nombre      VARCHAR(160)  NOT NULL,
  tipo        VARCHAR(20)   NOT NULL
              CHECK (tipo IN ('sismo', 'huracan', 'inundacion', 'deslizamiento', 'otro')),
  nivel       VARCHAR(12)   NOT NULL
              CHECK (nivel IN ('critico', 'alto', 'medio', 'vigilancia')),
  latitud     NUMERIC(9, 6) NOT NULL,
  longitud    NUMERIC(9, 6) NOT NULL,
  radio_m     INTEGER       NOT NULL CHECK (radio_m BETWEEN 50 AND 50000),
  UNIQUE (region_id, nombre)
);

CREATE TABLE IF NOT EXISTS reportes (
  id              SERIAL PRIMARY KEY,
  usuario_id      INTEGER      NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  region_id       INTEGER      NOT NULL REFERENCES regiones (id),
  tipo            VARCHAR(20)  NOT NULL
                  CHECK (tipo IN ('inundacion', 'deslave', 'arbol', 'cable', 'vivienda', 'otro')),
  descripcion     TEXT         NOT NULL,
  latitud         NUMERIC(9, 6),
  longitud        NUMERIC(9, 6),
  referencia      VARCHAR(250),
  estado          VARCHAR(12)  NOT NULL DEFAULT 'recibido'
                  CHECK (estado IN ('recibido', 'en_atencion', 'atendido')),
  nota_autoridad  VARCHAR(500),
  atendido_por    INTEGER      REFERENCES usuarios (id),
  creado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planes_familiares (
  usuario_id           INTEGER PRIMARY KEY REFERENCES usuarios (id) ON DELETE CASCADE,
  punto_reunion        VARCHAR(250),
  albergue_id          INTEGER REFERENCES albergues (id) ON DELETE SET NULL,
  contacto_externo     VARCHAR(160),
  necesidades          VARCHAR(500),
  mochila              JSONB       NOT NULL DEFAULT '[]'::jsonb,
  actualizado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_albergues_region ON albergues (region_id);
CREATE INDEX IF NOT EXISTS idx_zonas_region     ON zonas_riesgo (region_id);
CREATE INDEX IF NOT EXISTS idx_reportes_region  ON reportes (region_id, estado);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes (usuario_id);
