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

var index = require('./adapters/index.cjs');
var client = require('./client.cjs');

function r(r2 = {}) {
  const a = index.createAdapter(r2.adapter);
  return new client.HttpClientImpl(r2, a);
}

exports.createHttpClient = r;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=factory.cjs.map
