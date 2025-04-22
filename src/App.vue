<!--
 * @Author: buaabuaazk 2447230029@qq.com
 * @Date: 2025-03-02 16:15:15
 * @LastEditors: buaabuaazk 2447230029@qq.com
 * @LastEditTime: 2025-04-20 20:01:30
 * @FilePath: \3_2\my-vue-electron-app\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="app-container">
    <nav class="nav-bar">
      <div class="nav-container">
        <router-link to="/" class="nav-item">Intro</router-link>
        <router-link to="/work" class="nav-item">Work</router-link>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  padding: 0;
  z-index: 1000;
}

.nav-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  height: 100%;
}

.nav-item {
  text-decoration: none;
  color: #303133;
  font-size: 16px;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  transition: color 0.3s;
}

.nav-item:hover {
  color: #409EFF;
}

.nav-item.router-link-active {
  color: #409EFF;
  border-bottom: 2px solid #409EFF;
}

/* 为固定导航栏腾出空间 */
.work-container {
  padding-top: 80px;
}
</style>
