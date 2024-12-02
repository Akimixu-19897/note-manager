<template>
 <div>
  头
 </div>
</template>

<script lang="ts" setup>



const isDark = useDark()

const toggleDark = useToggle(isDark)

// 未使用函数，且直接通过document操作cookie了
// const clearStorage = () => {
//   localStorage.clear()
//   sessionStorage.clear()
//   document.cookie = ''
// }





onMounted(() => {
  // 默认展示浅色
  if (isDark.value) {
    toggleDark()
  }
})
</script>

<style lang="scss" scoped>
.el-header {
  &.sunny {
    background-color: var(--el-header-side-sunny-bg-color);
  }
  --el-header-padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .el-icon {
    cursor: pointer;
  }
  .header-left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: none;
    height: 30px;
    box-sizing: border-box;
    .logo {
      flex: none;
      box-sizing: border-box;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .el-image {
        height: 32px;
      }
    }
  }
  // .header-center {
  //   padding: var(--el-header-padding);
  // }
  .space {
    flex: auto;
  }
  .header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .el-button.is-text {
      // --el-button-text-color: var(--el-text-color-primary);
      padding: 8px;
      margin-left: 16px;
      width: 34px;
      height: 34px;
      :deep(.el-badge__content.is-fixed) {
        transform: translateY(-50%) translateX(100%) scale(0.8);
      }
    }
    .el-icon {
      font-size: 16px;
    }

    :deep(.header-popover-notice) {
      border-radius: 6px;
      padding: 10px 0 0;
      .el-tabs__header {
        margin: 0;
      }
      .el-tabs__item {
        padding: 12px 16px !important;
      }
      .notice-list {
        .notice-item {
          padding: 16px 16px 16px 24px;
          box-sizing: border-box;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .el-text {
            line-height: 28px;
          }
        }
      }
      .notice-more {
        padding: 12px 0;
        border-top: var(--el-border);
        display: flex;
        justify-content: center;
      }
    }

    :deep(.header-popover-list) {
      border-radius: 6px;
      padding: 4px;

      .header-popover-item {
        text-decoration: none;
        border-radius: 2px;
        padding: 8px 12px;
        margin-top: 2px;
        display: flex;
        align-items: center;
        cursor: pointer;
        a {
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        .el-icon {
          margin-right: 6px;
          color: var(--el-text-color-regular);
        }
        // .el-text {
        // color: var(--el-text-color-regular);
        // }
        &:first-child {
          margin-top: 0;
        }
        &:hover {
          background: var(--el-bg-color);
          // .el-icon {
          // color: var(--el-color-white);
          // }
          // .el-text {
          // color: var(--el-color-white);
          // }
        }
      }
    }

    .user-box {
      display: flex;
      align-items: center;
      cursor: pointer;
      margin-left: 16px;
      // color: var(--el-text-color-regular);
      // .el-avatar {
      // border: 1px solid var(--el-color-white);
      // }
      .el-text {
        margin: 0 4px;
      }
    }
  }
}
</style>
