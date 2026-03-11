# Ruidozo MX — QA & Testing Log

> Documento vivo para rastrear pruebas, bugs y fixes durante el desarrollo.

---

## Commits pendientes (plan)

Antes de probar, agrupar cambios en conventional commits:

| #   | Tipo | Scope         | Archivos                                                                                                                                                                                                                                                                                                                                     | Descripción                                  |
| --- | ---- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1   | feat | ui            | `components.json`, `app/components/ui/button.tsx`, `checkbox.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`, `radio-group.tsx`, `select.tsx`, `textarea.tsx`, `package.json`, `package-lock.json`                                                                                                                                              | add shadcn/ui components                     |
| 2   | feat | auth          | `app/(auth)/actions.ts`, `app/(auth)/callback/route.ts`, `app/(auth)/iniciar-sesion/page.tsx`, `app/(auth)/registrarte/page.tsx`, ~~`login/page.tsx`~~, ~~`signup/page.tsx`~~, `app/auth/confirm/route.ts`, `lib/supabase/proxy.ts`                                                                                                          | rename auth routes to Spanish                |
| 3   | feat | player        | `app/components/player/CassettePlayer.tsx`, `SongList.tsx`, `SongRow.tsx`, `DialogBubble.tsx`, `HomePlayerSection.tsx`, `ProponRolaModal.tsx`, `app/hooks/useAudioPlayer.ts`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `app/not-found.tsx`, `app/components/layout/Header.tsx`, `Footer.tsx`, `lib/mock-data.ts`, `lib/utils.ts` | cassette player and landing improvements     |
| 4   | feat | assets        | `public/assets/registro/crear-cuenta/*` (10 imgs), `public/assets/registro/elige-rol/*` (9 imgs), `public/assets/registro/formulario/*` (12 imgs), `public/assets/registro/tickets/*` (7 imgs), `public/assets/registro/proponer-rola/*` (9 imgs), `public/assets/registro/modal/*` (3 imgs)                                                 | add registration and proposal image assets   |
| 5   | feat | registro      | `app/registro/crear-cuenta/page.tsx`, `constants.ts`, `app/registro/elige-rol/page.tsx`, `constants.ts`, `app/registro/formulario/page.tsx`, `constants.ts`, `app/registro/formulario/_components/*` (13 files), `app/registro/ticket/page.tsx`, `constants.ts`, `app/registro/actions.ts`, `lib/mexico-locations.ts`                        | add registration flow                        |
| 6   | feat | proponer-rola | `app/proponer-rola/page.tsx`, `actions.ts`, `constants.ts`, `app/proponer-rola/_components/FormField.tsx`, `app/components/player/ProponRolaModal.tsx`                                                                                                                                                                                       | add song proposal flow                       |
| 7   | feat | database      | `docs/schema.sql`, `docs/database-schema.md`, `docs/QA-testing.md`, `lib/types.ts`, `lib/supabase/service.ts`                                                                                                                                                                                                                                | add database schema, docs and service client |

**No commitear**: `.claude/`, `app/components/layout/transcript.txt`

---

## Test Plan

### 1. Landing / Home Page

| #    | Caso de prueba                              | Status | Notas |
| ---- | ------------------------------------------- | ------ | ----- |
| 1.1  | La página carga sin errores                 | ⬜     |       |
| 1.2  | Cassette player se renderiza correctamente  | ⬜     |       |
| 1.3  | Se pueden reproducir canciones (play/pause) | ⬜     |       |
| 1.4  | Cambio entre Side A y Side B funciona       | ⬜     |       |
| 1.5  | Lista de canciones se muestra correctamente | ⬜     |       |
| 1.6  | Song row muestra título, artista, duración  | ⬜     |       |
| 1.7  | Header y Footer se ven correctos            | ⬜     |       |
| 1.8  | DialogBubble aparece al interactuar         | ⬜     |       |
| 1.9  | Layout responsive (desktop → mobile)        | ⬜     |       |
| 1.10 | 404 page funciona (`/ruta-inexistente`)     | ⬜     |       |

### 2. Registro — Elige Rol

| #   | Caso de prueba                                              | Status | Notas |
| --- | ----------------------------------------------------------- | ------ | ----- |
| 2.1 | `/registro/elige-rol` carga sin errores                     | ⬜     |       |
| 2.2 | Se muestran las 6 tarjetas de rol                           | ⬜     |       |
| 2.3 | Click en cada tarjeta lleva a `/registro/formulario?role=X` | ⬜     |       |
| 2.4 | El parámetro `source` se pasa correctamente                 | ⬜     |       |

### 3. Registro — Formulario (por rol)

| #    | Caso de prueba                                         | Status | Notas |
| ---- | ------------------------------------------------------ | ------ | ----- |
| 3.1  | Banda: formulario carga, campos correctos              | ⬜     |       |
| 3.2  | Fan: formulario carga, géneros seleccionables          | ⬜     |       |
| 3.3  | Manager: formulario carga, campos manager              | ⬜     |       |
| 3.4  | Promotor: formulario carga, sub-rol correcto           | ⬜     |       |
| 3.5  | Agente: formulario carga, sub-rol correcto             | ⬜     |       |
| 3.6  | Proveedor: formulario carga, service types             | ⬜     |       |
| 3.7  | Venue: formulario carga, venue types                   | ⬜     |       |
| 3.8  | LocationFields: cascading selects (país→estado→ciudad) | ⬜     |       |
| 3.9  | Submit guarda datos en sessionStorage                  | ⬜     |       |
| 3.10 | Redirect a `/registro/crear-cuenta?role=X&source=Y`    | ⬜     |       |

### 4. Registro — Crear Cuenta

| #    | Caso de prueba                                     | Status | Notas |
| ---- | -------------------------------------------------- | ------ | ----- |
| 4.1  | Datos del formulario se cargan de sessionStorage   | ⬜     |       |
| 4.2  | Hidden inputs contienen todos los campos de perfil | ⬜     |       |
| 4.3  | Validación: email, password match, min 6 chars     | ⬜     |       |
| 4.4  | Submit crea usuario en Supabase Auth               | ⬜     |       |
| 4.5  | Submit crea row en `profiles`                      | ⬜     |       |
| 4.6  | Submit crea row en tabla de detalle del rol        | ⬜     |       |
| 4.7  | Slug se genera correctamente                       | ⬜     |       |
| 4.8  | Redirect a `/registro/ticket` (source=registro)    | ⬜     |       |
| 4.9  | Redirect a `/proponer-rola` (source=propon_rola)   | ⬜     |       |
| 4.10 | Error: email duplicado muestra mensaje             | ⬜     |       |

### 5. Registro — Ticket

| #   | Caso de prueba                      | Status | Notas |
| --- | ----------------------------------- | ------ | ----- |
| 5.1 | Ticket page carga según el rol      | ⬜     |       |
| 5.2 | Muestra info y next steps correctos | ⬜     |       |

### 6. Auth — Login / Signup simple

| #   | Caso de prueba                                   | Status | Notas |
| --- | ------------------------------------------------ | ------ | ----- |
| 6.1 | `/iniciar-sesion` carga correctamente            | ⬜     |       |
| 6.2 | Login con email/password funciona                | ⬜     |       |
| 6.3 | Login con credenciales incorrectas muestra error | ⬜     |       |
| 6.4 | `/registrarte` carga correctamente               | ⬜     |       |
| 6.5 | Signup simple (sin perfil) funciona              | ⬜     |       |
| 6.6 | Redirect de auth protegido funciona (proxy)      | ⬜     |       |

### 7. Proponer Rola

| #   | Caso de prueba                          | Status | Notas |
| --- | --------------------------------------- | ------ | ----- |
| 7.1 | `/proponer-rola` carga (auth required)  | ⬜     |       |
| 7.2 | Sin auth → redirect a `/iniciar-sesion` | ⬜     |       |
| 7.3 | Formulario tiene todos los campos       | ⬜     |       |
| 7.4 | Submit crea row en `song_proposals`     | ⬜     |       |
| 7.5 | Límite de 3 propuestas por semana       | ⬜     |       |
| 7.6 | Mensaje de éxito después de enviar      | ⬜     |       |

### 8. Base de Datos (Supabase)

| #   | Caso de prueba                            | Status | Notas |
| --- | ----------------------------------------- | ------ | ----- |
| 8.1 | Schema se ejecuta sin errores             | ⬜     |       |
| 8.2 | Enums creados correctamente               | ⬜     |       |
| 8.3 | Todas las tablas existen                  | ⬜     |       |
| 8.4 | RLS policies activas                      | ⬜     |       |
| 8.5 | Triggers de `updated_at` funcionan        | ⬜     |       |
| 8.6 | Trigger de `activity_feed` funciona       | ⬜     |       |
| 8.7 | Unique constraint: solo 1 cassette activo | ⬜     |       |
| 8.8 | `system_config` tiene valores iniciales   | ⬜     |       |

---

## Cómo limpiar datos de prueba en Supabase

### Borrar un usuario de prueba (completo)

```sql
-- Esto borra el usuario de auth Y en cascada elimina:
-- profiles, role detail table, song_proposals, interests, activity_feed
DELETE FROM auth.users WHERE email = 'test@example.com';
```

### Borrar solo el perfil (mantener auth user)

```sql
-- ON DELETE CASCADE borra también la tabla de detalle del rol
DELETE FROM profiles WHERE id = 'uuid-del-usuario';
```

### Borrar todas las propuestas de un usuario

```sql
DELETE FROM song_proposals WHERE user_id = 'uuid-del-usuario';
```

### Borrar todos los eventos de prueba

```sql
DELETE FROM events WHERE profile_id = 'uuid-del-usuario';
```

### Reset completo (borrar TODOS los datos de prueba)

```sql
-- En orden por dependencias
TRUNCATE song_proposals CASCADE;
TRUNCATE interests CASCADE;
TRUNCATE events CASCADE;
TRUNCATE activity_feed CASCADE;
TRUNCATE songs CASCADE;
TRUNCATE cassettes CASCADE;
-- Profiles se borran desde auth para respetar el cascade
DELETE FROM auth.users WHERE email LIKE '%@test.%';
```

### Ver datos rápido

```sql
-- Ver todos los perfiles registrados
SELECT id, role, display_name, slug, city, created_at FROM profiles;

-- Ver propuestas
SELECT id, title, artist, status, created_at FROM song_proposals;

-- Ver activity feed
SELECT type, profile_name, profile_role, created_at FROM activity_feed ORDER BY created_at DESC LIMIT 20;

-- Ver eventos
SELECT id, title, event_date, status, created_at FROM events;
```

---

## Bugs encontrados

| #   | Área | Descripción | Severity | Fix | Status |
| --- | ---- | ----------- | -------- | --- | ------ |
|     |      |             |          |     |        |

---

## Notas

- **Supabase Dashboard**: Para ejecutar SQL manual → SQL Editor
- **Service Role Key**: Necesaria en `.env.local` como `SUPABASE_SERVICE_ROLE_KEY`
- **Email confirmation**: Si está activada en Supabase, el registration flow usa service client para insertar perfiles antes de confirmación
