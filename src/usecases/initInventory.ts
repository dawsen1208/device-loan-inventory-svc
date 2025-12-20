// src/usecases/initInventory.ts
import { CosmosInventoryRepo } from "../adapters/cosmosInventoryRepo.js";
import { InventoryItem } from "../domain/inventory.js";

const DEFAULT_ITEMS: InventoryItem[] = [
  { id: "Camera-A", model: "Camera-A", totalCount: 5, availableCount: 5 },
  { id: "Laptop-B", model: "Laptop-B", totalCount: 3, availableCount: 3 },
  { id: "Mic-C", model: "Mic-C", totalCount: 10, availableCount: 10 },
  { id: "Tablet-D", model: "Tablet-D", totalCount: 8, availableCount: 8 },
  { id: "VR-Headset-E", model: "VR-Headset-E", totalCount: 4, availableCount: 4 },
  { id: "Projector-F", model: "Projector-F", totalCount: 2, availableCount: 2 },
  { id: "Drone-G", model: "Drone-G", totalCount: 3, availableCount: 3 },
  { id: "Speaker-H", model: "Speaker-H", totalCount: 6, availableCount: 6 },
  { id: "Camera-I", model: "Camera-I", totalCount: 5, availableCount: 5 },
  { id: "Laptop-J", model: "Laptop-J", totalCount: 4, availableCount: 4 }
];

let initialised = false; // 防止重复初始化（进程级）

export async function ensureInventoryInitialised() {
  if (initialised) return;

  console.log("Checking inventory initialisation...");

  // ✅ 延迟初始化 repo（关键）
  const repo = CosmosInventoryRepo.getInstance();

  // 移除“如果已有数据就跳过”的逻辑，改为始终检查缺少的默认数据
  // (由于下面有 409 忽略逻辑，所以是安全的)
  
  console.log("Initialising inventory...");

  for (const item of DEFAULT_ITEMS) {
    try {
      await repo.create(item);
    } catch (err: any) {
      // 忽略 409 Conflict (已存在)
      if (err.code === 409 || err.statusCode === 409) {
        console.log(`Item ${item.id} already exists, skipping.`);
      } else {
        throw err;
      }
    }
  }

  console.log("Inventory initialised successfully.");
  initialised = true;
}
