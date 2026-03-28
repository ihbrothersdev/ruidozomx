// === Player (client-side state) ===

export interface PlayerSong {
  id: string
  title: string
  artist: string
  side: 'A' | 'B'
  position: number
  durationSeconds: number
  audioSrc: string
}

export interface PlayerState {
  currentSongId: string
  currentSide: 'A' | 'B'
  elapsedSeconds: number
  isPlaying: boolean
  date: string
}

// === Registration & Roles ===

export const ROLES = ['banda', 'fan', 'manager', 'agente', 'promotor', 'proveedor', 'venue'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  fan: 'Fan/Público',
  banda: 'Banda/Solista',
  manager: 'Manager',
  agente: 'Agente',
  promotor: 'Promotor',
  proveedor: 'Proveedor',
  venue: 'Venue/Foro'
}

export type RegistrationSource = 'propon_rola' | 'registro'

/** Base profile stored in `profiles` table */
export interface Profile {
  id: string
  role: Role
  display_name: string
  slug: string
  photo_url: string | null
  contact: string | null
  country: string | null
  state: string | null
  city: string | null
  bio: string | null
  social_links: Record<string, string>
  registration_source: RegistrationSource
  onboarding_complete: boolean
  verified: boolean
  active: boolean
  created_at: string
  updated_at: string
}

/** Banda / Solista details — band_profiles table (v2) */
export interface BandaProfile {
  profile_id: string
  project_type: string | null
  genre: string | null
  available_live: boolean
  open_collabs: boolean
  available_tours: boolean
  willing_travel: boolean
  publish_dates: boolean
  accept_proposals: boolean
}

/** Fan o Público details */
export interface FanProfile {
  profile_id: string
  alias: string
  favorite_genres: string[]
  notify_new_bands: boolean
  propose_fav_bands: boolean
}

/** Predefined genre options for Fan form */
export const FAN_GENRE_OPTIONS = [
  'Rock',
  'Pop',
  'Hip Hop/Rap',
  'Reggae / Ska',
  'Metal',
  'Punk / Hardcore',
  'Electrónica',
  'Folk/Acústico',
  'Indie',
  'Alternativo',
  'Regional/Fusión',
  'Experimental',
  'Instrumental',
  'Latino Urbano',
  'Jazz & Blue'
] as const

/** Industry profile — shared by manager, promotor, agente (industry_profiles table v2) */
export interface IndustryProfile {
  profile_id: string
  // Manager
  represents_artists: boolean
  artists_represented: string | null
  seeks_emerging_talent: boolean
  promote_bands_ruidozo: boolean
  // Promotor
  organizes_events: boolean
  event_types: string[]
  provide_events_ruidozo: boolean
  seeks_talent: boolean
  // Agente
  represents_artists_live: boolean
  seeks_new_projects: boolean
  // Promotor + Agente
  territorial_reach: string[]
  // All three
  accept_proposals: boolean
}

/** Proveedor details — provider_profiles table (v2) */
export interface ProveedorProfile {
  profile_id: string
  service_types: string[]
  territorial_reach: string[]
  works_emerging_projects: boolean
  publish_services: boolean
  accept_proposals: boolean
}

/** Venue / Foro details — venue_profiles table (v2) */
export interface VenueProfile {
  profile_id: string
  capacity: string | null
  venue_type: string[]
  has_audio: boolean
  has_lighting: boolean
  accepts_indie_proposals: boolean
  publish_calls_ruidozo: boolean
}

/** User-to-user proposal — user_proposals table (v2) */
export type UserProposalType = 'booking' | 'representation' | 'service' | 'collab' | 'event_invite' | 'general'
export type UserProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'

export interface UserProposal {
  id: string
  from_profile_id: string
  to_profile_id: string
  type: UserProposalType
  subject: string | null
  message: string | null
  status: UserProposalStatus
  seen_at: string | null
  responded_at: string | null
  created_at: string
}

export const TERRITORIAL_REACH_OPTIONS = ['Local', 'Nacional', 'Internacional'] as const

export const SERVICE_TYPE_OPTIONS = [
  'Audio',
  'Iluminación',
  'Producción',
  'Diseño',
  'Merch',
  'Prensa',
  'Booking',
  'Video',
  'Fotografía',
  'Otro'
] as const

export const EVENT_TYPE_OPTIONS = ['Shows locales', 'Circuitos', 'Festivales', 'Giras', 'Otro'] as const

export const CAPACITY_OPTIONS = ['0-100', '100-300', '300-600', '600+'] as const

export const VENUE_TYPE_OPTIONS = [
  'Foro independiente',
  'Bar con música en vivo',
  'Espacio cultural',
  'Foro alternativo'
] as const

// === Cassettes & Songs (DB) ===

export interface Cassette {
  id: string
  name: string | null
  start_date: string
  end_date: string
  duration_minutes: number
  curator_id: string | null
  curator_name: string | null
  cover_image_url: string | null
  active: boolean
  archived: boolean
  total_plays: number
  created_at: string
  updated_at: string
}

export interface Song {
  id: string
  cassette_id: string
  title: string
  artist: string
  genre: string | null
  duration_seconds: number | null
  side: 'A' | 'B'
  position: number
  audio_url: string | null
  proposal_id: string | null
  plays: number
  created_at: string
}

// === Events ===

export type EventStatus = 'draft' | 'published' | 'cancelled'

export interface Event {
  id: string
  profile_id: string
  title: string
  description: string | null
  event_date: string
  event_end_date: string | null
  venue_name: string | null
  venue_profile_id: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  event_type: string | null
  external_link: string | null
  cover_image_url: string | null
  status: EventStatus
  created_at: string
  updated_at: string
}

// === Song Proposals ===

export type ProposalStatus = 'pending' | 'in_review' | 'selected' | 'rejected'

export interface SongProposal {
  id: string
  user_id: string
  title: string
  artist: string
  genre: string | null
  external_link: string | null
  audio_file_path: string | null
  comment: string | null
  status: ProposalStatus
  cassette_id: string | null
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

// === Interests ===

export interface Interest {
  id: string
  from_profile_id: string
  to_profile_id: string
  message: string | null
  created_at: string
}

// === Activity Feed ===

export type ActivityType =
  | 'registration'
  | 'interest'
  | 'proposal'
  | 'user_proposal'
  | 'song_selected'
  | 'event_published'

export interface ActivityFeedItem {
  id: string
  type: ActivityType
  profile_id: string | null
  profile_name: string | null
  profile_role: Role | null
  metadata: Record<string, unknown>
  visible: boolean
  created_at: string
}
