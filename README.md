# EffectDex

**EffectDex** is a fast, lightweight Pokémon lookup tool focused on **typing, weaknesses, forms, and relevant abilities**.

It is designed for players between **casual and competitive** who want quick, accurate information without damage calculators or full battle simulation.

---

## ✨ Features

- 🔍 **Instant Pokémon search**
  - Prefix-based filtering for speed
- 🧬 **Accurate typing & effectiveness**
  - 4× / 2× weaknesses
  - Resistances & immunities
- 🔄 **Form switching**
  - Megas
  - Regional forms (Alola, Galar, Hisui, Paldea)
  - Other typing-changing forms (Rotom, Giratina, Ogerpon, etc.)
- 🧠 **Ability awareness**
  - Displays abilities that affect damage, immunities, or on-hit effects
  - Clearly distinguishes **guaranteed** vs **possible** abilities
- ⚠️ **Move-decision context**
  - Highlights abilities that trigger on contact, physical/special hits, or specific move types
- 🖼️ **Offline sprites**
  - Pokémon sprites are downloaded and served locally for speed and reliability
- 📱 **Responsive layout**
  - Sticky sidebar with independent scrolling for long information panels

---

## 🧭 Design Philosophy

EffectDex is **not** a battle simulator.

Instead, it aims to:
- Surface **hidden mechanics** that often surprise players
- Help users make **better move choices** when multiple options are viable
- Stay fast, readable, and low-noise

It intentionally avoids:
- EV / IV math
- Damage rolls
- Item guessing
- Turn-by-turn simulation

Just **useful information, quickly**.

---

## 🛠️ Tech Stack

- React + Vite
- Plain CSS (no UI framework)
- Static JSON data
- Pokémon sprites sourced from PokéAPI and served locally

---

## 🚀 Getting Started

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 🖼️ Download Pokémon Sprites (one-time)

Sprites are served locally for performance and to avoid repeated external requests.

```bash
npm run sprites:download
```

Sprites are downloaded into:

```
public/sprites/pokemon/
```

---

## 📄 Data Sources & Credits

- Pokémon data and references are derived from **PokéAPI**
- Pokémon sprites are downloaded from the official PokéAPI sprite repository and served locally

---

## ⚠️ Disclaimer

**Pokémon © Nintendo / Creatures Inc. / GAME FREAK inc.**  
This is an **unofficial, fan-made tool** created for informational purposes only.

This project is not affiliated with Nintendo, GAME FREAK, or Creatures Inc.

---

