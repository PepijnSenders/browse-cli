import { Command } from "commander";
import {
  getTweet,
  createTweet,
  deleteTweet,
  replyToTweet,
  quoteTweet,
} from "../api/posts.js";
import {
  output,
  isJsonMode,
  printError,
  createSpinner,
  formatTweet,
} from "../output/index.js";
import { XCLIError } from "../types/errors.js";
import type { User } from "../types/index.js";

/**
 * Create post command group
 */
export function createPostCommand(): Command {
  const post = new Command("post").description("Post commands");

  // Create post
  post
    .command("create")
    .description("Create a new post")
    .argument("<text>", "Post text (max 280 characters)")
    .option("--reply-to <id>", "Reply to this post ID")
    .option("--quote <id>", "Quote this post ID")
    .action(async (text: string, options) => {
      const spinner = createSpinner("Creating post...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        let result;

        if (options.replyTo) {
          result = await replyToTweet(options.replyTo, text);
        } else if (options.quote) {
          result = await quoteTweet(options.quote, text);
        } else {
          result = await createTweet({ text });
        }

        if (!isJsonMode()) {
          spinner.succeed("Post created!");
          console.log(`ID: ${result.id}`);
        } else {
          output(result);
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to create post");
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

  // Get post
  post
    .command("get")
    .description("Get a post by ID")
    .argument("<id>", "Post ID")
    .action(async (id: string) => {
      try {
        const response = await getTweet(id);
        const tweet = response.data;

        // Find author from includes
        const author = response.includes?.users?.find(
          (u: User) => u.id === tweet.author_id
        );

        if (isJsonMode()) {
          output(response);
        } else {
          console.log(formatTweet(tweet, author));
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

  // Delete post
  post
    .command("delete")
    .description("Delete a post")
    .argument("<id>", "Post ID")
    .action(async (id: string) => {
      const spinner = createSpinner("Deleting post...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const deleted = await deleteTweet(id);

        if (!isJsonMode()) {
          if (deleted) {
            spinner.succeed("Post deleted");
          } else {
            spinner.warn("Post may not have been deleted");
          }
        } else {
          output({ deleted });
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to delete post");
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

  // Reply to post (shorthand)
  post
    .command("reply")
    .description("Reply to a post")
    .argument("<id>", "Post ID to reply to")
    .argument("<text>", "Reply text")
    .action(async (id: string, text: string) => {
      const spinner = createSpinner("Posting reply...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const result = await replyToTweet(id, text);

        if (!isJsonMode()) {
          spinner.succeed("Reply posted!");
          console.log(`ID: ${result.id}`);
        } else {
          output(result);
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to post reply");
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

  return post;
}
