/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { createAdapter as s } from './adapters/index.js';
import { HttpClientImpl as w } from './client.js';

function r(r2 = {}) {
  const a = s(r2.adapter);
  return new w(r2, a);
}

export { r as createHttpClient };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=factory.js.map
