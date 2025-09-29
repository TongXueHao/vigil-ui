/**
 * 监控相关类型定义
 */

/**
 * 内存基本信息
 */
export interface MemoryInfo {
  /** 已使用堆内存（字节） */
  heapUsed: number;
  /** 已提交给 JVM 的堆内存（字节） */
  heapCommitted: number;
  /** 堆内存最大值（字节，-1 表示未设置） */
  heapMax: number;
  /** 已使用非堆内存（字节） */
  nonHeapUsed: number;
  /** 已提交给 JVM 的非堆内存（字节） */
  nonHeapCommitted: number;
  /** 非堆内存最大值（字节，-1 表示不限制） */
  nonHeapMax: number;
}

/**
 * 内存池信息（Eden/Survivor/Old Gen/Metaspace/Code Cache 等）
 */
export interface MemoryPoolInfo {
  /** 内存池名称（如 Eden Space、Survivor Space、Metaspace、Code Cache 等） */
  name: string;
  /** 内存类型：HEAP / NON_HEAP */
  type: string;
  /** 已使用内存（字节） */
  used: number;
  /** 已提交内存（字节） */
  committed: number;
  /** 最大内存值（字节，可能为 -1 表示不限制） */
  max: number;
}

/**
 * 缓冲区池信息（Direct Memory、Mapped Memory）
 */
export interface BufferPoolInfo {
  /** 缓冲区池名称，如 direct 或 mapped */
  name: string;
  /** 当前缓冲区数量 */
  count: number;
  /** 已使用内存（字节） */
  memoryUsed: number;
  /** 缓冲区总容量（字节） */
  totalCapacity: number;
}

/**
 * 垃圾回收器信息（分代/区域级别）
 */
export interface GcInfo {
  /** GC 名称（如 G1 Young Generation、G1 Old Generation） */
  name: string;
  /** GC 执行次数 */
  collectionCount: number;
  /** GC 总耗时（毫秒） */
  collectionTime: number;
}

/**
 * JIT 编译器信息
 */
export interface CompilerInfo {
  /** JIT 编译器名称（如 HotSpot 64-Bit Tiered Compilers） */
  name: string;
  /** 累计编译耗时（毫秒） */
  totalCompilationTime: number;
}

/**
 * 线程统计信息
 */
export interface ThreadInfo {
  /** 当前活跃线程数 */
  live: number;
  /** 当前守护线程数 */
  daemon: number;
  /** 自 JVM 启动以来的峰值线程数 */
  peak: number;
  /** 自 JVM 启动以来已启动线程总数 */
  totalStarted: number;
}

/**
 * 类加载信息
 */
export interface ClassLoadingInfo {
  /** 当前已加载类数量 */
  loaded: number;
  /** 自 JVM 启动以来加载过的类总数 */
  totalLoaded: number;
  /** 已卸载的类数量 */
  unloaded: number;
}

/**
 * JVM 运行时信息
 */
export interface RuntimeInfo {
  /** JVM 启动时间（Epoch 毫秒） */
  startTime: number;
  /** JVM 已运行时长（毫秒） */
  uptime: number;
  /** JVM 名称（如 OpenJDK 64-Bit Server VM） */
  vmName: string;
  /** JVM 版本（如 17.0.10+7） */
  vmVersion: string;
  /** JVM 提供商（如 Eclipse Adoptium） */
  vmVendor: string;
  /** JVM 启动参数列表（如 -Xmx512m、-XX:+UseG1GC） */
  inputArguments: string[];
}

/**
 * 操作系统及物理资源信息
 */
export interface OsInfo {
  /** 操作系统名称（如 Linux、Windows 10） */
  name: string;
  /** 操作系统版本号 */
  version: string;
  /** 系统架构（如 amd64） */
  arch: string;
  /** 可用 CPU 核心数 */
  availableProcessors: number;
  /** 系统负载平均值（1 分钟），-1 表示不可用 */
  systemLoadAverage: number;
  /** JVM 进程 CPU 使用率（0.0 ~ 1.0） */
  processCpuLoad: number;
  /** 系统 CPU 使用率（0.0 ~ 1.0） */
  systemCpuLoad: number;
  /** 总物理内存（字节） */
  totalPhysicalMemory: number;
  /** 空闲物理内存（字节） */
  freePhysicalMemory: number;
  /** 总 Swap 内存（字节） */
  totalSwapSpace: number;
  /** 空闲 Swap 内存（字节） */
  freeSwapSpace: number;
}

/**
 * JVM 指标完整接口
 */
export interface JvmMetrics {
  /** 内存基本信息 */
  memory: MemoryInfo;
  /** 内存池信息（Eden/Survivor/Old Gen/Metaspace/Code Cache 等） */
  memoryPools: MemoryPoolInfo[];
  /** 缓冲区池信息（Direct Memory、Mapped Memory） */
  bufferPools: BufferPoolInfo[];
  /** 垃圾回收器信息（分代/区域级别） */
  garbageCollectors: GcInfo[];
  /** JIT 编译器信息 */
  compiler: CompilerInfo;
  /** 线程统计信息 */
  threads: ThreadInfo;
  /** 死锁线程 ID 列表 */
  deadlockedThreads: number[];
  /** 类加载信息 */
  classes: ClassLoadingInfo;
  /** JVM 运行时信息 */
  runtime: RuntimeInfo;
  /** 操作系统及物理资源信息 */
  os: OsInfo;
}

// 健康状态接口
export interface HealthStatus {
  status: 'UP' | 'DOWN';
  details: Record<string, any>;
}
