#!/usr/bin/env node
/**
 * clean-orphan-audio — find (and optionally delete) audio files in the `songs`
 * Storage bucket that no DB row references anymore. SQL deletes (e.g. removing a
 * cassette) drop the rows but leave the bucket objects orphaned.
 *
 * Usage:
 *   node --env-file=.env scripts/clean-orphan-audio.mjs            (dry run)
 *   node --env-file=.env scripts/clean-orphan-audio.mjs --delete   (delete them)
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.
 *
 * Referenced = anything pointed at by songs.audio_url, cassettes.concat_audio_url
 * or song_proposals.audio_file_path. Everything else in the bucket is an orphan.
 * Dry run prints the list; review it before re-running with --delete.
 */

import { createClient } from '@supabase/supabase-js'

const BUCKET = 'songs'
const DELETE = process.argv.includes('--delete')

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}
const supabase = createClient(URL, KEY)

/** Pull the in-bucket path out of a public URL, or pass through a raw path. */
function toBucketPath(value) {
  if (!value) return null
  const marker = `/object/public/${BUCKET}/`
  const i = value.indexOf(marker)
  if (i !== -1) return decodeURIComponent(value.slice(i + marker.length))
  // Not a public URL — treat as a raw path, stripping a leading `songs/` if present.
  return value.replace(/^\/+/, '').replace(new RegExp(`^${BUCKET}/`), '')
}

async function collectReferenced() {
  const referenced = new Set()
  const add = v => {
    const p = toBucketPath(v)
    if (p) referenced.add(p)
  }
  const [{ data: songs }, { data: cassettes }, { data: proposals }] = await Promise.all([
    supabase.from('songs').select('audio_url'),
    supabase.from('cassettes').select('concat_audio_url'),
    supabase.from('song_proposals').select('audio_file_path')
  ])
  for (const s of songs ?? []) add(s.audio_url)
  for (const c of cassettes ?? []) add(c.concat_audio_url)
  for (const p of proposals ?? []) add(p.audio_file_path)
  return referenced
}

/** List every object in the bucket, recursing into folders (id === null). */
async function listAll(prefix = '') {
  const out = []
  const LIMIT = 100
  for (let offset = 0; ; offset += LIMIT) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: LIMIT, offset, sortBy: { column: 'name', order: 'asc' } })
    if (error) throw error
    if (!data?.length) break
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name
      if (item.id === null) out.push(...(await listAll(path)))
      else out.push({ path, size: item.metadata?.size ?? 0 })
    }
    if (data.length < LIMIT) break
  }
  return out
}

const referenced = await collectReferenced()
const all = await listAll()
const orphans = all.filter(o => !referenced.has(o.path))

const mb = bytes => (bytes / 1024 / 1024).toFixed(2)
console.log(`Bucket:            ${BUCKET}`)
console.log(`Referenced (DB):   ${referenced.size}`)
console.log(`Objects in bucket: ${all.length}`)
console.log(`Orphans:           ${orphans.length}  (${mb(orphans.reduce((a, o) => a + o.size, 0))} MB)`)
console.log('')
for (const o of orphans) console.log(`  ${o.path}  (${(o.size / 1024).toFixed(0)} KB)`)

// Safety net: an empty referenced set almost certainly means a parsing/connection
// bug, which would flag the entire bucket as orphaned. Never delete in that case.
if (DELETE && referenced.size === 0) {
  console.error('\nAborting: 0 referenced files — refusing to delete the whole bucket.')
  process.exit(1)
}

if (!DELETE) {
  console.log('\nDRY RUN — nothing deleted. Re-run with --delete to remove the above.')
  process.exit(0)
}

if (orphans.length === 0) {
  console.log('\nNothing to delete.')
  process.exit(0)
}

for (let i = 0; i < orphans.length; i += 100) {
  const batch = orphans.slice(i, i + 100).map(o => o.path)
  const { error } = await supabase.storage.from(BUCKET).remove(batch)
  if (error) throw error
  console.log(`Deleted ${Math.min(i + 100, orphans.length)}/${orphans.length}`)
}
console.log('Done.')
