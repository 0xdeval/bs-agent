import {
  Action,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from "@elizaos/core";
import { logger } from "@elizaos/core";
import { chainsMapping } from "../lib/constants";

export const getSupportedMarketplaceAction: Action = {
  name: "GET_SUPPORTED_MARKETPLACE",
  similes: [
    "SUPPORTED_CHAINS",
    "MARKETPLACE_SUPPORT",
    "AVAILABLE_CHAINS",
    "SUPPORTED_NETWORKS",
    "ELIZA_CHAINS",
  ],
  description:
    "Provides information about on which blockchains marketplaces data is available by Eliza for dApp data fetching",

  validate: async (
    _runtime: IAgentRuntime,
    message: Memory,
    state: State
  ): Promise<boolean> => {
    const text = message.content.text.toLowerCase();

    // Check if user is asking about supported marketplaces/chains
    const isMarketplaceQuery =
      text.includes("marketplace") ||
      text.includes("supported") ||
      text.includes("available") ||
      text.includes("chains") ||
      text.includes("networks") ||
      text.includes("which") ||
      text.includes("what chains") ||
      text.includes("what networks") ||
      text.includes("eliza support") ||
      text.includes("can you") ||
      text.includes("do you support");

    return isMarketplaceQuery;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[]
  ) => {
    try {
      const supportedChains = Object.keys(chainsMapping);

      const responseText = `Eliza currently supports the following blockchain networks for dApp data and recommendations:

${supportedChains.map((chain) => `• **${chain.charAt(0).toUpperCase() + chain.slice(1)}** (Chain ID: ${chainsMapping[chain]})`).join("\n")}

You can ask me about dApps, DeFi protocols, games, bridges, and other applications on any of these supported networks.`;

      callback({
        text: responseText,
        markdown: true,
        actions: ["GET_SUPPORTED_MARKETPLACE"],
        source: message.content.source,
      });

      return true;
    } catch (error) {
      logger.error("Error in GET_SUPPORTED_MARKETPLACE action:", error);
      callback({
        text: "Sorry, I encountered an error while retrieving the supported marketplaces. Please try again.",
        actions: ["GET_SUPPORTED_MARKETPLACE"],
        source: message.content.source,
      });
      return false;
    }
  },

  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "What marketplaces do you support?",
        },
      },
      {
        name: "Eliza",
        content: {
          text: "Eliza currently supports the following blockchain networks for dApp data and recommendations:\n\n• **Ethereum** (Chain ID: 1)\n• **Base** (Chain ID: 8453)\n• **Arbitrum** (Chain ID: 42161)\n• **Optimism** (Chain ID: 10)",
          markdown: true,
          actions: ["GET_SUPPORTED_MARKETPLACE"],
        },
      },
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Which chains can you fetch dApp data from?",
        },
      },
      {
        name: "Eliza",
        content: {
          text: "Eliza currently supports the following blockchain networks for dApp data and recommendations:\n\n• **Ethereum** (Chain ID: 1)\n• **Base** (Chain ID: 8453)\n• **Arbitrum** (Chain ID: 42161)\n• **Optimism** (Chain ID: 10)",
          markdown: true,
          actions: ["GET_SUPPORTED_MARKETPLACE"],
        },
      },
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "What networks are available in Eliza?",
        },
      },
      {
        name: "Eliza",
        content: {
          text: "Eliza currently supports the following blockchain networks for dApp data and recommendations:\n\n• **Ethereum** (Chain ID: 1)\n• **Base** (Chain ID: 8453)\n• **Arbitrum** (Chain ID: 42161)\n• **Optimism** (Chain ID: 10)",
          markdown: true,
          actions: ["GET_SUPPORTED_MARKETPLACE"],
        },
      },
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Can you tell me which chains you support?",
        },
      },
      {
        name: "Eliza",
        content: {
          text: "Eliza currently supports the following blockchain networks for dApp data and recommendations:\n\n• **Ethereum** (Chain ID: 1)\n• **Base** (Chain ID: 8453)\n• **Arbitrum** (Chain ID: 42161)\n• **Optimism** (Chain ID: 10)",
          markdown: true,
          actions: ["GET_SUPPORTED_MARKETPLACE"],
        },
      },
    ],
  ],
};
