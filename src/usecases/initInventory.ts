// src/usecases/initInventory.ts
import { CosmosInventoryRepo } from "../adapters/cosmosInventoryRepo.js";
import { InventoryItem } from "../domain/inventory.js";

const DEFAULT_ITEMS: InventoryItem[] = [
  { id: "Camera-A", model: "Camera-A", totalCount: 5, availableCount: 5 },
  { id: "Laptop-B", model: "Laptop-B", totalCount: 3, availableCount: 3 },
  { id: "Mic-C", model: "Mic-C", totalCount: 10, availableCount: 10 }
];

let initialised = false; // 防止重复初始化（进程级）

export async function ensureInventoryInitialised() {
  if (initialised) return;

  console.log("Checking inventory initialisation...");

  // ✅ 延迟初始化 repo（关键）
  const repo = CosmosInventoryRepo.getInstance();

  // 查询是否已有库存数据
  const any = await repo.getAnyItem();
  if (any) {
    console.log("Inventory already initialised.");
    initialised = true;
    return;
  }

  console.log("Initialising inventory...");

  for (const item of DEFAULT_ITEMS) {
    await repo.create(item);
  }

  console.log("Inventory initialised successfully.");
  initialised = true;
}
