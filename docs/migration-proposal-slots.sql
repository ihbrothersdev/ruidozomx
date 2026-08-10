-- Migration: 3 slots de propuesta por banda + Dale Play automático
--
-- Regla nueva (PO): cada banda puede tener 3 propuestas VIVAS a la vez.
--   viva     = status pending | in_review, y deleted_at IS NULL
--   aceptada = se queda en el cassette y LIBERA el slot (no cuenta)
--   rechazada / borrada = no cuenta ni se muestra
-- Reemplaza el límite semanal (3 por semana) que vivía sólo en código.
--
-- Para subir una 4ta, la banda borra una desde "editar perfil". El borrado es
-- SOFT: `songs.proposal_id` no declara ON DELETE, así que un DELETE real de una
-- propuesta ya aceptada falla por FK; además perderíamos historial en
-- admin/propuestas y en métricas.
--
-- Aditiva y reversible. Run in the Supabase SQL Editor.

BEGIN;

-- 1. Soft delete ────────────────────────────────────────────────────────────
ALTER TABLE song_proposals ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Orden en el Dale Play ──────────────────────────────────────────────────
-- El bloque pasa de curación manual (profile_featured_songs) a derivarse de las
-- propuestas. Guardamos el orden aquí para no perder el que ya eligieron los
-- 406 perfiles curados; NULL = ordenar por created_at.
ALTER TABLE song_proposals ADD COLUMN IF NOT EXISTS featured_order SMALLINT;

UPDATE song_proposals sp
SET featured_order = pfs.position
FROM profile_featured_songs pfs
WHERE pfs.source_type = 'proposal'
  AND pfs.proposal_id = sp.id
  AND sp.featured_order IS NULL;

-- 3. Conteo de slots ────────────────────────────────────────────────────────
-- Índice parcial: el gate de "¿ya llegó a 3?" corre en cada submit y en cada
-- petición de subida de MP3.
CREATE INDEX IF NOT EXISTS idx_proposals_live
  ON song_proposals(user_id)
  WHERE deleted_at IS NULL AND status IN ('pending', 'in_review');

-- 4. RLS: que el soft delete realmente oculte ───────────────────────────────
-- proposals_select_public_active se creó directo en Supabase (no está en
-- schema.sql). Sin este cambio una propuesta borrada sigue siendo legible por
-- cualquiera. Definición previa:
--   FOR SELECT USING (status = ANY (ARRAY['pending','in_review','accepted']::proposal_status[]))
DROP POLICY IF EXISTS proposals_select_public_active ON song_proposals;

CREATE POLICY proposals_select_public_active ON song_proposals
  FOR SELECT
  USING (
    deleted_at IS NULL
    AND status = ANY (ARRAY['pending'::proposal_status, 'in_review'::proposal_status, 'accepted'::proposal_status])
  );

COMMIT;

-- REVERT:
-- BEGIN;
-- DROP POLICY IF EXISTS proposals_select_public_active ON song_proposals;
-- CREATE POLICY proposals_select_public_active ON song_proposals
--   FOR SELECT
--   USING (status = ANY (ARRAY['pending'::proposal_status, 'in_review'::proposal_status, 'accepted'::proposal_status]));
-- DROP INDEX IF EXISTS idx_proposals_live;
-- ALTER TABLE song_proposals DROP COLUMN IF EXISTS featured_order;
-- ALTER TABLE song_proposals DROP COLUMN IF EXISTS deleted_at;
-- COMMIT;
