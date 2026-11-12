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
