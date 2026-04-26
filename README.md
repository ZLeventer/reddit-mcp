# reddit-mcp

MCP server for Reddit — 11 tools for submitting posts, replying to comments, searching subreddits, and reading posts via the Reddit API.

## Tools

### Posts (4)
| Tool | Description |
|------|-------------|
| `reddit_submit_post` | Submit a text or link post to any subreddit |
| `reddit_get_post` | Get a post by ID |
| `reddit_get_subreddit_posts` | Get hot/new/top/rising posts from a subreddit |
| `reddit_get_my_posts` | Get your own recent posts |

### Comments (3)
| Tool | Description |
|------|-------------|
| `reddit_submit_comment` | Reply to a post or comment |
| `reddit_get_post_comments` | Get comments on a post |
| `reddit_get_my_comments` | Get your own recent comments |

### Subreddits & Search (4)
| Tool | Description |
|------|-------------|
| `reddit_get_subreddit_info` | Get subreddit metadata (subscribers, description, etc.) |
| `reddit_get_subreddit_rules` | Get posting rules before submitting |
| `reddit_search_subreddits` | Find subreddits by keyword |
| `reddit_search_posts` | Search posts across Reddit or within a subreddit |

## Setup

### 1. Create a Reddit app

1. Go to https://www.reddit.com/prefs/apps
2. Click **Create another app**
3. Select **script** (for personal use)
4. Set redirect URI to `http://localhost:8080` (not used but required)
5. Copy the **client ID** (under the app name) and **client secret**

### 2. Configure Claude Desktop

```json
{
  "mcpServers": {
    "reddit": {
      "command": "npx",
      "args": ["-y", "reddit-mcp"],
      "env": {
        "REDDIT_CLIENT_ID": "your_client_id",
        "REDDIT_CLIENT_SECRET": "your_client_secret",
        "REDDIT_USERNAME": "your_reddit_username",
        "REDDIT_PASSWORD": "your_reddit_password"
      }
    }
  }
}
```

### 2a. Configure Claude Code (CLI)

```bash
claude mcp add reddit \
  -e REDDIT_CLIENT_ID=your_client_id \
  -e REDDIT_CLIENT_SECRET=your_client_secret \
  -e REDDIT_USERNAME=your_reddit_username \
  -e REDDIT_PASSWORD=your_reddit_password \
  -- npx -y reddit-mcp
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REDDIT_CLIENT_ID` | Yes | App client ID from reddit.com/prefs/apps |
| `REDDIT_CLIENT_SECRET` | Yes | App client secret |
| `REDDIT_USERNAME` | Yes | Your Reddit username |
| `REDDIT_PASSWORD` | Yes | Your Reddit password |
| `REDDIT_USER_AGENT` | No | Custom user agent string (defaults to `reddit-mcp/1.0.0 by <username>`) |

## License

MIT
