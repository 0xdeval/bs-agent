import { Provider } from "@elizaos/core";
import ratingsData from "./ratings.json";
import { Rating } from "../types/dapps";
import { ratingsPostProcessing } from "../lib/utils";

export const appsRatingsProvider: Provider = {
  name: "appsRatingsProvider",
  description: "A provider that fetches dapps ratings from an external source",
  dynamic: true,
  position: -100,
  get: async (runtime, message, state) => {
    let ratings: Rating[] = ratingsData;

    ratings = ratingsPostProcessing(ratings);

    return {
      text: `the list of fetched dapps ratings were received`,
      values: { ratings },
      data: { ratings },
    };
  },
};
