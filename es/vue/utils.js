/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { watch, onUnmounted } from 'vue';

function useIntersectionObserver(target, onIntersect, options = {}) {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
    return { stop: () => {
    } };
  }
  const root = options.root ?? null;
  const rootMargin = options.rootMargin ?? "0px";
  const threshold = options.threshold ?? 0;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.isIntersecting && onIntersect(entry));
  }, { root, rootMargin, threshold });
  const start = () => {
    const el = target.value;
    if (el)
      observer.observe(el);
  };
  start();
  const stopWatch = watch(target, (el, old) => {
    if (old)
      observer.unobserve(old);
    if (el)
      observer.observe(el);
  });
  onUnmounted(() => {
    observer.disconnect();
    stopWatch();
  });
  return { stop: () => {
    observer.disconnect();
    stopWatch();
  } };
}

export { useIntersectionObserver };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=utils.js.map
