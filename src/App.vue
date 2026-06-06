<script setup lang="ts">
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { RouterView } from "vue-router";

const { locale, messages } = useI18n();
const elementPlusLocale = computed(() => {
  return (messages.value[locale.value]?.elementPlusLocale || zhCn) as typeof zhCn;
});
</script>

<template>
  <el-config-provider :locale="elementPlusLocale">
    <RouterView />
  </el-config-provider>
</template>

<style scoped lang="scss"></style>
