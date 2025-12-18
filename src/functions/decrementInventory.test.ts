import { decrementInventory } from "./decrementInventory";
import { CosmosInventoryRepo } from "../adapters/cosmosInventoryRepo";
import { InvocationContext, HttpRequest } from "@azure/functions";

// Mock dependencies
jest.mock("../adapters/cosmosInventoryRepo");
jest.mock("../usecases/initInventory", () => ({
  ensureInventoryInitialised: jest.fn(),
}));

describe("decrementInventory", () => {
  let mockRepo: any;
  let mockContext: InvocationContext;
  let mockRequest: HttpRequest;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepo = {
      getByModel: jest.fn(),
      update: jest.fn(),
    };
    (CosmosInventoryRepo.getInstance as jest.Mock).mockReturnValue(mockRepo);

    mockContext = {
      error: jest.fn(),
    } as unknown as InvocationContext;
  });

  it("should decrement inventory when available", async () => {
    // Arrange
    const body = { count: 1 };
    mockRequest = {
      params: { model: "iPhone 13" },
      json: jest.fn().mockResolvedValue(body),
    } as unknown as HttpRequest;

    mockRepo.getByModel.mockResolvedValue({
      model: "iPhone 13",
      availableCount: 5,
    });
    mockRepo.update.mockImplementation((item: any) => Promise.resolve(item));

    // Act
    const result = await decrementInventory(mockRequest, mockContext);

    // Assert
    expect(mockRepo.getByModel).toHaveBeenCalledWith("iPhone 13");
    expect(mockRepo.update).toHaveBeenCalledWith(expect.objectContaining({
      availableCount: 4
    }));
    expect(result).toEqual({
      status: 200,
      jsonBody: expect.objectContaining({ availableCount: 4 })
    });
  });

  it("should return 409 if not enough inventory", async () => {
    // Arrange
    const body = { count: 10 };
    mockRequest = {
      params: { model: "iPhone 13" },
      json: jest.fn().mockResolvedValue(body),
    } as unknown as HttpRequest;

    mockRepo.getByModel.mockResolvedValue({
      model: "iPhone 13",
      availableCount: 5,
    });

    // Act
    const result = await decrementInventory(mockRequest, mockContext);

    // Assert
    expect(mockRepo.update).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 409,
      jsonBody: { error: "Not enough inventory available" }
    });
  });

  it("should return 404 if model not found", async () => {
     // Arrange
     mockRequest = {
      params: { model: "Unknown" },
      json: jest.fn().mockResolvedValue({}),
    } as unknown as HttpRequest;

    mockRepo.getByModel.mockResolvedValue(null);

    // Act
    const result = await decrementInventory(mockRequest, mockContext);

    // Assert
    expect(result).toEqual({
      status: 404,
      jsonBody: expect.objectContaining({ error: expect.stringContaining("not found") })
    });
  });
});
