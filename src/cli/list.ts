import { Command } from "commander";
import {
  getList,
  createList,
  updateList,
  deleteList,
  getListTimeline,
  getOwnedLists,
  getFollowedLists,
  getPinnedLists,
  getListMembers,
  addListMember,
  removeListMember,
  followList,
  unfollowList,
  pinList,
  unpinList,
} from "../api/lists.js";
import { getMe, getUserByUsername } from "../api/users.js";
import {
  output,
  isJsonMode,
  printError,
  createSpinner,
  formatNumber,
  formatTweet,
  formatUsername,
  createTable,
} from "../output/index.js";
import { XCLIError } from "../types/errors.js";
import type { List, User, Tweet } from "../types/index.js";
import chalk from "chalk";

/**
 * Format a list for pretty output
 */
function formatListDetails(list: List): string {
  const lines: string[] = [];

  // Name with private indicator
  const privateTag = list.private ? chalk.yellow(" [Private]") : "";
  lines.push(chalk.bold(`📋 ${list.name}`) + privateTag);

  // Description
  if (list.description) {
    lines.push("");
    lines.push(list.description);
  }

  // Stats
  lines.push("");
  const stats = [];
  if (list.member_count !== undefined) {
    stats.push(`👥 ${formatNumber(list.member_count)} members`);
  }
  if (list.follower_count !== undefined) {
    stats.push(`👁 ${formatNumber(list.follower_count)} followers`);
  }
  if (stats.length > 0) {
    lines.push(stats.join("  "));
  }

  return lines.join("\n");
}

/**
 * Format lists for table output
 */
function formatListsTable(lists: List[]): string {
  if (lists.length === 0) {
    return "No lists found";
  }

  const table = createTable({
    head: ["Name", "Members", "Followers", "Private"],
  });

  for (const list of lists) {
    table.push([
      list.name,
      list.member_count !== undefined ? formatNumber(list.member_count) : "-",
      list.follower_count !== undefined ? formatNumber(list.follower_count) : "-",
      list.private ? "Yes" : "No",
    ]);
  }

  return table.toString();
}

/**
 * Format timeline for pretty output
 */
function formatTimeline(tweets: Tweet[], users: User[] = []): string {
  const userMap = new Map(users.map((u) => [u.id, u]));

  return tweets
    .map((tweet) => {
      const author = tweet.author_id ? userMap.get(tweet.author_id) : undefined;
      return formatTweet(tweet, author);
    })
    .join("\n\n---\n\n");
}

/**
 * Format user list for pretty output
 */
function formatUserList(users: User[]): string {
  if (users.length === 0) {
    return "No members found";
  }

  const table = createTable({
    head: ["Username", "Name", "Followers"],
  });

  for (const user of users) {
    table.push([
      formatUsername(user),
      user.name,
      user.public_metrics ? formatNumber(user.public_metrics.followers_count) : "-",
    ]);
  }

  return table.toString();
}

/**
 * Create list command group
 */
export function createListCommand(): Command {
  const list = new Command("list").description("List commands");

  // Get list details (default when ID provided)
  list
    .command("show")
    .description("Show list details")
    .argument("<id>", "List ID")
    .action(async (id: string) => {
      try {
        const listData = await getList(id);

        if (isJsonMode()) {
          output(listData);
        } else {
          console.log(formatListDetails(listData));
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

  // Create list
  list
    .command("create")
    .description("Create a new list")
    .argument("<name>", "List name (max 25 chars)")
    .option("-d, --description <text>", "List description (max 100 chars)")
    .option("-p, --private", "Make list private")
    .action(async (name: string, options) => {
      const spinner = createSpinner("Creating list...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const result = await createList({
          name,
          description: options.description,
          private: options.private,
        });

        if (!isJsonMode()) {
          spinner.succeed(`List created: ${result.name}`);
          console.log(`ID: ${result.id}`);
        } else {
          output(result);
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to create list");
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

  // Update list
  list
    .command("update")
    .description("Update a list")
    .argument("<id>", "List ID")
    .option("-n, --name <name>", "New name")
    .option("-d, --description <text>", "New description")
    .option("--private", "Make private")
    .option("--public", "Make public")
    .action(async (id: string, options) => {
      const spinner = createSpinner("Updating list...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const updateData: { name?: string; description?: string; private?: boolean } = {};
        if (options.name) updateData.name = options.name;
        if (options.description) updateData.description = options.description;
        if (options.private) updateData.private = true;
        if (options.public) updateData.private = false;

        const updated = await updateList(id, updateData);

        if (!isJsonMode()) {
          if (updated) {
            spinner.succeed("List updated");
          } else {
            spinner.warn("List may not have been updated");
          }
        } else {
          output({ updated });
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to update list");
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

  // Delete list
  list
    .command("delete")
    .description("Delete a list")
    .argument("<id>", "List ID")
    .action(async (id: string) => {
      const spinner = createSpinner("Deleting list...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const deleted = await deleteList(id);

        if (!isJsonMode()) {
          if (deleted) {
            spinner.succeed("List deleted");
          } else {
            spinner.warn("List may not have been deleted");
          }
        } else {
          output({ deleted });
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to delete list");
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

  // List timeline
  list
    .command("timeline")
    .description("Get posts from a list")
    .argument("<id>", "List ID")
    .option("-l, --limit <n>", "Number of posts", "20")
    .action(async (id: string, options) => {
      try {
        const response = await getListTimeline(id, {
          max_results: parseInt(options.limit, 10),
        });

        if (isJsonMode()) {
          output(response);
        } else {
          if (!response.data || response.data.length === 0) {
            console.log("No posts in this list");
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

  // List members
  list
    .command("members")
    .description("Get list members")
    .argument("<id>", "List ID")
    .option("-l, --limit <n>", "Number of members", "100")
    .action(async (id: string, options) => {
      try {
        const response = await getListMembers(id, {
          max_results: parseInt(options.limit, 10),
        });

        if (isJsonMode()) {
          output(response);
        } else {
          if (!response.data || response.data.length === 0) {
            console.log("No members in this list");
            return;
          }
          console.log(formatUserList(response.data));
          if (response.meta?.next_token) {
            console.log(`\n--- More members available ---`);
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

  // Add member
  list
    .command("add")
    .description("Add a member to a list")
    .argument("<id>", "List ID")
    .argument("<username>", "Username to add")
    .action(async (id: string, username: string) => {
      const spinner = createSpinner("Adding member...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const user = await getUserByUsername(username);
        const added = await addListMember(id, user.id);

        if (!isJsonMode()) {
          spinner.succeed(`Added @${user.username} to list`);
        } else {
          output({ added });
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to add member");
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

  // Remove member
  list
    .command("remove")
    .description("Remove a member from a list")
    .argument("<id>", "List ID")
    .argument("<username>", "Username to remove")
    .action(async (id: string, username: string) => {
      const spinner = createSpinner("Removing member...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const user = await getUserByUsername(username);
        const removed = await removeListMember(id, user.id);

        if (!isJsonMode()) {
          spinner.succeed(`Removed @${user.username} from list`);
        } else {
          output({ removed });
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to remove member");
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

  // Follow list
  list
    .command("follow")
    .description("Follow a list")
    .argument("<id>", "List ID")
    .action(async (id: string) => {
      const spinner = createSpinner("Following list...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const me = await getMe();
        const following = await followList(me.id, id);

        if (!isJsonMode()) {
          spinner.succeed("Now following list");
        } else {
          output({ following });
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to follow list");
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

  // Unfollow list
  list
    .command("unfollow")
    .description("Unfollow a list")
    .argument("<id>", "List ID")
    .action(async (id: string) => {
      const spinner = createSpinner("Unfollowing list...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const me = await getMe();
        const unfollowed = await unfollowList(me.id, id);

        if (!isJsonMode()) {
          spinner.succeed("Unfollowed list");
        } else {
          output({ unfollowed });
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to unfollow list");
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

  // Pin list
  list
    .command("pin")
    .description("Pin a list")
    .argument("<id>", "List ID")
    .action(async (id: string) => {
      const spinner = createSpinner("Pinning list...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const me = await getMe();
        const pinned = await pinList(me.id, id);

        if (!isJsonMode()) {
          spinner.succeed("List pinned");
        } else {
          output({ pinned });
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to pin list");
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

  // Unpin list
  list
    .command("unpin")
    .description("Unpin a list")
    .argument("<id>", "List ID")
    .action(async (id: string) => {
      const spinner = createSpinner("Unpinning list...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const me = await getMe();
        const unpinned = await unpinList(me.id, id);

        if (!isJsonMode()) {
          spinner.succeed("List unpinned");
        } else {
          output({ unpinned });
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to unpin list");
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

  return list;
}

/**
 * Create lists command (list your lists)
 */
export function createListsCommand(): Command {
  return new Command("lists")
    .description("List your lists or another user's lists")
    .argument("[username]", "Username (defaults to you)")
    .option("--pinned", "Show only pinned lists")
    .option("--followed", "Show lists you follow")
    .option("-l, --limit <n>", "Number of lists", "100")
    .action(async (username: string | undefined, options) => {
      try {
        let userId: string;
        let targetUsername: string;

        if (username) {
          const user = await getUserByUsername(username);
          userId = user.id;
          targetUsername = user.username;
        } else {
          const me = await getMe();
          userId = me.id;
          targetUsername = me.username;
        }

        let response;
        let listType: string;

        if (options.pinned) {
          response = await getPinnedLists(userId);
          listType = "pinned";
        } else if (options.followed) {
          response = await getFollowedLists(userId, {
            max_results: parseInt(options.limit, 10),
          });
          listType = "followed";
        } else {
          response = await getOwnedLists(userId, {
            max_results: parseInt(options.limit, 10),
          });
          listType = "owned";
        }

        if (isJsonMode()) {
          output(response);
        } else {
          if (!response.data || response.data.length === 0) {
            console.log(`@${targetUsername} has no ${listType} lists`);
            return;
          }
          console.log(`@${targetUsername}'s ${listType} lists:\n`);
          console.log(formatListsTable(response.data));
          if (response.meta?.next_token) {
            console.log(`\n--- More lists available ---`);
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
