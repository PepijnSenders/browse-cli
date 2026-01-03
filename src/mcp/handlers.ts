/**
 * MCP Tool Handlers
 * Maps tool calls to x-cli API functions
 */

import { getMe, getUserByUsername } from "../api/users.js";
import {
  getTweet,
  createTweet,
  deleteTweet,
  getHomeTimeline,
  getUserTimeline,
  getMentions,
  searchTweets,
} from "../api/posts.js";
import {
  likeTweet,
  unlikeTweet,
  retweet,
  unretweet,
  bookmarkTweet,
  removeBookmark,
  getBookmarks,
} from "../api/engagement.js";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../api/relationships.js";
import {
  listConversations,
  sendMessageToUser,
} from "../api/dm.js";

type ToolArgs = Record<string, unknown>;

/**
 * Handle a tool call and return the result
 */
export async function handleToolCall(
  name: string,
  args: ToolArgs
): Promise<unknown> {
  switch (name) {
    // Authentication
    case "x_auth_status":
    case "x_me":
      return await getMe();

    // Posts
    case "x_post_create": {
      const text = args.text as string;
      const reply_to = args.reply_to as string | undefined;
      const quote = args.quote as string | undefined;
      return await createTweet({
        text,
        reply: reply_to ? { in_reply_to_tweet_id: reply_to } : undefined,
        quote_tweet_id: quote,
      });
    }
    case "x_post_get":
      return await getTweet(args.id as string);
    case "x_post_delete":
      return { deleted: await deleteTweet(args.id as string) };

    // Timelines
    case "x_timeline_home": {
      const me = await getMe();
      return await getHomeTimeline(me.id, {
        max_results: (args.limit as number) || 20,
      });
    }
    case "x_timeline_user": {
      const user = await getUserByUsername(args.username as string);
      return await getUserTimeline(user.id, {
        max_results: (args.limit as number) || 20,
      });
    }
    case "x_timeline_mentions": {
      const me = await getMe();
      return await getMentions(me.id, {
        max_results: (args.limit as number) || 20,
      });
    }

    // Search
    case "x_search":
      return await searchTweets(args.query as string, {
        max_results: (args.limit as number) || 20,
      });

    // Users
    case "x_user_get":
      return await getUserByUsername(args.username as string);

    // Engagement
    case "x_like": {
      const me = await getMe();
      return { liked: await likeTweet(me.id, args.id as string) };
    }
    case "x_unlike": {
      const me = await getMe();
      return { unliked: await unlikeTweet(me.id, args.id as string) };
    }
    case "x_repost": {
      const me = await getMe();
      return { reposted: await retweet(me.id, args.id as string) };
    }
    case "x_unrepost": {
      const me = await getMe();
      return { unreposted: await unretweet(me.id, args.id as string) };
    }

    // Following
    case "x_follow": {
      const me = await getMe();
      const targetUser = await getUserByUsername(args.username as string);
      const result = await followUser(me.id, targetUser.id);
      return { following: result.following, pending: result.pending_follow };
    }
    case "x_unfollow": {
      const me = await getMe();
      const targetUser = await getUserByUsername(args.username as string);
      return { unfollowed: await unfollowUser(me.id, targetUser.id) };
    }
    case "x_followers": {
      let userId: string;
      if (args.username) {
        const user = await getUserByUsername(args.username as string);
        userId = user.id;
      } else {
        const me = await getMe();
        userId = me.id;
      }
      return await getFollowers(userId, {
        max_results: (args.limit as number) || 100,
      });
    }
    case "x_following": {
      let userId: string;
      if (args.username) {
        const user = await getUserByUsername(args.username as string);
        userId = user.id;
      } else {
        const me = await getMe();
        userId = me.id;
      }
      return await getFollowing(userId, {
        max_results: (args.limit as number) || 100,
      });
    }

    // Direct Messages
    case "x_dm_list":
      return await listConversations({
        max_results: (args.limit as number) || 20,
      });
    case "x_dm_send": {
      const user = await getUserByUsername(args.username as string);
      return await sendMessageToUser(user.id, { text: args.text as string });
    }

    // Bookmarks
    case "x_bookmark_add": {
      const me = await getMe();
      return { bookmarked: await bookmarkTweet(me.id, args.id as string) };
    }
    case "x_bookmark_list": {
      const me = await getMe();
      return await getBookmarks(me.id, {
        max_results: (args.limit as number) || 20,
      });
    }
    case "x_bookmark_remove": {
      const me = await getMe();
      return { removed: await removeBookmark(me.id, args.id as string) };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
