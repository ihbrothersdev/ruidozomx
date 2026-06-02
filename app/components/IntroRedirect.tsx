/**
 * Redirects first-time visitors on the home page to the identity video
 * (`/quienes-somos`) — without showing a flash of the home page first.
 *
 * Why this is a SERVER component returning an inline <script>:
 *   - A client component with `useEffect` only runs AFTER React hydrates,
 *     by which point the browser has already painted the home page → flash.
 *   - An inline parser-blocking <script> runs synchronously during HTML
 *     parse, BEFORE the browser paints anything visible after it. If we
 *     `window.location.replace`, the navigation cancels the current paint.
 *
 * Same trick `next-themes` uses to avoid theme flashes. Side effect for
 * returning visitors: the script still runs (a single localStorage read),
 * sees the flag is set, and exits — cheap.
 */
const STORAGE_KEY = 'ruidozo_intro_seen'

// Minified inline; runs before the rest of <main> is parsed.
const SCRIPT = `(function(){try{if(!localStorage.getItem(${JSON.stringify(STORAGE_KEY)})){localStorage.setItem(${JSON.stringify(STORAGE_KEY)},'1');document.documentElement.style.visibility='hidden';window.location.replace('/quienes-somos');}}catch(e){}})();`

export function IntroRedirect() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
}
