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

function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function generateShortId(length = 21) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id2 = "";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      id2 += alphabet[bytes[i] % alphabet.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      id2 += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }
  return id2;
}
let counter = 0;
function generateNumericId() {
  return String(++counter);
}
function resetNumericCounter(start = 0) {
  counter = start;
}
function generateTimestampId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
let sequence = 0;
let lastTimestamp = -1;
const machineId = Math.floor(Math.random() * 1024);
function generateSnowflakeId() {
  let timestamp = Date.now();
  if (timestamp === lastTimestamp) {
    sequence = sequence + 1 & 4095;
    if (sequence === 0) {
      while (timestamp <= lastTimestamp) {
        timestamp = Date.now();
      }
    }
  } else {
    sequence = 0;
  }
  lastTimestamp = timestamp;
  const id2 = BigInt(timestamp) << BigInt(22) | BigInt(machineId) << BigInt(12) | BigInt(sequence);
  return id2.toString();
}
function generateHexId(length = 16) {
  let result = "";
  const chars = "0123456789abcdef";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(Math.ceil(length / 2));
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[Math.floor(i / 2)] % 16];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * 16)];
    }
  }
  return result;
}
function generateBase62Id(length = 12) {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return result;
}
class IdGenerator {
  constructor(config = {}) {
    this.strategy = config.strategy || "short";
    this.length = config.length || 21;
    this.prefix = config.prefix || "";
    this.suffix = config.suffix || "";
  }
  /**
   * 生成ID
   */
  generate() {
    let id2;
    if (typeof this.strategy === "function") {
      id2 = this.strategy();
    } else {
      switch (this.strategy) {
        case "uuid":
          id2 = generateUUID();
          break;
        case "numeric":
          id2 = generateNumericId();
          break;
        case "timestamp":
          id2 = generateTimestampId();
          break;
        case "snowflake":
          id2 = generateSnowflakeId();
          break;
        case "hex":
          id2 = generateHexId(this.length);
          break;
        case "base62":
          id2 = generateBase62Id(this.length);
          break;
        case "short":
        default:
          id2 = generateShortId(this.length);
          break;
      }
    }
    return `${this.prefix}${id2}${this.suffix}`;
  }
  /**
   * 批量生成ID
   */
  generateBatch(count) {
    return Array.from({ length: count }, () => this.generate());
  }
  /**
   * 更新配置
   */
  updateConfig(config) {
    if (config.strategy !== void 0) {
      this.strategy = config.strategy;
    }
    if (config.length !== void 0) {
      this.length = config.length;
    }
    if (config.prefix !== void 0) {
      this.prefix = config.prefix;
    }
    if (config.suffix !== void 0) {
      this.suffix = config.suffix;
    }
  }
}
function createIdGenerator(config) {
  return new IdGenerator(config);
}
let globalIdGenerator = null;
function getGlobalIdGenerator() {
  if (!globalIdGenerator) {
    globalIdGenerator = new IdGenerator();
  }
  return globalIdGenerator;
}
function setGlobalIdGenerator(generator) {
  globalIdGenerator = generator;
}
function id(strategy, length) {
  const generator = new IdGenerator({ strategy, length });
  return generator.generate();
}

exports.IdGenerator = IdGenerator;
exports.createIdGenerator = createIdGenerator;
exports.generateBase62Id = generateBase62Id;
exports.generateHexId = generateHexId;
exports.generateNumericId = generateNumericId;
exports.generateShortId = generateShortId;
exports.generateSnowflakeId = generateSnowflakeId;
exports.generateTimestampId = generateTimestampId;
exports.generateUUID = generateUUID;
exports.getGlobalIdGenerator = getGlobalIdGenerator;
exports.id = id;
exports.resetNumericCounter = resetNumericCounter;
exports.setGlobalIdGenerator = setGlobalIdGenerator;
/*! End of @ldesign/api | Powered by @ldesign/builder */
//# sourceMappingURL=IdGenerator.cjs.map
