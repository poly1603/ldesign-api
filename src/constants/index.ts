/**
 * API 包全局常量配置
 * 集中管理所有魔法数字和配置常量
 */

/**
 * HTTP 相关常量
 */
export const HTTP_CONSTANTS = {
  /** 默认超时时间（毫秒） */
  DEFAULT_TIMEOUT: 10000,
  /** 长超时时间（开发模式，毫秒） */
  DEVELOPMENT_TIMEOUT: 30000,
  /** 短超时时间（测试模式，毫秒） */
  TEST_TIMEOUT: 5000,
} as const

/**
 * 缓存相关常量
 */
export const CACHE_CONSTANTS = {
  /** 默认缓存 TTL（5分钟，毫秒） */
  DEFAULT_TTL: 300000,
  /** 短期缓存 TTL（1分钟，毫秒） */
  SHORT_TTL: 60000,
  /** 中期缓存 TTL（10分钟，毫秒） */
  MEDIUM_TTL: 600000,
  /** 长期缓存 TTL（30分钟，毫秒） */
  LONG_TTL: 1800000,
  /** 超长期缓存 TTL（1小时，毫秒） */
  VERY_LONG_TTL: 3600000,
  /** 默认最大缓存条目数 */
  DEFAULT_MAX_SIZE: 100,
  /** 大缓存最大条目数 */
  LARGE_MAX_SIZE: 200,
  /** 小缓存最大条目数 */
  SMALL_MAX_SIZE: 50,
  /** 缓存键前缀 */
  DEFAULT_PREFIX: 'ldesign_api_cache_',
  /** 统计更新间隔（毫秒） */
  STATS_UPDATE_INTERVAL: 10000,
  /** 大缓存阈值（用于采样估算） */
  LARGE_CACHE_THRESHOLD: 100,
  /** 采样大小 */
  SAMPLE_SIZE: 20,
  /** 缓存清理间隔（5分钟，毫秒） */
  CLEANUP_INTERVAL: 300000,
  /** LRU淘汰比例 */
  EVICTION_RATIO: 0.1,
} as const

/**
 * 防抖相关常量
 */
export const DEBOUNCE_CONSTANTS = {
  /** 默认防抖延迟（毫秒） */
  DEFAULT_DELAY: 300,
  /** 快速防抖延迟（毫秒） */
  FAST_DELAY: 100,
  /** 慢速防抖延迟（毫秒） */
  SLOW_DELAY: 500,
  /** 最大防抖项数量 */
  MAX_ITEMS: 1000,
  /** 自动清理间隔（1分钟，毫秒） */
  AUTO_CLEANUP_INTERVAL: 60000,
  /** 最大保留时间（1分钟，毫秒） */
  MAX_AGE: 60000,
} as const

/**
 * 请求去重相关常量
 */
export const DEDUPLICATION_CONSTANTS = {
  /** 最大去重项数量 */
  MAX_ITEMS: 500,
  /** 清理间隔（1分钟，毫秒） */
  CLEANUP_INTERVAL: 60000,
  /** 最大保留时间（5分钟，毫秒） */
  MAX_AGE: 300000,
  /** 过早清理比例 */
  STALE_CLEANUP_RATIO: 0.2,
} as const

/**
 * 重试相关常量
 */
export const RETRY_CONSTANTS = {
  /** 默认最大重试次数 */
  DEFAULT_MAX_RETRIES: 3,
  /** 默认重试延迟（毫秒） */
  DEFAULT_DELAY: 1000,
  /** 默认最大延迟（毫秒） */
  DEFAULT_MAX_DELAY: 30000,
  /** 默认抖动比例（0-1） */
  DEFAULT_JITTER: 0.1,
} as const

/**
 * 断路器相关常量
 */
export const CIRCUIT_BREAKER_CONSTANTS = {
  /** 默认失败阈值 */
  DEFAULT_FAILURE_THRESHOLD: 5,
  /** 默认半开等待时间（30秒，毫秒） */
  DEFAULT_HALF_OPEN_AFTER: 30000,
  /** 默认成功阈值 */
  DEFAULT_SUCCESS_THRESHOLD: 1,
  /** 清理间隔（1小时，毫秒） */
  CLEANUP_INTERVAL: 3600000,
  /** 过期时间（24小时，毫秒） */
  EXPIRE_TIME: 86400000,
} as const

/**
 * 对象池相关常量
 */
export const OBJECT_POOL_CONSTANTS = {
  /** 上下文池默认最大容量 */
  MAX_CONTEXTS: 200,
  /** 配置池默认最大容量 */
  MAX_CONFIGS: 200,
  /** 缓存键池默认最大容量 */
  MAX_CACHE_KEYS: 500,
  /** 通用数组池默认最大容量 */
  MAX_ARRAYS: 100,
  /** 热池最大容量 */
  HOT_POOL_MAX_SIZE: 100,
  /** 冷池最大容量 */
  COLD_POOL_MAX_SIZE: 100,
  /** 预热数量 */
  PREWARM_COUNT: 20,
} as const

/**
 * 请求队列相关常量
 */
export const QUEUE_CONSTANTS = {
  /** 默认并发数 */
  DEFAULT_CONCURRENCY: 5,
  /** 默认最大队列长度（0表示无限） */
  DEFAULT_MAX_QUEUE: 0,
  /** 高并发数 */
  HIGH_CONCURRENCY: 10,
  /** 低并发数 */
  LOW_CONCURRENCY: 2,
} as const

/**
 * 性能监控相关常量
 */
export const PERFORMANCE_CONSTANTS = {
  /** 性能记录保留时间（10分钟，毫秒） */
  RECORD_RETENTION: 600000,
  /** 最大性能记录数 */
  MAX_RECORDS: 1000,
  /** 分位数计算点 */
  PERCENTILES: [50, 75, 90, 95, 99],
  /** 慢请求阈值（毫秒） */
  SLOW_REQUEST_THRESHOLD: 3000,
} as const

/**
 * 内存相关常量
 */
export const MEMORY_CONSTANTS = {
  /** 最大内存使用（字节，100MB） */
  MAX_MEMORY_USAGE: 100 * 1024 * 1024,
  /** 内存警告阈值（字节，80MB） */
  MEMORY_WARNING_THRESHOLD: 80 * 1024 * 1024,
  /** 内存检查间隔（30秒，毫秒） */
  MEMORY_CHECK_INTERVAL: 30000,
  /** UTF-16 字符字节数 */
  UTF16_CHAR_SIZE: 2,
  /** 基础对象开销（字节） */
  OBJECT_OVERHEAD: 24,
  /** 节点对象开销（字节） */
  NODE_OVERHEAD: 64,
  /** 字符串最大估算大小（64KB） */
  MAX_STRING_ESTIMATE: 65536,
  /** 数组/对象最大估算大小（1MB） */
  MAX_COLLECTION_ESTIMATE: 1048576,
} as const

/**
 * 序列化相关常量
 */
export const SERIALIZATION_CONSTANTS = {
  /** 简单对象最大键数量 */
  SIMPLE_OBJECT_MAX_KEYS: 20,
  /** 小数组阈值 */
  SMALL_ARRAY_THRESHOLD: 5,
  /** 大数组阈值 */
  LARGE_ARRAY_THRESHOLD: 100,
  /** 小对象阈值 */
  SMALL_OBJECT_THRESHOLD: 5,
  /** 数组采样大小 */
  ARRAY_SAMPLE_SIZE: 10,
  /** 对象采样大小 */
  OBJECT_SAMPLE_SIZE: 10,
  /** FNV哈希偏移基数 */
  FNV_OFFSET_BASIS: 2166136261,
} as const

/**
 * 中间件相关常量
 */
export const MIDDLEWARE_CONSTANTS = {
  /** 中间件缓存最大条目数 */
  CACHE_MAX_SIZE: 100,
  /** 中间件缓存 TTL（1小时，毫秒） */
  CACHE_TTL: 3600000,
} as const

/**
 * LRU 缓存相关常量
 */
export const LRU_CONSTANTS = {
  /** 默认清理间隔（5分钟，毫秒） */
  DEFAULT_CLEANUP_INTERVAL: 300000,
  /** 内存使用重新计算间隔（缓存大小变化） */
  MEMORY_RECALC_THRESHOLD: 20,
  /** 内存使用重新计算周期 */
  MEMORY_RECALC_PERIOD: 50,
  /** 值大小估算采样大小 */
  VALUE_SIZE_SAMPLE: 10,
  /** 浅层估算最大键数 */
  SHALLOW_ESTIMATE_MAX_KEYS: 10,
  /** 估算值最大大小（1KB） */
  ESTIMATE_MAX_SIZE: 1024,
} as const

/**
 * REST API 相关常量
 */
export const REST_CONSTANTS = {
  /** 列表缓存 TTL（5分钟，毫秒） */
  LIST_CACHE_TTL: 300000,
  /** 默认 ID 参数名 */
  DEFAULT_ID_PARAM: 'id',
} as const

/**
 * 系统 API 相关常量
 */
export const SYSTEM_API_CONSTANTS = {
  /** 验证码默认过期时间（5分钟，秒） */
  CAPTCHA_EXPIRES_IN: 300,
  /** Token 存储键 */
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_INFO_KEY: 'user_info',
} as const

/**
 * 日志相关常量
 */
export const LOG_CONSTANTS = {
  /** 日志前缀 */
  PREFIX: '[API Engine]',
  /** 错误日志前缀 */
  ERROR_PREFIX: '[API Engine Error]',
  /** 警告日志前缀 */
  WARN_PREFIX: '[API Engine Warning]',
} as const

/**
 * 开发相关常量
 */
export const DEV_CONSTANTS = {
  /** 是否为开发模式 */
  IS_DEV: typeof process !== 'undefined' && process.env?.NODE_ENV === 'development',
  /** 是否为测试模式 */
  IS_TEST: typeof process !== 'undefined' && process.env?.NODE_ENV === 'test',
  /** 是否为生产模式 */
  IS_PROD: typeof process !== 'undefined' && process.env?.NODE_ENV === 'production',
} as const


