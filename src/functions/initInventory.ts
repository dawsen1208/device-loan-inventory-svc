import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext
} from "@azure/functions";

import { ensureInventoryInitialised } from "../usecases/initInventory.js";

export async function initInventory(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {

  context.log("Init inventory triggered");

  await ensureInventoryInitialised();

  return {
    status: 200,
    jsonBody: {
      message: "Inventory initialisation complete"
    }
  };
}

app.http("initInventory", {
  methods: ["POST"],
  route: "inventory/init",
  authLevel: "anonymous",
  handler: initInventory
});
