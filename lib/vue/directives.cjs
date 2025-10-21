/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

const vIntersect = {
  mounted(el, binding) {
    const val = binding.value;
    const cb = typeof val === "function" ? val : val?.callback;
    const opts = typeof val === "object" && "options" in (val || {}) ? val.options : void 0;
    const once = typeof val === "object" && "once" in (val || {}) ? val.once : false;
    const delay = typeof val === "object" && "delay" in (val || {}) ? val.delay : 0;
    if (!cb)
      return;
    const root = opts?.root ?? null;
    const rootMargin = opts?.rootMargin ?? "0px";
    const threshold = opts?.threshold ?? 0;
    const handler = (entry) => {
      const run = () => cb(entry);
      if (delay && delay > 0) {
        setTimeout(run, delay);
      } else {
        run();
      }
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          handler(entry);
          if (once) {
            observer.disconnect();
          }
        }
      });
    }, { root, rootMargin, threshold });
    el.__io__ = observer;
    observer.observe(el);
  },
  unmounted(el) {
    const obs = el.__io__;
    obs?.disconnect();
    delete el.__io__;
  }
};

exports.vIntersect = vIntersect;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=directives.cjs.map
