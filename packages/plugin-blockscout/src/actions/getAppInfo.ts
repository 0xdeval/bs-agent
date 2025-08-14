import { Action, HandlerCallback, IAgentRuntime, Memory, State } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { retrieveDataBasedOnPrompt } from '../lib/utils';
import { parseInterestedAppNamePrompt } from '../lib/prompts/usersIntents';
import { findCorrectAppPrompt } from '../lib/prompts/appsPrompts';
import { Rating } from '../types/dapps';
import { findAppInfoById } from '../lib/marketplace/utils';
import { isRunGetAppInfoActionPrompt } from '../lib/prompts/isRunGetAppInfoAction';
import { formatAppInfoAsMarkdown } from '../lib/formatters/formatAppInfo';

export const getAppInfoAction: Action = {
  name: 'GET_APP_INFO',
  similes: ['GET_APP_INFORMATION', 'GET_APP_DETAILS', 'GET_APP_RATING', 'GET_APP_REVIEW'],
  description:
    'Get information about a specific dapp based on a user description using Blockscout API and other resources',

  validate: async (_runtime: IAgentRuntime, message: Memory, state: State): Promise<boolean> => {
    const { isGetAppInfoAction } = (await retrieveDataBasedOnPrompt(
      isRunGetAppInfoActionPrompt(message.content.text),
      _runtime,
      state,
      true,
      true
    )) as { isGetAppInfoAction: boolean };

    logger.info('Is get app info action should be run: ', isGetAppInfoAction);

    return isGetAppInfoAction;
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
      const recentUserMessages = await runtime.getMemories({
        roomId: message.roomId,
        count: 1, // Only get the last message
        unique: false,
        tableName: 'messages',
        agentId: runtime.agentId,
      });

      // Filter to get only user messages (exclude agent messages)
      const lastUserMessage = recentUserMessages.find((mem) => mem.entityId !== runtime.agentId);

      const parsedAppName = (await retrieveDataBasedOnPrompt(
        parseInterestedAppNamePrompt(lastUserMessage.content.text),
        runtime,
        state,
        true,
        true
      )) as { appName: string } | null;

      if (!parsedAppName) {
        callback({
          text: 'To make a recommendation more clear, please, provide a name of an app that you are interested in',
          actions: ['GET_APP_INFO'],
          source: message.content.source,
        });

        return true;
      }

      state = await runtime.composeState(message, ['appsProvider', 'appsRatingsProvider']);

      // callback({
      //   text: `Give me a second, I'm retrieving data about ${parsedAppName.appName}`,
      //   actions: ['GET_APP_INFO'],
      //   source: message.content.source,
      // });

      const fetchedDappsViaApi = state.data.providers.appsProvider.data.fetchedDappsViaApi;

      logger.info(
        'Fetched dapps amount via API that was retrieved from a provider: ',
        fetchedDappsViaApi?.length
      );

      const matchedApp = (await retrieveDataBasedOnPrompt(
        findCorrectAppPrompt(parsedAppName.appName, fetchedDappsViaApi),
        runtime,
        state,
        false,
        true
      )) as { id: string; title: string } | null;

      if (!matchedApp) {
        callback({
          text: "Sorry, I couldn't find any information about this app. Please, try again with a different name.",
          actions: ['GET_APP_INFO'],
          source: message.content.source,
        });
      }

      logger.info('Matched app: ', matchedApp);

      const ratings = state.data.providers.appsRatingsProvider.data.ratings;

      const appInfo = findAppInfoById(fetchedDappsViaApi, ratings as Rating[], matchedApp.id);

      if (appInfo) {
        callback({
          text: formatAppInfoAsMarkdown(appInfo),
          actions: ['GET_APP_INFO'],
          markdown: true,
          source: message.content.source,
        });
      } else {
        callback({
          text: "Sorry, I couldn't find any information about this app. Please, try again with a different name.",
          actions: ['GET_APP_INFO'],
          source: message.content.source,
        });
      }

      return true;
    } catch (error) {
      logger.error('Error in GET_APP_INFO action:', error);
    }
  },
  examples: [
    [
      {
        name: '{{name1}}',
        content: {
          text: 'Say token name',
        },
      },
      {
        name: 'Dot',
        content: {
          text: '',
          actions: ['IGNORE'],
        },
      },
    ],
    [
      {
        name: '{{name1}}',
        content: {
          text: 'Tell me more about Uniswap',
        },
      },
      {
        name: 'Eliza',
        content: {
          text: `Here is the information about Uniswap that I found: 
          
          Description: Uniswap is a decentralized exchange (DEX) protocol that allows users to swap ERC-20 tokens without intermediaries. It is built on the Ethereum blockchain and is one of the most popular DEXes.
          Rating: 4.5
          Rating count: 100
          Website: https://app.uniswap.org
          Categories: DEX
          Twitter: https://x.com/Uniswap
          Github: https://github.com/uniswap
          `,
          actions: ['GET_APP_INFO'],
          providers: ['appsProvider', 'appsRatingsProvider'],
        },
      },
    ],
    [
      {
        name: '{{name1}}',
        content: {
          text: 'what is the correct website link for 1inch',
        },
      },
      {
        name: 'Blockscout agent',
        content: {
          text: `Here is all information that I could find about 1inch: \n
          Description: 1inch is a decentralized exchange (DEX) protocol that allows users to swap ERC-20 tokens without intermediaries. It is built on the Ethereum blockchain and is one of the most popular DEXes.
          Rating: 4.5
          Rating count: 100
          Website: https://app.1inch.io
          Categories: DEX
          Twitter: https://x.com/1inch
          Github: https://github.com/1inch
          `,
          actions: ['GET_APP_INFO'],
          providers: ['appsProvider', 'appsRatingsProvider'],
        },
      },
    ],
  ],
};
