document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const timeStr = now.toLocaleString(undefined, {hour12: false});
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(`Page loaded: ${location.pathname} at ${timeStr}`);
});