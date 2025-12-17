import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext
} from "@azure/functions";



// ✅ 改成导入“类”或“工厂”
import { CosmosInventoryRepo } from "../adapters/cosmosInventoryRepo.js";
import { ensureInventoryInitialised } from "../usecases/initInventory.js";

export async function getInventory(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // ✅ 延迟初始化（核心修复）
    const cosmosInventoryRepo = CosmosInventoryRepo.getInstance();

    await ensureInventoryInitialised();

    const model = req.params.model;

    if (!model) {
      return {
        status: 400,
        jsonBody: { error: "model is required in route" }
      };
    }

    const item = await cosmosInventoryRepo.getByModel(model);

    if (!item) {
      return {
        status: 404,
        jsonBody: { error: `Inventory not found for model ${model}` }
      };
    }

    return {
      status: 200,
      jsonBody: item
    };

  } catch (err: any) {
    context.error("getInventory error:", err);
    return {
      status: 500,
      jsonBody: { error: "Server error" }
    };
  }
}

app.http("getInventory", {
  methods: ["GET"],
  route: "inventory/{model}",
  authLevel: "anonymous",
  handler: getInventory
});
