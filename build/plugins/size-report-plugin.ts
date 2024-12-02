// size-report-plugin.ts
import { Plugin } from 'vite'

export const sizeReportPlugin = (): Plugin => {
  return {
    name: 'size-report',
    apply: 'build', // 仅在构建时应用此插件
    async closeBundle() {
      const fs = await import('fs')
      const path = await import('path')

      const distPath = path.resolve(__dirname, '../../dist')
      let totalSize = 0

      // 递归计算文件大小
      const calculateSize = (dir: string) => {
        const files = fs.readdirSync(dir)
        for (const file of files) {
          const filePath = path.join(dir, file)
          const stat = fs.statSync(filePath)
          if (stat.isDirectory()) {
            calculateSize(filePath) // 如果是目录，则递归计算
          } else {
            totalSize += stat.size // 累加文件大小
          }
        }
      }

      calculateSize(distPath)

      // 转换为可读的格式（例如：KB，MB）
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let unitIndex = 0
      while (totalSize >= 1024 && unitIndex < units.length - 1) {
        totalSize /= 1024
        unitIndex++
      }

      // 输出结果
      console.log(
        `\n\x1B[33m\x1B[4m打出来的包大小: ${totalSize.toFixed(2)}${units[unitIndex]}\x1B[0m\n`
      )
    }
  }
}
