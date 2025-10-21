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

function renameKeysShallow(obj, mapping) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const nk = mapping[k] || k;
    out[nk] = v;
  }
  return out;
}
function renameKeysDeep(input, mapping) {
  if (Array.isArray(input))
    return input.map((i) => renameKeysDeep(i, mapping));
  if (input && typeof input === "object") {
    const out = {};
    for (const [k, v] of Object.entries(input)) {
      const nk = mapping[k] || k;
      out[nk] = renameKeysDeep(v, mapping);
    }
    return out;
  }
  return input;
}

exports.renameKeysDeep = renameKeysDeep;
exports.renameKeysShallow = renameKeysShallow;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=object.cjs.map
