import 'dayjs/locale/zh-cn'
import elementPlusLocale from 'element-plus/dist/locale/zh-cn.mjs'
import messages from './messages.json'

export default {
  messages: {
    elementPlusLocale: elementPlusLocale,
    ...messages
  },
  dayjsLocale: 'zh-cn'
}
