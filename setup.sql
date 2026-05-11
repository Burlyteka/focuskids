-- ╔══════════════════════════════════════════════════╗
-- ║   FocusKids v3 — Supabase SQL Setup              ║
-- ║   Ejecuta en el SQL Editor de Supabase           ║
-- ╚══════════════════════════════════════════════════╝

-- 1. Tabla de códigos de acceso
CREATE TABLE IF NOT EXISTS access_codes (
  code      TEXT PRIMARY KEY,
  is_active BOOLEAN DEFAULT true
);

-- 2. Progreso del niño (indexado por código NK-)
CREATE TABLE IF NOT EXISTS kid_progress (
  code            TEXT PRIMARY KEY REFERENCES access_codes(code),
  username        TEXT,
  stars           INTEGER DEFAULT 0,
  routines_done   INTEGER DEFAULT 0,
  focus_minutes   INTEGER DEFAULT 0,
  games_played    INTEGER DEFAULT 0,
  routine_state   JSONB DEFAULT '{}',
  last_seen       TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS — permitir todo (acceso por código, sin JWT)
ALTER TABLE access_codes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE kid_progress  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all" ON access_codes;
DROP POLICY IF EXISTS "allow_all" ON kid_progress;

CREATE POLICY "allow_all" ON access_codes  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON kid_progress  FOR ALL USING (true) WITH CHECK (true);

-- 4. Función para incrementar estrellas
CREATE OR REPLACE FUNCTION add_stars(p_code TEXT, amount INTEGER)
RETURNS INTEGER AS $$
DECLARE new_stars INTEGER;
BEGIN
  UPDATE kid_progress SET stars = stars + amount WHERE code = p_code
  RETURNING stars INTO new_stars;
  RETURN COALESCE(new_stars, 0);
END;
$$ LANGUAGE plpgsql;

-- 5. Códigos de prueba (niños NK- y padres PD-)
INSERT INTO access_codes (code, is_active) VALUES
  ('NK-DEMO01', true),
  ('PD-DEMO01', true),
  ('NK-TEST01', true),
  ('PD-TEST01', true),
  ('NK-ALEX01', true),
  ('PD-ALEX01', true)
ON CONFLICT (code) DO NOTHING;

-- Crear registros de progreso vacíos para los niños
INSERT INTO kid_progress (code) VALUES
  ('NK-DEMO01'),
  ('NK-TEST01'),
  ('NK-ALEX01')
ON CONFLICT (code) DO NOTHING;
