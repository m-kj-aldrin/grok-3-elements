export function wait() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(resolve);
  });
}
