/**
 * Lucca Trombinoscope Cheating CLI (Deno)
 *
 * Usage:
 *   BASE_URL=... AUTH_TOKEN=... deno run --allow-net --allow-read --allow-env main.ts
 *
 * Options:
 *   DEBUG=true  Affiche les logs detailles
 *
 * Le token se trouve dans les cookies du navigateur (authToken=...)
 * Avant de lancer ce script, recuperez les SHA1 des images des employes avec le script build-sha1-browser.js
 * et copiez le resultat dans le fichier sha1-map.json
 */

import { loadSha1Map } from "./lib/sha1-map.ts";
import {
  createGame,
  getNextQuestion,
  submitGuess,
  getImageSha1,
  type ApiConfig,
} from "./lib/api.ts";
import { findCorrectSuggestion } from "./lib/suggestions.ts";

const BASE_URL = Deno.env.get("BASE_URL");
const AUTH_TOKEN = Deno.env.get("AUTH_TOKEN");
const DEBUG = Deno.env.get("DEBUG") === "true";
const MAX_QUESTIONS = 10;

function log(...msg: unknown[]): void {
  if (DEBUG) console.log(...msg);
}

async function main(): Promise<void> {
  if (!AUTH_TOKEN || !BASE_URL) {
    console.log(
      "Usage: BASE_URL=... AUTH_TOKEN=... deno run --allow-net --allow-read --allow-env main.ts"
    );
    console.log("");
    console.log("Le token se trouve dans les cookies du navigateur.");
    console.log("Ouvre DevTools > Application > Cookies > authToken");
    Deno.exit(1);
  }

  const config: ApiConfig = {
    baseUrl: BASE_URL,
    authToken: AUTH_TOKEN,
  };

  log("Lucca Trombinoscope Cheat");
  log("============================\n");

  const sha1Map = loadSha1Map();
  log(`${Object.keys(sha1Map).length} SHA1 charges\n`);

  log("Creation d'une nouvelle partie...");
  const game = await createGame(config);
  const gameId = game.id;
  log(`   Game ID: ${gameId}`);
  log(`   Questions: ${game.nbQuestions}\n`);

  let totalScore = 0;
  let correct = 0;
  let incorrect = 0;

  for (let i = 0; i < MAX_QUESTIONS; i++) {
    const question = await getNextQuestion(config, gameId);
    if (!question) break;

    log(`Question ${i + 1}/${MAX_QUESTIONS} (ID: ${question.id})`);

    const hash = await getImageSha1(config, question.imageUrl);
    const targetName = sha1Map[hash];

    let suggestion = null;

    if (!targetName) {
      log(`   SHA1 inconnu: ${hash.substring(0, 12)}...`);
      suggestion =
        question.suggestions[
          Math.floor(Math.random() * question.suggestions.length)
        ];
    } else {
      suggestion = findCorrectSuggestion(question.suggestions, targetName);

      if (!suggestion) {
        log(`   "${targetName}" non trouve dans les suggestions`);
        log(
          `      Suggestions: ${question.suggestions.map((s) => s.value).join(", ")}`
        );
        suggestion = question.suggestions[0];
      }
    }

    const result = await submitGuess(config, gameId, question.id, suggestion.id);

    log(result);

    if (result.correctSuggestionId === result.suggestionId) {
      correct++;
      log(`   ${suggestion.value} (+${result.score} pts)`);
    } else {
      incorrect++;
      const correctName =
        question.suggestions.find((s) => s.id === result.correctSuggestionId)
          ?.value || "?";
      log(`   ${suggestion.value} (etait: ${correctName})`);
    }
    totalScore += result.score;
  }

  console.log("\n============================");
  console.log(`Score final: ${totalScore} pts`);
  console.log(`   Correct: ${correct}/${MAX_QUESTIONS}`);
  console.log(`   Incorrect: ${incorrect}/${MAX_QUESTIONS}`);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("Erreur:", err.message);
    Deno.exit(1);
  });
}
