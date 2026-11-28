/* Histórico operacional: filtros no servidor e atualização somente dos resultados. */
import { apiFetch } from "../api.js";
import { metaOptions } from "../state.js";
import { SENSOR_TYPE_LABELS } from "../constants.js";

const ORIGINS = { dispositivo: "Dispositivo", importacao: "Importação", manual: "Manual" };
let activeController = null;

function addOptions(select, options) {
  for (const { value, label } of options) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  }
}

function showRows(tbody, rows) {
  const fragment = document.createDocumentFragment();
  for (const row of rows) {
    const tr = document.createElement("tr");
    const values = [row.at, row.sensor, row.machine, Object.hasOwn(SENSOR_TYPE_LABELS, row.type) ? SENSOR_TYPE_LABELS[row.type] : row.type,
      row.value, Object.hasOwn(ORIGINS, row.origin) ? ORIGINS[row.origin] : row.origin];
    for (const [index, value] of values.entries()) {
      const td = document.createElement("td");
      td.textContent = value === null || value === undefined || value === "" ? "—" : String(value);
      if (index === 0 || index === 4) td.className = "table-cell-mono";
      tr.append(td);
    }
    fragment.append(tr);
  }
  tbody.replaceChildren(fragment);
}

function showPlaceholder(tbody, message) {
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  td.colSpan = 6;
  td.className = "table-empty-state";
  td.textContent = message;
  tr.append(td);
  tbody.replaceChildren(tr);
}

export function renderReadings() {
  return {
    html: '<div class="view-wrapper readings-view">' +
      '<div class="section-page-header"><div><h2 class="section-page-title">Histórico de leituras</h2>' +
      '<p class="section-page-subtitle">Consulte as medições registradas na sua organização.</p></div></div>' +
      '<form id="reading-filters" class="panel-card panel-card-padded reading-filter-form" method="post" aria-label="Filtros do histórico">' +
      '<div class="reading-filter-grid">' +
      '<div class="form-field-group"><label class="form-input-label" for="reading-q">Sensor ou máquina</label><input id="reading-q" name="q" class="form-input-field" maxlength="100" placeholder="Buscar por nome..." autocomplete="off"></div>' +
      '<div class="form-field-group"><label class="form-input-label" for="reading-type">Tipo de medida</label><select id="reading-type" name="type" class="form-input-field"><option value="">Todos</option></select></div>' +
      '<div class="form-field-group"><label class="form-input-label" for="reading-origin">Origem</label><select id="reading-origin" name="origin" class="form-input-field"><option value="">Todas</option></select></div>' +
      '<div class="form-field-group"><label class="form-input-label" for="reading-from">Data inicial</label><input id="reading-from" name="from" type="date" min="1000-01-01" max="9999-12-31" class="form-input-field"></div>' +
      '<div class="form-field-group"><label class="form-input-label" for="reading-to">Data final (inclusive)</label><input id="reading-to" name="to" type="date" min="1000-01-01" max="9999-12-31" class="form-input-field"></div>' +
      '<div class="form-field-group"><label class="form-input-label" for="reading-sort">Ordenação</label><select id="reading-sort" name="sort" class="form-input-field"><option value="recent">Mais recentes</option><option value="oldest">Mais antigas</option></select></div>' +
      '</div><div class="reading-filter-actions"><button type="submit" class="button-primary">Aplicar filtros</button><button type="button" class="button-cancel" data-reading-clear>Limpar filtros</button></div></form>' +
      '<div class="panel-card reading-results"><div class="panel-header-bar"><h3 class="panel-header-title">Medições</h3></div>' +
      '<p class="reading-feedback" data-reading-status role="status" aria-live="polite"></p>' +
      '<div class="table-responsive-wrapper" data-reading-table aria-busy="false" tabindex="0" aria-label="Tabela de medições"><table><thead><tr>' +
      '<th scope="col">Data e hora</th><th scope="col">Sensor</th><th scope="col">Máquina</th><th scope="col">Tipo</th><th scope="col">Valor</th><th scope="col">Origem</th>' +
      '</tr></thead><tbody data-reading-rows></tbody></table></div>' +
      '<div class="reading-pagination"><button type="button" class="button-cancel" data-reading-prev disabled>Anterior</button><span data-reading-page>Página 1</span><button type="button" class="button-cancel" data-reading-next disabled>Próxima</button></div></div></div>',
    after(container) {
      const form = container.querySelector("#reading-filters");
      if (!form) return;
      addOptions(form.elements.namedItem("type"), metaOptions("sensorType", SENSOR_TYPE_LABELS));
      addOptions(form.elements.namedItem("origin"), metaOptions("readingOrigin", ORIGINS));

      const tbody = container.querySelector("[data-reading-rows]");
      const status = container.querySelector("[data-reading-status]");
      const table = container.querySelector("[data-reading-table]");
      const previous = container.querySelector("[data-reading-prev]");
      const next = container.querySelector("[data-reading-next]");
      const pageLabel = container.querySelector("[data-reading-page]");
      const submit = form.querySelector('button[type="submit"]');
      const clear = form.querySelector("[data-reading-clear]");
      let applied = {};
      let page = 1;

      function collect() {
        return Object.fromEntries(new FormData(form));
      }

      async function load(filters, targetPage) {
        activeController?.abort();
        const controller = new AbortController();
        activeController = controller;
        const current = () => form.isConnected && activeController === controller && !controller.signal.aborted;
        submit.disabled = previous.disabled = next.disabled = true;
        table.setAttribute("aria-busy", "true");
        status.classList.remove("text-crimson");
        status.textContent = "Consultando medições...";
        showPlaceholder(tbody, "Carregando...");
        try {
          const data = await apiFetch("api.php?entity=readings-query", {
            method: "POST", body: { ...filters, page: targetPage }, signal: controller.signal,
          });
          if (!current()) return;
          if (!data || !Array.isArray(data.rows) || data.page !== targetPage || typeof data.hasNext !== "boolean") {
            throw new Error("O servidor retornou dados inválidos.");
          }
          applied = { ...filters };
          page = targetPage;
          if (data.rows.length) showRows(tbody, data.rows);
          else showPlaceholder(tbody, "Nenhuma medição encontrada.");
          pageLabel.textContent = "Página " + page;
          status.textContent = data.rows.length + " medição(ões) nesta página." +
            (data.limitReached ? " Limite de navegação atingido. Refine os filtros." : "");
          previous.disabled = page <= 1;
          next.disabled = !data.hasNext;
        } catch (error) {
          if (!current()) return;
          status.classList.add("text-crimson");
          status.textContent = error?.message || "Não foi possível consultar as medições.";
          showPlaceholder(tbody, "Não foi possível carregar os resultados. Tente aplicar os filtros novamente.");
          pageLabel.textContent = "Consulta não concluída";
        } finally {
          if (current()) {
            submit.disabled = false;
            table.setAttribute("aria-busy", "false");
            activeController = null;
          }
        }
      }

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!submit.disabled) void load(collect(), 1);
      });
      clear.addEventListener("click", () => {
        form.reset();
        void load(collect(), 1);
      });
      previous.addEventListener("click", () => {
        if (!previous.disabled) void load(applied, page - 1);
      });
      next.addEventListener("click", () => {
        if (!next.disabled) void load(applied, page + 1);
      });
      void load(collect(), 1);
    },
  };
}
