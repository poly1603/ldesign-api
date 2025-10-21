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

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');
var index = require('../adapters/index.cjs');
var client = require('../client.cjs');
var useHttp = require('./useHttp.cjs');

const s = { install(e2, s2 = {}) {
  const l2 = s2, a2 = l2.client || new client.HttpClientImpl(l2.globalConfig || {}, index.createAdapter());
  e2.provide(useHttp.HTTP_CLIENT_KEY, a2), l2.globalConfig && e2.provide(useHttp.HTTP_CONFIG_KEY, vue.ref(l2.globalConfig));
  const p2 = l2.globalProperty || "$http";
  e2.config.globalProperties[p2] = a2, e2.provide("httpClient", a2);
} };

exports.HttpPlugin = s;
exports.default = s;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=plugin.cjs.map
