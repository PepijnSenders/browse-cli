import { Command } from "commander";
import { searchTweets } from "../api/posts.js";
import {
  output,
  isJsonMode,
  printError,
  formatTweet,
} from "../output/index.js";
import { XCLIError } from "../types/errors.js";
import type { User, Tweet } from "../types/index.js";

/**
 * Format search results for pretty output
 */
function formatSearchResults(tweets: Tweet[], users: User[] = []): string {
  const userMap = new Map(users.map((u) => [u.id, u]));

  return tweets
    .map((tweet) => {
      const author = tweet.author_id ? userMap.get(tweet.author_id) : undefined;
      return formatTweet(tweet, author);
    })
    .join("\n\n---\n\n");
}

/**
 * Create search command
 */
export function createSearchCommand(): Command {
  return new Command("search")
    .description("Search posts")
    .argument("<query>", "Search query")
    .option("-l, --limit <n>", "Number of results", "20")
    .option("--since-id <id>", "Only posts after this ID")
    .option("--until-id <id>", "Only posts before this ID")
    .action(async (query: string, options) => {
      try {
        const response = await searchTweets(query, {
          max_results: parseInt(options.limit, 10),
          since_id: options.sinceId,
          until_id: options.untilId,
        });

        if (isJsonMode()) {
          output(response);
        } else {
          if (!response.data || response.data.length === 0) {
            console.log("No posts found matching your query");
            return;
          }

          console.log(
            formatSearchResults(response.data, response.includes?.users)
          );

          if (response.meta?.result_count) {
            console.log(`\n--- ${response.meta.result_count} results ---`);
          }
          if (response.meta?.next_token) {
            console.log(`More results available`);
          }
        }
      } catch (error) {
        if (error instanceof XCLIError) {
          if (isJsonMode()) {
            output({ error: error.message, code: error.code });
          } else {
            printError(error);
          }
        } else {
          throw error;
        }
        process.exit(1);
      }
    });
}
