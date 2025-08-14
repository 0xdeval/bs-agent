import { Action, HandlerCallback, IAgentRuntime, Memory, State } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { retrieveDataBasedOnPrompt } from '../lib/utils';
import { parseUserIntentPrompt } from '../lib/prompts/usersIntents';
import { mapDappsByCategoriesPrompt } from '../lib/prompts/appsPrompts';

import {
  recommendationFallbackPrompt,
  recommendDappsPrompt,
} from '../lib/prompts/appsRecommendationPrompts';
import { Rating, Recommendation } from '../types/dapps';
import { UserIntent } from '../types/userData';
import { filterDappsByCategories, retrieveFinalRecommendation } from '../lib/marketplace/utils';
import { combineDappWithRatings } from '../lib/marketplace/utils';
import { formatRecommendationsForDisplay } from '../lib/formatters/formatRecommendations';
import { isRunRecommendActionPrompt } from '../lib/prompts/isRunRecommendAction';

// To fetch information from custom providers use the following format:
// state.data.providers.appsProvider.data
// where appsProvider is a name of a custom provider. Data, Values, Text inside it what you're returning in a provider
export const recommendAppsAction: Action = {
  name: 'RECOMMEND_APPS',
  similes: [
    'DAPP_RECOMMENDATIONS',
    'DAPP_SUGGESTIONS',
    'DEFI_RECOMMENDATIONS',
    'APP_RECOMMENDATIONS',
    'PROTOCOL_RECOMMENDATIONS',
  ],
  description:
    'Recommend the most relevant dapp based on a user intent, user case, and a chain preference using Blockscout API and other resources',

  validate: async (_runtime: IAgentRuntime, message: Memory, state: State): Promise<boolean> => {
    const { isRecommendAction } = (await retrieveDataBasedOnPrompt(
      isRunRecommendActionPrompt(message.content.text),
      _runtime,
      state,
      true,
      true
    )) as { isRecommendAction: boolean };

    logger.info('Is recommend action should be run: ', isRecommendAction);

    return isRecommendAction;
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

      const parsedUserIntent = (await retrieveDataBasedOnPrompt(
        parseUserIntentPrompt(lastUserMessage.content.text),
        runtime,
        state,
        true,
        true
      )) as UserIntent;

      logger.info('Parsed user intent: ', parsedUserIntent);

      // Store user intent in memory
      await runtime.createMemory(
        {
          entityId: message.entityId,
          roomId: message.roomId,
          content: {
            userIntent: parsedUserIntent,
          },
          createdAt: new Date().getTime(),
        },
        'userInfo'
      );

      const chainId = parsedUserIntent.chainId;

      state = await runtime.composeState(message, ['appsProvider', 'appsRatingsProvider']);

      if (!chainId) {
        callback({
          text: 'To make a recommendation more clear, please, provide a chain name for a use case',
          actions: ['RECOMMEND_APPS'],
          source: message.content.source,
        });

        return true;
      }

      callback({
        text: `Give me a second, I'm retrieving data for you based on your input:\n\nUse case: ${parsedUserIntent.useCase}\nChain: ${parsedUserIntent.chain}`,
        actions: ['RECOMMEND_APPS'],
        source: message.content.source,
      });

      logger.info('Current agent state keys: ', Object.keys(state));
      logger.info('Current agent state data: ', state.data);
      logger.info(
        'Current agent state data from a provider appsProvider: ',
        state.data.providers.appsProvider.data
      );

      const fetchedDappsViaApi = state.data.providers.appsProvider.data.fetchedDappsViaApi;

      logger.info(
        'Fetched dapps via API that was retrieved from a provider: ',
        fetchedDappsViaApi?.slice(0, 10)
      );

      const matchedCategories = (await retrieveDataBasedOnPrompt(
        mapDappsByCategoriesPrompt(parsedUserIntent.useCase, fetchedDappsViaApi),
        runtime,
        state,
        false,
        true
      )) as { categories: string[] };

      logger.info('Filtered dapps by a user use case: ', matchedCategories);

      const filteredDappsByCategory = filterDappsByCategories(
        fetchedDappsViaApi,
        matchedCategories.categories
      );

      // On this step we have a fetched list of dapp from a provider and filtered by a user use case

      // Then fetch ratings for dapps and update state;

      const ratings = state.data.providers.appsRatingsProvider.data.ratings;

      logger.info('Ratings in an action: ', ratings);

      const dappsWithRatings = combineDappWithRatings(filteredDappsByCategory, ratings as Rating[]);

      const recommendationPrompt = recommendDappsPrompt(
        parsedUserIntent,
        dappsWithRatings.map((dapp) => ({
          id: dapp.id,
          description: dapp.description,
          rating: dapp.rating,
          ratingCount: dapp.ratingCount,
        }))
      );

      const recommendationResult = (await retrieveDataBasedOnPrompt(
        recommendationPrompt,
        runtime,
        state,
        false,
        true
      )) as Recommendation | string;

      logger.info('Recommendation result: ', recommendationResult);

      if (recommendationResult && typeof recommendationResult === 'object') {
        const finalRecommendation = retrieveFinalRecommendation(
          filteredDappsByCategory,
          recommendationResult as Recommendation
        );

        const formattedRecommendation = formatRecommendationsForDisplay(finalRecommendation);

        callback({
          text: formattedRecommendation,
          markdown: true,
          actions: ['RECOMMEND_APPS'],
          source: message.content.source,
        });
      } else {
        if (typeof recommendationResult === 'string') {
          logger.info("Can't structure data, return summary");
          const summaryResult = (await retrieveDataBasedOnPrompt(
            recommendationFallbackPrompt(recommendationResult),
            runtime,
            null,
            false,
            false
          )) as string;

          callback({
            text: summaryResult,
            actions: ['RECOMMEND_APPS'],
            source: message.content.source,
          });
        }
      }

      return true;
    } catch (error) {
      logger.error('Error in RECOMMEND_APPS action:', error);
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
          text: 'Do you know what will be the best dapp to borrow on tokens on Arbitrum?',
        },
      },
      {
        name: 'Eliza',
        content: {
          text: 'The best dapp to borrow on tokens on Arbitrum is: ',
          actions: ['RECOMMEND_APPS'],
          providers: ['appsProvider', 'appsRatingsProvider'],
        },
      },
    ],
    [
      {
        name: '{{name1}}',
        content: {
          text: 'What is the best bridge on Ethereum?',
        },
      },
      {
        name: 'Eliza',
        content: {
          text: 'The best bridge on Ethereum is: ',
          actions: ['RECOMMEND_APPS'],
          providers: ['appsProvider', 'appsRatingsProvider'],
        },
      },
    ],
    [
      {
        name: '{{name1}}',
        content: {
          text: 'What are good games to play on Optimism?',
        },
      },
      {
        name: 'Eliza',
        content: {
          text: 'Good games on Optimism are: ',
          actions: ['RECOMMEND_APPS'],
          providers: ['appsProvider', 'appsRatingsProvider'],
        },
      },
    ],
  ],
};
