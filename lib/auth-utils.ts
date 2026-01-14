import { Role, Permission, hasPermission, hasRole } from "@/middleware/auth";

/**
 * Get user-friendly role name in Indonesian
 */
export function getRoleName(role: Role): string {
  const roleNames = {
    superadmin: "Super Admin",
    operator: "Operator",
    user: "Pengguna",
  };
  return roleNames[role] || "Tidak Diketahui";
}

/**
 * Get user-friendly status name in Indonesian
 */
export function getStatusName(status: string): string {
  const statusNames = {
    active: "Aktif",
    pending: "Menunggu Persetujuan",
    inactive: "Tidak Aktif",
  };
  return statusNames[status as keyof typeof statusNames] || status;
}

/**
 * Get role color for UI components
 */
export function getRoleColor(role: Role): string {
  const colors = {
    superadmin: "bg-red-100 text-red-800 border-red-200",
    operator: "bg-blue-100 text-blue-800 border-blue-200",
    user: "bg-green-100 text-green-800 border-green-200",
  };
  return colors[role] || "bg-gray-100 text-gray-800 border-gray-200";
}

/**
 * Get status color for UI components
 */
export function getStatusColor(status: string): string {
  const colors = {
    active: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
}

/**
 * Get all available roles with their descriptions
 */
export function getAvailableRoles() {
  return [
    {
      value: "superadmin" as Role,
      label: "Super Admin",
      description: "Akses penuh ke semua fitur sistem, termasuk manajemen pengguna",
    },
    {
      value: "operator" as Role,
      label: "Operator",
      description: "Bisa mengelola arsip dan kategori, tapi tidak bisa mengelola pengguna",
    },
    {
      value: "user" as Role,
      label: "Pengguna",
      description: "Hanya bisa melihat dan mencari arsip",
    },
  ];
}

/**
 * Get menu items based on user role
 */
export function getMenuItems(role: Role) {
  const baseItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "LayoutDashboard",
      permission: "dashboard:view" as Permission,
    },
  ];

  const archiveItems = [
    {
      title: "Arsip Unit",
      href: "/dashboard/arsip-unit",
      icon: "Folder",
      permission: "arsip-unit:view" as Permission,
    },
    {
      title: "Berkas Arsip",
      href: "/dashboard/berkas-arsip",
      icon: "FileText",
      permission: "berkas-arsip:view" as Permission,
    },
  ];

  const masterDataItems = [
    {
      title: "Kategori",
      href: "/dashboard/kategori",
      icon: "Tags",
      permission: "kategori:view" as Permission,
    },
    {
      title: "Sub Kategori",
      href: "/dashboard/sub-kategori",
      icon: "Tag",
      permission: "sub-kategori:view" as Permission,
    },
    {
      title: "Kode Klasifikasi",
      href: "/dashboard/kode-klasifikasi",
      icon: "Hash",
      permission: "kode-klasifikasi:view" as Permission,
    },
    {
      title: "Unit Pengolah",
      href: "/dashboard/unit-pengolah",
      icon: "Building",
      permission: "unit-pengolah:view" as Permission,
    },
  ];

  const userManagementItems = [
    {
      title: "Manajemen Pengguna",
      href: "/dashboard/users",
      icon: "Users",
      permission: "users:view" as Permission,
    },
  ];

  const reportItems = [
    {
      title: "Laporan",
      href: "/dashboard/reports",
      icon: "FileBarChart",
      permission: "reports:view" as Permission,
    },
  ];

  // Combine items based on role and permissions
  const items = [...baseItems];

  // Add archive items
  if (hasPermission(role, "arsip-unit:view") || hasPermission(role, "berkas-arsip:view")) {
    items.push({
      title: "Arsip",
      items: archiveItems.filter(item => hasPermission(role, item.permission)),
    });
  }

  // Add master data items
  if (masterDataItems.some(item => hasPermission(role, item.permission))) {
    items.push({
      title: "Data Master",
      items: masterDataItems.filter(item => hasPermission(role, item.permission)),
    });
  }

  // Add user management (only for superadmin)
  if (hasPermission(role, "users:view")) {
    items.push({
      title: "Pengaturan",
      items: userManagementItems,
    });
  }

  // Add reports (only for superadmin and operator)
  if (hasPermission(role, "reports:view")) {
    items.push({
      title: "Laporan",
      items: reportItems,
    });
  }

  return items;
}

/**
 * Check if current user can perform specific actions
 */
export function canUserPerformAction(userRole: Role, action: string): boolean {
  const actionPermissions: Record<string, Permission> = {
    "create-user": "users:create",
    "edit-user": "users:update",
    "delete-user": "users:delete",
    "approve-user": "users:approve",
    "create-arsip": "arsip-unit:create",
    "edit-arsip": "arsip-unit:update",
    "delete-arsip": "arsip-unit:delete",
    "create-berkas": "berkas-arsip:create",
    "edit-berkas": "berkas-arsip:update",
    "delete-berkas": "berkas-arsip:delete",
    "create-kategori": "kategori:create",
    "edit-kategori": "kategori:update",
    "delete-kategori": "kategori:delete",
    "export-report": "reports:export",
  };

  const permission = actionPermissions[action];
  return permission ? hasPermission(userRole, permission) : false;
}