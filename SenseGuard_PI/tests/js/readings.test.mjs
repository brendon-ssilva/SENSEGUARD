import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderReadings } from "../../public/assets/js/views/readings.js";

test("renderiza formulário nativo, campos rotulados e região de status", () => {
  const { html, after } = renderReadings();
  assert.equal(typeof after, "function");
  assert.match(html, /<form id="reading-filters"/);
  for (const field of ["q", "type", "origin", "from", "to", "sort"]) {
    assert.ok(html.includes('for="reading-' + field + '"'));
    assert.ok(html.includes('name="' + field + '"'));
  }
  assert.match(html, /type="submit"/);
  assert.match(html, /data-reading-clear/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /data-reading-prev disabled/);
  assert.match(html, /data-reading-next disabled/);
});

test("a implementação usa cliente HTTP centralizado, intercepta submit e não injeta resultados em HTML", () => {
  const source = readFileSync(new URL("../../public/assets/js/views/readings.js", import.meta.url), "utf8");
  assert.match(source, /event\.preventDefault\(\)/);
  assert.match(source, /apiFetch\("api\.php\?entity=readings-query"/);
  assert.match(source, /method: "POST"/);
  assert.match(source, /new AbortController\(\)/);
  assert.match(source, /form\.isConnected/);
  assert.match(source, /td\.textContent/);
  assert.doesNotMatch(source, /innerHTML|location\.reload/);
});
