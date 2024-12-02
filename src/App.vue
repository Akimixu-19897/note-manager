<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { RouterView } from 'vue-router'
const { locale, messages } = useI18n()
const elementPlusLocale = ref()
watchEffect(() => {
  elementPlusLocale.value = messages.value[locale.value].elementPlusLocale
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <RouterView />
  </el-config-provider>
</template>

<style scoped lang="scss"></style>
