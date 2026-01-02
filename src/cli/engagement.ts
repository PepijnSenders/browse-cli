import { Command } from "commander";
import {
  likeTweet,
  unlikeTweet,
  retweet,
  unretweet,
  bookmarkTweet,
  removeBookmark,
  getBookmarks,
} from "../api/engagement.js";
import { getMe } from "../api/users.js";
import {
  output,
  isJsonMode,
  printError,
  createSpinner,
  formatTweet,
} from "../output/index.js";
import { XCLIError } from "../types/errors.js";
import type { User, Tweet } from "../types/index.js";

/**
 * Create like command
 */
export function createLikeCommand(): Command {
  return new Command("like")
    .description("Like a post")
    .argument("<id>", "Post ID")
    .action(async (id: string) => {
      const spinner = createSpinner("Liking post...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const me = await getMe();
        const liked = await likeTweet(me.id, id);

        if (!isJsonMode()) {
          spinner.succeed("Post liked!");
        } else {
          output({ liked });
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to like post");
        }
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

/**
 * Create unlike command
 */
export function createUnlikeCommand(): Command {
  return new Command("unlike")
    .description("Unlike a post")
    .argument("<id>", "Post ID")
    .action(async (id: string) => {
      const spinner = createSpinner("Unliking post...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const me = await getMe();
        const unliked = await unlikeTweet(me.id, id);

        if (!isJsonMode()) {
          spinner.succeed("Post unliked");
        } else {
          output({ unliked });
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to unlike post");
        }
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

/**
 * Create repost command
 */
export function createRepostCommand(): Command {
  return new Command("repost")
    .description("Repost a post")
    .argument("<id>", "Post ID")
    .action(async (id: string) => {
      const spinner = createSpinner("Reposting...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const me = await getMe();
        const reposted = await retweet(me.id, id);

        if (!isJsonMode()) {
          spinner.succeed("Reposted!");
        } else {
          output({ reposted });
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to repost");
        }
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

/**
 * Create unrepost command
 */
export function createUnrepostCommand(): Command {
  return new Command("unrepost")
    .description("Remove repost")
    .argument("<id>", "Post ID")
    .action(async (id: string) => {
      const spinner = createSpinner("Removing repost...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const me = await getMe();
        const unreposted = await unretweet(me.id, id);

        if (!isJsonMode()) {
          spinner.succeed("Repost removed");
        } else {
          output({ unreposted });
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to remove repost");
        }
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

/**
 * Format bookmarks for pretty output
 */
function formatBookmarks(tweets: Tweet[], users: User[] = []): string {
  const userMap = new Map(users.map((u) => [u.id, u]));

  return tweets
    .map((tweet) => {
      const author = tweet.author_id ? userMap.get(tweet.author_id) : undefined;
      return formatTweet(tweet, author);
    })
    .join("\n\n---\n\n");
}

/**
 * Create bookmark command group
 */
export function createBookmarkCommand(): Command {
  const bookmark = new Command("bookmark").description("Bookmark commands");

  // Add bookmark (default action)
  bookmark
    .command("add")
    .description("Bookmark a post")
    .argument("<id>", "Post ID")
    .action(async (id: string) => {
      const spinner = createSpinner("Bookmarking post...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const me = await getMe();
        const bookmarked = await bookmarkTweet(me.id, id);

        if (!isJsonMode()) {
          spinner.succeed("Post bookmarked!");
        } else {
          output({ bookmarked });
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to bookmark post");
        }
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

  // List bookmarks
  bookmark
    .command("list")
    .description("List bookmarked posts")
    .option("-l, --limit <n>", "Number of bookmarks", "20")
    .action(async (options) => {
      try {
        const me = await getMe();
        const response = await getBookmarks(me.id, {
          max_results: parseInt(options.limit, 10),
        });

        if (isJsonMode()) {
          output(response);
        } else {
          if (!response.data || response.data.length === 0) {
            console.log("No bookmarks yet");
            return;
          }
          console.log(formatBookmarks(response.data, response.includes?.users));
          if (response.meta?.next_token) {
            console.log(`\n--- More bookmarks available ---`);
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

  // Remove bookmark
  bookmark
    .command("remove")
    .description("Remove a bookmark")
    .argument("<id>", "Post ID")
    .action(async (id: string) => {
      const spinner = createSpinner("Removing bookmark...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const me = await getMe();
        const removed = await removeBookmark(me.id, id);

        if (!isJsonMode()) {
          spinner.succeed("Bookmark removed");
        } else {
          output({ removed });
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to remove bookmark");
        }
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

  return bookmark;
}
