/**
 * @name createVitePlugins
 * @description 封装plugins数组统一调用
 */
import { PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VitePluginCertificate from 'vite-plugin-mkcert'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import { AutoRegistryComponents } from './component'
import { AutoImportDeps } from './autoImport'
import { ConfigVisualizerConfig } from './visualizer'
import { ConfigCompressPlugin } from './compress'
import { ConfigRestartPlugin } from './restart'
import { ConfigProgressPlugin } from './progress'
import { sizeReportPlugin } from './size-report-plugin'
import { ConfigSvgIconsPlugin } from './svgIcons'

export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean) {
  const { VITE_USE_COMPRESS } = viteEnv

  const vitePlugins: (PluginOption | PluginOption[])[] = [
    // vue支持
    vue(),
    // JSX支持
    vueJsx(),
    // setup语法糖组件名支持
    vueSetupExtend(),
    // 提供https证书
    VitePluginCertificate({
      source: 'coding'
    })
  ]

  // 自动按需引入组件
  vitePlugins.push(AutoRegistryComponents())

  // 自动按需引入依赖
  vitePlugins.push(AutoImportDeps())

  // 监听配置文件改动重启
  vitePlugins.push(ConfigRestartPlugin())

  // 构建时显示进度条
  vitePlugins.push(ConfigProgressPlugin())

  // rollup-plugin-visualizer
  vitePlugins.push(ConfigVisualizerConfig())

  // vite-plugin-svg-icons
  vitePlugins.push(ConfigSvgIconsPlugin(isBuild))

  if (isBuild) {
    // 开启.gz压缩  rollup-plugin-gzip
    VITE_USE_COMPRESS && vitePlugins.push(ConfigCompressPlugin())
    // 查看打包后的dist目录大小
    vitePlugins.push(sizeReportPlugin())
  }

  return vitePlugins
}
