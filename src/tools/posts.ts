import { z } from "zod";
import { reddit } from "../client.js";

export const SubmitPostSchema = z.object({
  subreddit: z.string().describe("Subreddit name without r/ prefix, e.g. 'hubspot'"),
  title: z.string().max(300).describe("Post title (max 300 chars)"),
  kind: z.enum(["self", "link"]).default("self").describe("'self' for text post, 'link' for URL post"),
  text: z.string().optional().describe("Body text for self posts (markdown supported)"),
  url: z.string().url().optional().describe("URL for link posts"),
  nsfw: z.boolean().default(false).optional(),
  spoiler: z.boolean().default(false).optional(),
});

export async function submitPost(args: z.infer<typeof SubmitPostSchema>) {
  const body: Record<string, string> = {
    sr: args.subreddit,
    title: args.title,
    kind: args.kind,
    api_type: "json",
    resubmit: "true",
  };
  if (args.kind === "self" && args.text) body.text = args.text;
  if (args.kind === "link" && args.url) body.url = args.url;
  if (args.nsfw) body.nsfw = "true";
  if (args.spoiler) body.spoiler = "true";

  const res = await reddit<{ json: { errors: string[][]; data?: { url: string; id: string; name: string } } }>(
    "/api/submit", "POST", body,
  );

  if (res.json.errors?.length) {
    throw new Error(`Reddit submit error: ${res.json.errors.map((e) => e.join(": ")).join("; ")}`);
  }
  return res.json.data;
}

export const GetPostSchema = z.object({
  postId: z.string().describe("Reddit post ID (the t3_xxxxx part or just xxxxx)"),
});

export async function getPost(args: z.infer<typeof GetPostSchema>) {
  const id = args.postId.replace(/^t3_/, "");
  const res = await reddit<unknown[]>(`/by_id/t3_${id}`);
  return res;
}

export const GetSubredditPostsSchema = z.object({
  subreddit: z.string().describe("Subreddit name without r/ prefix"),
  sort: z.enum(["hot", "new", "top", "rising"]).default("hot").optional(),
  limit: z.number().int().min(1).max(100).default(25).optional(),
  time: z.enum(["hour", "day", "week", "month", "year", "all"]).default("day").optional()
    .describe("Time filter — only applies when sort=top"),
});

export async function getSubredditPosts(args: z.infer<typeof GetSubredditPostsSchema>) {
  const sort = args.sort ?? "hot";
  const params = new URLSearchParams({
    limit: String(args.limit ?? 25),
    ...(sort === "top" ? { t: args.time ?? "day" } : {}),
  });
  return reddit(`/r/${args.subreddit}/${sort}?${params}`);
}

export const GetMyPostsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(25).optional(),
});

export async function getMyPosts(args: z.infer<typeof GetMyPostsSchema>) {
  const username = process.env.REDDIT_USERNAME;
  if (!username) throw new Error("REDDIT_USERNAME is not set");
  return reddit(`/user/${username}/submitted?limit=${args.limit ?? 25}&sort=new`);
}
