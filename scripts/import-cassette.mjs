// scripts/import-cassette.mjs
//
// Bulk-imports manually-curated songs into a cassette. Skips slots that are
// already filled (pass --replace to overwrite). Reads env from .env via dotenv.
//
// Usage:
//   node scripts/import-cassette.mjs            # uses TRACKS list below
//   node scripts/import-cassette.mjs --replace  # overwrites occupied slots
//
// Each TRACK is uploaded as:
//   songs/{cassetteId}/{slugify(artist)}-{slugify(title)}.{ext}
// and inserted in `songs` with artist_profile_id = null (text-only artist).

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { createReadStream, readFileSync, statSync } from 'node:fs'
import { extname } from 'node:path'
import * as tus from 'tus-js-client'

dotenv.config({ path: '.env' })

// ─── Configuration ──────────────────────────────────────────────────────────
const CASSETTE_ID = 'd2a52918-a9cf-43ef-8172-bfcb2f08b02d' // Cassette 2.0
const SONGS_BUCKET = 'songs'
const REPLACE = process.argv.includes('--replace')

const DL = '/Users/hugogonzalez/Downloads/ruidozo'

// Order on the cassette: A1 = CANIBAL (owner's request), the rest in Excel order
// skipping CANIBAL's original row #18. Titles match the Excel verbatim.
const TRACKS = [
  // ── Lado A ─────────────────────────────────────────────────────────────────
  {
    side: 'A',
    position: 1,
    artist: 'Edson Velandia',
    title: 'El Canibal',
    duration: '2:29',
    file: `${DL}/06 - El Karateka - Canibal.wav`
  },
  {
    side: 'A',
    position: 2,
    artist: 'Andy Mountains',
    title: 'Reyna Roja',
    duration: '4:16',
    file: `${DL}/REINA ROJA master 1.1.wav`
  },
  {
    side: 'A',
    position: 3,
    artist: 'Timoti la Motocasco',
    title: 'Desvanecer',
    duration: '5:15',
    file: `${DL}/Desvanecer - TLMC - MASTER B.wav`
  },
  {
    side: 'A',
    position: 4,
    artist: 'Ezpazmo',
    title: 'El último Almuerzo de Mike Labios',
    duration: '2:12',
    file: `${DL}/El último almuerzo de Mike Labios.wav`
  },
  {
    side: 'A',
    position: 5,
    artist: 'Carrion Kids',
    title: 'Santa Ursula',
    duration: '2:51',
    file: `${DL}/Santa Ursula Master 2025 +vol.wav`
  },
  {
    side: 'A',
    position: 6,
    artist: 'Rumba San Feroz',
    title: 'La Guapa',
    duration: '3:46',
    file: `${DL}/GUAPA_SOLO_RSF.mp3`
  },
  {
    side: 'A',
    position: 7,
    artist: 'Belafonte Sensacional',
    title: 'Lo Hice por el Punk',
    duration: '2:49',
    file: `${DL}/Lo Hice Por El Punk.mp3`
  },
  { side: 'A', position: 8, artist: 'CUAUH', title: 'Quémenme', duration: '3:00', file: `${DL}/QUEMENME .mp3` },
  { side: 'A', position: 9, artist: 'Axel Catalán', title: 'Marzo', duration: '2:52', file: `${DL}/Marzo.wav` },
  {
    side: 'A',
    position: 10,
    artist: 'Viridianos',
    title: 'Inky Shadow',
    duration: '5:37',
    file: `${DL}/1 Inky shadow.wav`
  },
  {
    side: 'A',
    position: 11,
    artist: 'Mixanteña de Santa Cecilia',
    title: 'Toro Chato',
    duration: '2:55',
    file: `${DL}/Toro chato_Mixantena de Santa Cecilia_Banda completa_mix_v1.wav`
  },
  {
    side: 'A',
    position: 12,
    artist: 'También Soy Leonarda',
    title: 'Silencio',
    duration: '3:05',
    file: `${DL}/silencio2.mp3`
  },
  { side: 'A', position: 13, artist: 'Buka', title: 'Álamo', duration: '2:35', file: `${DL}/06 Álamo.mp3` },
  // ── Lado B ─────────────────────────────────────────────────────────────────
  {
    side: 'B',
    position: 1,
    artist: 'Stereo Animal',
    title: 'Bailemos en la Hoguera',
    duration: '4:50',
    file: `${DL}/7.- Bailemos en la Hoguera.mp3`
  },
  {
    side: 'B',
    position: 2,
    artist: 'La Diabbla',
    title: 'Estilo Mexa',
    duration: '3:16',
    file: `${DL}/DIABBLA  - Estilo Mexa PROD. By Skong Lowkvida.wav`
  },
  {
    side: 'B',
    position: 3,
    artist: 'Expedición Humboldt',
    title: 'Todos Regresaremos',
    duration: '4:50',
    file: `${DL}/Todos Regresaremos.mp3`
  },
  {
    side: 'B',
    position: 4,
    artist: 'Niña Fatal',
    title: 'Progreso',
    duration: '3:07',
    file: `${DL}/Progreso_MPv3_080425_44-16.wav`
  },
  {
    side: 'B',
    position: 5,
    artist: 'Los Petardos',
    title: 'Azul',
    duration: '2:52',
    file: `${DL}/01 Azul Master [Diffusonix 2496] V3.5.wav`
  },
  {
    side: 'B',
    position: 6,
    artist: 'Jatun Mama',
    title: 'Cumbia Chiquito',
    duration: '3:27',
    file: `${DL}/06. Cumbia Chiquito 13.05.wav`
  },
  {
    side: 'B',
    position: 7,
    artist: 'Bakkers Trakkes',
    title: 'Atrévete',
    duration: '2:34',
    file: `${DL}/Atrévete_m_24bit.wav`
  },
  {
    side: 'B',
    position: 8,
    artist: 'Yasoli',
    title: 'Permisos',
    duration: '3:58',
    file: `${DL}/Permisos_Yasoli_Master_WAV.wav`
  },
  {
    side: 'B',
    position: 9,
    artist: 'Huarache',
    title: 'Que No te Haga Falta nah',
    duration: '3:24',
    file: `${DL}/No te hace falta nadaPM.mp3`
  },
  {
    side: 'B',
    position: 10,
    artist: 'Ultimos Nietos',
    title: 'Mala Estrella',
    duration: '4:28',
    file: `${DL}/05. Mala estrella.wav`
  },
  {
    side: 'B',
    position: 11,
    artist: 'Itawa',
    title: 'Más Allá deToda Distancia',
    duration: '3:44',
    file: `${DL}/itawa_mas_alla.wav`
  },
  {
    side: 'B',
    position: 12,
    artist: 'The Mantra',
    title: 'Vestido Rojo',
    duration: '3:33',
    file: `${DL}/vestido rojo mix 7 (2).wav`
  },
  {
    side: 'B',
    position: 13,
    artist: 'Bolsa de Moscas',
    title: 'Tengo Sed',
    duration: '2:56',
    file: `${DL}/Bolsa de Moscas - Tengo Sed.wav`
  }
].map(t => ({ ...t, genre: null }))

// ─── Helpers ────────────────────────────────────────────────────────────────
function slugify(input) {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function parseDuration(value) {
  if (!value) return null
  const m = String(value).match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}

const MIME = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4'
}

// Supabase recommends resumable (TUS) uploads for files > 6 MB. The regular
// `.upload()` POST is capped around ~50 MB even in Pro plans.
const TUS_THRESHOLD = 6 * 1024 * 1024

function fmtMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

/** Upload a file using the TUS resumable protocol to Supabase Storage. */
function uploadResumable({ url, serviceKey, bucket, key, file, contentType }) {
  return new Promise((resolve, reject) => {
    const fileStream = createReadStream(file)
    const fileSize = statSync(file).size
    const upload = new tus.Upload(fileStream, {
      endpoint: `${url}/storage/v1/upload/resumable`,
      retryDelays: [0, 1000, 3000, 5000],
      headers: {
        authorization: `Bearer ${serviceKey}`,
        'x-upsert': 'true'
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: bucket,
        objectName: key,
        contentType,
        cacheControl: '3600'
      },
      chunkSize: 6 * 1024 * 1024, // required by Supabase
      uploadSize: fileSize,
      onError: reject,
      onSuccess: () => resolve()
    })
    upload.start()
  })
}

// ─── Main ───────────────────────────────────────────────────────────────────
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

let inserted = 0
let skipped = 0
let failed = 0

for (const track of TRACKS) {
  const tag = `${track.side}${track.position} — ${track.artist} - ${track.title}`
  console.log(`\n→ ${tag}`)

  // 1. Verify file exists
  let size
  try {
    size = statSync(track.file).size
  } catch {
    console.error(`  ❌ File not found: ${track.file}`)
    failed++
    continue
  }

  // 2. Check if slot is occupied
  const { data: existing } = await supabase
    .from('songs')
    .select('id, title, artist')
    .eq('cassette_id', CASSETTE_ID)
    .eq('side', track.side)
    .eq('position', track.position)
    .maybeSingle()

  if (existing && !REPLACE) {
    console.log(
      `  ⏭   Slot already filled by "${existing.artist} - ${existing.title}". Skipping (use --replace to overwrite).`
    )
    skipped++
    continue
  }

  // 3. Upload to storage
  const ext = extname(track.file).slice(1).toLowerCase()
  const key = `${CASSETTE_ID}/${slugify(track.artist)}-${slugify(track.title)}.${ext}`
  const contentType = MIME[ext] ?? 'application/octet-stream'

  const useTus = size > TUS_THRESHOLD
  console.log(`  ↑ Uploading ${fmtMB(size)} → ${key} ${useTus ? '(resumable)' : ''}`)

  try {
    if (useTus) {
      await uploadResumable({
        url,
        serviceKey,
        bucket: SONGS_BUCKET,
        key,
        file: track.file,
        contentType
      })
    } else {
      const fileBuf = readFileSync(track.file)
      const { error: upErr } = await supabase.storage.from(SONGS_BUCKET).upload(key, fileBuf, {
        contentType,
        upsert: true,
        cacheControl: '3600'
      })
      if (upErr) throw upErr
    }
  } catch (err) {
    console.error(`  ❌ Upload failed: ${err?.message ?? err}`)
    failed++
    continue
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(SONGS_BUCKET).getPublicUrl(key)

  // 4. Insert or update row
  const row = {
    cassette_id: CASSETTE_ID,
    title: track.title,
    artist: track.artist,
    artist_profile_id: null,
    genre: track.genre,
    side: track.side,
    position: track.position,
    audio_url: publicUrl,
    duration_seconds: parseDuration(track.duration)
  }

  let dbErr
  if (existing && REPLACE) {
    const { error } = await supabase.from('songs').update(row).eq('id', existing.id)
    dbErr = error
  } else {
    const { error } = await supabase.from('songs').insert(row)
    dbErr = error
  }

  if (dbErr) {
    console.error(`  ❌ DB write failed: ${dbErr.message}`)
    await supabase.storage
      .from(SONGS_BUCKET)
      .remove([key])
      .catch(() => {})
    failed++
    continue
  }

  console.log(
    `  ✅ ${existing ? 'Updated' : 'Inserted'} at ${track.side}${track.position} · ${parseDuration(track.duration) ?? '?'}s`
  )
  inserted++
}

console.log(`\n──────────────────────────────`)
console.log(`✓ ${inserted} inserted/updated · ${skipped} skipped · ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
