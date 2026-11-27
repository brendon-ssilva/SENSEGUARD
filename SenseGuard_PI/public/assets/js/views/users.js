/* View Usuários (somente administradores). */
import { state, metaOptions } from "../state.js";
import { h } from "../utils/dom.js";
import { avatarInitials } from "../utils/format.js";
import { I } from "../ui/icons.js";
import { badge, dot, emptyRow, rowActions } from "../ui/components.js";
import { openModal, closeModal, markInvalidField } from "../ui/modal.js";
import { toastError } from "../ui/toast.js";
import { saveEntity, deleteEntity } from "../api.js";
import { upsert } from "../data.js";
import { renderAll, renderView, renderChrome } from "../view-host.js";
import { AVATAR_TONES, USER_ROLE } from "../constants.js";

const normalize = (value) => String(value || "").trim().toLowerCase();

function userRow(user, index) {
  const role = USER_ROLE[normalize(user.role)] || { cls: "muted", label: user.role || "Não definido" };
  const active = normalize(user.status) === "ativo";
  const tone = AVATAR_TONES[index % AVATAR_TONES.length];

  return `<tr>
    <td><div class="user-cell"><div class="user-avatar tone-${tone}">${h(avatarInitials(user.name))}</div><span class="user-name-cell">${h(user.name)}</span></div></td>
    <td class="table-cell-mono">${h(user.email)}</td>
    <td class="table-cell-mono">${h(user.phone)}</td>
    <td>${badge(role.cls, role.label)}</td>
    <td>${dot(active ? "emerald" : "muted", active ? "Ativo" : "Inativo")}</td>
    <td class="table-cell-mono">${h(user.createdAt)}</td>
    <td>${rowActions("users", user.id, state.deleteId)}</td>
  </tr>`;
}

export function renderUsers() {
  const { users, userQuery } = state;
  const q = userQuery.toLowerCase();
  const filtered = users.filter((u) => (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q));
  const activeCount = users.filter((u) => normalize(u.status) === "ativo").length;

  return `<div class="view-wrapper">
    <div class="section-page-header">
      <div><div class="section-page-title">Usuários</div><div class="section-page-subtitle">${activeCount} ativos de ${users.length} cadastrados</div></div>
      <button class="button-primary" data-action="users.openAdd">${I.plus} Novo Usuário</button>
    </div>
    <div class="actions-toolbar">
      <div class="search-input-wrapper">${I.search}<input class="search-input-field" data-input="users.setQuery" placeholder="Buscar por nome ou e-mail..." value="${h(userQuery)}"></div>
    </div>
    <div class="panel-card">
      <table>
        <thead><tr><th>Usuário</th><th>E-mail</th><th>Telefone</th><th>Cargo</th><th>Status</th><th>Cadastro</th><th></th></tr></thead>
        <tbody>${filtered.map(userRow).join("") || emptyRow(7, I.users, "Nenhum usuário encontrado")}</tbody>
      </table>
    </div>
  </div>`;
}

function userForm(user) {
  const option = (o, selected) => `<option value="${h(o.value)}" ${selected === o.value ? "selected" : ""}>${h(o.label)}</option>`;
  const roles = metaOptions("userRole", USER_ROLE).map((o) => option(o, user?.role || "tecnico")).join("");
  const statuses = metaOptions("userStatus", { ativo: { label: "Ativo" }, inativo: { label: "Inativo" } })
    .map((o) => option(o, user?.status || "ativo"))
    .join("");

  return `<div class="form-grid-layout">
    <div class="form-field-group full-width"><label class="form-input-label" for="f-name">Nome completo</label><input id="f-name" data-field="name" class="form-input-field" value="${h(user?.name || "")}" placeholder="Ex: João da Silva"></div>
    <div class="form-field-group full-width"><label class="form-input-label" for="f-email">E-mail</label><input id="f-email" data-field="email" type="email" class="form-input-field" value="${h(user?.email || "")}" placeholder="joao@empresa.com" required></div>
    <div class="form-field-group full-width"><label class="form-input-label" for="f-password">Senha ${user ? "(deixe em branco para manter a atual)" : ""}</label><input id="f-password" data-field="password" type="password" class="form-input-field" autocomplete="new-password" minlength="8" maxlength="72" placeholder="${user ? "Nova senha (opcional)" : "Mínimo de 8 caracteres"}"></div>
    <div class="form-field-group"><label class="form-input-label" for="f-phone">Telefone</label><input id="f-phone" data-field="phone" class="form-input-field" value="${h(user?.phone || "")}" placeholder="(11) 99999-9999"></div>
    <div class="form-field-group"><label class="form-input-label" for="f-role">Cargo</label><select id="f-role" data-field="role" class="form-input-field">${roles}</select></div>
    <div class="form-field-group"><label class="form-input-label" for="f-status">Status</label><select id="f-status" data-field="status" class="form-input-field">${statuses}</select></div>
  </div>`;
}

const footer = `<button class="button-cancel" data-action="modal.close">Cancelar</button><button class="button-save" data-action="users.save">Salvar</button>`;
const value = (id) => document.getElementById(id)?.value ?? "";

function invalid(message, field) {
  toastError(message);
  markInvalidField(field);
}

async function save() {
  const name = value("f-name").trim();
  const email = value("f-email").trim();
  const password = value("f-password");
  const isEdit = Boolean(state.editingId);
  const passwordBytes = new TextEncoder().encode(password).length;

  if (!name || !email) return invalid("Preencha o nome e o e-mail.", name ? "email" : "name");
  if (!isEdit && (password.length < 8 || passwordBytes > 72)) return invalid("A senha é obrigatória e deve ter entre 8 e 72 bytes.", "password");
  if (isEdit && password && (password.length < 8 || passwordBytes > 72)) return invalid("A nova senha deve ter entre 8 e 72 bytes.", "password");

  const payload = {
    name,
    email,
    phone: value("f-phone"),
    role: value("f-role") || "tecnico",
    status: value("f-status") || "ativo",
  };
  if (password) payload.password = password; // a API grava apenas o hash (password_hash).

  let saved;
  try {
    saved = await saveEntity("users", state.editingId, payload);
  } catch (error) {
    markInvalidField(error.field);
    throw error;
  }

  upsert("users", { ...saved, id: String(saved.id), status: normalize(saved.status) });
  await closeModal();
  await renderAll();
}

async function confirmDelete({ id }) {
  await deleteEntity("users", id);
  state.users = state.users.filter((u) => u.id !== id);
  state.deleteId = null;
  renderView();
  renderChrome();
}

export const userActions = {
  "users.openAdd"() {
    state.editingId = null;
    openModal("Novo Usuário", userForm(null), footer);
  },
  "users.openEdit"({ id }) {
    state.editingId = id;
    openModal("Editar Usuário", userForm(state.users.find((u) => u.id === id)), footer);
  },
  "users.save": save,
  "users.confirmDelete": confirmDelete,
};

export const userInputs = {
  "users.setQuery"({ value: query }) {
    state.userQuery = query;
    renderView();
  },
};
