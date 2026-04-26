import { z } from "zod";
import { reddit } from "../client.js";

export const SubmitCommentSchema = z.object({
  parentId: z.string().describe("Fullname of parent to reply to — post (t3_xxx) or comment (t1_xxx)"),
  text: z.string().describe("Comment body in markdown"),
});

export async function submitComment(args: z.infer<typeof SubmitCommentSchema>) {
  const res = await reddit<{ json: { errors: string[][]; data?: { things: Array<{ data: unknown }> } } }>(
    "/api/comment", "POST", {
      parent: args.parentId,
      text: args.text,
      api_type: "json",
    },
  );
  if (res.json.errors?.length) {
    throw new Error(`Reddit comment error: ${res.json.errors.map((e) => e.join(": ")).join("; ")}`);
  }
  return res.json.data?.things?.[0]?.data;
}

export const GetPostCommentsSchema = z.object({
  subreddit: z.string().describe("Subreddit name without r/ prefix"),
  postId: z.string().describe("Reddit post ID (xxxxx or t3_xxxxx)"),
  limit: z.number().int().min(1).max(200).default(50).optional(),
  sort: z.enum(["best", "top", "new", "controversial", "old"]).default("best").optional(),
});

export async function getPostComments(args: z.infer<typeof GetPostCommentsSchema>) {
  const id = args.postId.replace(/^t3_/, "");
  const params = new URLSearchParams({
    limit: String(args.limit ?? 50),
    sort: args.sort ?? "best",
  });
  return reddit(`/r/${args.subreddit}/comments/${id}?${params}`);
}

export const GetMyCommentsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(25).optional(),
});

export async function getMyComments(args: z.infer<typeof GetMyCommentsSchema>) {
  const username = process.env.REDDIT_USERNAME;
  if (!username) throw new Error("REDDIT_USERNAME is not set");
  return reddit(`/user/${username}/comments?limit=${args.limit ?? 25}&sort=new`);
}
