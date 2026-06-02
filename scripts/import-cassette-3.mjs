// scripts/import-cassette-3.mjs
//
// Imports the 27 Cassette 3 songs from ~/Downloads/songs into Cassette 3.
//   - Uploads each file to Storage (songs/{cassetteId}/{slug(artist)}-{slug(title)}.{ext})
//   - Inserts into `songs` with side/position, ffprobe duration, and
//     artist_profile_id when a band profile exists.
//   - Confirms the matching pending proposal (status -> 'accepted', links
//     cassette_id + song.proposal_id) ONLY for songs whose proposal title matches.
//
// SAFE BY DEFAULT: runs in --dry-run mode (reads only, prints the full plan).
// Pass --commit to actually upload/insert/confirm. --replace overwrites slots.
//
// Requires ffprobe in PATH and .env with Supabase keys (npm loads it).

import { createClient } from '@supabase/supabase-js'
import { spawn } from 'node:child_process'
import { createReadStream, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import * as tus from 'tus-js-client'

const CASSETTE_ID = '00e7ca46-34cf-4241-b7e1-3a7abd9865e5' // Cassete 3.0
const SONGS_BUCKET = 'songs'
const DL = '/Users/hugogonzalez/Downloads/songs'

const COMMIT = process.argv.includes('--commit')
const REPLACE = process.argv.includes('--replace')

// Each track: side/position, normalized artist+title (what goes in the DB),
// the original Excel text (for the verification table), and `match`: an
// ASCII-safe substring used to locate the file in DL (filenames are messy /
// have odd accent encodings, so we match on a safe token, case-insensitive).
const TRACKS = [
  // ── Lado A (14) ──────────────────────────────────────────────
  {
    side: 'A',
    position: 1,
    artist: 'ACTY',
    title: 'Escena Nacional',
    orig: 'ACTY — Escena Nacional',
    match: 'acty escena'
  },
  {
    side: 'A',
    position: 2,
    artist: 'Geo Equihua',
    title: 'Tráfico y Clima',
    orig: 'Geo Equihua — Tráfico y clima',
    match: 'clima'
  },
  {
    side: 'A',
    position: 3,
    artist: 'Mau Gatiyo',
    title: 'El Chiflón del Caribe',
    orig: 'Mau Gatiyo — El Chiflón del Caribe',
    match: 'chiflon'
  },
  {
    side: 'A',
    position: 4,
    artist: 'Cuerdas Muertas',
    title: 'Drogados y Descalzos',
    orig: 'Cuerdas Muertas — Drogados y Descalzos',
    match: 'drogados'
  },
  {
    side: 'A',
    position: 5,
    artist: 'Gonzalo Montero',
    title: 'Lento',
    orig: 'Gonzalo Montero — Lento',
    match: 'lento'
  },
  {
    side: 'A',
    position: 6,
    artist: 'Los Honey Rockets',
    title: 'No Te Corresponde',
    orig: 'Los Honey Rockets — No te Corresponde',
    match: 'corresponde'
  },
  {
    side: 'A',
    position: 7,
    artist: 'Lucas Jesús',
    title: 'Sin Salida',
    orig: 'Lucas Jesús — Sin Salida',
    match: 'sin salida'
  },
  {
    side: 'A',
    position: 8,
    artist: 'Lalo Enríquez',
    title: 'El Rehilete',
    orig: 'Lalo Enríquez — El Rehilete',
    match: 'rehilete'
  },
  {
    side: 'A',
    position: 9,
    artist: 'Hey California',
    title: 'Nepakartojama',
    orig: 'Hey California — Nepakartojama',
    match: 'kartohama'
  },
  {
    side: 'A',
    position: 10,
    artist: 'Fátima Foronda',
    title: 'Brilla la Conciencia',
    orig: 'Fátima foronda — Brilla Conciencia',
    match: 'brilla'
  },
  { side: 'A', position: 11, artist: 'Espanglish', title: 'Como Tú', orig: 'Espanglish — Como Tú', match: 'como tu' },
  {
    side: 'A',
    position: 12,
    artist: 'Viernes de Hongos',
    title: 'Cordyceps',
    orig: 'Viernes de Hongos — Cordyceps',
    match: 'cordyceps'
  },
  {
    side: 'A',
    position: 13,
    artist: 'Ages y Usko',
    title: 'Deja Ahí',
    orig: 'Ages y Usko — Deja Ahí',
    match: 'deja ahi'
  },
  {
    side: 'A',
    position: 14,
    artist: 'Nosoyo',
    title: 'Desierto de los Leones (Nada es Cierto)',
    orig: 'Nosoyo — Desierto de lo Leónes (Nada es cierto)',
    match: 'desierto'
  },
  // ── Lado B (13) ──────────────────────────────────────────────
  {
    side: 'B',
    position: 1,
    artist: 'Brokentear',
    title: 'Días sin Salir',
    orig: 'Brokentear — Días sin Salir',
    match: 'brokentear'
  },
  { side: 'B', position: 2, artist: 'SoulMara', title: 'DLV', orig: 'SoulMara — DLV', match: 'dlv' },
  {
    side: 'B',
    position: 3,
    artist: 'Don Couto ft. Maryta de Humahuaca',
    title: 'Negrita',
    orig: 'Don Couto ft. Maryta de Humahuaca — Negrita',
    match: 'negrita'
  },
  {
    side: 'B',
    position: 4,
    artist: 'Gallos Charros',
    title: 'La Vida es Fácil',
    orig: 'Gallos Charros — La Vida es Fácil',
    match: 'la vida'
  },
  {
    side: 'B',
    position: 5,
    artist: 'Michel Canavati',
    title: 'Monterrey Wey',
    orig: 'Michel Canavati — Monterresy Wey',
    match: 'monterrey'
  },
  {
    side: 'B',
    position: 6,
    artist: 'Pata de Alacrán',
    title: 'Sinatra',
    orig: 'Pata de Alacrán — Sinatra',
    match: 'sinatra'
  },
  {
    side: 'B',
    position: 7,
    artist: 'Ay Gregorio!',
    title: 'Soy Tu Piñata',
    orig: 'Ay Gregorio! — Soy tu Piñata',
    match: 'soy tu'
  },
  {
    side: 'B',
    position: 8,
    artist: 'Los Hidalgo',
    title: 'Sueño Infinito',
    orig: 'Los Hidalgo — Sueño Infinito',
    match: 'infinito'
  },
  {
    side: 'B',
    position: 9,
    artist: 'Pinche Toro',
    title: 'Tirando Crema',
    orig: 'Pinche Toro — Tirando Crema',
    match: 'tirando'
  },
  {
    side: 'B',
    position: 10,
    artist: 'Alegría Malasuerte',
    title: 'Outro: Todo y Nada',
    orig: 'Alegría Malasuerte — Outro: Todo Y nada',
    match: 'todo y nada'
  },
  {
    side: 'B',
    position: 11,
    artist: 'Satán es Real',
    title: 'El Día Que No Te Diga (Lo Que Siento Por Ti)',
    orig: 'Satán es Real — El Día Que No Te Diga (...)',
    match: 'siento por ti'
  },
  {
    side: 'B',
    position: 12,
    artist: 'Los Salvajes Tristes',
    title: 'Deseo',
    orig: 'Los Salvajes Tristes — Deseo',
    match: 'deseo'
  },
  {
    side: 'B',
    position: 13,
    artist: 'Vinilika',
    title: 'Maquillada',
    orig: 'Vinilika — Maquillada',
    match: 'maquillada'
  }
]

// ─── Helpers ──────────────────────────────────────────────────────────────
function slugify(input) {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Find the file in DL matching `sub` (ASCII substring, case-insensitive).
 *  De-dupes copies like "name (1).wav" by preferring the basename without "(". */
function findFile(sub, allFiles) {
  const hits = allFiles.filter(f => f.normalize('NFC').toLowerCase().includes(sub))
  if (hits.length === 0) return { file: null, dupes: [] }
  const clean = hits.filter(f => !/\(\d+\)\.[a-z0-9]+$/i.test(f))
  const chosen = (clean.length ? clean : hits).sort((a, b) => a.length - b.length)[0]
  return { file: chosen, dupes: hits.filter(f => f !== chosen) }
}

function run(cmd, args) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let out = '',
      err = ''
    p.stdout.on('data', d => (out += d))
    p.stderr.on('data', d => (err += d))
    p.on('error', rej)
    p.on('close', c => (c === 0 ? res(out) : rej(new Error(err))))
  })
}
async function probeDuration(file) {
  try {
    const out = await run('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      file
    ])
    const d = parseFloat(out.trim())
    return Number.isFinite(d) && d > 0 ? Math.round(d) : null
  } catch {
    return null
  }
}
const fmt = s => (s == null ? '—' : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`)

const MIME = { mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', flac: 'audio/flac' }
const TUS_THRESHOLD = 6 * 1024 * 1024
function uploadResumable({ url, serviceKey, key, file, contentType }) {
  return new Promise((resolve, reject) => {
    const up = new tus.Upload(createReadStream(file), {
      endpoint: `${url}/storage/v1/upload/resumable`,
      retryDelays: [0, 1000, 3000, 5000],
      headers: { authorization: `Bearer ${serviceKey}`, 'x-upsert': 'true' },
      uploadDataDuringCreation: true,
      metadata: { bucketName: SONGS_BUCKET, objectName: key, contentType, cacheControl: '3600' },
      chunkSize: 6 * 1024 * 1024,
      uploadSize: statSync(file).size,
      onError: reject,
      onSuccess: () => resolve()
    })
    up.start()
  })
}

// ─── Main ───────────────────────────────────────────────────────────────────
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).')
  process.exit(1)
}
const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

const allFiles = readdirSync(DL).filter(f => /\.(mp3|wav|m4a|flac)$/i.test(f))
console.log(
  `\n${COMMIT ? '🚀 COMMIT' : '🔎 DRY-RUN (no writes)'} · ${TRACKS.length} tracks · ${allFiles.length} audio files in ${DL}\n`
)

// Load proposals + profiles once and match in-memory with accent-insensitive
// normalization. Postgres ILIKE is accent-sensitive (missed "Fátima", "Alacrán"…)
// and substring matching collided on tokens like "los" inside "gallos".
const norm = x =>
  String(x || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
const { data: allProps } = await supabase
  .from('song_proposals')
  .select('id, title, artist, status, user_id')
  .eq('status', 'pending')
const { data: allProfiles } = await supabase.from('profiles').select('id, display_name, slug, role, active')
const profById = new Map((allProfiles || []).map(p => [p.id, p]))
const PROPS = (allProps || []).map(p => ({ ...p, nt: norm(p.title), na: norm(p.artist) }))
const BANDAS = (allProfiles || [])
  .filter(p => p.role === 'banda' && p.active)
  .map(p => ({ ...p, nd: norm(p.display_name) }))

// Guarded name match: exact normalized, else one fully contains the other (length-guarded
// so short tokens can't collide). Used only when there's no proposal account to trust.
function matchProfileByName(artist) {
  const na = norm(artist)
  return (
    BANDAS.find(p => p.nd === na) ||
    BANDAS.find(p => p.nd.length > 4 && na.length > 4 && (p.nd.includes(na) || na.includes(p.nd))) ||
    null
  )
}

const plan = []
for (const t of TRACKS) {
  const { file, dupes } = findFile(t.match, allFiles)
  const fullPath = file ? join(DL, file) : null
  const duration = fullPath ? await probeDuration(fullPath) : null

  // proposal = same TITLE (reliable key; bands wrote their name inconsistently:
  // AGEZ→Ages y Usko, Nosoyyo→Nosoyo, PincheToro→Pinche Toro).
  const nt = norm(t.title)
  const proposal =
    PROPS.find(p => p.nt === nt) ||
    PROPS.find(p => nt.length > 5 && p.nt.length > 4 && (p.nt.includes(nt) || nt.includes(p.nt))) ||
    null

  // profile: prefer the account behind a proposal by this artist (gold —
  // spelling/accent-proof), then a guarded name match.
  const na = norm(t.artist)
  const accountOf = uid => {
    const p = profById.get(uid)
    return p && p.role === 'banda' ? p : null
  }
  // any proposal by the same artist (the matched one, or another song they sent)
  const artistProp =
    proposal ||
    PROPS.find(p => p.na === na || (p.na.length > 4 && na.length > 4 && (p.na.includes(na) || na.includes(p.na)))) ||
    null
  let profile = null
  let via = null
  if (artistProp) {
    profile = accountOf(artistProp.user_id)
    if (profile) via = artistProp === proposal ? 'cuenta' : 'cuenta-artista'
  }
  if (!profile) {
    const m = matchProfileByName(t.artist)
    if (m) {
      profile = m
      via = 'nombre'
    }
  }

  // Display only: did this artist propose a DIFFERENT song?
  const otherProp = !proposal ? artistProp : null

  plan.push({ t, file, dupes, duration, profile, via, proposal, otherProp })
}

// ─── Print verification table ────────────────────────────────────────────────
console.log(
  '  #   POS   ARTIST / TITLE                         FILE                    DUR    PERFIL            PROPUESTA'
)
console.log('  ' + '─'.repeat(120))
let nFile = 0,
  nProf = 0,
  nConfirm = 0
const warnings = []
for (let i = 0; i < plan.length; i++) {
  const { t, file, dupes, duration, profile, via, proposal, otherProp } = plan[i]
  const pos = `${t.side}${t.position}`
  if (file) nFile++
  else warnings.push(`✗ #${i + 1} ${t.artist} — sin archivo (match "${t.match}")`)
  if (profile) nProf++
  const profTag = profile ? `@${profile.slug}${via === 'nombre' ? '·nom' : ''}` : '— ninguno'
  let propTag
  if (proposal) {
    propTag = '✓ confirmar'
    if (norm(proposal.artist) !== norm(t.artist)) propTag += ` (propuso como "${proposal.artist.trim()}")`
    nConfirm++
  } else if (otherProp) propTag = `⚠ propuso otra: "${otherProp.title}"`
  else propTag = '— sin propuesta'
  console.log(
    `  ${String(i + 1).padStart(2)}  ${pos.padEnd(4)}  ${(t.artist + ' / ' + t.title).slice(0, 38).padEnd(38)}  ${(file || '✗ NO FILE').slice(0, 22).padEnd(22)}  ${fmt(duration).padStart(5)}  ${profTag.padEnd(18)}  ${propTag}`
  )
  if (profile && norm(profile.display_name) !== norm(t.artist))
    warnings.push(
      `• #${i + 1} ${t.artist}: perfil ligado @${profile.slug} (display "${profile.display_name.trim()}", via ${via})`
    )
  if (dupes.length) warnings.push(`• #${i + 1} ${t.artist}: ignoro ${dupes.length} copia(s): ${dupes.join(', ')}`)
  if (duration == null && file) warnings.push(`• #${i + 1} ${t.artist}: ffprobe no sacó duración`)
}

const totalDur = plan.reduce((a, p) => a + (p.duration || 0), 0)
console.log('  ' + '─'.repeat(120))
console.log(
  `\n  Archivos: ${nFile}/${TRACKS.length} · Perfiles: ${nProf}/${TRACKS.length} · Propuestas a confirmar: ${nConfirm}`
)
console.log(
  `  Duración total: ${fmt(totalDur)}  (Lado A: ${fmt(plan.filter(p => p.t.side === 'A').reduce((a, p) => a + (p.duration || 0), 0))} · Lado B: ${fmt(plan.filter(p => p.t.side === 'B').reduce((a, p) => a + (p.duration || 0), 0))})`
)
if (warnings.length) {
  console.log('\n  AVISOS:')
  for (const w of warnings) console.log('   ' + w)
}

if (!COMMIT) {
  console.log('\n  (dry-run — nada se subió ni se escribió. Corre con --commit para ejecutar.)\n')
  process.exit(0)
}

// ─── COMMIT path ──────────────────────────────────────────────────────────────
console.log('\n🚀 Ejecutando…\n')
let done = 0,
  skip = 0,
  fail = 0
for (let i = 0; i < plan.length; i++) {
  const { t, file, duration, profile, proposal } = plan[i]
  const tag = `${t.side}${t.position} ${t.artist} — ${t.title}`
  if (!file) {
    console.error(`  ✗ ${tag}: sin archivo`)
    fail++
    continue
  }

  const { data: existing } = await supabase
    .from('songs')
    .select('id')
    .eq('cassette_id', CASSETTE_ID)
    .eq('side', t.side)
    .eq('position', t.position)
    .maybeSingle()
  if (existing && !REPLACE) {
    console.log(`  ⏭  ${tag}: slot ocupado (usa --replace)`)
    skip++
    continue
  }

  const ext = extname(file).slice(1).toLowerCase()
  const key = `${CASSETTE_ID}/${slugify(t.artist)}-${slugify(t.title)}.${ext}`
  const contentType = MIME[ext] ?? 'application/octet-stream'
  const full = join(DL, file)
  const size = statSync(full).size
  try {
    if (size > TUS_THRESHOLD) await uploadResumable({ url, serviceKey, key, file: full, contentType })
    else {
      const { error } = await supabase.storage
        .from(SONGS_BUCKET)
        .upload(key, readFileSync(full), { contentType, upsert: true, cacheControl: '3600' })
      if (error) throw error
    }
  } catch (e) {
    console.error(`  ✗ ${tag}: upload falló — ${e.message}`)
    fail++
    continue
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(SONGS_BUCKET).getPublicUrl(key)
  const row = {
    cassette_id: CASSETTE_ID,
    title: t.title,
    artist: t.artist,
    artist_profile_id: profile?.id ?? null,
    genre: null,
    side: t.side,
    position: t.position,
    audio_url: publicUrl,
    duration_seconds: duration
  }

  let songId
  if (existing && REPLACE) {
    const { error } = await supabase.from('songs').update(row).eq('id', existing.id)
    if (error) {
      console.error(`  ✗ ${tag}: ${error.message}`)
      fail++
      continue
    }
    songId = existing.id
  } else {
    const { data, error } = await supabase.from('songs').insert(row).select('id').single()
    if (error) {
      console.error(`  ✗ ${tag}: ${error.message}`)
      fail++
      continue
    }
    songId = data.id
  }

  // Confirm matching proposal -> accepted (requires enum to have 'accepted')
  if (proposal) {
    const { error: pe } = await supabase
      .from('song_proposals')
      .update({ status: 'accepted', cassette_id: CASSETTE_ID })
      .eq('id', proposal.id)
    if (pe) console.error(`     ⚠ no pude confirmar propuesta ${proposal.id}: ${pe.message}`)
    else await supabase.from('songs').update({ proposal_id: proposal.id }).eq('id', songId)
  }
  console.log(`  ✅ ${tag}${profile ? ' · perfil ✓' : ''}${proposal ? ' · confirmada ✓' : ''}`)
  done++
}
console.log(`\n──────────\n✓ ${done} subidas · ${skip} saltadas · ${fail} fallidas\n`)
process.exit(fail > 0 ? 1 : 0)
