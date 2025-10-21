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

function gql(chunks, ...exprs) {
  let out = "";
  chunks.forEach((c, i) => {
    out += c + (i < exprs.length ? String(exprs[i]) : "");
  });
  return out;
}
function createGraphqlApiPlugin(options) {
  const { endpoint, headers = {}, operations, mapVariables } = options;
  const makeHeaders = (vars) => {
    const h = {};
    for (const [k, v] of Object.entries(headers)) {
      try {
        h[k] = typeof v === "function" ? v(vars) : v;
      } catch {
      }
    }
    return h;
  };
  const apis = {};
  for (const [name, op] of Object.entries(operations)) {
    apis[name] = {
      name,
      config: (variables) => ({
        method: "POST",
        url: endpoint,
        headers: { "Content-Type": "application/json", ...makeHeaders(variables) },
        data: {
          query: op.query,
          variables: mapVariables ? mapVariables(variables) : variables
        }
      }),
      transform: (resp) => {
        const out = op.transform ? op.transform(resp) : resp?.data?.data ?? resp?.data;
        return out;
      },
      validate: op.validate,
      cache: op.cache
    };
  }
  return {
    name: "graphql-apis",
    version: "1.0.0",
    apis
  };
}

exports.createGraphqlApiPlugin = createGraphqlApiPlugin;
exports.gql = gql;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=graphql.cjs.map
