<template>
  <div class="container_box">
    <el-container class="full-container">
      <el-header class="app-header">
        <div class="header-container">
          <div class="logo" @click="go('/')">
            <span class="logo-text">Vigil</span>
          </div>

          <div class="nav" v-show="!isMobile || menuOpen">
            <el-menu
              class="nav-menu"
              mode="horizontal"
              :ellipsis="false"
              :router="true"
              :default-active="activePath"
            >
              <el-menu-item index="/">首页</el-menu-item>
              <el-menu-item index="/logs">日志</el-menu-item>
              <el-menu-item index="/monitor">监控</el-menu-item>
              <!-- <el-menu-item index="/about">关于</el-menu-item> -->
            </el-menu>
          </div>

          <div class="right-side">
            <el-button 
              class="github-btn" 
              text 
              circle 
              @click="goToGitHub"
              title="查看 GitHub 项目"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </el-button>
            
          </div>
        </div>
      </el-header>

      <router-view></router-view>
    </el-container>
  </div>
  
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const activePath = computed(() => route.path);

const isMobile = ref(false);
const menuOpen = ref(false);

const detectMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) menuOpen.value = false;
};

const go = (path: string) => router.push(path);

const goToGitHub = () => {
  window.open('https://github.com/TongXueHao/vigil', '_blank');
};

onMounted(() => {
  detectMobile();
  window.addEventListener("resize", detectMobile);
});
onBeforeUnmount(() => window.removeEventListener("resize", detectMobile));
</script>

<style scoped>
.container_box {
  height: 100vh;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  /* 统一品牌渐变色，与首页保持一致 */
  --brand-start: #6366f1; /* indigo-500 */
  --brand-end: #22c55e;   /* emerald-500 */
}

.full-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.el-header {
  padding: 0;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255,255,255,0.8);
  backdrop-filter: saturate(180%) blur(8px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}
.app-header::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, var(--brand-start), var(--brand-end));
  opacity: 0.35;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  border-bottom: 0;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(90deg, var(--brand-start), var(--brand-end));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  cursor: pointer;
}

.nav {
  flex: 1;
  margin: 0 20px;
}
.nav-menu {
  border-bottom: none;
  background: transparent;
}

.right-side {
  display: flex;
  align-items: center;
  gap: 8px;
}

.github-btn {
  transition: all 0.3s ease;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #24292e;
}

.github-btn:hover {
  background: rgba(36, 41, 46, 0.1);
  transform: scale(1.1);
  color: #0366d6;
}

.github-btn:active {
  transform: scale(0.95);
}

.github-btn svg {
  width: 20px;
  height: 20px;
}
.menu-toggle {
  font-size: 18px;
}
.menu-icon {
  display: inline-block;
  font-weight: 700;
}
.user-avatar {
  height: 32px;
  width: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-start), var(--brand-end));
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}


.el-menu--horizontal {
  border-bottom: none;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-container {
    height: 56px;
  }
  .nav {
    position: absolute;
    top: 56px;
    left: 0;
    right: 0;
    padding: 8px 12px 12px;
    background: rgba(255,255,255,0.98);
    border-bottom: 0;
  }
  .nav :deep(.el-menu--horizontal) {
    border-bottom: none;
    display: grid;
    grid-template-columns: 1fr;
  }
  .nav::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: linear-gradient(90deg, var(--brand-start), var(--brand-end));
    opacity: 0.35;
  }
}
</style>
