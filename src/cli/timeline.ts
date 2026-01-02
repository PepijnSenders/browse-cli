import { Command } from "commander";
import {
  getHomeTimeline,
  getUserTimeline,
  getMentions,
} from "../api/posts.js";
import { getMe, getUserByUsername } from "../api/users.js";
import {
  output,
  isJsonMode,
  printError,
  formatTweet,
} from "../output/index.js";
import { XCLIError } from "../types/errors.js";
import type { User, Tweet } from "../types/index.js";

/**
 * Format timeline for pretty output
 */
function formatTimeline(
  tweets: Tweet[],
  users: User[] = []
): string {
  const userMap = new Map(users.map((u) => [u.id, u]));

  return tweets
    .map((tweet) => {
      const author = tweet.author_id ? userMap.get(tweet.author_id) : undefined;
      return formatTweet(tweet, author);
    })
    .join("\n\n---\n\n");
}

/**
 * Create timeline command group
 */
export function createTimelineCommand(): Command {
  const timeline = new Command("timeline").description("Timeline commands");

  // Home timeline
  timeline
    .command("home")
    .description("Get home timeline")
    .option("-l, --limit <n>", "Number of posts", "20")
    .option("--since-id <id>", "Only posts after this ID")
    .option("--until-id <id>", "Only posts before this ID")
    .action(async (options) => {
      try {
        // Get current user ID
        const me = await getMe();

        const response = await getHomeTimeline(me.id, {
          max_results: parseInt(options.limit, 10),
          since_id: options.sinceId,
          until_id: options.untilId,
        });

        if (isJsonMode()) {
          output(response);
        } else {
          if (!response.data || response.data.length === 0) {
            console.log("No posts found");
            return;
          }
          console.log(formatTimeline(response.data, response.includes?.users));
          if (response.meta?.next_token) {
            console.log(`\n--- More posts available ---`);
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

  // User timeline
  timeline
    .command("user")
    .description("Get a user's posts")
    .argument("<username>", "Username (with or without @)")
    .option("-l, --limit <n>", "Number of posts", "20")
    .option("--since-id <id>", "Only posts after this ID")
    .option("--until-id <id>", "Only posts before this ID")
    .action(async (username: string, options) => {
      try {
        // Get user ID from username
        const user = await getUserByUsername(username);

        const response = await getUserTimeline(user.id, {
          max_results: parseInt(options.limit, 10),
          since_id: options.sinceId,
          until_id: options.untilId,
        });

        if (isJsonMode()) {
          output(response);
        } else {
          if (!response.data || response.data.length === 0) {
            console.log(`No posts from @${user.username}`);
            return;
          }
          console.log(formatTimeline(response.data, response.includes?.users));
          if (response.meta?.next_token) {
            console.log(`\n--- More posts available ---`);
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

  // Mentions timeline
  timeline
    .command("mentions")
    .description("Get your mentions")
    .option("-l, --limit <n>", "Number of posts", "20")
    .option("--since-id <id>", "Only posts after this ID")
    .option("--until-id <id>", "Only posts before this ID")
    .action(async (options) => {
      try {
        // Get current user ID
        const me = await getMe();

        const response = await getMentions(me.id, {
          max_results: parseInt(options.limit, 10),
          since_id: options.sinceId,
          until_id: options.untilId,
        });

        if (isJsonMode()) {
          output(response);
        } else {
          if (!response.data || response.data.length === 0) {
            console.log("No mentions found");
            return;
          }
          console.log(formatTimeline(response.data, response.includes?.users));
          if (response.meta?.next_token) {
            console.log(`\n--- More mentions available ---`);
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

  return timeline;
}
