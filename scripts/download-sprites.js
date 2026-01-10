import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const DATA_PATH = path.resolve("src/data/pokemon.json");
const OUT_DIR = path.resolve("public/sprites/pokemon");
const BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

// Ensure output dir exists
fs.mkdirSync(OUT_DIR, { recursive: true });

// Read and parse pokemon.json safely
const pokemon = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }

        const file = fs.createWriteStream(dest);
        res.pipe(file);

        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", reject);
  });
}

async function main() {
  const ids = [...new Set(pokemon.map((p) => p.id))]
    .filter((id) => Number.isInteger(id))
    .sort((a, b) => a - b);

  console.log(`Found ${ids.length} unique Pokémon IDs`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const id of ids) {
    const outPath = path.join(OUT_DIR, `${id}.png`);

    if (fs.existsSync(outPath)) {
      skipped++;
      continue;
    }

    const url = `${BASE_URL}/${id}.png`;

    try {
      await download(url, outPath);
      downloaded++;
      console.log(`✔ ${id}.png`);
    } catch (err) {
      failed++;
      console.warn(`✖ ${id}.png (${err.message})`);
    }
  }

  console.log("\nDone:");
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Skipped:    ${skipped}`);
  console.log(`Failed:     ${failed}`);
}

main();

