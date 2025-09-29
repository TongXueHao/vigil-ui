<template>

  <div class="w-355 m-[0_auto] h-full flex flex-col justify-center gap2 mt4">
    
    <!-- 设置工具栏 -->
    <div class="settings-toolbar">
      <div class="flex items-center gap-4 p-3 ">
        <div class="flex items-center gap-2">
          <el-switch
            v-model="autoRefresh"
            @change="updateAutoRefresh"
            active-text="自动刷新"
            inactive-text="手动刷新"
            size="small"
          />
        </div>
        
        <div class="flex items-center gap-2" v-if="autoRefresh">
          <span class="text-sm text-gray-600">刷新间隔:</span>
          <el-select
            v-model="refreshInterval"
            @change="setRefreshInterval"
            size="small"
            style="width: 120px"
          >
            <el-option label="5秒" :value="5000" />
            <el-option label="10秒" :value="10000" />
            <el-option label="30秒" :value="30000" />
          </el-select>
        </div>
        
        <div class="flex items-center gap-2">
          <el-button
            @click="refresh"
            size="small"
            type="primary"
          >
            立即刷新
          </el-button>
        </div>
        
        <div class="flex-1"></div>
        
        <div class="text-xs text-gray-500" v-if="metrics">
          最后更新: {{ formatDateTime(Date.now()) }}
        </div>
      </div>
    </div>

    <!-- 内存信息 -->
    <div flex gap-1 justify-center text-white>

      <!-- 堆内存 -->
      <div flex-1 bg-blue-1 relative text-center p-2 box-border>
        <div class="absolute bottom-0 left-0 w-full bg-blue-200 transition-all duration-1000 ease-out"
          :style="{ height: (metrics?.memory?.heapCommitted) === 0 ? '0%' : Math.min(((metrics?.memory.heapUsed || 0) / (metrics?.memory?.heapCommitted || 1)) * 100, 100) + '%' }">
        </div>
        <div relative z-10 top-20>
          <div class="font-bold text-sm mb-1">Head Memory</div>
          <div text-xs space-y-0.5>
            <div class="flex justify-between items-center">
              <span>已使用:</span>
              <span text-pink>{{ formatBytes(metrics?.memory?.heapUsed || 0) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>已提交:</span>
              <span text-pink>{{ formatBytes(metrics?.memory?.heapCommitted || 0) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>最大:</span>
              <span text-pink>{{ formatBytes(metrics?.memory?.heapMax || 0) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 内存明细 -->
      <div text-center w-280>
        <div class="flex justify-center gap-1 box-border">
          <div flex w-120 gap-1>
            <div class="w-80 bg-green-100 flex flex-col justify-end gap-1 p-2 relative overflow-hidden box-border">
              <div class="absolute bottom-0 left-0 h-full bg-green-500 transition-all duration-1000 ease-out"
                :style="{ width: getEdenCommitted() === 0 ? '0%' : Math.min((getEdenUsed() / getEdenCommitted()) * 100, 100) + '%' }">
              </div>

              <div relative z-10>
                <div class="font-bold text-sm mb-1">Eden</div>
                <div text-xs space-y-0.5>
                  <div class="flex justify-between items-center">
                    <span>已使用:</span>
                    <span text-pink>{{ formatBytes(getEdenUsed()) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span>已提交:</span>
                    <span text-pink>{{ formatBytes(getEdenCommitted()) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span>最大:</span>
                    <span text-pink>{{ formatBytes(getEdenMax()) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex-1 bg-blue-100 flex flex-col justify-end gap-1 p-2 relative overflow-hidden box-border">

              <div class="absolute bottom-0 left-0 h-full bg-blue-500 transition-all duration-1000 ease-out"
                :style="{ width: getSurvivorCommitted() === 0 ? '0%' : Math.min((getSurvivorUsed() / getSurvivorCommitted()) * 100, 100) + '%' }">
              </div>

              <div class="relative z-10">
                <div class="font-bold text-sm mb-1">Survivor</div>
                <div class="text-xs space-y-0.5">
                  <div class="flex justify-between items-center">
                    <span>已使用:</span>
                    <span text-pink>{{ formatBytes(getSurvivorUsed()) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span>已提交:</span>
                    <span text-pink>{{ formatBytes(getSurvivorCommitted()) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span>最大:</span>
                    <span text-pink>{{ formatBytes(getSurvivorMax()) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="w-160 bg-pink-100 flex flex-col justify-end gap-1 p-2 relative overflow-hidden box-border">

            <div class="absolute bottom-0 left-0 h-full bg-pink-500 transition-all duration-1000 ease-out"
              :style="{ width: getOldGenCommitted() === 0 ? '0%' : Math.min((getOldGenUsed() / getOldGenCommitted()) * 100, 100) + '%' }">
            </div>

            <div class="relative z-10">
              <div class="font-bold text-sm mb-1">Old Gen</div>
              <div class="text-xs space-y-0.5">
                <div class="flex justify-between items-center">
                  <span>已使用:</span>
                  <span text-pink>{{ formatBytes(getOldGenUsed()) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span>已提交:</span>
                  <span text-pink>{{ formatBytes(getOldGenCommitted()) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span>最大:</span>
                  <span text-pink>{{ formatBytes(getOldGenMax()) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center mt-1 text-pink text-xs gap-1">
          <div w-120 bg-gray-2 p-2 box-border>
            <p text-center m-0 font-bold text-sm mb-1>{{ metrics?.garbageCollectors[0].name }}</p>
            <div flex justify-between>
              <span text-pink>执行次数: </span>
              <span text-pink>{{ metrics?.garbageCollectors[0].collectionCount }}</span>
            </div>
            <div flex justify-between>
              <span>耗时: </span>
              <span text-pink>{{ metrics?.garbageCollectors[0].collectionTime }}</span>
            </div>
          </div>
          <div w-160 bg-gray-2 p-2 box-border>
            <p text-center m-0 font-bold text-sm mb-1>{{ metrics?.garbageCollectors[1].name }}</p>
            <div flex justify-between>
              <span>执行次数: </span>
              <span>{{ metrics?.garbageCollectors[1].collectionCount }}</span>
            </div>
            <div flex justify-between>
              <span>耗时: </span>
              <span>{{ metrics?.garbageCollectors[1].collectionTime }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-center mt-1 gap-1 box-border">

          <div class="flex-1 bg-[#9c4dcc] flex flex-col justify-end gap-1 p-2 relative overflow-hidden box-border">
            <div class="absolute bottom-0 left-0 h-full bg-[#6a1b9a] transition-all duration-1000 ease-out"
              :style="{ width: getMetaspaceCommitted() === 0 ? '0%' : Math.min((getMetaspaceUsed() / getMetaspaceCommitted()) * 100, 100) + '%' }">
            </div>

            <div class="relative z-10">
              <div class="font-bold text-sm mb-1">{{ getMetaspaceName() }}</div>
              <div class="text-xs space-y-0.5">
                <div class="flex justify-between items-center">
                  <span>已使用:</span>
                  <span>{{ formatBytes(getMetaspaceUsed()) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span>已提交:</span>
                  <span>{{ formatBytes(getMetaspaceCommitted()) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span>最大:</span>
                  <span>{{ formatBytes(getMetaspaceMax()) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex-1 bg-[#42a5f5] flex flex-col justify-end gap-1 p-2 relative overflow-hidden box-border">
            <div class="absolute bottom-0 left-0 h-full bg-[#1565c0] transition-all duration-1000 ease-out"
              :style="{ width: getCompressedCommitted() === 0 ? '0%' : Math.min((getCompressedUsed() / getCompressedCommitted()) * 100, 100) + '%' }">
            </div>

            <div class="relative z-10">
              <div class="font-bold text-sm mb-1">{{ getCompressedName() }}</div>
              <div class="text-xs space-y-0.5">
                <div class="flex justify-between items-center">
                  <span>已使用:</span>
                  <span>{{ formatBytes(getCompressedUsed()) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span>已提交:</span>
                  <span>{{ formatBytes(getCompressedCommitted()) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span>最大:</span>
                  <span>{{ formatBytes(getCompressedMax()) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex-1 bg-[#ef5350] flex flex-col justify-end gap-1 p-2 relative overflow-hidden box-border">
            <div class="absolute bottom-0 left-0 h-full bg-[#c62828] transition-all duration-1000 ease-out"
              :style="{ width: getCodeCacheCommitted() === 0 ? '0%' : Math.min((getCodeCacheUsed() / getCodeCacheCommitted()) * 100, 100) + '%' }">
            </div>

            <div class="relative z-10">
              <div class="font-bold text-sm mb-1">{{ getCodeCacheName() }}</div>
              <div class="text-xs space-y-0.5">
                <div class="flex justify-between items-center">
                  <span>已使用:</span>
                  <span>{{ formatBytes(getCodeCacheUsed()) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span>已提交:</span>
                  <span>{{ formatBytes(getCodeCacheCommitted()) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span>最大:</span>
                  <span>{{ formatBytes(getCodeCacheMax()) }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- 非堆内存 -->
      <div flex-1 bg-blue-1 relative text-center p-2 box-border>
        <div class="absolute bottom-0 left-0 w-full bg-blue-200 transition-all duration-1000 ease-out"
          :style="{ height: (metrics?.memory?.nonHeapCommitted) === 0 ? '0%' : Math.min(((metrics?.memory.nonHeapUsed || 0) / (metrics?.memory?.nonHeapCommitted || 1)) * 100, 100) + '%' }">
        </div>
        <div relative z-10 top-20>
          <div class="font-bold text-sm mb-1">No Head Memory</div>
          <div text-xs space-y-0.5>
            <div class="flex justify-between items-center">
              <span>已使用:</span>
              <span text-pink>{{ formatBytes(metrics?.memory?.nonHeapUsed || 0) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>已提交:</span>
              <span text-pink>{{ formatBytes(metrics?.memory?.nonHeapCommitted || 0) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>最大:</span>
              <span text-pink>{{ formatBytes(metrics?.memory?.nonHeapMax || 0) }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Buffer Pools -->
    <div class="flex gap1">
      <div v-for="pool in bufferPoolsSorted" :key="pool.name" class="flex-1 p-3 bg-blue-1">
        <div class="flex items-center justify-between mb-2 text-xs">
          <span class="text-gray-800 font-medium">{{ pool.name }}</span>
          <el-tag size="small" type="primary">{{ pool.count }} buffers</el-tag>
        </div>
        <div class="mb-1 flex justify-between text-[11px] text-gray-600">
          <span>使用 {{ formatBytes(pool.memoryUsed || 0) }}</span>
          <span>{{ formatBytes(pool.totalCapacity || 0) }}</span>
        </div>
        <el-progress
          :percentage="Math.round(((pool.totalCapacity || 0) === 0 ? 0 : ((pool.memoryUsed || 0) / (pool.totalCapacity || 1))) * 100)"
          :color="progressColor" :show-text="false" />
      </div>
    </div>

    <!-- Runtime信息（单个面板：展开即显示启动参数） -->
    <div class="flex justify-center">
      <div class="w-full">
        <el-collapse v-model="activeRuntimePanels">
          <el-collapse-item v-if="metrics?.runtime?.inputArguments?.length" name="args">
            <template #title>
              <div class="text-xs flex items-center gap-2 flex-wrap">
                <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Runtime</span>
                <span class="text-gray-800">{{ metrics?.runtime?.vmName || '-' }}</span>
                <span class="text-green-700">| v{{ metrics?.runtime?.vmVersion || '-' }}</span>
                <span class="text-purple-700">| {{ metrics?.runtime?.vmVendor || '-' }}</span>
                <span class="text-gray-600">• start {{ formatDateTime(metrics?.runtime?.startTime || 0) }}</span>
                <span class="text-gray-600">• 运行 {{ formatDuration(metrics?.runtime?.uptime || 0) }}</span>
                <span class="text-pink-600">• CPU</span>
                <span><el-progress w-40 :percentage="Math.round(((metrics?.os?.processCpuLoad || 0) * 100))"
                    :color="progressColor" :show-text="false" /></span>
                <span class="text-pink-600">{{ formatPercentage(metrics?.os?.processCpuLoad || 0) }}</span>
                <span class="text-gray-600">• 参数 {{ metrics?.runtime?.inputArguments?.length || 0 }}</span>
              </div>
            </template>
            <div class="p-2 bg-purple-50 border border-purple-200 rounded">
              <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                <span v-for="(arg, index) in metrics.runtime.inputArguments" :key="index"
                  class="bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full text-xs hover:bg-purple-300 transition-colors">
                  {{ arg }}
                </span>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <!-- 操作系统信息 -->
    <div class="flex justify-center">
      <div class="w-full">
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center gap-2 flex-wrap text-xs">
              <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">OS</span>
              <el-tag type="info" size="small">{{ metrics?.os?.name || '-' }}</el-tag>
              <el-tag type="success" size="small">v{{ metrics?.os?.version || '-' }}</el-tag>
              <el-tag type="warning" size="small">{{ metrics?.os?.arch || '-' }}</el-tag>
              <el-tag type="primary" size="small">CPU 内核：{{ metrics?.os?.availableProcessors ?? '-' }}</el-tag>
              <span text-pink-600>CPU</span>
              <el-progress w-40 :percentage="Math.round(((metrics?.os?.systemCpuLoad || 0) * 100))"
                :color="progressColor" :show-text="false" />
              <span class="text-pink-600">{{ formatPercentage(metrics?.os?.systemCpuLoad || 0) }}</span>
            </div>

          </template>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

            <!-- 物理内存 -->
            <div class="p-3 rounded bg-gray-50 border border-gray-200">
              <div class="flex items-center justify-between mb-2 text-xs">
                <span class="text-gray-600">物理内存(总/空闲)</span>
                <span class="text-gray-800">{{ formatBytes(metrics?.os?.totalPhysicalMemory || 0) }} / {{
                  formatBytes(metrics?.os?.freePhysicalMemory || 0) }}</span>
              </div>
              <div>
                <div class="flex justify-between text-[11px] text-gray-600 mb-1">
                  <span>已使用</span>
                  <span class="">
                    {{ formatPercentage(((metrics?.os?.totalPhysicalMemory || 0) === 0) ? 0 :
                      ((metrics?.os?.totalPhysicalMemory || 0) - (metrics?.os?.freePhysicalMemory || 0)) /
                      (metrics?.os?.totalPhysicalMemory || 1)) }}
                  </span>
                </div>
                <el-progress
                  :percentage="Math.round((((metrics?.os?.totalPhysicalMemory || 0) === 0) ? 0 : (((metrics?.os?.totalPhysicalMemory || 0) - (metrics?.os?.freePhysicalMemory || 0)) / (metrics?.os?.totalPhysicalMemory || 1))) * 100)"
                  :color="progressColor" :show-text="false" />
              </div>
            </div>

            <!-- Swap -->
            <div class="p-3 rounded bg-gray-50 border border-gray-200">
              <div class="flex items-center justify-between mb-2 text-xs">
                <span class="text-gray-600">Swap(总/空闲)</span>
                <span class=" text-gray-800">{{ formatBytes(metrics?.os?.totalSwapSpace || 0) }} / {{
                  formatBytes(metrics?.os?.freeSwapSpace || 0) }}</span>
              </div>
              <div>
                <div class="flex justify-between text-[11px] text-gray-600 mb-1">
                  <span>已使用</span>
                  <span class="">
                    {{ formatPercentage(((metrics?.os?.totalSwapSpace || 0) === 0) ? 0 : ((metrics?.os?.totalSwapSpace
                      || 0)
                      - (metrics?.os?.freeSwapSpace || 0)) / (metrics?.os?.totalSwapSpace || 1)) }}
                  </span>
                </div>
                <el-progress
                  :percentage="Math.round((((metrics?.os?.totalSwapSpace || 0) === 0) ? 0 : (((metrics?.os?.totalSwapSpace || 0) - (metrics?.os?.freeSwapSpace || 0)) / (metrics?.os?.totalSwapSpace || 1))) * 100)"
                  :color="progressColor" :show-text="false" />
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 线程、类加载与缓冲区池信息 -->
    <div class="flex justify-center">
      <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- Threads -->
        <el-card shadow="hover">
          <div class="grid grid-cols-4 gap-2 justify-center">
            <el-statistic text-center title="活跃线程数" :value="metrics?.threads?.live ?? '-'"
              :value-style="{ color: '#16a34a' }" />
            <el-statistic text-center title="守护线程数" :value="metrics?.threads?.daemon ?? '-'"
              :value-style="{ color: '#0284c7' }" />
            <el-statistic text-center title="峰值线程数" :value="metrics?.threads?.peak ?? '-'"
              :value-style="{ color: '#d97706' }" />
            <el-statistic text-center title="累计启动数" :value="metrics?.threads?.totalStarted ?? '-'"
              :value-style="{ color: '#e11d48' }" />
          </div>
          <div class="mt-2">
            <div class="flex justify-between text-[11px] text-gray-600 mb-1">
              <span>守护占比</span>
              <span>{{ formatPercentage(((metrics?.threads?.live || 0) === 0) ? 0 : (metrics?.threads?.daemon || 0) /
                (metrics?.threads?.live || 1)) }}</span>
            </div>
            <el-progress
              :percentage="Math.round((((metrics?.threads?.live || 0) === 0) ? 0 : ((metrics?.threads?.daemon || 0) / (metrics?.threads?.live || 1))) * 100)"
              :color="progressColor" :show-text="false" />
          </div>
        </el-card>

        <!-- Classes -->
        <el-card shadow="hover">
          <div class="grid grid-cols-3 gap-2">
            <el-statistic text-center title="已加载类" :value="metrics?.classes?.loaded ?? '-'"
              :value-style="{ color: '#4f46e5' }" />
            <el-statistic text-center title="累计加载" :value="metrics?.classes?.totalLoaded ?? '-'"
              :value-style="{ color: '#059669' }" />
            <el-statistic text-center title="已卸载类" :value="metrics?.classes?.unloaded ?? '-'"
              :value-style="{ color: '#dc2626' }" />
          </div>
          <div class="mt-2">
            <div class="flex justify-between text-[11px] text-gray-600 mb-1">
              <span>加载占比</span>
              <span>{{ formatPercentage(((metrics?.classes?.totalLoaded || 0) === 0) ? 0 : (metrics?.classes?.loaded ||
                0) /
                (metrics?.classes?.totalLoaded || 1)) }}</span>
            </div>
            <el-progress
              :percentage="Math.round((((metrics?.classes?.totalLoaded || 0) === 0) ? 0 : ((metrics?.classes?.loaded || 0) / (metrics?.classes?.totalLoaded || 1))) * 100)"
              :color="progressColor" :show-text="false" />
          </div>
        </el-card>
      </div>
    </div>



  </div>


</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useMonitor } from "../composables/useMonitor";
// Element Plus icons are available but not used in current UI

// 使用监控管理 Composable
const {
  metrics,
  autoRefresh,
  refreshInterval,
  refresh,
  setRefreshInterval,
  updateAutoRefresh,
  formatBytes,
  formatDuration,
  formatDateTime,
  formatPercentage,
} = useMonitor();

// Runtime 折叠面板状态
const activeRuntimePanels = ref<string[] | string>([]);


// 内存池数据获取函数
const getEdenPool = () => {
  return metrics.value?.memoryPools?.find(pool =>
    pool.name.toLowerCase().includes('eden') ||
    pool.name.toLowerCase().includes('young')
  );
};

const getSurvivorPool = () => {
  return metrics.value?.memoryPools?.find(pool =>
    pool.name.toLowerCase().includes('survivor')
  );
};

const getOldGenPool = () => {
  return metrics.value?.memoryPools?.find(pool =>
    pool.name.toLowerCase().includes('old') ||
    pool.name.toLowerCase().includes('tenured')
  );
};

const getMetaspacePool = () => {
  return metrics.value?.memoryPools?.find(pool =>
    pool.name.toLowerCase().includes('metaspace')
  );
};

const getCompressedPool = () => {
  return metrics.value?.memoryPools?.find(pool =>
    pool.name.toLowerCase().includes('compressed clas')
  );
};

const getCodeCachePool = () => {
  return metrics.value?.memoryPools?.find(pool =>
    pool.name.toLowerCase().includes('codecache')
  );
};

// Eden Space 相关
const getEdenUsed = () => getEdenPool()?.used || 0;
const getEdenCommitted = () => getEdenPool()?.committed || 0;
const getEdenMax = () => getEdenPool()?.max || -1;

// Survivor Space 相关
const getSurvivorUsed = () => getSurvivorPool()?.used || 0;
const getSurvivorCommitted = () => getSurvivorPool()?.committed || 0;
const getSurvivorMax = () => getSurvivorPool()?.max || -1;

// Old Generation 相关
const getOldGenUsed = () => getOldGenPool()?.used || 0;
const getOldGenCommitted = () => getOldGenPool()?.committed || 0;
const getOldGenMax = () => getOldGenPool()?.max || -1;

// Metaspace 相关
const getMetaspaceName = () => getMetaspacePool()?.name || '-';
const getMetaspaceUsed = () => getMetaspacePool()?.used || 0;
const getMetaspaceCommitted = () => getMetaspacePool()?.committed || 0;
const getMetaspaceMax = () => getMetaspacePool()?.max || -1;

// Compressed Class Space 相关
const getCompressedName = () => getCompressedPool()?.name || '-';
const getCompressedUsed = () => getCompressedPool()?.used || 0;
const getCompressedCommitted = () => getCompressedPool()?.committed || 0;
const getCompressedMax = () => getCompressedPool()?.max || -1;

// CodeCache 相关
const getCodeCacheName = () => getCodeCachePool()?.name || '-';
const getCodeCacheUsed = () => getCodeCachePool()?.used || 0;
const getCodeCacheCommitted = () => getCodeCachePool()?.committed || 0;
const getCodeCacheMax = () => getCodeCachePool()?.max || -1;

// CPU 进度条颜色（Element Plus 支持字符串或函数）
const progressColor = (percentage: number) => {
  if (percentage < 50) return '#67C23A'; // success
  if (percentage < 80) return '#E6A23C'; // warning
  return '#F56C6C'; // danger
};

// BufferPools 汇总与排序
const bufferPoolsSorted = computed(() => {
  const pools = metrics.value?.bufferPools || [];
  return [...pools].sort((a, b) => {
    const aCap = a.totalCapacity || 0;
    const bCap = b.totalCapacity || 0;
    const aPct = aCap === 0 ? 0 : a.memoryUsed / aCap;
    const bPct = bCap === 0 ? 0 : b.memoryUsed / bCap;
    return bPct - aPct;
  });
});


</script>

<style scoped>
.settings-toolbar {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.12);
  border-radius: 12px;
  backdrop-filter: saturate(180%) blur(6px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.settings-toolbar .el-switch {
  --el-switch-on-color: #409eff;
  --el-switch-off-color: #dcdfe6;
}

.settings-toolbar .el-select {
  --el-select-border-color-hover: #409eff;
}

.settings-toolbar .el-button {
  --el-button-border-radius: 6px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-toolbar .flex {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .settings-toolbar .flex-1 {
    display: none;
  }
}
</style>