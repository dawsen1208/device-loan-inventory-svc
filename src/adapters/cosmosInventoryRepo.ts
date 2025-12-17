// src/adapters/cosmosInventoryRepo.ts
import { CosmosClient } from "@azure/cosmos";
import { InventoryItem } from "../domain/inventory.js";

export class CosmosInventoryRepo {
  private container;
  private static instance: CosmosInventoryRepo;

  constructor() {
    const connection = process.env.CosmosDBConnection;
    const dbName = process.env.CosmosInventoryDatabase || "cdls";
    const containerName = process.env.CosmosInventoryContainer || "inventory";

    if (!connection) {
      throw new Error("Missing CosmosDBConnection environment variable");
    }

    const client = new CosmosClient(connection);
    this.container = client.database(dbName).container(containerName);
  }

  public static getInstance(): CosmosInventoryRepo {
    if (!CosmosInventoryRepo.instance) {
      CosmosInventoryRepo.instance = new CosmosInventoryRepo();
    }
    return CosmosInventoryRepo.instance;
  }

  /**
   * 获取某个 model 的库存项
   */
  async getByModel(model: string): Promise<InventoryItem | null> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.model = @model",
      parameters: [{ name: "@model", value: model }],
    };

    const { resources } = await this.container.items
      .query(querySpec)
      .fetchAll();

    return (resources[0] as InventoryItem) || null;
  }

  /**
   * 创建新的库存记录
   */
  async create(item: InventoryItem): Promise<InventoryItem> {
    const { resource } = await this.container.items.create(item);
    return resource as InventoryItem;
  }

  /**
   * 更新库存记录
   */
  async update(item: InventoryItem): Promise<InventoryItem> {
    const { resource } = await this.container
      .item(item.id, item.id) // partition key = id
      .replace(item);

    return resource as InventoryItem;
  }

  /**
   * 查询任意一条库存记录（用于初始化判断）
   */
  async getAnyItem(): Promise<InventoryItem | null> {
    const querySpec = { query: "SELECT * FROM c OFFSET 0 LIMIT 1" };

    const { resources } = await this.container.items
      .query(querySpec)
      .fetchAll();

    return (resources[0] as InventoryItem) || null;
  }
}

