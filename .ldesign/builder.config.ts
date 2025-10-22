export default {
  // 排除不需要打包的依赖
  external: (id: string) => {
    // 排除所有 node_modules 中的包
    if (id.includes('node_modules')) return true
    // 排除特定的包
    if (/^(fsevents|chokidar)/.test(id)) return true
    return false
  },
  // 输出配置
  output: {
    esm: {
      dir: 'es',
      preserveStructure: true,
      dts: true
    },
    cjs: {
      dir: 'lib',
      preserveStructure: true,
      dts: true
    }
  }
}
