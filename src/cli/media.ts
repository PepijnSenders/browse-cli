import { Command } from "commander";
import { access } from "fs/promises";
import {
  uploadMedia,
  getMediaStatus,
  waitForProcessing,
  setMediaAltText,
} from "../api/media.js";
import {
  output,
  isJsonMode,
  printError,
  createSpinner,
} from "../output/index.js";
import { XCLIError, ErrorCode } from "../types/errors.js";

/**
 * Create media command with subcommands
 */
export function createMediaCommand(): Command {
  const media = new Command("media").description("Media upload commands");

  // Upload media
  media
    .command("upload")
    .description("Upload media file")
    .argument("<file>", "File to upload")
    .option("-a, --alt <text>", "Alt text for accessibility")
    .option("-w, --wait", "Wait for processing to complete", false)
    .action(async (file: string, options) => {
      const spinner = createSpinner("Uploading media...");

      try {
        // Check file exists
        try {
          await access(file);
        } catch {
          throw new XCLIError(`File not found: ${file}`, ErrorCode.VALIDATION);
        }

        if (!isJsonMode()) {
          spinner.start();
        }

        const result = await uploadMedia(file, (percent) => {
          if (!isJsonMode()) {
            spinner.text = `Uploading... ${percent}%`;
          }
        });

        // Set alt text if provided
        if (options.alt) {
          if (!isJsonMode()) {
            spinner.text = "Setting alt text...";
          }
          await setMediaAltText(result.media_id_string, options.alt);
        }

        // Wait for processing if requested or if there's processing info
        if (options.wait && result.processing_info) {
          if (!isJsonMode()) {
            spinner.text = "Processing...";
          }
          const finalResult = await waitForProcessing(
            result.media_id_string,
            (state, percent) => {
              if (!isJsonMode()) {
                const pct = percent !== undefined ? ` (${percent}%)` : "";
                spinner.text = `Processing: ${state}${pct}`;
              }
            }
          );

          if (!isJsonMode()) {
            spinner.succeed("Media uploaded and processed");
            console.log(`\nMedia ID: ${finalResult.media_id_string}`);
            console.log(`\nUse in a post:`);
            console.log(`  x post create "Your text" --media ${finalResult.media_id_string}`);
          } else {
            output(finalResult);
          }
        } else {
          if (!isJsonMode()) {
            spinner.succeed("Media uploaded");
            console.log(`\nMedia ID: ${result.media_id_string}`);
            if (result.processing_info) {
              console.log(`\nProcessing status: ${result.processing_info.state}`);
              console.log(`Check status with: x media status ${result.media_id_string}`);
            } else {
              console.log(`\nUse in a post:`);
              console.log(`  x post create "Your text" --media ${result.media_id_string}`);
            }
          } else {
            output(result);
          }
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Upload failed");
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

  // Check media status
  media
    .command("status")
    .description("Check media processing status")
    .argument("<id>", "Media ID")
    .action(async (id: string) => {
      const spinner = createSpinner("Checking status...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const result = await getMediaStatus(id);

        if (!isJsonMode()) {
          spinner.stop();
          console.log(`Media ID: ${result.media_id_string}`);
          if (result.processing_info) {
            console.log(`State: ${result.processing_info.state}`);
            if (result.processing_info.progress_percent !== undefined) {
              console.log(`Progress: ${result.processing_info.progress_percent}%`);
            }
            if (result.processing_info.error) {
              console.log(`Error: ${result.processing_info.error.message}`);
            }
            if (result.processing_info.state === "succeeded") {
              console.log(`\nReady to use in a post:`);
              console.log(`  x post create "Your text" --media ${result.media_id_string}`);
            }
          } else {
            console.log("State: ready");
            console.log(`\nUse in a post:`);
            console.log(`  x post create "Your text" --media ${result.media_id_string}`);
          }
        } else {
          output(result);
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Status check failed");
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

  // Wait for processing
  media
    .command("wait")
    .description("Wait for media processing to complete")
    .argument("<id>", "Media ID")
    .option("-t, --timeout <seconds>", "Timeout in seconds", "120")
    .action(async (id: string, options) => {
      const spinner = createSpinner("Waiting for processing...");

      try {
        if (!isJsonMode()) {
          spinner.start();
        }

        const timeoutMs = parseInt(options.timeout, 10) * 1000;
        const result = await waitForProcessing(
          id,
          (state, percent) => {
            if (!isJsonMode()) {
              const pct = percent !== undefined ? ` (${percent}%)` : "";
              spinner.text = `Processing: ${state}${pct}`;
            }
          },
          timeoutMs
        );

        if (!isJsonMode()) {
          spinner.succeed("Processing complete");
          console.log(`\nMedia ID: ${result.media_id_string}`);
          console.log(`\nUse in a post:`);
          console.log(`  x post create "Your text" --media ${result.media_id_string}`);
        } else {
          output(result);
        }
      } catch (error) {
        if (!isJsonMode()) {
          spinner.fail("Processing failed or timed out");
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

  return media;
}
