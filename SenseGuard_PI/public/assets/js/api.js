/*
 * Cliente HTTP único: mantém a sessão, envia o token CSRF nas operações de escrita
 * e transforma respostas inválidas em ApiError, que as telas sabem tratar.
 */

export class ApiError extends Error {
  constructor(message, { status = 0, field = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.field = field;
  }
}

let redirectingToLogin = false;

function csrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
}

/**
 * @param {string} url
 * @param {RequestInit & {body?: any}} options  body pode ser objeto (vira JSON) ou string.
 * @returns {Promise<any>} JSON da resposta já interpretado.
 */
export async function apiFetch(url, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  let body = options.body;
  if (body !== undefined && body !== null) {
    if (typeof body !== "string") body = JSON.stringify(body);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const token = csrfToken();
    if (!token) throw new ApiError("Token de segurança ausente. Atualize a página e tente novamente.");
    headers.set("X-CSRF-Token", token);
  }

  let response;
  try {
    response = await window.fetch(url, { ...options, method, headers, body, credentials: "same-origin", cache: "no-store" });
  } catch (error) {
    throw new ApiError("Não foi possível falar com o servidor. Verifique a conexão.");
  }

  let data = {};
  try {
    data = await response.json();
  } catch (error) {
    if (response.ok) throw new ApiError("O servidor retornou uma resposta inválida.", { status: response.status });
  }

  if (!response.ok) {
    if (response.status === 401 && !redirectingToLogin && !url.startsWith("logout.php")) {
      redirectingToLogin = true;
      window.location.replace("index.php?expired=1");
    }
    const message = data && typeof data === "object" ? data.error || data.message : null;
    throw new ApiError(message || `A operação falhou (HTTP ${response.status}).`, {
      status: response.status,
      field: data && typeof data === "object" ? data.field || null : null,
    });
  }

  return data;
}

export const fetchJson = (url) => apiFetch(url, { method: "GET" });

/** Cria (id ausente) ou atualiza uma entidade e devolve o registro salvo. */
export function saveEntity(entity, id, payload) {
  const url = id ? `api.php?entity=${entity}&id=${encodeURIComponent(id)}` : `api.php?entity=${entity}`;
  return apiFetch(url, { method: id ? "PUT" : "POST", body: payload });
}

export function deleteEntity(entity, id) {
  return apiFetch(`api.php?entity=${entity}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

/**
 * Pesquisa máquinas no MySQL utilizando GET e JSON.
 */
export async function searchMachines(query) {
  const text = String(query ?? "").trim();
  const url = `api.php?entity=machines&q=${encodeURIComponent(text)}`;

  const machines = await fetchJson(url);

  if (!Array.isArray(machines)) {
    throw new ApiError("A API retornou uma lista de máquinas inválida.");
  }

  return machines;
}

/**
 * Consulta os detalhes de uma máquina pelo ID.
 */
export async function getMachineById(id) {
  const machineId = String(id ?? "").trim();

  if (!/^[1-9]\d*$/.test(machineId)) {
    throw new ApiError("Identificador da máquina inválido.");
  }

  const url = `api.php?entity=machines&id=${encodeURIComponent(machineId)}`;
  const machine = await fetchJson(url);

  if (
    !machine ||
    typeof machine !== "object" ||
    Array.isArray(machine) ||
    String(machine.id) !== machineId
  ) {
    throw new ApiError("A API retornou dados inválidos da máquina.");
  }

  return machine;
}