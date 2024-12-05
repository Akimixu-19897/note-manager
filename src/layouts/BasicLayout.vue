<template>
  <el-container class="basic-layout" direction="vertical">
    <!-- <HeaderView /> -->
    <el-container class="main-container">
      <!-- <el-aside>
        <MenuView />
      </el-aside> -->
      <el-main class="layout-main">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
// import HeaderView from './HeaderView.vue'
// import MenuView from './MenuView.vue'
</script>

<style lang="scss" scoped>
.basic-layout {
  height: 100vh;
  overflow: auto;
  background-color: var(--bg-100);
}
</style>
