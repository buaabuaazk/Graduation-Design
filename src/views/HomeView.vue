<!--
 * @Author: buaabuaazk 2447230029@qq.com
 * @Date: 2025-03-02 16:15:15
 * @LastEditors: buaabuaazk 2447230029@qq.com
 * @LastEditTime: 2025-05-11 09:33:53
 * @FilePath: \my-vue-electron-app\src\views\HomeView.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="home-container">
    <!-- 顶部欢迎区域 -->
    <div class="welcome-section">
      <h1 class="welcome-title">欢迎使用用例分析工具</h1>
      <p class="welcome-subtitle">基于用例图的工作量估算工具</p>
    </div>

    <!-- 主要功能区域 -->
    <div class="features-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="feature-card">
            <template #header>
              <div class="card-header">
                <el-icon><Upload /></el-icon>
                <span>用例图分析</span>
              </div>
            </template>
            <div class="card-content">
              <p>上传用例图，自动识别角色和用例</p>
              <p>支持多种大模型分析</p>
              <p>智能评估复杂度</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="feature-card">
            <template #header>
              <div class="card-header">
                <el-icon><DataAnalysis /></el-icon>
                <span>工作量估算</span>
              </div>
            </template>
            <div class="card-content">
              <p>基于用例点方法</p>
              <p>考虑技术复杂度因子</p>
              <p>考虑环境复杂度因子</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="feature-card">
            <template #header>
              <div class="card-header">
                <el-icon><Document /></el-icon>
                <span>结果导出</span>
              </div>
            </template>
            <div class="card-content">
              <p>详细的分析报告</p>
              <p>可视化图表展示</p>
              <p>支持多种导出格式</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 使用指南区域 -->
    <div class="guide-section">
      <h2 class="section-title">使用指南</h2>
      <el-steps :active="1" finish-status="success" align-center>
        <el-step title="上传用例图" description="支持JPG、PNG格式的用例图"></el-step>
        <el-step title="输入系统描述" description="添加系统背景和功能说明"></el-step>
        <el-step title="选择分析模型" description="支持多种大模型分析"></el-step>
        <el-step title="查看结果" description="获取详细的工作量估算"></el-step>
      </el-steps>
    </div>

    <!-- 开始使用按钮 -->
    <div class="action-section">
      <el-button type="primary" size="large" @click="startAnalysis">
        开始分析
        <el-icon class="el-icon--right"><ArrowRight /></el-icon>
      </el-button>
    </div>

    <!-- 统计信息区域 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-value">100+</div>
            <div class="stat-label">已分析用例图</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-value">95%</div>
            <div class="stat-label">准确率</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-value">3</div>
            <div class="stat-label">支持的大模型</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { Upload, DataAnalysis, Document, ArrowRight } from '@element-plus/icons-vue';

const router = useRouter();

const startAnalysis = () => {
  router.push('/work');
};
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 60px;
}

.welcome-title {
  font-size: 2.5em;
  color: #303133;
  margin-bottom: 10px;
}

.welcome-subtitle {
  font-size: 1.2em;
  color: #606266;
}

.features-section {
  margin-bottom: 60px;
}

.feature-card {
  height: 100%;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2em;
  font-weight: 500;
}

.card-content {
  color: #606266;
  line-height: 1.6;
}

.guide-section {
  margin-bottom: 60px;
}

.section-title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.action-section {
  text-align: center;
  margin-bottom: 60px;
}

.stats-section {
  margin-bottom: 40px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.stat-card:hover {
  background: #ecf5ff;
}

.stat-value {
  font-size: 2em;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 10px;
}

.stat-label {
  color: #606266;
}

:deep(.el-step__title) {
  font-size: 1.1em;
}

:deep(.el-step__description) {
  font-size: 0.9em;
}
</style>
