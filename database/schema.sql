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

-- ============================================================
-- AO-406: acceso con Google, términos y recuperación de contraseña
-- ============================================================

-- Identificador de la cuenta de Google (solo si la persona entra con Google)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS google_sub VARCHAR(64) UNIQUE;
-- Momento en que la persona aceptó los Términos y el Aviso de Privacidad
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS terminos_aceptados_en TIMESTAMPTZ;

-- Enlaces para crear una nueva contraseña. Se guarda el hash SHA-256 del token, nunca el token.
CREATE TABLE IF NOT EXISTS recuperaciones (
  id          SERIAL PRIMARY KEY,
  usuario_id  INTEGER     NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  token_hash  CHAR(64)    NOT NULL UNIQUE,
  expira_en   TIMESTAMPTZ NOT NULL,
  usada_en    TIMESTAMPTZ,
  creada_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recuperaciones_usuario ON recuperaciones (usuario_id);

-- ============================================================
-- AO-411 a AO-415: correcciones de la revisión (verificación de correo y perfil)
-- ============================================================

-- Las cuentas que ya existían (y el administrador creado por script) quedan verificadas.
-- Las que se registran con formulario nacen sin verificar (lo indica crearUsuario).
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS correo_verificado BOOLEAN NOT NULL DEFAULT TRUE;
-- FALSE cuando la cuenta se creó con Google y la persona nunca eligió una contraseña propia.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_definida BOOLEAN NOT NULL DEFAULT TRUE;

-- Código de 6 dígitos para confirmar el correo. Se guarda su hash SHA-256, nunca el código.
CREATE TABLE IF NOT EXISTS verificaciones_correo (
  usuario_id   INTEGER PRIMARY KEY REFERENCES usuarios (id) ON DELETE CASCADE,
  codigo_hash  CHAR(64)    NOT NULL,
  expira_en    TIMESTAMPTZ NOT NULL,
  intentos     INTEGER     NOT NULL DEFAULT 0,
  enviado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teléfono opcional (10 dígitos) que la persona agrega desde «Mi perfil»
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(10);
-- Al cambiar o restablecer la contraseña se cierran todas las sesiones abiertas:
-- los tokens emitidos antes de esta fecha dejan de servir.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS sesiones_desde TIMESTAMPTZ;

-- ============================================================
-- AO-428: aviso por correo de alertas críticas y altas
-- ============================================================
-- Cada persona decide en «Mi perfil» si recibe por correo las alertas críticas y altas de su región.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avisos_correo BOOLEAN NOT NULL DEFAULT TRUE;

-- ============================================================
-- AO-429: albergues con datos oficiales
-- ============================================================
-- Protección Civil publica nombre y localidad de los refugios, pero no siempre su cupo:
-- la capacidad puede quedar vacía («cupo no reportado»).
ALTER TABLE albergues ALTER COLUMN capacidad DROP NOT NULL;
-- De dónde sale el dato (p. ej. «CEPCyGR Oaxaca, junio 2026»)
ALTER TABLE albergues ADD COLUMN IF NOT EXISTS fuente VARCHAR(200);
-- TRUE en los datos de demostración (database/seed-ejemplo.sql); la app los marca como «Dato de ejemplo»
ALTER TABLE albergues ADD COLUMN IF NOT EXISTS es_ejemplo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE zonas_riesgo ADD COLUMN IF NOT EXISTS es_ejemplo BOOLEAN NOT NULL DEFAULT FALSE;
