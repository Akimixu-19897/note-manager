import { fileURLToPath, URL } from 'node:url'
import { loadEnv, ConfigEnv, UserConfig } from 'vite'
import { createVitePlugins } from './build/plugins/index'
import { wrapperEnv } from './build/utils'
import viteCompression from 'vite-plugin-compression'

export default ({ command, mode }: ConfigEnv): UserConfig => {
  console.log('command:', command, mode)

  const isBuild = command === 'build'
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const viteEnv = wrapperEnv(env)

  return {
    base: '/', // 设置打包路径
    plugins: createVitePlugins(viteEnv, isBuild),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: '0.0.0.0',
      open: true,
      port: 9528
    },
    build: {
      outDir: 'dist', // 打包输出目录
      target: 'es2020',
      minify: 'terser', // 压缩代码
      // rollup 配置
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js', // 引入文件名的名称
          entryFileNames: 'js/[name]-[hash].js', // 包的入口文件名称
          assetFileNames: '[ext]/[name]-[hash].[ext]', // 资源文件像 字体，图片等
          // 构建过程中如何分块文件
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          }
        },
        //  告诉打包工具 在external配置的 都是外部依赖项  不需要打包
        // external: ['vue', 'element-plus'],
        plugins: [
          // 告诉打包工具  这些是外部依赖项  从外部引入
          // externalGlobals({
          //   vue: 'Vue',
          //   'element-plus': 'ElementPlus',
          // }),
          // 压缩文件
          viteCompression({
            verbose: true, //是否在控制台中输出压缩结果
            disable: false,
            threshold: 10240, //如果体积大于阈值，将被压缩，单位为b，体积过小时请不要压缩，以免适得其反
            algorithm: 'gzip', //压缩算法，可选['gzip'，'brotliccompress'，'deflate'，'deflateRaw']
            ext: '.gz',
            deleteOriginFile: false //源文件压缩后是否删除
          })
        ]
      },
      terserOptions: {
        compress: {
          //生产环境时移除console
          drop_console: true,
          drop_debugger: true
        }
      }
    }
  }
}
