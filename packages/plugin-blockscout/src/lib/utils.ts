import { Rating } from "@/types/dapps";
import {
  composePromptFromState,
  IAgentRuntime,
  logger,
  ModelType,
  State,
} from "@elizaos/core";

/**
 * Extracts and parses a JSON structure from a Markdown-style ```json code block.
 *
 * @param input The full text that may contain a ```json code block
 * @returns Parsed JSON object or null if parsing fails
 */
export function extractJsonFromMarkdownBlock(input: string): any | null {
  const match = input.match(/```json\s*([\s\S]*?)\s*```/);

  if (!match || match.length < 2) {
    console.warn("No valid ```json block found.");

    try {
      return JSON.parse(input);
    } catch (error) {
      console.error("JSON parsing failed:", error);
      return null;
    }
  }

  const jsonContent = match[1];

  try {
    return JSON.parse(jsonContent);
  } catch (err) {
    console.error("JSON parsing failed:", err);
    return null;
  }
}

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

  logger.info("Prompt to execute: ", prompt);

  const rawParsedData = await runtime.useModel(
    smallModelType ? ModelType.TEXT_SMALL : ModelType.TEXT_LARGE,
    {
      prompt: prompt,
    }
  );

  console.log("Raw parsed data in retrieveDataBasedOnPrompt: ", rawParsedData);
  try {
    return parseJson
      ? extractJsonFromMarkdownBlock(rawParsedData)
      : rawParsedData;
  } catch (error) {
    logger.error("Error in retrieveDataBasedOnPrompt: ", error);
    return rawParsedData;
  }
};

export const ratingsPostProcessing = (ratings: Rating[]): Rating[] => {
  const uniqueRatingsMap = new Map<string, Rating>();

  ratings.forEach((rating) => {
    if (!uniqueRatingsMap.has(rating.appId)) {
      uniqueRatingsMap.set(rating.appId, rating);
    }
  });

  return Array.from(uniqueRatingsMap.values());
};
