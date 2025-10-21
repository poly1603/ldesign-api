/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { ref } from 'vue';
import { createAdapter as s$1 } from '../adapters/index.js';
import { HttpClientImpl as w } from '../client.js';
import { HTTP_CLIENT_KEY as p, HTTP_CONFIG_KEY as v } from './useHttp.js';

const s = { install(e2, s2 = {}) {
  const l2 = s2, a2 = l2.client || new w(l2.globalConfig || {}, s$1());
  e2.provide(p, a2), l2.globalConfig && e2.provide(v, ref(l2.globalConfig));
  const p2 = l2.globalProperty || "$http";
  e2.config.globalProperties[p2] = a2, e2.provide("httpClient", a2);
} };

export { s as HttpPlugin, s as default };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=plugin.js.map
