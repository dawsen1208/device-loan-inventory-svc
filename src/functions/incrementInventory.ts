import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext
} from "@azure/functions";

import { CosmosInventoryRepo } from "../adapters/cosmosInventoryRepo.js";
import { ensureInventoryInitialised } from "../usecases/initInventory.js";

export async function incrementInventory(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const repo = CosmosInventoryRepo.getInstance();

    await ensureInventoryInitialised();

    const model = req.params.model;
    if (!model) {
      return {
        status: 400,
        jsonBody: { error: "model is required in route" }
      };
    }

    const body = (await req.json().catch(() => ({}))) as { count?: number };
    const count = body.count ?? 1;

    const item = await repo.getByModel(model);
    if (!item) {
      return {
        status: 404,
        jsonBody: { error: `Inventory not found for model ${model}` }
      };
    }

    item.availableCount += count;
    const updated = await repo.update(item);

    return {
      status: 200,
      jsonBody: updated
    };

  } catch (err: any) {
    context.error("incrementInventory error:", err);
    return {
      status: 500,
      jsonBody: { error: "Server error" }
    };
  }
}

app.http("incrementInventory", {
  methods: ["POST"],
  route: "inventory/{model}/increment",
  authLevel: "anonymous",
  handler: incrementInventory
});
