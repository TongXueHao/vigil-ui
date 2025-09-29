<template>
  <el-main class="main-content">
    <div class="home-container">
      <!-- 顶部日志演示（无背景） -->
      

      <section class="hero fade-in">
        <h1 class="main-title gradient-text">Vigil</h1>
        <p class="sub-title">轻量便捷，开箱即用：支持日志检索/多级过滤与控制台视图，覆盖内存、线程、GC 等核心监控</p>
        
        <div class="intro-buttons">
          <el-button plain type="primary" size="large" @click="goStart">立即开始</el-button>
          <el-button plain type="primary" size="large" @click="aboutVigil">了解更多</el-button>
        </div>
      </section>

      <section class="log-strip fade-in">
        <div class="console" ref="consoleRef">
          <div v-for="(l, i) in visibleLines" :key="i" class="line" :class="'lv-' + l.level.toLowerCase()">
            <span class="time">{{ l.time }}</span>
            <span class="level">{{ l.level }}</span>
            <span class="logger">{{ l.logger }}</span>
            <span class="message">{{ l.message }}</span>
          </div>
        </div>
      </section>
      
    </div>
  </el-main>

</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { onBeforeUnmount, onMounted, nextTick, ref } from "vue";

const router = useRouter();
const goStart = () => router.push("/logs");
const aboutVigil = () => {
  window.open('https://github.com/TongXueHao/vigil', '_blank');
};
type LogLevel = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR";
interface DemoLog { time: string; level: LogLevel; logger: string; message: string }
const script = [
  { time: "10:21:00", level: "INFO", logger: "vigil.Banner", message: "Welcome to Vigil - Spring Boot Logs & JVM Monitor" },
  { time: "10:21:01", level: "INFO", logger: "o.s.boot.SpringApplication", message: "Starting Application on host.local with PID 4242" },
  { time: "10:21:02", level: "INFO", logger: "o.s.boot.SpringApplication", message: "No active profile set, falling back to 1 default profile: default" },
  { time: "10:21:03", level: "INFO", logger: "o.s.b.w.embedded.tomcat.TomcatWebServer", message: "Tomcat initialized with port(s): 8080 (http)" },
  { time: "10:21:04", level: "INFO", logger: "o.a.c.core.StandardService", message: "Starting service [Tomcat]" },
  { time: "10:21:04", level: "INFO", logger: "o.a.c.c.StandardEngine", message: "Starting Servlet engine: [Apache Tomcat]" },
  { time: "10:21:05", level: "INFO", logger: "o.s.b.w.s.ServletWebServerApplicationContext", message: "Root WebApplicationContext: initialization completed in 3.142 s" },
  { time: "10:21:06", level: "INFO", logger: "o.s.b.web.embedded.tomcat.TomcatWebServer", message: "Tomcat started on port(s): 8080 (http) with context path ''" },
  { time: "10:21:07", level: "INFO", logger: "o.s.boot.SpringApplication", message: "Started Application in 4.523 seconds (JVM running for 5.117)" },
  { time: "10:21:08", level: "DEBUG", logger: "org.hibernate.SQL", message: "select * from user where id=?" },
] as DemoLog[];
const consoleRef = ref<HTMLElement | null>(null);
const visibleLines = ref<DemoLog[]>([]);
let idx = 0;
let timer: number | undefined;

const tick = () => {
  visibleLines.value = [...visibleLines.value, script[idx % script.length]];
  if (visibleLines.value.length > 8) visibleLines.value.shift();
  idx++;
  nextTick(() => {
    const el = consoleRef.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
};

onMounted(() => {
  for (let i = 0; i < 3; i++) tick();
  timer = window.setInterval(tick, 1400);
});
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});
</script>

<style scoped>
.main-content {
  flex: 1;
  padding: 0;
  overflow: auto;
  height: calc(100vh - 60px);
  background: radial-gradient(1200px 600px at 20% -10%, rgba(99,102,241,0.18), transparent),
              radial-gradient(1000px 500px at 90% 10%, rgba(16,185,129,0.15), transparent);
}
.home-container {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px 80px;
  box-sizing: border-box;
}

.hero {
  text-align: center;
  padding: 40px 20px 24px;
  margin: 10px 0 24px;
}
.console {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  color: #1f2937;
  border-radius: 12px;
  padding: 8px 12px;
  height: 140px;
  overflow: auto;
  scrollbar-width: none;
  width: 980px;
  max-width: calc(100vw - 40px);
  margin: 0 auto 16px;
}
.console::-webkit-scrollbar { width: 0; height: 0; }
.line {
  display: flex;
  gap: 8px;
  white-space: nowrap;
  line-height: 1.5;
  font-size: 12px;
}
.line .time { color: rgba(55,65,81,0.8); width: 88px; }
.line .level { font-weight: 700; width: 64px; }
.line .logger { color: #2563eb; min-width: 200px; }
.line .dash { color: #64748b; }
.line .message { color: #111827; opacity: 0.95; }
.line.lv-trace .level { color: #94a3b8; }
.line.lv-debug .level { color: #60a5fa; }
.line.lv-info .level { color: #34d399; }
.line.lv-warn .level { color: #f59e0b; }
.line.lv-error .level { color: #f87171; }

.sub-title {
  font-size: 1.125rem;
  margin-bottom: 28px;
  opacity: 0.9;
}

.main-title {
  font-size: 3rem;
  margin-bottom: 14px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.gradient-text {
  --brand-start: #6366f1; /* indigo-500 */
  --brand-end: #22c55e;   /* emerald-500 */
  background: linear-gradient(90deg, var(--brand-start), var(--brand-end));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.intro-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
  max-width: 1000px;
}

.bg-console {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  pointer-events: none;
  opacity: 0.22;
  padding: 16px 20px 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  color: #e5e7eb;
  overflow: hidden;
}
.bg-line {
  display: flex;
  gap: 10px;
  white-space: nowrap;
  line-height: 1.6;
}
.bg-line .time { color: #9ca3af; width: 64px; }
.bg-line .level { font-weight: 700; width: 64px; }
.bg-line .logger { color: #93c5fd; min-width: 140px; }
.bg-line .dash { color: #64748b; }
.bg-line .message { color: #e5e7eb; }
.bg-line.lv-trace .level { color: #94a3b8; }
.bg-line.lv-debug .level { color: #60a5fa; }
.bg-line.lv-info .level { color: #34d399; }
.bg-line.lv-warn .level { color: #f59e0b; }
.bg-line.lv-error .level { color: #f87171; }
.feature-card {
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(99, 102, 241, 0.12);
  border-radius: 12px;
  padding: 20px;
  transition: transform 200ms ease, box-shadow 200ms ease, background 200ms ease;
}
.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  background: rgba(255, 255, 255, 0.75);
}
.feature-card h3 {
  margin: 0 0 8px;
  font-size: 1.05rem;
}
.feature-card p {
  margin: 0;
  color: rgba(0,0,0,0.68);
}

@media (max-width: 960px) {
  .main-title { font-size: 2.25rem; }
  .features-grid { grid-template-columns: 1fr; max-width: 680px; }
  .intro-buttons { justify-content: center; }
}

/* 入场动画 */
.fade-in {
  opacity: 0;
  animation: fadeIn 700ms ease forwards;
}
.fade-in-delayed {
  opacity: 0;
  animation: fadeIn 700ms ease 160ms forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
