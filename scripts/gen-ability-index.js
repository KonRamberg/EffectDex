import fs from "node:fs/promises";

const BASE = "https://pokeapi.co/api/v2";
const CONCURRENCY = 12;

// Put any abilities you want here (start small, expand later)
const ABILITIES_TO_INDEX = [
    "levitate",
    "flash-fire",
    "water-absorb",
    "volt-absorb",
    "sap-sipper",
    "storm-drain",
    "lightning-rod",
    "motor-drive",
    "thick-fat",
    "filter",
    "solid-rock",
    "prism-armor",
    "magic-guard",
    "heatproof",
    "water-bubble",
    "dry-skin",
    "fluffy",
    "fur-coat",
    "ice-scales",
    "multiscale",
    "shadow-shield",
    "delta-stream",
    "desolate-land",
    "primordial-sea",
    "wonder-guard",
    "bulletproof",
    "punk-rock",
    "sturdy",
    "ice-face",
    "drought",
    "drizzle",
    "steam-engine",
    "water-compaction",
    "thermal-exchange",
    "justified",
    "rattled",
    "weak-armor",
    "earth-eater",
    "gooey",
    "tangling-hair",
    "effect-spore",
    "static",
    "poison-point",
    "flame-body",
    "rough-skin",
    "iron-barbs",
    "aftermath",
    "mummy",
    "disguise",
    "overcoat",
    "armor-tail",
    "soundproof",
    "dazzling",
    "queenly-majesty",
    "unaware"
];

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function getEnglishEffect(abilityData) {
  // Prefer "effect_entries" English short/effect text
  const en = abilityData.effect_entries?.find((e) => e.language?.name === "en");
  if (en?.short_effect) return en.short_effect;
  if (en?.effect) return en.effect;

  // fallback
  const en2 = abilityData.flavor_text_entries?.find((e) => e.language?.name === "en");
  return en2?.flavor_text ?? "";
}

async function main() {
  const out = {
    abilities: {}, // abilityName -> { name, effect }
    pokemon: {},   // pokemonId -> [{ name: abilityName, status }]
  };

  for (const abilityName of ABILITIES_TO_INDEX) {
    // 1) ability metadata + list of pokemon that can have it
    const abilityData = await fetchJson(`${BASE}/ability/${abilityName}`);

    out.abilities[abilityName] = {
      name: abilityData.names?.find((n) => n.language?.name === "en")?.name ?? abilityName,
      effect: getEnglishEffect(abilityData),
    };

    const ids = abilityData.pokemon
      .map((p) => p.pokemon.url)
      .map((u) => Number(u.split("/").filter(Boolean).pop()))
      .filter((n) => Number.isFinite(n));

    // 2) For each pokemon id, fetch /pokemon/{id} and decide guaranteed vs possible
    for (const group of chunk(ids, CONCURRENCY)) {
      const rows = await Promise.all(
        group.map(async (id) => {
          const data = await fetchJson(`${BASE}/pokemon/${id}`);
          const abilityList = data.abilities.map((a) => a.ability.name);
          if (!abilityList.includes(abilityName)) return null;

          const status = abilityList.length === 1 ? "guaranteed" : "possible";
          return { id, status };
        })
      );

      for (const r of rows) {
        if (!r) continue;
        const key = String(r.id);
        if (!out.pokemon[key]) out.pokemon[key] = [];
        // prevent duplicates
        if (!out.pokemon[key].some((x) => x.name === abilityName)) {
          out.pokemon[key].push({ name: abilityName, status: r.status });
        }
      }
    }
  }

  await fs.mkdir("src/data", { recursive: true });
  await fs.writeFile("src/data/ability_index.json", JSON.stringify(out, null, 2));
  console.log(
    `Wrote ability_index.json with ${Object.keys(out.abilities).length} abilities, ` +
    `${Object.keys(out.pokemon).length} pokemon entries`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
