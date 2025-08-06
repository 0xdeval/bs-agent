import { Provider } from "@elizaos/core";
import { UserIntent } from "../types/userData";
import { fetchDapps } from "../lib/marketplace/getApps";

export const appsProvider: Provider = {
  name: "appsProvider",
  description:
    "A provider that fetches dapps information with category and other details from the Blockscout marketplace",
  dynamic: true,
  position: -100,
  get: async (runtime, message, state) => {
    const memories = await runtime.getMemories({
      entityId: message.entityId,
      roomId: message.roomId,
      tableName: "userInfo",
    });

    console.log("memories were received in a provider", memories);

    let chainId: number | null = null;
    for (const memory of memories) {
      const memoryKeys = Object.keys(memory.content);

      if (memoryKeys.includes("userIntent")) {
        const userIntent = memory.content.userIntent as UserIntent;
        chainId = userIntent.chainId;

        console.log("chainId found in memory in a provider", chainId);

        break;
      }
    }

    if (!chainId) {
      return {
        text: `No chain name was provided, so, no dapps were fetched`,
      };
    }

    const fetchedDappsViaApi = await fetchDapps(chainId);

    return {
      text: `the list of fetched dapps via Blockscout API: ${fetchedDappsViaApi.map((dapp) => dapp.title).join(", ")}`,
      values: { fetchedDappsViaApi },
      data: { fetchedDappsViaApi },
    };
  },
};
