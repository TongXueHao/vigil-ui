<template>
  <el-main class="main-content">
    <div class="about-container">
      <!-- 页面标题区域 -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-badge">
            <el-icon><i class="i-ep-star-filled" /></el-icon>
            <span>开源项目</span>
          </div>
          <h1 class="page-title gradient-text">关于 Vigil</h1>
          <p class="page-subtitle">基于 Spring Boot 的 JVM 监控和实时日志流式传输工具</p>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="goToGitHub">
              <el-icon><i class="i-ep-link" /></el-icon>
              查看源码
            </el-button>
            <el-button size="large" @click="goToDocs">
              <el-icon><i class="i-ep-document" /></el-icon>
              使用文档
            </el-button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="floating-card">
            <div class="card-header">
              <div class="card-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div class="card-content">
              <div class="metric-item">
                <span class="metric-label">内存使用率</span>
                <div class="metric-bar">
                  <div class="metric-fill" style="width: 65%"></div>
                </div>
                <span class="metric-value">65%</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">活跃线程</span>
                <div class="metric-bar">
                  <div class="metric-fill" style="width: 42%"></div>
                </div>
                <span class="metric-value">42</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">GC 次数</span>
                <div class="metric-bar">
                  <div class="metric-fill" style="width: 28%"></div>
                </div>
                <span class="metric-value">28</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能特性区域 -->
      <div class="features-section">
        <div class="section-header">
          <h2 class="section-title">核心功能</h2>
          <p class="section-subtitle">为 Java 应用提供全面的监控和日志管理能力</p>
        </div>
        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in features" :key="feature.title" :style="{ '--delay': index * 0.1 + 's' }">
            <div class="feature-icon">
              <el-icon :size="32" :color="feature.color">
                <i :class="feature.icon" />
              </el-icon>
            </div>
            <div class="feature-content">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
              <div class="feature-highlights">
                <div class="highlight-item" v-for="item in feature.items.slice(0, 3)" :key="item">
                  <el-icon size="12" color="#10b981"><i class="i-ep-check" /></el-icon>
                  <span>{{ item }}</span>
                </div>
                <div class="highlight-item more" v-if="feature.items.length > 3">
                  <el-icon size="12" color="#6366f1"><i class="i-ep-more" /></el-icon>
                  <span>还有 {{ feature.items.length - 3 }} 项功能</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 技术栈区域 -->
      <div class="tech-section">
        <div class="section-header">
          <h2 class="section-title">技术栈</h2>
          <p class="section-subtitle">基于现代化的技术栈构建</p>
        </div>
        <div class="tech-grid">
          <div class="tech-category" v-for="category in techStack" :key="category.name">
            <h4>{{ category.name }}</h4>
            <div class="tech-tags">
              <span class="tech-tag" v-for="tech in category.technologies" :key="tech.name" :class="tech.type">
                {{ tech.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 贡献指南区域 -->
      <div class="contribute-section">
        <div class="section-header">
          <h2 class="section-title">参与贡献</h2>
          <p class="section-subtitle">欢迎参与 Vigil 的开发和完善</p>
        </div>
        <div class="contribute-grid">
          <div class="contribute-card" v-for="action in contributeActions" :key="action.title">
            <div class="card-icon">
              <el-icon :size="24" :color="action.color">
                <i :class="action.icon" />
              </el-icon>
            </div>
            <div class="card-content">
              <h4>{{ action.title }}</h4>
              <p>{{ action.description }}</p>
              <el-button :type="action.buttonType" size="small" @click="action.action">
                {{ action.buttonText }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-main>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 功能特性数据
const features = ref([
  {
    title: 'JVM 运行时监控',
    description: '全面监控运行时 JVM 各项指标',
    icon: 'i-ep-monitor',
    color: '#6366f1',
    items: [
      '内存监控：堆内存、非堆内存使用情况',
      '内存池详情：Eden Space、Survivor Space、Old Generation、Metaspace、Code Cache 等',
      '缓冲区池：Direct Memory、Mapped Memory 使用统计',
      '垃圾回收：GC 执行次数、耗时统计',
      '线程监控：活跃线程数、守护线程数、峰值线程数、死锁检测',
      '类加载：已加载类数量、总加载数、卸载数',
      'JIT 编译：编译器信息、编译耗时',
      '运行时信息：JVM 版本、启动参数、运行时长',
      '系统资源：CPU 使用率、物理内存、Swap 空间'
    ]
  },
  {
    title: '实时日志流',
    description: '基于 SSE 的响应式日志流传输',
    icon: 'i-ep-view',
    color: '#22c55e',
    items: [
      'SSE 支持：基于 Server-Sent Events 的实时日志流',
      '响应式架构：使用 Reactor 实现非阻塞日志传输',
      '包名过滤：支持按包名过滤日志事件',
      '异常处理：完整的异常堆栈跟踪信息',
      'JSON 格式：标准化的日志事件数据结构'
    ]
  },
  {
    title: 'Spring Boot Starter',
    description: '零侵入的自动化集成方案',
    icon: 'i-ep-box',
    color: '#f59e0b',
    items: [
      '自动配置：开箱即用的自动配置支持',
      '零侵入：无需修改现有代码，只需添加依赖',
      '条件化加载：支持通过配置控制功能启用/禁用'
    ]
  }
])

// 技术栈数据
const techStack = ref([
  {
    name: '后端技术',
    technologies: [
      { name: 'Java 17', type: 'primary' },
      { name: 'Spring Boot', type: 'success' },
      { name: 'Reactor', type: 'warning' },
      { name: 'Logback', type: 'info' }
    ]
  },
  {
    name: '监控技术',
    technologies: [
      { name: 'Micrometer', type: 'primary' },
      { name: 'Actuator', type: 'success' },
      { name: 'SSE', type: 'warning' }
    ]
  },
  {
    name: '前端技术',
    technologies: [
      { name: 'Vue 3', type: 'primary' },
      { name: 'TypeScript', type: 'success' },
      { name: 'Element Plus', type: 'warning' },
      { name: 'Vite', type: 'info' }
    ]
  }
])

// 贡献行动数据
const contributeActions = ref([
  {
    title: '问题反馈',
    description: '遇到问题或有建议？欢迎提交 Issue',
    icon: 'i-ep-message',
    color: '#6366f1',
    buttonType: 'primary',
    buttonText: '提交 Issue',
    action: () => goToGitHub()
  },
  {
    title: '贡献代码',
    description: '欢迎提交 Pull Request 参与开发',
    icon: 'i-ep-star',
    color: '#22c55e',
    buttonType: 'success',
    buttonText: 'Fork 项目',
    action: () => goToGitHub()
  },
  {
    title: '分享项目',
    description: '如果觉得有用，请给个 Star',
    icon: 'i-ep-share',
    color: '#f59e0b',
    buttonType: 'warning',
    buttonText: '给个 Star',
    action: () => goToGitHub()
  }
])

// 跳转方法
const goToGitHub = () => {
  window.open('https://github.com/TongXueHao/vigil', '_blank')
}

const goToDocs = () => {
  window.open('https://github.com/TongXueHao/vigil', '_blank')
}
</script>

<style scoped>
.main-content {
  flex: 1;
  padding: 0;
  overflow: hidden;
  height: calc(100vh - 60px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.main-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(245, 158, 11, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.about-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

/* Hero Section */
.hero-section {
  display: flex;
  align-items: center;
  min-height: 60vh;
  padding: 40px 20px;
  gap: 60px;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin-bottom: 24px;
}

.page-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.gradient-text {
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #e0f2fe 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 32px;
  line-height: 1.6;
  font-weight: 400;
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.floating-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 320px;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.card-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.card-dots {
  display: flex;
  gap: 6px;
}

.card-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e5e7eb;
}

.card-dots span:first-child { background: #ef4444; }
.card-dots span:nth-child(2) { background: #f59e0b; }
.card-dots span:last-child { background: #10b981; }

.card-content {
  padding: 20px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.metric-item:last-child {
  margin-bottom: 0;
}

.metric-label {
  font-size: 14px;
  color: #6b7280;
  min-width: 80px;
}

.metric-bar {
  flex: 1;
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #22c55e);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  min-width: 30px;
  text-align: right;
}

/* Section Headers */
.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* Features Section */
.features-section {
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 32px;
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease forwards;
  animation-delay: var(--delay);
  opacity: 0;
  transform: translateY(30px);
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  margin-bottom: 20px;
}

.feature-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 12px;
  color: #1f2937;
}

.feature-content p {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 20px;
  line-height: 1.6;
}

.feature-highlights {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
}

.highlight-item.more {
  color: #6366f1;
  font-weight: 500;
}

/* Tech Section */
.tech-section {
  padding: 60px 20px;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.tech-category {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 24px;
  text-align: center;
}

.tech-category h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin: 0 0 16px;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.tech-tag {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.tech-tag.primary {
  background: rgba(99, 102, 241, 0.2);
  color: #c7d2fe;
}

.tech-tag.success {
  background: rgba(16, 185, 129, 0.2);
  color: #a7f3d0;
}

.tech-tag.warning {
  background: rgba(245, 158, 11, 0.2);
  color: #fde68a;
}

.tech-tag.info {
  background: rgba(59, 130, 246, 0.2);
  color: #bfdbfe;
}

/* Contribute Section */
.contribute-section {
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.contribute-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.contribute-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
}

.contribute-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.card-icon {
  margin-bottom: 16px;
}

.contribute-card h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
}

.contribute-card p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    gap: 40px;
    min-height: auto;
    padding: 40px 20px;
  }
  
  .hero-content {
    max-width: 100%;
  }
  
  .page-title {
    font-size: 3rem;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .tech-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .contribute-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .floating-card {
    width: 280px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .floating-card {
    width: 260px;
  }
}
</style>