import type { Plugin } from '@elizaos/core';
import { type IAgentRuntime, logger } from '@elizaos/core';
import { z } from 'zod';
import { BlockscoutService } from './service/BlockscoutService';
import { recommendAppsAction } from './actions/recommendApps';
import { getAppInfoAction } from './actions/getAppInfo';
import { appsProvider } from './providers/fetchApps';
import { appsRatingsProvider } from './providers/fetchAppsRatings';
import { getSupportedMarketplaceAction } from './actions/getSupportedMarketplace';

const configSchema = z.object({
  API_KEY: z
    .string()
    .min(1, 'API key is required')
    .optional()
    .transform((val) => {
      if (!val) {
        console.warn('Warning: API_KEY is not provided');
      }
      return val;
    }),
});

const blockscoutPlugin: Plugin = {
  name: 'plugin-blockscout',
  description:
    'A plugin to retrieve information about dapps, web3 marketplaces and other dapp-related topics using Blockscout API and other resources',
  priority: 9999999,
  config: {
    API_KEY: process.env.API_KEY,
  },
  async init(config: Record<string, string>) {
    logger.info('*** Initializing Blockscout plugin ***');
    try {
      const validatedConfig = await configSchema.parseAsync(config);

      // Set all environment variables at once
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid plugin configuration: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  },
  models: {},
  routes: [
    {
      name: 'api-status',
      path: '/api/status',
      type: 'GET',
      handler: async (req: any, res: any, runtime: IAgentRuntime) => {
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          plugin: 'plugin-blockscout',
        });
      },
    },
  ],
  events: {
    MESSAGE_RECEIVED: [
      async (payload) => {
        const MAX_CONVERSATION_LENGTH = 6;

        console.log('Checking if a user hit a limit of messages. User: ', payload.message.entityId);

        const memories = await payload.runtime.getMemories({
          entityId: payload.message.entityId,
          count: MAX_CONVERSATION_LENGTH + 1,
          unique: false,
          tableName: 'messages',
          agentId: payload.runtime.agentId,
        });

        console.log('User total messages length:', memories.length);

        const conversationLength = memories.length;

        if (conversationLength > MAX_CONVERSATION_LENGTH) {
          await payload.callback({
            text: `You hit a limit of ${MAX_CONVERSATION_LENGTH} messages. Thanks for testing our solution!`,
          });

          payload.runtime.setParticipantUserState(
            payload.message.roomId,
            payload.message.agentId,
            'MUTED'
          );
        }
      },
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger.info('VOICE_MESSAGE_RECEIVED event received');
      },
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger.info('WORLD_CONNECTED event received');
      },
    ],
    WORLD_JOINED: [
      async (params) => {
        logger.info('WORLD_JOINED event received');
      },
    ],
  },
  services: [BlockscoutService],
  actions: [recommendAppsAction, getAppInfoAction, getSupportedMarketplaceAction],
  providers: [appsProvider, appsRatingsProvider],
};

export default blockscoutPlugin;
