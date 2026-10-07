export const adminPermissions = [
  "manage_content",
  "manage_publications",
  "view_messages",
  "view_bookings",
  "manage_users",
] as const;

export type AdminPermission = (typeof adminPermissions)[number];
export type AdminRole = "owner" | "admin" | "editor" | "viewer";

export const adminPermissionLabels: Record<AdminPermission, { label: string; description: string }> = {
  manage_content: { label: "Website content", description: "Edit and publish pages, services and homepage content." },
  manage_publications: { label: "Publications", description: "Create articles, manage authors and upload publication media." },
  view_messages: { label: "Messages", description: "View enquiries submitted through the contact form." },
  view_bookings: { label: "Bookings", description: "View session requests and booking details." },
  manage_users: { label: "User management", description: "Create users and change roles or permissions." },
};

export const adminRoleLabels: Record<AdminRole, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export const adminRoleDefaults: Record<AdminRole, AdminPermission[]> = {
  owner: [...adminPermissions],
  admin: [...adminPermissions],
  editor: ["manage_content", "manage_publications"],
  viewer: ["view_messages", "view_bookings"],
};

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && value in adminRoleLabels;
}

export function normaliseAdminPermissions(value: unknown, role: AdminRole): AdminPermission[] {
  if (role === "owner") return [...adminPermissions];
  if (!Array.isArray(value)) return [...adminRoleDefaults[role]];
  return adminPermissions.filter((permission) => value.includes(permission));
}
