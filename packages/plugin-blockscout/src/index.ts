import type { Plugin } from '@elizaos/core';
import { type IAgentRuntime, logger } from '@elizaos/core';
import { z } from 'zod';
import { BlockscoutService } from './service/BlockscoutService';
import { getAppsInfoAction } from './actions/getAppsInfo';
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
  name: 'blockscout-plugin',
  description: 'A plugin to interact with Blockscout API',
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
  // Fallback models to call if other models are not available
  models: {},
  // Routes that can be exposed externally
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
          // roomId: payload.message.roomId,
          entityId: payload.message.entityId,
          count: MAX_CONVERSATION_LENGTH + 1,
          unique: false,
          tableName: 'messages',
          agentId: payload.runtime.agentId,
        });

        console.log('User memories:', memories);
        console.log('User memories length:', memories.length);

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

        // await payload.callback({
        //   text: `I received your message after a receiving a MESSAGE_RECEIVED event! Current user conversation length is ${conversationLength}`,
        // });

        // payload.runtime.setParticipantUserState(
        //   payload.message.roomId,
        //   payload.message.agentId,
        //   "MUTED"
        // );

        // console.log("Memories:", memories);
        // const db = payload.runtime.db;

        // const dbUsers = await db.select().from(userTable);
        // console.log("DB users:", dbUsers);

        // Additional processing...
      },
      // async (params) => {

      //   logger.info("MESSAGE_RECEIVED event received");

      //   logger.info(Object.keys(params));
      // },
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger.info('VOICE_MESSAGE_RECEIVED event received');
        // print the keys
        logger.info(Object.keys(params));
      },
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger.info('WORLD_CONNECTED event received');
        // print the keys
        logger.info(Object.keys(params));
      },
    ],
    WORLD_JOINED: [
      async (params) => {
        logger.info('WORLD_JOINED event received');
        // print the keys
        logger.info(Object.keys(params));
      },
    ],
  },
  services: [BlockscoutService],
  actions: [getAppsInfoAction, getSupportedMarketplaceAction],
  providers: [appsProvider, appsRatingsProvider],
};

export default blockscoutPlugin;
