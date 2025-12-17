// src/domain/inventory.ts

export interface InventoryItem {
  id: string;           // 建议 = model，方便用 model 做分区键
  model: string;        // 设备型号（如 "Camera-A"、"Laptop-B"）
  totalCount: number;   // 总数量
  availableCount: number; // 当前可用数量
}
