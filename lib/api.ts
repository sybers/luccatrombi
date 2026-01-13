import { sha1 } from "./crypto.ts";

export interface Game {
  id: string;
  nbQuestions: number;
}

export interface Suggestion {
  id: string;
  value: string;
}

export interface Question {
  id: string;
  imageUrl: string;
  suggestions: Suggestion[];
}

export interface GuessResult {
  correctSuggestionId: string;
  suggestionId: string;
  score: number;
}

export interface ApiConfig {
  baseUrl: string;
  authToken: string;
}

function getHeaders(config: ApiConfig): HeadersInit {
  return {
    accept: "application/json, text/plain, */*",
    "accept-language": "fr-FR,fr;q=0.9",
    "content-type": "application/json",
    cookie: `authToken=${config.authToken}`,
    origin: config.baseUrl,
    referer: `${config.baseUrl}/faces/game`,
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  };
}

export async function createGame(config: ApiConfig): Promise<Game> {
  const response = await fetch(`${config.baseUrl}/faces/api/games`, {
    method: "POST",
    headers: getHeaders(config),
    body: "{}",
  });

  if (!response.ok) {
    throw new Error(`Failed to create game: ${response.status}`);
  }

  return response.json();
}

export async function getNextQuestion(
  config: ApiConfig,
  gameId: string
): Promise<Question | null> {
  const response = await fetch(
    `${config.baseUrl}/faces/api/games/${gameId}/questions/next`,
    {
      method: "POST",
      headers: getHeaders(config),
      body: JSON.stringify({ establishments: [], departments: [] }),
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to get next question: ${response.status}`);
  }

  return response.json();
}

export async function submitGuess(
  config: ApiConfig,
  gameId: string,
  questionId: string,
  suggestionId: string
): Promise<GuessResult> {
  const response = await fetch(
    `${config.baseUrl}/faces/api/games/${gameId}/questions/${questionId}/guess`,
    {
      method: "POST",
      headers: getHeaders(config),
      body: JSON.stringify({
        questionId: questionId,
        suggestionId: suggestionId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to submit guess: ${response.status}`);
  }

  return response.json();
}

export async function getImageSha1(
  config: ApiConfig,
  imageUrl: string
): Promise<string> {
  const url = imageUrl.startsWith("/")
    ? `${config.baseUrl}${imageUrl}`
    : imageUrl;

  const response = await fetch(url, {
    headers: { cookie: `authToken=${config.authToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return sha1(new Uint8Array(arrayBuffer));
}
