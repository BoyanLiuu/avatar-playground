/**
 * Runs in <head> before first paint: marks a page opened from a share link (<html data-link>), so
 * the loading print shows "developing" instead of the default avatar (see playground/loading.tsx).
 */
export const LINK_SCRIPT = `if(/[?&](s|v|c|f|m)=/.test(location.search))document.documentElement.dataset.link=""`;
