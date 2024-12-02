/**
 * @name  AutoRegistryComponents
 * @description 按需加载，自动引入组件
 */

import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export const AutoRegistryComponents = () => {
  return Components({
    dirs: ['src/components'],
    extensions: ['vue', 'md'],
    deep: true,
    dts: 'types/components.d.ts',
    directoryAsNamespace: false, //这个是默认值，就是把每个目录当作一个命名空间
    globalNamespaces: [], //这个是默认值，就是不引入全局命名空间
    directives: true, //这个是默认值，就是引入所有指令
    include: [/\.vue$/, /\.vue\?vue/, /\.md$/], //这个是默认值，就是引入所有文件
    exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/],
    resolvers: [
      ElementPlusResolver({
        importStyle: 'sass'
      })
    ]
  })
}
