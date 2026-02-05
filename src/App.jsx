import { useMemo, useState, useEffect } from "react";
import "./App.css";

import POKEMON_ALL from "./data/pokemon.json";
import { defensiveBuckets } from "./typeChart";
import ABILITY_INDEX from "./data/ability_index.json";

const TYPE_COLORS = {
  Normal: "#A8A77A",
  Fire: "#EE8130",
  Water: "#6390F0",
  Electric: "#F7D02C",
  Grass: "#7AC74C",
  Ice: "#96D9D6",
  Fighting: "#C22E28",
  Poison: "#A33EA1",
  Ground: "#E2BF65",
  Flying: "#A98FF3",
  Psychic: "#F95587",
  Bug: "#A6B91A",
  Rock: "#B6A136",
  Ghost: "#735797",
  Dragon: "#6F35FC",
  Dark: "#705746",
  Steel: "#B7B7CE",
  Fairy: "#D685AD",
};


const normalize = (s) =>
  s
    .normalize("NFD")                 // split accents
    .replace(/[\u0300-\u036f]/g, "")  // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const spriteUrl = (id) => `/sprites/pokemon/${id}.png`;

const prettyAbility = (slug) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function TypePill({ type }) {
  const c = TYPE_COLORS[type] ?? "#2b3242";

  return (
    <span
      className="pill"
      style={{
        background: `${c}22`,      // tinted background
        borderColor: `${c}AA`,     // colored border
      }}
    >
      {type}
    </span>
  );
}

function AbilityPill({ ability, status, description }) {
  return (
    <span
      className={`abilityPill ${
        status === "possible" ? "abilityPossible" : "abilityGuaranteed"
      }`}
      title={description}
    >
      {ability}
    </span>
  );
}


function Section({ title, items }) {
  return (
    <div className="section">
      <div className="sectionTitle">{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {items.length ? items.map((t) => <TypePill key={t} type={t} />) : <span className="muted">—</span>}
      </div>
    </div>
  );
}

function BaseStats({ baseStats }) {
  if (!baseStats) return null;

  return (
    <div style={{ marginTop: 14 }}>
      <div className="sectionTitle">Base Stats</div>

      <div className="statsGrid2">
        <div className="statRow">
          <span className="statLabel">HP</span>
          <span className="statValue">{baseStats.hp}</span>
        </div>

        <div className="statRow">
          <span className="statLabel">Atk</span>
          <span className="statValue">{baseStats.attack}</span>
        </div>

        <div className="statRow">
          <span className="statLabel">Def</span>
          <span className="statValue">{baseStats.defense}</span>
        </div>

        <div className="statRow">
          <span className="statLabel">Spd</span>
          <span className="statValue">{baseStats.speed}</span>
        </div>

        <div className="statRow">
          <span className="statLabel">SpAtk</span>
          <span className="statValue">{baseStats.spattack}</span>
        </div>

        <div className="statRow">
          <span className="statLabel">SpDef</span>
          <span className="statValue">{baseStats.spdefense}</span>
        </div>
      </div>

      {typeof baseStats.total === "number" && (
        <div className="statTotal">Total: {baseStats.total}</div>
      )}
    </div>
  );
}

export default function App() {
  // If your dataset includes forms/meg as separate IDs, those sprites may not exist at the base sprite URL.
  // For the grid UX, it’s best to show base species only.
  const basePokemon = useMemo(
    () => POKEMON_ALL.filter((p) => p.baseId == null && p.id >= 1 && p.id <= 1025),
    []
  );

  const [query, setQuery] = useState("");
  const [lockedId, setLockedId] = useState(null);

  // Filter list (prefix match)
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return basePokemon;
    return basePokemon.filter((p) => normalize(p.name).startsWith(q));
  }, [query, basePokemon]);

  // selection model:
  // - hoverId is transient preview
  // - lockedId is persistent selection
  const [hoverId, setHoverId] = useState(null);

  // Auto-select top result while typing if nothing locked
  useEffect(() => {
  // Any new search cancels the lock
  if (query.trim()) {
    setLockedId(null);
  }

  if (filtered.length === 0) return;
  setHoverId(filtered[0].id);
}, [query, filtered]);

  const selectedId = lockedId ?? hoverId ?? (filtered[0]?.id ?? null);
  const selected = useMemo(
  () => (selectedId == null ? null : POKEMON_ALL.find((p) => p.id === selectedId) || null),
  [selectedId]
);
const baseId = selected?.baseId ?? selected?.id ?? null;

const basePokemonForForms = useMemo(() => {
  if (!baseId) return null;
  return POKEMON_ALL.find(p => p.id === baseId) || null;
}, [baseId]);

const formsToShow = useMemo(() => {
  if (!basePokemonForForms) return [];
  return POKEMON_ALL.filter((p) => p.baseId === basePokemonForForms.id);
}, [basePokemonForForms]);

const abilityRows = useMemo(() => {
  if (!selected) return [];
  const list = ABILITY_INDEX.pokemon?.[String(selected.id)] ?? [];
  return list.map((a) => ({
    slug: a.name,
    label: ABILITY_INDEX.abilities?.[a.name]?.name ?? prettyAbility(a.name),
    effect: ABILITY_INDEX.abilities?.[a.name]?.effect ?? "",
    status: a.status,
  }));
}, [selected]);

const abilityGuaranteed = useMemo(
  () => abilityRows.filter((a) => a.status === "guaranteed"),
  [abilityRows]
);

const abilityPossible = useMemo(
  () => abilityRows.filter((a) => a.status === "possible"),
  [abilityRows]
);

const buckets = useMemo(() => {
    if (!selected) return null;
    return defensiveBuckets(selected.types);
  }, [selected]);

 
  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <div className="appTitle">
            <img
              src="/logo.png"
              alt="EffectDex"
              className="appLogo"
            />
             <img
                src="/favicon.png"
                alt=""
                className="appIcon"
              />
            <div className="appTagline">
              A fast Pokémon effectiveness tool
            </div>
          </div>
        </div>

        <div className="layout">
          {/* Main grid */}
          <div className="panel">
            <div className="gridTop stickyLeftTop">
  <input
    className="search"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Search Pokémon…"
  />

</div>

            <div className="gridWrap">
              <div className="grid">
                {filtered.map((p) => {
                  const isSelected = p.id === selectedId;
                  return (
                    <div
                      key={p.id}
                      className={`card ${isSelected ? "cardSelected" : ""}`}
                      onMouseEnter={() => {
                        if (lockedId == null) setHoverId(p.id);
                      }}
                      onMouseLeave={() => {
                        // optional: keep last hover; feels good for preview
                      }}
                      onClick={() => {
                        setLockedId(p.id);
                        setHoverId(p.id);
                      }}
                      title={`${p.name} (${p.types.join(" / ")})`}
                    >
                      <img
                        className="sprite"
                        src={spriteUrl(p.id)}
                        alt={p.name}
                        loading="lazy"
                        onError={(e) => {
                          // simple fallback: hide broken images
                          e.currentTarget.style.visibility = "hidden";
                        }}
                      />
                      <div className="name">{p.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="panel sidebar stickyRight">
            {!selected ? (
              <div className="muted">No Pokémon selected.</div>
            ) : (
              <>
                <div className="sidebarTop">
                  <img className="sidebarSprite" src={spriteUrl(selected.id)} alt={selected.name} />
                  <div>
                      <div className="titleRow">
                        <div className="pokemonName">{selected.name}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                        {selected.types.map((t) => (
                          <TypePill key={t} type={t} />
                        ))}
                        </div>
                      </div>

                    <div className="lockRow">
                      {lockedId == null ? (
                        <span className="muted">Hover previews • Click to lock</span>
                      ) : (
                        <>
                          <span className="muted">Locked selection</span>
                          <button className="button" onClick={() => setLockedId(null)}>
                            Unlock
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
        {formsToShow.length > 0 && basePokemonForForms && (
        <div style={{ marginTop: 14 }}>
          <div className="sectionTitle">Forms</div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {/* Base button */}
            <button
              className="button"
              style={{
                borderColor:
                  selected.id === basePokemonForForms.id ? "#6f7ea8" : undefined
              }}
              onClick={() => {
                setHoverId(basePokemonForForms.id);
                setLockedId(basePokemonForForms.id);
              }}
            >
              Base
            </button>

            
            {formsToShow.map(f => (
              <button
                key={f.id}
                className="button"
                style={{
                  borderColor: selected.id === f.id ? "#6f7ea8" : undefined
                }}
                onClick={() => {
                  setHoverId(f.id);
                  setLockedId(f.id);
                }}
              >
                {f.form ?? f.name}
              </button>
            ))}
          </div>
        </div>
      )}
              {(abilityGuaranteed.length > 0 || abilityPossible.length > 0) && (
                <div style={{ marginTop: 14 }}>
                 {abilityGuaranteed.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <div className="sectionTitle" style={{ marginBottom: 6 }}>
                        Guaranteed ability
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {abilityGuaranteed.map((a) => (
                          <AbilityPill
                            key={a.slug}
                            ability={a.label}
                            status="guaranteed"
                            description={a.effect}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {abilityPossible.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div className="sectionTitle" style={{ marginBottom: 6 }}>
                        Possible ability
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {abilityPossible.map((a) => (
                          <AbilityPill
                            key={a.slug}
                            ability={a.label}
                            status="possible"
                            description={a.effect}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <BaseStats baseStats={selected.baseStats} />
                <div className="sidebarScroll">
                <div className="sectionGrid">
                  <Section title="Weak (4×)" items={buckets?.["4x"] ?? []} />
                  <Section title="Weak (2×)" items={buckets?.["2x"] ?? []} />
                  <Section title="Resist (½×)" items={buckets?.["0.5x"] ?? []} />
                  <Section title="Resist (¼×)" items={buckets?.["0.25x"] ?? []} />
                  <Section title="Immune (0×)" items={buckets?.["0x"] ?? []} />
                  <Section title="Neutral (1×)" items={buckets?.["1x"] ?? []} />
                </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <footer className="pageFooter">
        Pokémon © Nintendo / Creatures Inc. / GAME FREAK inc. Unofficial fan-made tool.
      </footer>
    </div>
  );
}
