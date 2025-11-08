import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Define role permissions
export const PERMISSIONS = {
  // Dashboard
  "dashboard:view": ["superadmin", "operator", "user"],

  // User management
  "users:view": ["superadmin"],
  "users:create": ["superadmin"],
  "users:update": ["superadmin"],
  "users:delete": ["superadmin"],
  "users:approve": ["superadmin"],

  // Archive unit management
  "arsip-unit:view": ["superadmin", "operator", "user"],
  "arsip-unit:create": ["superadmin", "operator"],
  "arsip-unit:update": ["superadmin", "operator"],
  "arsip-unit:delete": ["superadmin"],

  // File archive management
  "berkas-arsip:view": ["superadmin", "operator", "user"],
  "berkas-arsip:create": ["superadmin", "operator"],
  "berkas-arsip:update": ["superadmin", "operator"],
  "berkas-arsip:delete": ["superadmin"],

  // Category management
  "kategori:view": ["superadmin", "operator", "user"],
  "kategori:create": ["superadmin", "operator"],
  "kategori:update": ["superadmin", "operator"],
  "kategori:delete": ["superadmin"],

  // Sub category management
  "sub-kategori:view": ["superadmin", "operator", "user"],
  "sub-kategori:create": ["superadmin", "operator"],
  "sub-kategori:update": ["superadmin", "operator"],
  "sub-kategori:delete": ["superadmin"],

  // Classification code management
  "kode-klasifikasi:view": ["superadmin", "operator", "user"],
  "kode-klasifikasi:create": ["superadmin", "operator"],
  "kode-klasifikasi:update": ["superadmin", "operator"],
  "kode-klasifikasi:delete": ["superadmin"],

  // Processing unit management
  "unit-pengolah:view": ["superadmin", "operator", "user"],
  "unit-pengolah:create": ["superadmin", "operator"],
  "unit-pengolah:update": ["superadmin", "operator"],
  "unit-pengolah:delete": ["superadmin"],

  // Reports
  "reports:view": ["superadmin", "operator"],
  "reports:export": ["superadmin", "operator"],
} as const;

export type Permission = keyof typeof PERMISSIONS;
export type Role = "superadmin" | "operator" | "user";

/**
 * Check if a user has permission to perform an action
 */
export function hasPermission(
  userRole: Role | null,
  permission: Permission
): boolean {
  if (!userRole) return false;
  return PERMISSIONS[permission]?.includes(userRole) ?? false;
}

/**
 * Check if a user has any of the specified roles
 */
export function hasRole(userRole: Role | null, roles: Role[]): boolean {
  if (!userRole) return false;
  return roles.includes(userRole);
}

/**
 * Get the current session and validate user status
 */
export async function getCurrentSession(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return null;
    }

    // Check if user is active
    if (session.user.status !== "active") {
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Middleware function to protect routes with role-based access control
 */
export async function requireAuth(
  request: NextRequest,
  requiredPermission?: Permission,
  requiredRoles?: Role[]
) {
  const session = await getCurrentSession(request);

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Check if user has required permission
  if (requiredPermission && !hasPermission(session.user.role as Role, requiredPermission)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Check if user has required role
  if (requiredRoles && !hasRole(session.user.role as Role, requiredRoles)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return session;
}

/**
 * Higher-order function to create route protection middleware
 */
export function createProtectedRoute(
  options: {
    permission?: Permission;
    roles?: Role[];
    requireActiveStatus?: boolean;
  } = {}
) {
  return async (request: NextRequest) => {
    const session = await getCurrentSession(request);

    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Check active status if required
    if (options.requireActiveStatus !== false && session.user.status !== "active") {
      return NextResponse.redirect(new URL("/pending-approval", request.url));
    }

    // Check permissions
    if (options.permission && !hasPermission(session.user.role as Role, options.permission)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Check roles
    if (options.roles && !hasRole(session.user.role as Role, options.roles)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return session;
  };
}