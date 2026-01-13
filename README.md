# Lucca Trombi

A CLI tool to automatically play the Lucca Trombinoscope game by matching employee photos with their names using pre-computed SHA1 hashes.

## How It Works

1. Pre-compute SHA1 hashes of all employee photos using the browser script
2. During the game, the CLI fetches each question's image, computes its SHA1, and looks up the corresponding name
3. Submits the correct answer automatically

## Prerequisites

- [Deno](https://deno.land/) runtime installed
- Access to a Lucca instance with the Trombinoscope game
- Your authentication token from the browser

## Setup

### Step 1: Build the SHA1 Map

1. Open your Lucca Trombinoscope page in the browser
2. Open DevTools (F12) → Console
3. Copy and paste the contents of `build-sha1-browser.js`
4. Run the script and wait for it to complete
5. Copy the resulting JSON object
6. Save it to `sha1-map.json` in the project root

```json
{
  "a1b2c3d4e5...": "John Doe",
  "f6g7h8i9j0...": "Jane Smith"
}
```

### Step 2: Get Your Auth Token

1. Open DevTools → Application → Cookies
2. Find the `authToken` cookie
3. Copy its value
4. Save it to `.env` file

## Usage

```bash
deno task start
```

### Environment Variables (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `BASE_URL` | Yes | Your Lucca instance URL (e.g., `https://company.ilucca.net`) |
| `AUTH_TOKEN` | Yes | Authentication token from browser cookies |
| `DEBUG` | No | Set to `true` for detailed logs |

## Permissions

The script requires the following Deno permissions:

- `--allow-net` - To make HTTP requests to the Lucca API
- `--allow-read` - To read the `sha1-map.json` file
- `--allow-env` - To read environment variables
