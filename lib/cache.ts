import { createHash } from 'crypto';

// 內存快取，避免文件系統問題
const memoryCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30分鐘過期

// 生成快取 key
export function generateCacheKey(visualPrompt: string, style?: string): string {
  const content = `${visualPrompt}|${style || ''}`;
  return createHash('sha1').update(content).digest('hex');
}

// 檢查快取是否存在
export function hasCache(key: string): boolean {
  const cached = memoryCache.get(key);
  if (!cached) return false;
  
  // 檢查是否過期
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    memoryCache.delete(key);
    return false;
  }
  
  return true;
}

// 從快取讀取
export function getCache(key: string): string | null {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  
  // 檢查是否過期
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    memoryCache.delete(key);
    return null;
  }
  
  return cached.data;
}

// 寫入快取
export function setCache(key: string, data: string): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // 清理過期的快取項目
  const now = Date.now();
  const keysToDelete: string[] = [];
  memoryCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_TTL) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => memoryCache.delete(key));
}

// 清理快取（可選）
export function clearCache(): void {
  memoryCache.clear();
}
