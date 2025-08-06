import { Service, IAgentRuntime } from "@elizaos/core";
import { logger } from "@elizaos/core";

export class BlockscoutService extends Service {
  static serviceType = "starter";
  capabilityDescription =
    "This is a starter service which is attached to the agent through the starter plugin.";

  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  static async start(runtime: IAgentRuntime) {
    logger.info("*** Starting starter service ***");
    const service = new BlockscoutService(runtime);
    return service;
  }

  static async stop(runtime: IAgentRuntime) {
    logger.info("*** Stopping starter service ***");

    const service = runtime.getService(BlockscoutService.serviceType);
    if (!service) {
      throw new Error("Blockscout service not found");
    }
    service.stop();
  }

  async stop() {
    logger.info("*** Stopping starter service instance ***");
  }
}
