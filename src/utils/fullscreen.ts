export function triggerAutoFullscreen() {
  if (
    typeof document !== 'undefined' &&
    !document.fullscreenElement &&
    document.documentElement &&
    typeof document.documentElement.requestFullscreen === 'function'
  ) {
    document.documentElement.requestFullscreen().catch(() => {
      // Modern browsers allow fullscreen when invoked directly within a user click event stack
    });
  }
}

export function toggleFullscreen() {
  if (typeof document === 'undefined') return;
  if (!document.fullscreenElement) {
    triggerAutoFullscreen();
  } else if (typeof document.exitFullscreen === 'function') {
    document.exitFullscreen().catch(() => {});
  }
}
