#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ok, err } from "./client.js";

// Posts
import {
  SubmitPostSchema, submitPost,
  GetPostSchema, getPost,
  GetSubredditPostsSchema, getSubredditPosts,
  GetMyPostsSchema, getMyPosts,
} from "./tools/posts.js";

// Comments
import {
  SubmitCommentSchema, submitComment,
  GetPostCommentsSchema, getPostComments,
  GetMyCommentsSchema, getMyComments,
} from "./tools/comments.js";

// Subreddits & Search
import {
  GetSubredditInfoSchema, getSubredditInfo,
  GetSubredditRulesSchema, getSubredditRules,
  SearchSubredditsSchema, searchSubreddits,
  SearchPostsSchema, searchPosts,
} from "./tools/subreddits.js";

const server = new McpServer({ name: "reddit-mcp", version: "1.0.0" });

// ─── Posts ───────────────────────────────────────────────────────────────────

server.tool(
  "reddit_submit_post",
  "Submit a text or link post to a subreddit. Use kind='self' for text posts (markdown body), kind='link' for URL posts.",
  SubmitPostSchema.shape,
  async (args) => { try { return ok(await submitPost(args)); } catch (e) { return err(e); } },
);

server.tool(
  "reddit_get_post",
  "Get details of a Reddit post by ID.",
  GetPostSchema.shape,
  async (args) => { try { return ok(await getPost(args)); } catch (e) { return err(e); } },
);

server.tool(
  "reddit_get_subreddit_posts",
  "Get posts from a subreddit sorted by hot, new, top, or rising.",
  GetSubredditPostsSchema.shape,
  async (args) => { try { return ok(await getSubredditPosts(args)); } catch (e) { return err(e); } },
);

server.tool(
  "reddit_get_my_posts",
  "Get your own most recent posts across all subreddits.",
  GetMyPostsSchema.shape,
  async (args) => { try { return ok(await getMyPosts(args)); } catch (e) { return err(e); } },
);

// ─── Comments ────────────────────────────────────────────────────────────────

server.tool(
  "reddit_submit_comment",
  "Reply to a post or comment. parentId must be a Reddit fullname: t3_xxx for a post, t1_xxx for a comment.",
  SubmitCommentSchema.shape,
  async (args) => { try { return ok(await submitComment(args)); } catch (e) { return err(e); } },
);

server.tool(
  "reddit_get_post_comments",
  "Get comments on a post, sorted by best, top, new, controversial, or old.",
  GetPostCommentsSchema.shape,
  async (args) => { try { return ok(await getPostComments(args)); } catch (e) { return err(e); } },
);

server.tool(
  "reddit_get_my_comments",
  "Get your own most recent comments across all subreddits.",
  GetMyCommentsSchema.shape,
  async (args) => { try { return ok(await getMyComments(args)); } catch (e) { return err(e); } },
);

// ─── Subreddits & Search ─────────────────────────────────────────────────────

server.tool(
  "reddit_get_subreddit_info",
  "Get metadata for a subreddit: subscriber count, description, creation date, NSFW flag, etc.",
  GetSubredditInfoSchema.shape,
  async (args) => { try { return ok(await getSubredditInfo(args)); } catch (e) { return err(e); } },
);

server.tool(
  "reddit_get_subreddit_rules",
  "Get the posting rules for a subreddit. Check these before submitting to avoid removals.",
  GetSubredditRulesSchema.shape,
  async (args) => { try { return ok(await getSubredditRules(args)); } catch (e) { return err(e); } },
);

server.tool(
  "reddit_search_subreddits",
  "Search for subreddits by keyword. Use to find the right community before posting.",
  SearchSubredditsSchema.shape,
  async (args) => { try { return ok(await searchSubreddits(args)); } catch (e) { return err(e); } },
);

server.tool(
  "reddit_search_posts",
  "Search posts across Reddit or within a specific subreddit. Useful for finding existing discussions before posting.",
  SearchPostsSchema.shape,
  async (args) => { try { return ok(await searchPosts(args)); } catch (e) { return err(e); } },
);

// ─── Transport ────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
