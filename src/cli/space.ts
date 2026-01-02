import { Command } from "commander";
import {
  getSpace,
  searchSpaces,
  getSpacesByCreators,
  getSpaceBuyers,
} from "../api/spaces.js";
import { getUserByUsername } from "../api/users.js";
import {
  output,
  isJsonMode,
  printError,
  createSpinner,
  formatNumber,
  createTable,
} from "../output/index.js";
import { XCLIError } from "../types/errors.js";
import type { Space, User } from "../types/index.js";

/**
 * Format space state with emoji
 */
function formatState(state: string): string {
  switch (state) {
    case "live":
      return "LIVE";
    case "scheduled":
      return "SCHEDULED";
    case "ended":
      return "ENDED";
    default:
      return state.toUpperCase();
  }
}

/**
 * Format space details for pretty output
 */
function formatSpaceDetails(space: Space, users?: User[]): string {
  const userMap = new Map(users?.map((u) => [u.id, u]) || []);
  const lines: string[] = [];

  lines.push(`${space.title || "Untitled Space"}`);
  lines.push(`State: ${formatState(space.state)}`);
  lines.push("");

  if (space.host_ids?.length) {
    const hosts = space.host_ids
      .map((id) => userMap.get(id)?.username || id)
      .map((u) => `@${u}`)
      .join(", ");
    lines.push(`Host: ${hosts}`);
  }

  if (space.speaker_ids?.length) {
    const speakers = space.speaker_ids
      .map((id) => userMap.get(id)?.username || id)
      .map((u) => `@${u}`)
      .join(", ");
    lines.push(`Speakers: ${speakers}`);
  }

  if (space.participant_count !== undefined) {
    lines.push(`Listeners: ${formatNumber(space.participant_count)}`);
  }

  if (space.scheduled_start) {
    lines.push(`Scheduled: ${new Date(space.scheduled_start).toLocaleString()}`);
  }

  if (space.is_ticketed) {
    lines.push("Ticketed Space");
  }

  return lines.join("\n");
}

/**
 * Format space list for pretty output
 */
function formatSpaceList(spaces: Space[], users?: User[]): string {
  if (spaces.length === 0) {
    return "No spaces found";
  }

  const userMap = new Map(users?.map((u) => [u.id, u]) || []);
  const table = createTable({
    head: ["Title", "State", "Host", "Listeners"],
  });

  for (const space of spaces) {
    const host = space.host_ids?.[0];
    const hostUser = host ? userMap.get(host) : undefined;
    const hostName = hostUser ? `@${hostUser.username}` : "-";

    table.push([
      (space.title || "Untitled").substring(0, 40),
      formatState(space.state),
      hostName,
      space.participant_count !== undefined
        ? formatNumber(space.participant_count)
        : "-",
    ]);
  }

  return table.toString();
}

/**
 * Create space command with subcommands
 */
export function createSpaceCommand(): Command {
  const space = new Command("space").description("Space commands");

  // Get space by ID
  space
    .command("get")
    .description("Get space details")
    .argument("<id>", "Space ID")
    .action(async (id: string) => {
      const spinner = createSpinner("Loading space...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const result = await getSpace(id);

        if (!isJsonMode()) {
          spinner.stop();
          console.log(formatSpaceDetails(result.space, result.users));
        } else {
          output(result);
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to load space");
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

  // Search spaces
  space
    .command("search")
    .description("Search for spaces")
    .argument("<query>", "Search query")
    .option("-s, --state <state>", "Filter by state (live, scheduled, all)", "all")
    .option("-l, --limit <n>", "Number of results", "10")
    .action(async (query: string, options) => {
      const spinner = createSpinner("Searching spaces...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const result = await searchSpaces(query, {
          state: options.state as "live" | "scheduled" | "all",
          max_results: parseInt(options.limit, 10),
        });

        if (!isJsonMode()) {
          spinner.stop();
          console.log(formatSpaceList(result.spaces, result.users));
        } else {
          output(result);
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Search failed");
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

  // Get space buyers
  space
    .command("buyers")
    .description("Get buyers of a ticketed space")
    .argument("<id>", "Space ID")
    .option("-l, --limit <n>", "Number of results", "100")
    .action(async (id: string, options) => {
      const spinner = createSpinner("Loading buyers...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const result = await getSpaceBuyers(id, {
          max_results: parseInt(options.limit, 10),
        });

        if (!isJsonMode()) {
          spinner.stop();
          if (result.data && result.data.length > 0) {
            const table = createTable({
              head: ["Username", "Name"],
            });
            for (const user of result.data) {
              table.push([`@${user.username}`, user.name]);
            }
            console.log(table.toString());
          } else {
            console.log("No buyers found");
          }
        } else {
          output(result);
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to load buyers");
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

  return space;
}

/**
 * Create spaces command (list user's spaces)
 */
export function createSpacesCommand(): Command {
  return new Command("spaces")
    .description("Get spaces by a user")
    .argument("<username>", "Username to get spaces for")
    .action(async (username: string) => {
      const spinner = createSpinner("Loading spaces...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const user = await getUserByUsername(username);
        const result = await getSpacesByCreators([user.id]);

        if (!isJsonMode()) {
          spinner.stop();
          console.log(`\nSpaces by @${user.username}\n`);
          console.log(formatSpaceList(result.spaces, result.users));
        } else {
          output(result);
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Failed to load spaces");
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
