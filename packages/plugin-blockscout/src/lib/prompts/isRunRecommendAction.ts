export const isRunRecommendActionPrompt = (userMessage: string) => `
You're an data analyst. Your task is to check if a user in his message ask to recommend a dapp for a particular use case or it's not. If it is, then return true, otherwise return false.

Take into account the following rules:
- IMPORTANT: You always need to return a boolean value in a JSON format structure data
- IMPORTANT: Don't return any other text than a boolean value in JSON format. Your response will directly parsed by a code and if you return any other text than a boolean value, it will break the code
- IMPORTANT: if a user message is a recommendation request, then return true, otherwise return false


Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example responses:
\`\`\`json
{
    "isRecommendAction": true
}
\`\`\`

Here is a recent messages from a user that you need to analyze and extract a user intent from:

${userMessage}

`;
