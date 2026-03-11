# Ruidozo MX — Database Schema

> Supabase (PostgreSQL). Profile tables use a **normalized** approach: one base `profiles`
> table with shared fields, plus one detail table per role.

---

## Enums

| Enum              | Values                                                                |
| ----------------- | --------------------------------------------------------------------- |
| `profile_role`    | `fan`, `banda`, `manager`, `agente`, `promotor`, `proveedor`, `venue`        |
| `proposal_status` | `pending`, `in_review`, `selected`, `rejected`                               |
| `cassette_side`   | `A`, `B`                                                                     |
| `activity_type`   | `registration`, `interest`, `proposal`, `song_selected`, `event_published`   |
| `event_status`    | `draft`, `published`, `cancelled`                                            |

> Role enum values (`banda`, `agente`, `promotor`, `proveedor`) are kept as identifiers
> used across routing and component mapping. All other schema elements are in English.

---

## `profiles`

Base table for all users. Every role shares these common fields.

| Column              | Type         | Nullable | Default  | Notes                                         |
| ------------------- | ------------ | -------- | -------- | --------------------------------------------- |
| id                  | uuid (PK)    | no       |          | References `auth.users(id)` ON DELETE CASCADE |
| role                | profile_role | no       |          |                                               |
| display_name        | varchar(100) | no       |          |                                               |
| slug                | varchar(100) | no       |          | UNIQUE — URL-friendly `/perfil/los-aguas`     |
| photo_url           | text         | yes      |          |                                               |
| phone               | varchar(20)  | yes      |          |                                               |
| contact_email       | varchar(255) | yes      |          | Public contact email (not auth email)         |
| country             | varchar(100) | yes      | 'México' |                                               |
| state               | varchar(100) | yes      |          |                                               |
| city                | varchar(100) | yes      |          |                                               |
| bio                 | text         | yes      |          |                                               |
| social_links        | jsonb        | yes      | '{}'     | `{ instagram: "…", facebook: "…" }`           |
| registration_source | text         | no       |          | `'registro'` or `'propon_rola'`               |
| onboarding_complete | boolean      | no       | false    |                                               |
| verified            | boolean      | no       | false    | Admin-verified badge                          |
| active              | boolean      | no       | true     | Soft-delete / deactivation                    |
| created_at          | timestamptz  | no       | now()    |                                               |
| updated_at          | timestamptz  | no       | now()    |                                               |

**Indexes**: `role`, `city` (slug already has implicit unique index from constraint)

---

## `band_profiles`

| Column           | Type          | Nullable | Default | Notes                                       |
| ---------------- | ------------- | -------- | ------- | ------------------------------------------- |
| profile_id       | uuid (PK, FK) | no       |         | References `profiles(id)` ON DELETE CASCADE |
| band_name        | varchar(200)  | no       |         |                                             |
| project_type     | varchar(50)   | yes      |         | Banda / Solista / Banda o Solista           |
| genre            | varchar(100)  | yes      |         |                                             |
| project_link     | text          | yes      |         |                                             |
| available_live   | boolean       | no       | false   |                                             |
| open_collabs     | boolean       | no       | false   |                                             |
| available_tours  | boolean       | no       | false   |                                             |
| willing_travel   | boolean       | no       | false   |                                             |
| review           | text          | yes      |         | Max 600 chars                               |
| publish_dates    | boolean       | no       | false   |                                             |
| accept_proposals | boolean       | no       | false   |                                             |
| contact          | text          | yes      |         |                                             |

---

## `fan_profiles`

| Column            | Type          | Nullable | Default | Notes                                       |
| ----------------- | ------------- | -------- | ------- | ------------------------------------------- |
| profile_id        | uuid (PK, FK) | no       |         | References `profiles(id)` ON DELETE CASCADE |
| alias             | varchar(100)  | no       |         |                                             |
| favorite_genres   | text[]        | no       | '{}'    | 1–3 values                                  |
| notify_new_bands  | boolean       | no       | false   |                                             |
| propose_fav_bands | boolean       | no       | false   |                                             |

---

## `manager_profiles`

| Column                | Type          | Nullable | Default | Notes                                       |
| --------------------- | ------------- | -------- | ------- | ------------------------------------------- |
| profile_id            | uuid (PK, FK) | no       |         | References `profiles(id)` ON DELETE CASCADE |
| full_name             | varchar(200)  | no       |         |                                             |
| web_link              | text          | yes      |         |                                             |
| role_type             | varchar(20)   | no       |         | Always `'manager'`                          |
| review                | text          | yes      |         | Max 600 chars                               |
| represents_artists    | boolean       | no       | false   |                                             |
| artists_represented   | text          | yes      |         |                                             |
| promote_bands_ruidozo | boolean       | no       | false   |                                             |
| seeks_emerging_talent | boolean       | no       | false   |                                             |
| accept_proposals      | boolean       | no       | false   |                                             |
| contact               | text          | yes      |         |                                             |

---

## `promoter_profiles`

| Column                 | Type          | Nullable | Default | Notes                                             |
| ---------------------- | ------------- | -------- | ------- | ------------------------------------------------- |
| profile_id             | uuid (PK, FK) | no       |         | References `profiles(id)` ON DELETE CASCADE       |
| full_name              | varchar(200)  | no       |         |                                                   |
| web_link               | text          | yes      |         |                                                   |
| role_type              | varchar(20)   | no       |         | Always `'promotor'`                               |
| review                 | text          | yes      |         | Max 600 chars                                     |
| organizes_events       | boolean       | no       | false   |                                                   |
| territorial_reach      | text[]        | no       | '{}'    | Local, Nacional, Internacional                    |
| event_types            | text[]        | no       | '{}'    | Shows locales, Circuitos, Festivales, Giras, Otro |
| provide_events_ruidozo | boolean       | no       | false   |                                                   |
| seeks_talent           | boolean       | no       | false   |                                                   |
| accept_proposals       | boolean       | no       | false   |                                                   |
| contact                | text          | yes      |         |                                                   |

---

## `agent_profiles`

| Column                  | Type          | Nullable | Default | Notes                                       |
| ----------------------- | ------------- | -------- | ------- | ------------------------------------------- |
| profile_id              | uuid (PK, FK) | no       |         | References `profiles(id)` ON DELETE CASCADE |
| full_name               | varchar(200)  | no       |         |                                             |
| web_link                | text          | yes      |         |                                             |
| role_type               | varchar(20)   | no       |         | Always `'agente'`                           |
| review                  | text          | yes      |         | Max 600 chars                               |
| represents_artists_live | boolean       | no       | false   |                                             |
| territorial_reach       | text[]        | no       | '{}'    | Local, Nacional, Internacional              |
| provide_events_ruidozo  | boolean       | no       | false   |                                             |
| seeks_new_projects      | boolean       | no       | false   |                                             |
| accept_proposals        | boolean       | no       | false   |                                             |
| contact                 | text          | yes      |         |                                             |

---

## `provider_profiles`

| Column                  | Type          | Nullable | Default | Notes                                                                                   |
| ----------------------- | ------------- | -------- | ------- | --------------------------------------------------------------------------------------- |
| profile_id              | uuid (PK, FK) | no       |         | References `profiles(id)` ON DELETE CASCADE                                             |
| brand_name              | varchar(200)  | no       |         |                                                                                         |
| web_link                | text          | yes      |         |                                                                                         |
| description             | text          | yes      |         | Max 600 chars                                                                           |
| territorial_reach       | text[]        | no       | '{}'    | Local, Nacional, Internacional                                                          |
| service_types           | text[]        | no       | '{}'    | Audio, Iluminación, Producción, Diseño, Merch, Prensa, Booking, Video, Fotografía, Otro |
| publish_services        | boolean       | no       | false   |                                                                                         |
| accept_proposals        | boolean       | no       | false   |                                                                                         |
| contact                 | text          | yes      |         |                                                                                         |
| works_emerging_projects | boolean       | no       | false   |                                                                                         |

---

## `venue_profiles`

| Column                  | Type          | Nullable | Default | Notes                                                                          |
| ----------------------- | ------------- | -------- | ------- | ------------------------------------------------------------------------------ |
| profile_id              | uuid (PK, FK) | no       |         | References `profiles(id)` ON DELETE CASCADE                                    |
| venue_name              | varchar(200)  | no       |         |                                                                                |
| web_link                | text          | yes      |         |                                                                                |
| description             | text          | yes      |         | Max 600 chars                                                                  |
| capacity                | varchar(20)   | yes      |         | 0-100, 100-300, 300-600, 600+                                                  |
| venue_type              | text[]        | no       | '{}'    | Foro independiente, Bar con música en vivo, Espacio cultural, Foro alternativo |
| has_audio               | boolean       | no       | false   |                                                                                |
| has_lighting            | boolean       | no       | false   |                                                                                |
| accepts_indie_proposals | boolean       | no       | false   |                                                                                |
| publish_calls_ruidozo   | boolean       | no       | false   |                                                                                |
| contact                 | text          | yes      |         |                                                                                |

---

## `cassettes`

Weekly mixtapes. Only one is `active` at a time.

| Column           | Type         | Nullable | Default           | Notes                     |
| ---------------- | ------------ | -------- | ----------------- | ------------------------- |
| id               | uuid (PK)    | no       | gen_random_uuid() |                           |
| name             | varchar(200) | yes      |                   | e.g. "Mixtape Semana 12"  |
| start_date       | date         | no       |                   |                           |
| end_date         | date         | no       |                   |                           |
| duration_minutes | integer      | yes      | 90                | 60 or 90                  |
| curator_id       | uuid (FK)    | yes      |                   | References `profiles(id)` |
| curator_name     | varchar(100) | yes      |                   |                           |
| cover_image_url  | text         | yes      |                   | Supabase Storage URL      |
| active           | boolean      | no       | false             | Only 1 active at a time   |
| archived         | boolean      | no       | false             |                           |
| total_plays      | integer      | no       | 0                 | Post-MVP                  |
| created_at       | timestamptz  | no       | now()             |                           |
| updated_at       | timestamptz  | no       | now()             |                           |

**Indexes**: composite on `(archived, start_date DESC)`
**Constraints**: `UNIQUE` partial index on `active = TRUE` (enforces only one active cassette at a time)

---

## `songs`

Tracks placed inside a cassette by an admin/curator.

| Column           | Type          | Nullable | Default           | Notes                                        |
| ---------------- | ------------- | -------- | ----------------- | -------------------------------------------- |
| id               | uuid (PK)     | no       | gen_random_uuid() |                                              |
| cassette_id      | uuid (FK)     | no       |                   | References `cassettes(id)` ON DELETE CASCADE |
| title            | varchar(200)  | no       |                   |                                              |
| artist           | varchar(200)  | no       |                   |                                              |
| genre            | varchar(100)  | yes      |                   |                                              |
| duration_seconds | integer       | yes      |                   |                                              |
| side             | cassette_side | no       |                   | A or B                                       |
| position         | integer       | no       |                   |                                              |
| audio_url        | text          | yes      |                   | Supabase Storage URL                         |
| proposal_id      | uuid (FK)     | yes      |                   | References `song_proposals(id)`              |
| plays            | integer       | no       | 0                 | Post-MVP                                     |
| created_at       | timestamptz   | no       | now()             |                                              |

**Indexes**: composite on `(cassette_id, side, position)`

---

## `events`

Events published by profiles (venues, promoters, bands, etc.). One of the four main actions.

| Column           | Type          | Nullable | Default           | Notes                                       |
| ---------------- | ------------- | -------- | ----------------- | ------------------------------------------- |
| id               | uuid (PK)     | no       | gen_random_uuid() |                                             |
| profile_id       | uuid (FK)     | no       |                   | References `profiles(id)` ON DELETE CASCADE |
| title            | varchar(200)  | no       |                   |                                             |
| description      | text          | yes      |                   |                                             |
| event_date       | timestamptz   | no       |                   |                                             |
| event_end_date   | timestamptz   | yes      |                   |                                             |
| venue_name       | varchar(200)  | yes      |                   |                                             |
| venue_profile_id | uuid (FK)     | yes      |                   | References `profiles(id)` — linked venue    |
| address          | text          | yes      |                   |                                             |
| city             | varchar(100)  | yes      |                   |                                             |
| state            | varchar(100)  | yes      |                   |                                             |
| country          | varchar(100)  | yes      | 'México'          |                                             |
| event_type       | varchar(100)  | yes      |                   | e.g. Concierto, Festival, etc.              |
| external_link    | text          | yes      |                   |                                             |
| cover_image_url  | text          | yes      |                   | Supabase Storage URL                        |
| status           | event_status  | no       | 'draft'           |                                             |
| created_at       | timestamptz   | no       | now()             |                                             |
| updated_at       | timestamptz   | no       | now()             |                                             |

**Indexes**: `profile_id`, `(event_date DESC) WHERE status = 'published'`, `(city) WHERE status = 'published'`

---

## `song_proposals`

User-submitted song suggestions.

| Column          | Type            | Nullable | Default           | Notes                                          |
| --------------- | --------------- | -------- | ----------------- | ---------------------------------------------- |
| id              | uuid (PK)       | no       | gen_random_uuid() |                                                |
| user_id         | uuid (FK)       | no       |                   | References `profiles(id)` ON DELETE CASCADE    |
| title           | varchar(200)    | no       |                   |                                                |
| artist          | varchar(200)    | no       |                   |                                                |
| genre           | varchar(100)    | yes      |                   |                                                |
| external_link   | text            | yes      |                   | Spotify, YouTube, etc.                         |
| audio_file_path | text            | yes      |                   | Supabase Storage path                          |
| contact_email   | varchar(255)    | yes      |                   | Proposer's contact email                       |
| comment         | text            | yes      |                   |                                                |
| status          | proposal_status | no       | 'pending'         |                                                |
| cassette_id     | uuid (FK)       | yes      |                   | References `cassettes(id)` — set when selected |
| created_at      | timestamptz     | no       | now()             |                                                |
| reviewed_at     | timestamptz     | yes      |                   |                                                |
| reviewed_by     | uuid (FK)       | yes      |                   | References `profiles(id)`                      |

**Indexes**: `(user_id, created_at DESC)`, `status`

---

## `interests`

Connections between profiles ("me interesa").

| Column          | Type        | Nullable | Default           | Notes                                       |
| --------------- | ----------- | -------- | ----------------- | ------------------------------------------- |
| id              | uuid (PK)   | no       | gen_random_uuid() |                                             |
| from_profile_id | uuid (FK)   | no       |                   | References `profiles(id)` ON DELETE CASCADE |
| to_profile_id   | uuid (FK)   | no       |                   | References `profiles(id)` ON DELETE CASCADE |
| message         | text        | yes      |                   |                                             |
| created_at      | timestamptz | no       | now()             |                                             |

**Constraints**: `UNIQUE(from_profile_id, to_profile_id)`
**Indexes**: `from_profile_id`, `to_profile_id`

---

## `activity_feed`

Public activity ticker shown on the homepage.

| Column       | Type          | Nullable | Default           | Notes                                       |
| ------------ | ------------- | -------- | ----------------- | ------------------------------------------- |
| id           | uuid (PK)     | no       | gen_random_uuid() |                                             |
| type         | activity_type | no       |                   |                                             |
| profile_id   | uuid (FK)     | yes      |                   | References `profiles(id)` ON DELETE CASCADE |
| profile_name | varchar(100)  | yes      |                   | Denormalized for fast reads                 |
| profile_role | profile_role  | yes      |                   | Denormalized                                |
| metadata     | jsonb         | yes      | '{}'              | Extra context per type                      |
| visible      | boolean       | no       | true              |                                             |
| created_at   | timestamptz   | no       | now()             |                                             |

**metadata examples**:

- `registration`: `{}`
- `interest`: `{ "to_profile_id": "…", "to_profile_name": "…" }`
- `proposal`: `{ "title": "…", "artist": "…" }`
- `song_selected`: `{ "title": "…", "artist": "…", "cassette_id": "…" }`
- `event_published`: `{ "title": "…", "event_date": "…", "city": "…" }`

**Indexes**: `(created_at DESC) WHERE visible = TRUE`

---

## `system_config`

Key-value store for system-wide settings.

| Column     | Type              | Nullable | Default | Notes |
| ---------- | ----------------- | -------- | ------- | ----- |
| key        | varchar(100) (PK) | no       |         |       |
| value      | jsonb             | no       |         |       |
| updated_at | timestamptz       | no       | now()   |       |

**Initial values**:

- `proposals_limit_per_week` → `3`
- `cassette_duration_options` → `[60, 90]`

---

## Supabase Storage Buckets

| Bucket         | Public | Notes                                  |
| -------------- | ------ | -------------------------------------- |
| `avatars`      | yes    | Profile photos                         |
| `audio`        | no     | Song proposal uploads, cassette tracks |
| `cassette-art` | yes    | Cassette cover art (future)            |
| `event-covers` | yes    | Event cover images                     |

---

---

# Application Architecture

## Tech Stack

- **Framework**: Next.js (App Router)
- **Auth & DB**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (`app/components/ui/`)
- **Fonts**: Baby Doll, PT Mono (custom)
- **TypeScript**: strict mode

## Route Map

```
/                              → Home (cassette player + landing)
/registro/elige-rol            → Role selection cards
/registro/formulario           → Role-specific profile form
/registro/crear-cuenta         → Email + password creation
/registro/ticket               → Welcome ticket post-registration
/proponer-rola                 → Song proposal form (auth required)
/iniciar-sesion                → Login
/registrarte                   → Simple signup (no profile)
/(auth)/callback               → OAuth/magic link PKCE code exchange
/auth/confirm                  → Email OTP verification
/dashboard                     → (placeholder, redirect target)
```

---

## Registration Flow

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────┐
│  elige-rol  │───▶│  formulario  │───▶│ crear-cuenta │───▶│ ticket │
│ (pick role) │    │ (profile     │    │ (email +     │    │(done!) │
│             │    │  form data)  │    │  password)   │    │        │
└─────────────┘    └──────────────┘    └──────────────┘    └────────┘
                        │                     │
                        │ sessionStorage      │ formAction=registroSignup
                        │ 'ruidozo_profile'   │
                        ▼                     ▼
                   Data stored          Hidden inputs + auth
                   client-side          → server action
```

### Step 1: Elige Rol (`/registro/elige-rol`)

User selects their role. Cards link to `/registro/formulario?role=X&source=Y`.

- `source` param: `'registro'` (default) or `'propon_rola'` (from song proposal CTA)
- `manager_group` role maps to `role=manager` (sub-role selected later in form)

### Step 2: Formulario (`/registro/formulario`)

Role-specific form. On submit:

1. `handleSubmit` intercepts, builds data object from `FormData`
2. Stores JSON in `sessionStorage` as key `'ruidozo_profile'`
3. Navigates to `/registro/crear-cuenta?role=X&source=Y`

**Component mapping:**

| Role                              | Component                            | Layout                                        |
| --------------------------------- | ------------------------------------ | --------------------------------------------- |
| `banda`                           | `BandaFormLayout`                    | Two-column with photo                         |
| `fan`                             | `FanFields` + `LocationFields`       | Single form + photo sidebar                   |
| `manager` / `promotor` / `agente` | `ManagerGroupFormLayout`             | Two-column, sub-role dropdown switches fields |
| `proveedor`                       | `ProveedorFields` + `LocationFields` | Single form + photo sidebar                   |
| `venue`                           | `VenueFields` + `LocationFields`     | Single form + photo sidebar                   |

### Step 3: Crear Cuenta (`/registro/crear-cuenta`)

1. Reads `ruidozo_profile` from `sessionStorage`
2. Renders all profile data as hidden `<input>` fields
3. User fills in: `display_name`, `email`, `password`, `confirm_password`
4. Submits via `formAction={registroSignup}`

### Step 4: `registroSignup` Server Action (`/registro/actions.ts`)

1. Creates auth user via `supabase.auth.signUp()`
2. Upserts `profiles` row (auto-generates `slug` via `generateSlug()`)
3. Upserts role-specific detail table (correct table per role: `band_profiles`, `fan_profiles`, `manager_profiles`, `promoter_profiles`, `agent_profiles`, `provider_profiles`, `venue_profiles`)
4. Redirects to `/registro/ticket?role=X` (or `/proponer-rola` if `source=propon_rola`)

### Step 5: Ticket (`/registro/ticket`)

Welcome screen with role-specific next steps. Links to home.

---

## Auth Flow (Simple Login/Signup)

Separate from the registration flow. Used for returning users or quick signups.

| Route              | Action                           | Notes                                           |
| ------------------ | -------------------------------- | ----------------------------------------------- |
| `/iniciar-sesion`  | `login()` → `signInWithPassword` | Redirects to `/dashboard`                       |
| `/registrarte`     | `signup()` → `signUp`            | Email confirmation only, **no profile created** |
| `/(auth)/callback` | PKCE code exchange               | OAuth / magic links                             |
| `/auth/confirm`    | `verifyOtp`                      | Email confirmation token                        |

---

## Proponer Rola Flow

Path: `/proponer-rola` (requires authenticated user with profile)

### Form Fields

| Field                   | Name Attr         | Required | Type     |
| ----------------------- | ----------------- | -------- | -------- |
| Nombre proyecto         | `artist`          | yes      | text     |
| Nombre de la rola       | `title`           | yes      | text     |
| Género                  | `genre`           | no       | text     |
| Link público            | `external_link`   | yes      | url      |
| Correo de contacto      | `contact_email`   | yes      | email    |
| Comentario opcional     | `comment`         | no       | textarea |
| Link privado (descarga) | `audio_file_path` | no       | url      |
| Derechos checkbox       | (client-only)     | yes      | checkbox |

### Server Action: `submitProposal`

1. Checks auth (redirects to `/iniciar-sesion` if not logged in)
2. Checks weekly limit: max 3 proposals per calendar week (Monday start)
3. Inserts into `song_proposals`: `user_id`, `title`, `artist`, `genre`, `external_link`, `audio_file_path`, `comment`, `status='pending'`
4. Redirects to `/proponer-rola?success=true`

> Both `contact_email` and `genre` are collected in the form and saved to `song_proposals`.

---

## Form Fields → Database Mapping

All form fields are correctly collected and saved to their respective tables.

### Banda → `band_profiles`

| Form Field         | DB Column          | Type           |
| ------------------ | ------------------ | -------------- |
| `band_name`        | `band_name`        | text           |
| `project_type`     | `project_type`     | text           |
| `genre`            | `genre`            | text           |
| `project_link`     | `project_link`     | text           |
| `available_live`   | `available_live`   | boolean        |
| `open_collabs`     | `open_collabs`     | boolean        |
| `available_tours`  | `available_tours`  | boolean        |
| `willing_travel`   | `willing_travel`   | boolean        |
| `review`           | `review`           | text (max 600) |
| `publish_dates`    | `publish_dates`    | boolean        |
| `accept_proposals` | `accept_proposals` | boolean        |
| `contact`          | `contact`          | text           |

### Fan → `fan_profiles`

| Form Field          | DB Column           | Type         |
| ------------------- | ------------------- | ------------ |
| `alias`             | `alias`             | text         |
| `favorite_genres`   | `favorite_genres`   | text[] (1-3) |
| `notify_new_bands`  | `notify_new_bands`  | boolean      |
| `propose_fav_bands` | `propose_fav_bands` | boolean      |

### Manager → `manager_profiles`

| Form Field              | DB Column               | Type                    |
| ----------------------- | ----------------------- | ----------------------- |
| `full_name`             | `full_name`             | text                    |
| `web_link`              | `web_link`              | text                    |
| `role_type`             | `role_type`             | `'manager'` (hardcoded) |
| `review`                | `review`                | text (max 600)          |
| `represents_artists`    | `represents_artists`    | boolean                 |
| `artists_represented`   | `artists_represented`   | text                    |
| `promote_bands_ruidozo` | `promote_bands_ruidozo` | boolean                 |
| `seeks_emerging_talent` | `seeks_emerging_talent` | boolean                 |
| `accept_proposals`      | `accept_proposals`      | boolean                 |
| `contact`               | `contact`               | text                    |

### Promotor → `promoter_profiles`

| Form Field               | DB Column                | Type                     |
| ------------------------ | ------------------------ | ------------------------ |
| `full_name`              | `full_name`              | text                     |
| `web_link`               | `web_link`               | text                     |
| `role_type`              | `role_type`              | `'promotor'` (hardcoded) |
| `review`                 | `review`                 | text (max 600)           |
| `organizes_events`       | `organizes_events`       | boolean                  |
| `territorial_reach`      | `territorial_reach`      | text[]                   |
| `event_types`            | `event_types`            | text[]                   |
| `provide_events_ruidozo` | `provide_events_ruidozo` | boolean                  |
| `seeks_talent`           | `seeks_talent`           | boolean                  |
| `accept_proposals`       | `accept_proposals`       | boolean                  |
| `contact`                | `contact`                | text                     |

### Agente → `agent_profiles`

| Form Field                | DB Column                 | Type                   |
| ------------------------- | ------------------------- | ---------------------- |
| `full_name`               | `full_name`               | text                   |
| `web_link`                | `web_link`                | text                   |
| `role_type`               | `role_type`               | `'agente'` (hardcoded) |
| `review`                  | `review`                  | text (max 600)         |
| `represents_artists_live` | `represents_artists_live` | boolean                |
| `territorial_reach`       | `territorial_reach`       | text[]                 |
| `provide_events_ruidozo`  | `provide_events_ruidozo`  | boolean                |
| `seeks_new_projects`      | `seeks_new_projects`      | boolean                |
| `accept_proposals`        | `accept_proposals`        | boolean                |
| `contact`                 | `contact`                 | text                   |

### Proveedor → `provider_profiles`

| Form Field                | DB Column                 | Type           |
| ------------------------- | ------------------------- | -------------- |
| `brand_name`              | `brand_name`              | text           |
| `web_link`                | `web_link`                | text           |
| `description`             | `description`             | text (max 600) |
| `territorial_reach`       | `territorial_reach`       | text[]         |
| `service_types`           | `service_types`           | text[]         |
| `publish_services`        | `publish_services`        | boolean        |
| `accept_proposals`        | `accept_proposals`        | boolean        |
| `contact`                 | `contact`                 | text           |
| `works_emerging_projects` | `works_emerging_projects` | boolean        |

### Venue → `venue_profiles`

| Form Field                | DB Column                 | Type                     |
| ------------------------- | ------------------------- | ------------------------ |
| `venue_name`              | `venue_name`              | text                     |
| `web_link`                | `web_link`                | text                     |
| `description`             | `description`             | text (max 600)           |
| `capacity`                | `capacity`                | varchar (e.g. `'0-100'`) |
| `venue_type`              | `venue_type`              | text[]                   |
| `has_audio`               | `has_audio`               | boolean                  |
| `has_lighting`            | `has_lighting`            | boolean                  |
| `accepts_indie_proposals` | `accepts_indie_proposals` | boolean                  |
| `publish_calls_ruidozo`   | `publish_calls_ruidozo`   | boolean                  |
| `contact`                 | `contact`                 | text                     |

### Common Fields → `profiles`

| Form Field     | DB Column             | Where Collected             | Notes                                                                       |
| -------------- | --------------------- | --------------------------- | --------------------------------------------------------------------------- |
| `display_name` | `display_name`        | crear-cuenta                | Falls back to `band_name`, `full_name`, `alias`, `venue_name`, `brand_name` |
| (auto)         | `slug`                | auto-generated              | `generateSlug()` in `lib/utils.ts`                                          |
| `country`      | `country`             | formulario (LocationFields) |                                                                             |
| `state`        | `state`               | formulario (LocationFields) |                                                                             |
| `city`         | `city`                | formulario (LocationFields) |                                                                             |
| `role`         | `role`                | elige-rol / formulario      |                                                                             |
| `source`       | `registration_source` | elige-rol                   | `'registro'` or `'propon_rola'`                                             |
| `photo`        | `photo_url`           | formulario (PhotoUpload)    | Upload not yet implemented                                                  |
| —              | `contact_email`       | not in any form             | Post-MVP                                                                    |
| —              | `social_links`        | not in any form             | Post-MVP                                                                    |

---

## Multi-Value Form Fields

The `handleSubmit` in `formulario/page.tsx` handles all multi-value checkbox fields as arrays via a centralized `ARRAY_FIELDS` set:

| Field               | Type       | Handled |
| ------------------- | ---------- | ------- |
| `favorite_genres`   | `string[]` | yes     |
| `capacity`          | `string[]` | yes     |
| `venue_type`        | `string[]` | yes     |
| `territorial_reach` | `string[]` | yes     |
| `service_types`     | `string[]` | yes     |
| `event_types`       | `string[]` | yes     |

---

## Hardcoded Option Constants

Defined in `lib/types.ts`:

### `FAN_GENRE_OPTIONS`

Rock, Pop, Hip Hop/Rap, Reggae / Ska, Metal, Punk / Hardcore, Electrónica, Folk/Acústico, Indie, Alternativo, Regional/Fusión, Experimental, Instrumental, Latino Urbano, Jazz & Blue

### `TERRITORIAL_REACH_OPTIONS`

Local, Nacional, Internacional

### `SERVICE_TYPE_OPTIONS`

Audio, Iluminación, Producción, Diseño, Merch, Prensa, Booking, Video, Fotografía, Otro

### `EVENT_TYPE_OPTIONS`

Shows locales, Circuitos, Festivales, Giras, Otro

### `CAPACITY_OPTIONS`

0-100, 100-300, 300-600, 600+

### `VENUE_TYPE_OPTIONS`

Foro independiente, Bar con música en vivo, Espacio cultural, Foro alternativo

---

## Cassette Player (Home)

The home page renders a cassette player using **mock data** (`lib/mock-data.ts`).

- `MOCK_SONGS`: 26 tracks (13 Side A + 13 Side B) with local MP3 files in `/songs/`
- `MOCK_PLAYER_STATE`: initial state with `date: 'MAR. 20/26'`
- Player components: `CassettePlayer`, `SongList`, `SongRow`, `DialogBubble`, `HomePlayerSection`
- Audio hook: `useAudioPlayer` manages playback state client-side

The player uses `PlayerSong` (client interface with `string` IDs), aligned with the DB `Song` interface (uuid IDs). When connected to real data, swap mock data for a Supabase query.

---

## Location Data

`lib/mexico-locations.ts` provides cascading select data:

- `COUNTRIES`: `['México']`
- `MEXICO_STATES`: all 32 Mexican states
- `getStates(country)`: returns states for a country
- `getCities(state)`: returns cities for a state

Used by `LocationFields` component in all registration forms.

---

## Service Role Client

Admin operations and the registration flow require a **service_role** Supabase client
(`lib/supabase/service.ts`) that bypasses RLS. This is needed because:

- `registroSignup` inserts into `profiles` + role tables right after `signUp()`,
  before the user has a confirmed session (if email confirmation is enabled).
- Admin operations (managing cassettes, songs, reviewing proposals, updating
  `system_config`) need write access to tables that only have SELECT policies
  for regular users.

The service client uses `SUPABASE_SERVICE_ROLE_KEY` (server-only, never exposed to the browser).

---

## Four Main Actions (Christian)

| Action              | DB Support                     | Status   |
| ------------------- | ------------------------------ | -------- |
| Proponer una rola   | `song_proposals` table         | Complete |
| Correr la voz       | Social sharing (no table)      | N/A      |
| Explorar comunidad  | `interests` + profile browsing | Complete |
| Publicar un evento  | `events` table                 | Complete |

---

## Status

All schema, actions, forms, and player types are aligned. No known discrepancies remain.
