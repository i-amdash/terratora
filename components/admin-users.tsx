"use client";

import { useState } from "react";
import { adminPermissionLabels, adminPermissions, adminRoleDefaults, adminRoleLabels, type AdminPermission, type AdminRole } from "@/lib/admin-permissions";
import type { AdminUser } from "@/lib/types";

type UserDraft = {
  id?: string;
  full_name: string;
  email: string;
  password: string;
  role: AdminRole;
  permissions: AdminPermission[];
  is_active: boolean;
};

const emptyDraft = (): UserDraft => ({ full_name: "", email: "", password: "", role: "editor", permissions: [...adminRoleDefaults.editor], is_active: true });

export function AdminUsers({ initialUsers, currentUserId, currentRole, onNotice }: { initialUsers: AdminUser[]; currentUserId: string; currentRole: AdminRole; onNotice: (message: string) => void }) {
  const [users, setUsers] = useState(initialUsers);
  const [draft, setDraft] = useState<UserDraft>(emptyDraft);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const editing = Boolean(draft.id);
  const editingSelf = draft.id === currentUserId;

  function createUser() {
    setDraft(emptyDraft());
    setError("");
    setOpen(true);
  }

  function editUser(user: AdminUser) {
    setDraft({ id: user.id, full_name: user.full_name, email: user.email, password: "", role: user.role, permissions: [...user.permissions], is_active: user.is_active });
    setError("");
    setOpen(true);
  }

  function setRole(role: AdminRole) {
    setDraft((current) => ({ ...current, role, permissions: [...adminRoleDefaults[role]] }));
  }

  function togglePermission(permission: AdminPermission) {
    setDraft((current) => ({ ...current, permissions: current.permissions.includes(permission) ? current.permissions.filter((item) => item !== permission) : [...current.permissions, permission] }));
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "The user could not be saved.");
      const saved = result as AdminUser;
      setUsers((current) => editing ? current.map((user) => user.id === saved.id ? saved : user) : [...current, saved]);
      setOpen(false);
      onNotice(editing ? "User details updated." : "CMS user created.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The user could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="user-manager">
    <header className="publication-manager-head">
      <div><p className="eyebrow">Access control</p><h2>CMS users</h2><p>Create accounts and decide what each person can access.</p></div>
      <button type="button" className="button button-dark" onClick={createUser}>New user <span aria-hidden="true">＋</span></button>
    </header>
    <div className="publication-table-wrap">
      <table className="publication-table user-table">
        <thead><tr><th>User</th><th>Role</th><th>Permissions</th><th>Status</th><th>Last sign-in</th><th /></tr></thead>
        <tbody>{users.map((user) => <tr key={user.id}>
          <td><strong>{user.full_name || "Unnamed user"}{user.id === currentUserId ? " (You)" : ""}</strong><small>{user.email}</small></td>
          <td><span className={`user-role role-${user.role}`}>{adminRoleLabels[user.role]}</span></td>
          <td><small>{user.permissions.length === adminPermissions.length ? "All permissions" : user.permissions.map((permission) => adminPermissionLabels[permission].label).join(", ") || "No permissions"}</small></td>
          <td><span className={`user-status ${user.is_active ? "active" : "inactive"}`}>{user.is_active ? "Active" : "Inactive"}</span></td>
          <td><small>{formatDate(user.last_sign_in_at)}</small></td>
          <td><button className="text-button" type="button" disabled={currentRole !== "owner" && user.role === "owner"} onClick={() => editUser(user)}>Edit</button></td>
        </tr>)}</tbody>
      </table>
      {!users.length && <div className="empty-state">Apply the admin roles migration to begin managing users.</div>}
    </div>

    {open && <div className="publication-drawer-layer">
      <button className="publication-drawer-backdrop" type="button" aria-label="Close user editor" onClick={() => setOpen(false)} />
      <aside className="publication-drawer user-drawer" role="dialog" aria-modal="true" aria-labelledby="user-editor-title">
        <header><div><p className="eyebrow">Access control</p><h2 id="user-editor-title">{editing ? "Edit user" : "Create a CMS user"}</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Close user editor">×</button></header>
        <div className="publication-drawer-body user-editor-body">
          <section className="user-details-form">
            <label className="field"><span>Full name</span><input value={draft.full_name} onChange={(event) => setDraft({ ...draft, full_name: event.target.value })} /></label>
            <label className="field"><span>Email address</span><input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>
            <label className="field"><span>{editing ? "New password" : "Temporary password"}</span><small>{editing ? "Leave blank to keep the existing password." : "At least 8 characters. Share it securely with the user."}</small><input type="password" autoComplete="new-password" value={draft.password} onChange={(event) => setDraft({ ...draft, password: event.target.value })} /></label>
            <label className="field"><span>Role</span><select value={draft.role} disabled={editingSelf} onChange={(event) => setRole(event.target.value as AdminRole)}>{Object.entries(adminRoleLabels).map(([value, label]) => <option key={value} value={value} disabled={value === "owner" && currentRole !== "owner"}>{label}</option>)}</select></label>
            {editing && <label className="user-active-toggle"><input type="checkbox" checked={draft.is_active} disabled={editingSelf} onChange={(event) => setDraft({ ...draft, is_active: event.target.checked })} /><span><strong>Active account</strong><small>Inactive users cannot sign in to the CMS.</small></span></label>}
          </section>
          <section className="permission-editor">
            <header><div><p className="eyebrow">Permissions</p><h3>What can this user do?</h3></div><small>{draft.role === "owner" ? "Owners always have every permission." : "Role presets can be customised."}</small></header>
            <div>{adminPermissions.map((permission) => <label key={permission}><input type="checkbox" checked={draft.role === "owner" || draft.permissions.includes(permission)} disabled={draft.role === "owner" || editingSelf} onChange={() => togglePermission(permission)} /><span><strong>{adminPermissionLabels[permission].label}</strong><small>{adminPermissionLabels[permission].description}</small></span></label>)}</div>
          </section>
          {editingSelf && <p className="user-editor-note">You can update your name, email and password here. Another owner must change your role or permissions.</p>}
          {error && <p className="form-status error" role="alert">{error}</p>}
        </div>
        <footer><p>{editing ? "Changes take effect the next time permissions are checked." : "The user can sign in immediately after creation."}</p><div><button type="button" className="text-button" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="button button-dark" disabled={saving} onClick={save}>{saving ? "Saving…" : editing ? "Save user →" : "Create user →"}</button></div></footer>
      </aside>
    </div>}
  </section>;
}

function formatDate(value?: string) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Never" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
