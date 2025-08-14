import { Rating } from '@/types/dapps';
import { composePromptFromState, IAgentRuntime, logger, ModelType, State } from '@elizaos/core';

/**
 * Extracts and parses a JSON structure from a Markdown-style ```json code block.
 *
 * @param input The full text that may contain a ```json code block
 * @returns Parsed JSON object or null if parsing fails
 */
export function extractJsonFromMarkdownBlock(input: string): any | null {
  const match = input.match(/```json\s*([\s\S]*?)\s*```/);

  if (!match || match.length < 2) {
    console.warn('No valid ```json block found.');

    try {
      return JSON.parse(input);
    } catch (error) {
      console.error('JSON parsing failed:', error);
      return null;
    }
  }

  const jsonContent = match[1];

  try {
    return JSON.parse(jsonContent);
  } catch (err) {
    console.error('JSON parsing failed:', err);
    return null;
  }
}

/**
 * Retrieves data based on a given prompt using an agent runtime.
 *
 * This function composes a prompt from state if provided, logs the prompt,
 * and uses the runtime to execute the prompt. It handles JSON parsing from
 * markdown blocks and returns the raw parsed data if parsing fails.
 *
 **/
export const retrieveDataBasedOnPrompt = async (
  prompt: string,
  runtime: IAgentRuntime,
  state?: State,
  smallModelType?: boolean,
  parseJson?: boolean
) => {
  if (state) {
    prompt = composePromptFromState({
      state: state,
      template: prompt,
    });
  }

  const rawParsedData = await runtime.useModel(
    smallModelType ? ModelType.TEXT_SMALL : ModelType.TEXT_LARGE,
    {
      prompt: prompt,
    }
  );

  try {
    return parseJson ? extractJsonFromMarkdownBlock(rawParsedData) : rawParsedData;
  } catch (error) {
    logger.error('Error in retrieveDataBasedOnPrompt: ', error);
    return rawParsedData;
  }
};

/**
 * Post-processes a list of ratings by ensuring each appId has only one rating.
 *
 * This function creates a Map of ratings, where the key is the appId and the value is the rating.
 * It then returns an array of unique ratings, where each appId has only one rating.
 *
 * @param ratings - The list of ratings to process
 **/
export const ratingsPostProcessing = (ratings: Rating[]): Rating[] => {
  const uniqueRatingsMap = new Map<string, Rating>();

  ratings.forEach((rating) => {
    if (!uniqueRatingsMap.has(rating.appId)) {
      uniqueRatingsMap.set(rating.appId, rating);
    }
  });

  return Array.from(uniqueRatingsMap.values());
};
