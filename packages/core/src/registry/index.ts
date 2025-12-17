/**
 * API 注册表模块
 */

export {
  createCrudApis,
  createLeapApis,
  defineApiModule,
  defineLeapApi,
  defineLeapServer,
  defineRestfulApi,
  defineRestfulServer,
  defineServer,
} from './ApiRegistry'

export type {
  ApiModule,
  LeapApiBuilder,
  RestfulApiBuilder,
} from './ApiRegistry'
