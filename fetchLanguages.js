import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();  // charge les variables depuis .env

const GITHUB_USER = 'baudryalexandre';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;  // côté local uniquement

const repos = [
  "DigiSphere",
  "CavalierDEuler",
  "test_kaggle-titanic",
  "Groupie_tracker",
  "DBZ_Brick_Breaker",
  "smart-road",
  "Spotlight_Studio"
];

async function fetchRepoLanguages(repo) {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo}/languages`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json'
      }
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    return Object.keys(data);
  } catch (err) {
    console.error(`Error fetching languages for ${repo}:`, err.message);
    return [];
  }
}

async function fetchRepoTopics(repo) {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo}/topics`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.mercy-preview+json'
      }
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    return Array.isArray(data.names) ? data.names : [];
  } catch (err) {
    console.error(`Error fetching topics for ${repo}:`, err.message);
    return [];
  }
}

async function fetchLanguagesAndTopics() {
  const results = [];

  for (const repo of repos) {
    const languages = await fetchRepoLanguages(repo);
    const topics = await fetchRepoTopics(repo);

    // Si tu veux inclure tous les projets même sans topics, juste décommenter la ligne ci-dessous
    results.push({ repo, languages, ...(topics.length > 0 ? { topics } : {}) });
  }

  fs.writeFileSync('languages.json', JSON.stringify(results, null, 2));
  console.log('languages.json + topics générés !');
}

fetchLanguagesAndTopics();