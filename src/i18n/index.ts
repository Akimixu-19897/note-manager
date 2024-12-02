import { createI18n } from 'vue-i18n'
import dayjs from 'dayjs'

const i18n: any = createI18n({
  locale: '',
  globalInjection: true,
  legacy: false
  // allowComposition: true, // 是否允许在 Legacy API 模式下使用 Composition API
})

export async function setI18n(name: any) {
  try {
    const i18nConfig = (await import(`./${name}/index.ts`)).default
    i18n.global.setLocaleMessage(name, i18nConfig.messages)
    i18n.global.locale.value = name
    dayjs.locale(i18nConfig.dayjsLocale)
    document?.querySelector('html')?.setAttribute('lang', name)
  } catch (error: any) {
    throw new Error(error)
  }
}

export default i18n
