-- =========================================
-- SCHEMA DE BASE DE DATOS PARA SUPABASE
-- Sistema de Tickets QR - Imantación de Volantes
-- =========================================

-- Tabla de usuarios/empleados
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL, -- ID de usuario de Clerk
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT, -- URL de la imagen de perfil de Clerk
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de tickets
CREATE TABLE tickets (
  id TEXT PRIMARY KEY, -- TKT-1234567890-ABC
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  status TEXT CHECK (status IN ('por_atender', 'pagado')) DEFAULT 'por_atender',
  qr_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_by UUID REFERENCES users(id), -- Empleado que marcó como pagado
  paid_at TIMESTAMPTZ
);

-- Tabla de configuración del sistema
CREATE TABLE config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo TEXT,
  primary_color TEXT DEFAULT '#06b6d4',
  secondary_color TEXT DEFAULT '#ec4899',
  company_name TEXT DEFAULT 'Buffa-Bikes',
  company_address TEXT,
  company_phone TEXT,
  access_password TEXT NOT NULL, -- Contraseña para marcar tickets como pagado
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =========================================

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_customer_email ON tickets(customer_email);
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);

-- =========================================
-- FUNCIÓN TRIGGER PARA ACTUALIZAR updated_at
-- =========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a la tabla tickets
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger a la tabla config
CREATE TRIGGER update_config_updated_at
  BEFORE UPDATE ON config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- DATOS INICIALES
-- =========================================

-- Insertar configuración inicial
-- IMPORTANTE: Cambia 'admin123' por una contraseña segura
INSERT INTO config (
  access_password,
  company_name,
  company_address,
  company_phone,
  primary_color,
  secondary_color
)
VALUES (
  'admin123', -- CAMBIAR POR UNA CONTRASEÑA SEGURA
  'Buffa-Bikes',
  'Dirección del Local',
  '+54 11 1234-5678',
  '#06b6d4',
  '#ec4899'
);

-- NOTA: Los usuarios se crearán automáticamente desde Clerk
-- No es necesario insertar usuarios manualmente

-- =========================================
-- POLÍTICAS DE SEGURIDAD RLS (Row Level Security)
-- =========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Política para usuarios: solo lectura para usuarios autenticados
CREATE POLICY "Usuarios pueden ver todos los usuarios"
  ON users FOR SELECT
  USING (true);

-- Política para tickets: lectura y escritura para todos
CREATE POLICY "Todos pueden ver tickets"
  ON tickets FOR SELECT
  USING (true);

CREATE POLICY "Todos pueden crear tickets"
  ON tickets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Todos pueden actualizar tickets"
  ON tickets FOR UPDATE
  USING (true);

-- Política para config: lectura para todos
CREATE POLICY "Todos pueden ver la configuración"
  ON config FOR SELECT
  USING (true);

CREATE POLICY "Todos pueden actualizar la configuración"
  ON config FOR UPDATE
  USING (true);

-- =========================================
-- COMENTARIOS EN LAS TABLAS
-- =========================================

COMMENT ON TABLE users IS 'Tabla de empleados/usuarios del sistema';
COMMENT ON TABLE tickets IS 'Tabla de tickets generados con QR';
COMMENT ON TABLE config IS 'Configuración global del sistema';

COMMENT ON COLUMN tickets.status IS 'Estado del ticket: por_atender o pagado';
COMMENT ON COLUMN tickets.paid_by IS 'ID del empleado que marcó el ticket como pagado';
COMMENT ON COLUMN config.access_password IS 'Contraseña que el empleado debe ingresar para marcar tickets como pagados';
