/*!
 * ***********************************
 * @ldesign/api v0.1.0             *
 * Built with rollup               *
 * Build time: 2024-10-21 14:31:33 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class DataTransformer {
  constructor() {
    this.transformers = /* @__PURE__ */ new Map();
  }
  /**
   * 注册转换器
   */
  register(config) {
    this.transformers.set(config.name, {
      enabled: true,
      ...config
    });
  }
  /**
   * 批量注册
   */
  registerBatch(configs) {
    configs.forEach((config) => this.register(config));
  }
  /**
   * 移除转换器
   */
  unregister(name) {
    this.transformers.delete(name);
  }
  /**
   * 执行转换
   */
  transform(name, data) {
    const transformer = this.transformers.get(name);
    if (!transformer) {
      throw new Error(`Transformer "${name}" not found`);
    }
    if (!transformer.enabled) {
      return data;
    }
    return transformer.transform(data);
  }
  /**
   * 链式转换（依次应用多个转换器）
   */
  chain(data, transformerNames) {
    return transformerNames.reduce((result, name) => {
      return this.transform(name, result);
    }, data);
  }
  /**
   * 启用/禁用转换器
   */
  setEnabled(name, enabled) {
    const transformer = this.transformers.get(name);
    if (transformer) {
      transformer.enabled = enabled;
    }
  }
  /**
   * 获取所有转换器名称
   */
  getTransformerNames() {
    return Array.from(this.transformers.keys());
  }
  /**
   * 清空所有转换器
   */
  clear() {
    this.transformers.clear();
  }
}
const BuiltinTransformers = {
  /**
   * 驼峰命名转换
   */
  camelCase: {
    name: "camelCase",
    transform: (data) => {
      if (Array.isArray(data)) {
        return data.map((item) => BuiltinTransformers.camelCase.transform(item));
      }
      if (data && typeof data === "object" && data.constructor === Object) {
        const result = {};
        for (const key of Object.keys(data)) {
          const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          result[camelKey] = BuiltinTransformers.camelCase.transform(data[key]);
        }
        return result;
      }
      return data;
    }
  },
  /**
   * 蛇形命名转换
   */
  snakeCase: {
    name: "snakeCase",
    transform: (data) => {
      if (Array.isArray(data)) {
        return data.map((item) => BuiltinTransformers.snakeCase.transform(item));
      }
      if (data && typeof data === "object" && data.constructor === Object) {
        const result = {};
        for (const key of Object.keys(data)) {
          const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
          result[snakeKey] = BuiltinTransformers.snakeCase.transform(data[key]);
        }
        return result;
      }
      return data;
    }
  },
  /**
   * 移除空值
   */
  removeEmpty: {
    name: "removeEmpty",
    transform: (data) => {
      if (Array.isArray(data)) {
        return data.filter((item) => item !== null && item !== void 0 && item !== "").map((item) => BuiltinTransformers.removeEmpty.transform(item));
      }
      if (data && typeof data === "object" && data.constructor === Object) {
        const result = {};
        for (const key of Object.keys(data)) {
          const value = data[key];
          if (value !== null && value !== void 0 && value !== "") {
            result[key] = BuiltinTransformers.removeEmpty.transform(value);
          }
        }
        return result;
      }
      return data;
    }
  },
  /**
   * 日期字符串转Date对象
   */
  parseDates: {
    name: "parseDates",
    transform: (data) => {
      if (Array.isArray(data)) {
        return data.map((item) => BuiltinTransformers.parseDates.transform(item));
      }
      if (data && typeof data === "object" && data.constructor === Object) {
        const result = {};
        for (const key of Object.keys(data)) {
          const value = data[key];
          if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            result[key] = new Date(value);
          } else {
            result[key] = BuiltinTransformers.parseDates.transform(value);
          }
        }
        return result;
      }
      return data;
    }
  },
  /**
   * Date对象转日期字符串
   */
  stringifyDates: {
    name: "stringifyDates",
    transform: (data) => {
      if (Array.isArray(data)) {
        return data.map((item) => BuiltinTransformers.stringifyDates.transform(item));
      }
      if (data instanceof Date) {
        return data.toISOString();
      }
      if (data && typeof data === "object" && data.constructor === Object) {
        const result = {};
        for (const key of Object.keys(data)) {
          result[key] = BuiltinTransformers.stringifyDates.transform(data[key]);
        }
        return result;
      }
      return data;
    }
  },
  /**
   * 深拷贝
   */
  deepClone: {
    name: "deepClone",
    transform: (data) => {
      if (data === null || typeof data !== "object") {
        return data;
      }
      if (data instanceof Date) {
        return new Date(data.getTime());
      }
      if (Array.isArray(data)) {
        return data.map((item) => BuiltinTransformers.deepClone.transform(item));
      }
      const result = {};
      for (const key of Object.keys(data)) {
        result[key] = BuiltinTransformers.deepClone.transform(data[key]);
      }
      return result;
    }
  },
  /**
   * 扁平化对象
   */
  flatten: {
    name: "flatten",
    transform: (data, prefix = "") => {
      const result = {};
      for (const key of Object.keys(data)) {
        const value = data[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === "object" && !Array.isArray(value)) {
          Object.assign(result, BuiltinTransformers.flatten.transform(value, newKey));
        } else {
          result[newKey] = value;
        }
      }
      return result;
    }
  },
  /**
   * 数字字符串转数字
   */
  parseNumbers: {
    name: "parseNumbers",
    transform: (data) => {
      if (Array.isArray(data)) {
        return data.map((item) => BuiltinTransformers.parseNumbers.transform(item));
      }
      if (data && typeof data === "object" && data.constructor === Object) {
        const result = {};
        for (const key of Object.keys(data)) {
          const value = data[key];
          if (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value)) {
            result[key] = Number.parseFloat(value);
          } else {
            result[key] = BuiltinTransformers.parseNumbers.transform(value);
          }
        }
        return result;
      }
      return data;
    }
  }
};
function createDataTransformer(withBuiltin = true) {
  const transformer = new DataTransformer();
  if (withBuiltin) {
    transformer.registerBatch(Object.values(BuiltinTransformers));
  }
  return transformer;
}
let globalTransformer = null;
function getGlobalTransformer() {
  if (!globalTransformer) {
    globalTransformer = createDataTransformer(true);
  }
  return globalTransformer;
}
function setGlobalTransformer(transformer) {
  globalTransformer = transformer;
}
function transform(name, data) {
  return getGlobalTransformer().transform(name, data);
}
function transformChain(data, transformerNames) {
  return getGlobalTransformer().chain(data, transformerNames);
}
const toCamelCase = (data) => transform("camelCase", data);
const toSnakeCase = (data) => transform("snakeCase", data);
const removeEmpty = (data) => transform("removeEmpty", data);
const parseDates = (data) => transform("parseDates", data);
const stringifyDates = (data) => transform("stringifyDates", data);
const deepClone = (data) => transform("deepClone", data);
const flatten = (data) => transform("flatten", data);
const parseNumbers = (data) => transform("parseNumbers", data);

export { BuiltinTransformers, DataTransformer, createDataTransformer, deepClone, flatten, getGlobalTransformer, parseDates, parseNumbers, removeEmpty, setGlobalTransformer, stringifyDates, toCamelCase, toSnakeCase, transform, transformChain };
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=DataTransformer.js.map
