import { z } from "zod";
import { reddit } from "../client.js";

export const GetSubredditInfoSchema = z.object({
  subreddit: z.string().describe("Subreddit name without r/ prefix"),
});

export async function getSubredditInfo(args: z.infer<typeof GetSubredditInfoSchema>) {
  return reddit(`/r/${args.subreddit}/about`);
}

export const GetSubredditRulesSchema = z.object({
  subreddit: z.string().describe("Subreddit name without r/ prefix"),
});

export async function getSubredditRules(args: z.infer<typeof GetSubredditRulesSchema>) {
  return reddit(`/r/${args.subreddit}/about/rules`);
}

export const SearchSubredditsSchema = z.object({
  query: z.string().describe("Search term to find subreddits"),
  limit: z.number().int().min(1).max(100).default(10).optional(),
});

export async function searchSubreddits(args: z.infer<typeof SearchSubredditsSchema>) {
  const params = new URLSearchParams({
    q: args.query,
    limit: String(args.limit ?? 10),
    type: "sr",
  });
  return reddit(`/search?${params}`);
}

export const SearchPostsSchema = z.object({
  query: z.string().describe("Search query"),
  subreddit: z.string().optional().describe("Restrict search to this subreddit (without r/)"),
  sort: z.enum(["relevance", "hot", "top", "new", "comments"]).default("relevance").optional(),
  time: z.enum(["hour", "day", "week", "month", "year", "all"]).default("all").optional(),
  limit: z.number().int().min(1).max(100).default(25).optional(),
});

export async function searchPosts(args: z.infer<typeof SearchPostsSchema>) {
  const params = new URLSearchParams({
    q: args.query,
    sort: args.sort ?? "relevance",
    t: args.time ?? "all",
    limit: String(args.limit ?? 25),
    type: "link",
  });
  const path = args.subreddit
    ? `/r/${args.subreddit}/search?${params}&restrict_sr=true`
    : `/search?${params}`;
  return reddit(path);
}
