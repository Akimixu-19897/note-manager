/**
 * @name AutoImportDeps
 * @description 按需加载，自动引入
 */

import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import IconsResolver from 'unplugin-icons/resolver'

export const AutoImportDeps = () => {
  return AutoImport({
    dts: 'types/auto-import.d.ts',
    dirs: ['./src/assets/**'],
    imports: [
      'vue',
      'vue-router',
      'vue-i18n',
      '@vueuse/head',
      '@vueuse/core',
      'pinia',
      {
        '@/i18n': [['default', 'i18n'], 'setI18n']
      },
      {
        from: '@/types',
        imports: [],
        type: true
      },
      {
        from: 'element-plus',
        imports: [
          'FormInstance',
          'FormRules',
          'FormItemRule',
          'TableInstance',
          'CheckboxValueType',
          'Action'
        ],
        type: true
      }
    ],
    resolvers: [
      ElementPlusResolver({
        importStyle: 'sass'
      }),
      IconsResolver({
        prefix: 'icon',
        enabledCollections: ['file-icons'],
        customCollections: ['rj', 'menu']
      })
    ]
  })
}
