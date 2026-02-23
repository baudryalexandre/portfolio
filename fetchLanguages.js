import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();  // charge les variables depuis .env

const GITHUB_USER = 'baudryalexandre';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;  // ici ton token, mais côté local seulement

const repos = [
  "DigiSphere",
  "CavalierDEuler",
  "test_kaggle-titanic",
  "Groupie_tracker",
  "DBZ_Brick_Breaker",
  "smart-road",
  "Spotlight_Studio"
];

async function fetchLanguages() {
  const results = [];

  for (const repo of repos) {
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo}/languages`, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json'
        }
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      results.push({ repo, languages: Object.keys(data) });
    } catch (err) {
      console.error(`Error fetching ${repo}:`, err.message);
      results.push({ repo, languages: [] });
    }
  }

  fs.writeFileSync('languages.json', JSON.stringify(results, null, 2));
  console.log('languages.json généré !');
}

fetchLanguages();