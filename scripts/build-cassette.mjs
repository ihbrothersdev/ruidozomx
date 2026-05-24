#!/usr/bin/env node
/**
 * build-cassette — concatenate a cassette's individual song MP3s into a
 * single continuous audio file, upload it to Supabase Storage, and record
 * the per-song offsets in the DB.
 *
 * Usage:
 *   npm run build-cassette <cassette_id>
 *   npm run build-cassette -- --active        (uses the currently active cassette)
 *
 * Requires:
 *   - ffmpeg + ffprobe in PATH  →  `brew install ffmpeg`
 *   - .env.local with:
 *       NEXT_PUBLIC_SUPABASE_URL
 *       SUPABASE_SERVICE_ROLE_KEY
 *
 * What this does (idempotent — safe to re-run on the same cassette):
 *   1. Fetches the cassette row and its songs (ordered by side, position).
 *   2. Downloads every song's MP3 to a temp directory.
 *   3. Probes each file's duration with ffprobe → builds the offsets table.
 *   4. Concatenates with the ffmpeg `concat` FILTER (not the demuxer) and
 *      re-encodes to one MP3 stream (libmp3lame, 256k CBR, 44.1 kHz,
 *      stereo). The filter is required because in practice the per-song
 *      uploads are a mix of formats (some MP3, some WAV masquerading with
 *      `.mp3` extension). The concat *demuxer* locks onto the first
 *      file's stream parameters and reads every subsequent file as if it
 *      were the same format — for our mixed bag that produces clean audio
 *      for song 1 and pure static for songs 2..N. The concat *filter*
 *      decodes each input independently in its native codec, normalises
 *      to stereo/44.1kHz, and only then glues the PCM streams together,
 *      so any combination of inputs works. Slower than the demuxer (more
 *      decoding work) but bulletproof.
 *   5. Uploads the result to `songs/cassettes/<cassette_id>.mp3`.
 *   6. Updates `cassettes.concat_audio_url` + `cassettes.song_offsets`.
 *   7. Cleans up the temp dir.
 *
 * Why this exists: the cassette player streams a single continuous file so
 * the browser handles song-to-song transitions natively. That survives
 * Chrome's tab freeze on Android (where JS stops running), unlike the
 * legacy mode where JS swaps `audio.src` on each `ended` event.
 */

import { createClient } from '@supabase/supabase-js'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// ────────────────────────────────────────────────────────────────────────────
// CLI args
// ────────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const useActive = args.includes('--active')
const cassetteIdArg = args.find(a => !a.startsWith('--'))

if (!useActive && !cassetteIdArg) {
  console.error('Usage: npm run build-cassette <cassette_id>')
  console.error('       npm run build-cassette -- --active')
  process.exit(1)
}

// ────────────────────────────────────────────────────────────────────────────
// Env
// ────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  console.error('The npm script loads .env.local automatically — make sure both are set there.')
  process.exit(1)
}

// Same bucket the individual song files already live in. Keeps everything
// under one public bucket so we inherit its existing read policy and don't
// have to provision a separate bucket / policy just for cassettes.
const STORAGE_BUCKET = 'songs'
const STORAGE_PREFIX = 'cassettes'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

/** Run a command, stream its output, resolve on success or reject on non-zero exit. */
function run(cmd, args, opts = {}) {
  return new Promise((resolveP, rejectP) => {
    const proc = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts })
    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', d => {
      stdout += d.toString()
    })
    proc.stderr.on('data', d => {
      stderr += d.toString()
    })
    proc.on('error', rejectP)
    proc.on('close', code => {
      if (code === 0) resolveP({ stdout, stderr })
      else rejectP(new Error(`${cmd} exited with code ${code}:\n${stderr}`))
    })
  })
}

/** Probe a file's duration in seconds (float) via ffprobe. */
async function probeDuration(filePath) {
  const { stdout } = await run('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    filePath
  ])
  const d = parseFloat(stdout.trim())
  if (!Number.isFinite(d) || d <= 0) {
    throw new Error(`ffprobe returned invalid duration for ${filePath}: "${stdout.trim()}"`)
  }
  return d
}

/** Assert ffmpeg + ffprobe are available before doing anything expensive. */
async function assertTooling() {
  try {
    await run('ffmpeg', ['-version'])
    await run('ffprobe', ['-version'])
  } catch {
    throw new Error('ffmpeg / ffprobe not found in PATH. Install with: brew install ffmpeg')
  }
}

/** Download a URL to a local file. */
async function downloadTo(url, filePath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(filePath, buf)
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  await assertTooling()

  // 1. Resolve cassette ──────────────────────────────────────────────────
  const cassetteQuery = supabase.from('cassettes').select('id, name, active').limit(1)
  const { data: cassetteRows, error: cErr } = await (useActive
    ? cassetteQuery.eq('active', true)
    : cassetteQuery.eq('id', cassetteIdArg))
  if (cErr) throw cErr
  const cassette = cassetteRows?.[0]
  if (!cassette) {
    throw new Error(useActive ? 'No active cassette found.' : `Cassette ${cassetteIdArg} not found.`)
  }
  console.log(`▶ Cassette: ${cassette.id} ${cassette.name ? `(${cassette.name})` : ''}`)

  // 2. Fetch songs ───────────────────────────────────────────────────────
  const { data: songs, error: sErr } = await supabase
    .from('songs')
    .select('id, title, artist, side, position, audio_url')
    .eq('cassette_id', cassette.id)
    .order('side', { ascending: true })
    .order('position', { ascending: true })
  if (sErr) throw sErr
  if (!songs || songs.length === 0) throw new Error('Cassette has no songs.')
  const missing = songs.filter(s => !s.audio_url)
  if (missing.length > 0) {
    throw new Error(`Songs without audio_url: ${missing.map(s => s.id).join(', ')}`)
  }
  console.log(`▶ ${songs.length} songs (side A + side B), in order`)

  // 3. Working dir ───────────────────────────────────────────────────────
  const workDir = await mkdtemp(join(tmpdir(), `rdz-cassette-${cassette.id}-`))
  console.log(`▶ Workdir: ${workDir}`)

  try {
    // 4. Download each song ──────────────────────────────────────────────
    const localPaths = []
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i]
      const localPath = join(workDir, `${String(i).padStart(3, '0')}-${song.id}.mp3`)
      console.log(`  ↓ [${i + 1}/${songs.length}] ${song.title} — ${song.artist}`)
      await downloadTo(song.audio_url, localPath)
      localPaths.push(localPath)
    }

    // 5. Probe durations + build offsets ─────────────────────────────────
    const offsets = []
    let cursor = 0
    for (let i = 0; i < songs.length; i++) {
      const duration = await probeDuration(localPaths[i])
      const start = Number(cursor.toFixed(2))
      const end = Number((cursor + duration).toFixed(2))
      offsets.push({ song_id: songs[i].id, start, end })
      cursor = end
    }
    console.log(`▶ Total duration: ${(cursor / 60).toFixed(2)} min`)

    // 6. Build filter_complex + run ffmpeg ───────────────────────────────
    // Concat *filter* (not demuxer). Each input file is decoded with its own
    // codec, normalised to stereo/44.1kHz via aformat, then all the PCM
    // streams are spliced by the concat filter. The encoder writes one
    // continuous MP3.
    //
    //   ffmpeg -i s0 -i s1 ... -filter_complex "
    //     [0:a]aformat=channel_layouts=stereo:sample_rates=44100[a0];
    //     [1:a]aformat=channel_layouts=stereo:sample_rates=44100[a1];
    //     ...
    //     [a0][a1]...concat=n=N:v=0:a=1[out]
    //   " -map "[out]" -c:a libmp3lame -b:a 256k out.mp3
    const N = localPaths.length
    const aformatChain = localPaths
      .map((_, i) => `[${i}:a]aformat=channel_layouts=stereo:sample_rates=44100[a${i}]`)
      .join(';')
    const concatInputs = localPaths.map((_, i) => `[a${i}]`).join('')
    const filterComplex = `${aformatChain};${concatInputs}concat=n=${N}:v=0:a=1[out]`

    const inputArgs = []
    for (const p of localPaths) inputArgs.push('-i', p)

    const outPath = join(workDir, `cassette-${cassette.id}.mp3`)
    console.log('▶ Running ffmpeg concat filter + re-encode to MP3 256k (this can take a few minutes)…')
    await run('ffmpeg', [
      '-y', // overwrite without prompt
      ...inputArgs,
      '-filter_complex',
      filterComplex,
      '-map',
      '[out]',
      '-c:a',
      'libmp3lame',
      '-b:a',
      '256k',
      outPath
    ])
    if (!existsSync(outPath)) throw new Error('ffmpeg did not produce the expected output.')

    // 7. Upload to Storage ───────────────────────────────────────────────
    const storagePath = `${STORAGE_PREFIX}/${cassette.id}.mp3`
    console.log(`▶ Uploading to storage: ${STORAGE_BUCKET}/${storagePath}`)
    const fileBuf = await (await import('node:fs/promises')).readFile(outPath)
    const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, fileBuf, {
      contentType: 'audio/mpeg',
      upsert: true,
      cacheControl: '3600'
    })
    if (upErr) throw upErr

    const {
      data: { publicUrl }
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)
    console.log(`▶ Public URL: ${publicUrl}`)

    // 8. Update DB ───────────────────────────────────────────────────────
    const { error: dbErr } = await supabase
      .from('cassettes')
      .update({ concat_audio_url: publicUrl, song_offsets: offsets })
      .eq('id', cassette.id)
    if (dbErr) throw dbErr
    console.log('▶ DB updated with concat_audio_url + song_offsets.')

    console.log('\n✓ Done. The player will use the concatenated file on the next request.')
    console.log('  To roll back: UPDATE cassettes SET concat_audio_url = NULL, song_offsets = NULL WHERE id = ...')
  } finally {
    await rm(workDir, { recursive: true, force: true })
  }
}

// Ensure scripts/ exists for relative ops (no-op if already there).
await mkdir(new URL('.', import.meta.url), { recursive: true })

main().catch(err => {
  console.error('\n✗ build-cassette failed:')
  console.error(err?.stack ?? err)
  process.exit(1)
})
