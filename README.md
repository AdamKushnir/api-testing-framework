# API Testing Framework
Univerzální a přenositelný testovací framework pro REST API 
postavený na nástrojích Postman a Newman.

## Technologie
- Postman — tvorba a správa testů
- Newman — automatizované spouštění z příkazové řádky
- Newman-reporter-htmlextra — HTML reporty

## Struktura projektu
project/
├── collections/     # Postman kolekce (JSON export)
├── data/            # Testovací data pro iterace
├── environments/    # Postman prostředí
├── reports/         # Výstupy z Newman běhů
└── schemas/         # JSON Schema soubory
runTests.js          # Vstupní bod pro Newman

## Spuštění
npm install

## Jak přidat nové API
Onboarding manuál — jak rozšířit API testing framework

Část 1 — Přidání nového API

Krok 1 — Vytvoř nový folder v Postmanu
V kolekci API Testing Framework klikněte pravým tlačítkem na tests folder → Add Folder → pojmenujte ho např. Pokemon API.

Krok 2 — Nastavte folder Pre-request Script
Klikni na nový folder → záložka Scripts → Pre-request. Zkopíruj a uprav podle svého API:

// =====================================================
// 📁 FOLDER DEFAULTS — Pokemon API (příklad)
// =====================================================

pm.variables.set("expectedStatus",      "200");
pm.variables.set("maxResponseTime",     "1000");      // ms — uprav podle rychlosti API
pm.variables.set("expectedContentType", "application/json");
pm.variables.set("expectedRootType",    "object");    // "object" nebo "array"

pm.variables.set("schemaSingleKey", "pokemon.schema"); // klíč do schema_store
pm.variables.set("schemaListKey",   "pokemon.schema");

// Výchozí validační pravidla pro requesty v tomto folderu
pm.variables.set("requiredKeys",           JSON.stringify(["id", "name"]));
pm.variables.set("nonEmptyStringFields",   JSON.stringify(["name"]));
pm.variables.set("positiveNumberFields",   JSON.stringify(["id"]));
pm.variables.set("urlFields",              JSON.stringify([]));
pm.variables.set("dateTimeFields",         JSON.stringify([]));
pm.variables.set("enumRules",              JSON.stringify({}));

Krok 3 — Přidejte schéma do schema_store
V Postmanu klikni na kolekci → záložka Variables → najdi schema_store → přidej nový klíč do JSON objektu:

{
  "character.schema": { ... },
  "country.schema":   { ... },
  "error.schema":     { ... },
  "pokemon.schema": {
    "type": "object",
    "properties": {
      "id":   { "type": "number" },
      "name": { "type": "string" }
    },
    "required": ["id", "name"]
  }
}

Krok 4 — Přidejte schéma do VS Code schemas/ složky
Vytvořte soubor project/schemas/pokemon.schema.json
{
  "type": "object",
  "properties": {
    "id":   { "type": "number" },
    "name": { "type": "string" }
  },
  "required": ["id", "name"]
}
Toto schéma se automaticky načte při Newman spuštění přes `runTests.js` — žádná další změna v kódu není potřeba.

Krok 5 — Přidejte requesty do folderu
Pro každý endpoint klikněte pravým tlačítkem na folder → Add Request. Pro každý request nastavte:

URL — použijte proměnnou pro base URL:
{{pokemonBaseUrl}}pokemon/{{pokemonId}}

Krok 6 — Přidej base URL proměnnou
V Postmanu klikněte na kolekci → záložka Variables → přidej:
Variable:    pokemonBaseUrl
Value:   https://pokeapi.co/api/v2/

Pre-request Script — pouze pokud potřebuješ přepsat folder defaults:
// Přepište pouze co se liší od folder defaults
pm.variables.set("expectedRootType", "object");
pm.variables.set("requiredKeys", JSON.stringify(["id", "name", "types"]));

Pokud request nepotřebuje žádné speciální chování → nech pre-req prázdný, folder default pokryje vše.
Post-request Script — vždy prázdný, sdílený skript na tests folderu pokryje vše automaticky.

## Výsledky testů
- 20 requestů
- 270 assertions
- 4 iterace (data-driven)
- 0 failures