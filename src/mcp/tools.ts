/**
 * MCP Tool Definitions for x-cli
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const tools: Tool[] = [
  // Authentication
  {
    name: "x_auth_status",
    description: "Check authentication status and get current user info",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },

  // Posts
  {
    name: "x_post_create",
    description: "Create a new post on X (Twitter)",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The text content of the post (max 280 characters)",
        },
        reply_to: {
          type: "string",
          description: "Post ID to reply to (optional)",
        },
        quote: {
          type: "string",
          description: "Post ID to quote (optional)",
        },
      },
      required: ["text"],
    },
  },
  {
    name: "x_post_get",
    description: "Get a post by its ID",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The post ID",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "x_post_delete",
    description: "Delete a post by its ID",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The post ID to delete",
        },
      },
      required: ["id"],
    },
  },

  // Timelines
  {
    name: "x_timeline_home",
    description: "Get the authenticated user's home timeline",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of posts to return (default 20, max 100)",
        },
      },
      required: [],
    },
  },
  {
    name: "x_timeline_user",
    description: "Get a user's timeline/posts",
    inputSchema: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "Username (without @)",
        },
        limit: {
          type: "number",
          description: "Number of posts to return (default 20, max 100)",
        },
      },
      required: ["username"],
    },
  },
  {
    name: "x_timeline_mentions",
    description: "Get mentions of the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of posts to return (default 20, max 100)",
        },
      },
      required: [],
    },
  },

  // Search
  {
    name: "x_search",
    description: "Search for posts on X. Supports operators like from:user, #hashtag, etc.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (supports from:, to:, #hashtag, etc.)",
        },
        limit: {
          type: "number",
          description: "Number of results (default 20, max 100)",
        },
      },
      required: ["query"],
    },
  },

  // Users
  {
    name: "x_user_get",
    description: "Get user profile information",
    inputSchema: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "Username (without @)",
        },
      },
      required: ["username"],
    },
  },
  {
    name: "x_me",
    description: "Get the authenticated user's profile",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },

  // Engagement
  {
    name: "x_like",
    description: "Like a post",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Post ID to like",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "x_unlike",
    description: "Unlike a post",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Post ID to unlike",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "x_repost",
    description: "Repost (retweet) a post",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Post ID to repost",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "x_unrepost",
    description: "Remove a repost",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Post ID to unrepost",
        },
      },
      required: ["id"],
    },
  },

  // Following
  {
    name: "x_follow",
    description: "Follow a user",
    inputSchema: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "Username to follow",
        },
      },
      required: ["username"],
    },
  },
  {
    name: "x_unfollow",
    description: "Unfollow a user",
    inputSchema: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "Username to unfollow",
        },
      },
      required: ["username"],
    },
  },
  {
    name: "x_followers",
    description: "Get a user's followers",
    inputSchema: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "Username (defaults to authenticated user)",
        },
        limit: {
          type: "number",
          description: "Number of followers to return",
        },
      },
      required: [],
    },
  },
  {
    name: "x_following",
    description: "Get users that a user is following",
    inputSchema: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "Username (defaults to authenticated user)",
        },
        limit: {
          type: "number",
          description: "Number of users to return",
        },
      },
      required: [],
    },
  },

  // Direct Messages
  {
    name: "x_dm_list",
    description: "List DM conversations",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of conversations to return",
        },
      },
      required: [],
    },
  },
  {
    name: "x_dm_send",
    description: "Send a direct message to a user",
    inputSchema: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "Username to send message to",
        },
        text: {
          type: "string",
          description: "Message text",
        },
      },
      required: ["username", "text"],
    },
  },

  // Bookmarks
  {
    name: "x_bookmark_add",
    description: "Bookmark a post",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Post ID to bookmark",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "x_bookmark_list",
    description: "List bookmarked posts",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of bookmarks to return",
        },
      },
      required: [],
    },
  },
  {
    name: "x_bookmark_remove",
    description: "Remove a bookmark",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Post ID to unbookmark",
        },
      },
      required: ["id"],
    },
  },
];
