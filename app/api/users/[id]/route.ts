import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  parseRequestBody,
  protectApiEndpoint,
} from "@/lib/api-utils";
import { userUpdateSchema } from "@/lib/validations";
import { PERMISSIONS } from "@/middleware/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id] - Get single user (superadmin only)
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Protect endpoint
  const protection = await protectApiEndpoint(
    request,
    PERMISSIONS["users:view"]
  );
  if (protection.error) {
    return errorResponse(protection.error, protection.status);
  }

  try {
    const { id } = await params;
    const users = await db.select().from(user).where(eq(user.id, id)).limit(1);

    if (users.length === 0) {
      return notFoundResponse("Pengguna tidak ditemukan");
    }

    // Remove sensitive information
    const { password, ...sanitizedUser } = users[0];

    return successResponse(sanitizedUser, "Berhasil mengambil data pengguna");
  } catch (error) {
    console.error("Error fetching user:", error);
    return errorResponse("Terjadi kesalahan saat mengambil data pengguna", 500);
  }
}

// PUT /api/users/[id] - Update user (superadmin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  // Protect endpoint
  const protection = await protectApiEndpoint(
    request,
    PERMISSIONS["users:update"]
  );
  if (protection.error) {
    return errorResponse(protection.error, protection.status);
  }

  try {
    const { id } = await params;
    const body = await parseRequestBody(request, userUpdateSchema);

    // Check if user exists
    const existingUsers = await db.select().from(user).where(eq(user.id, id)).limit(1);
    if (existingUsers.length === 0) {
      return notFoundResponse("Pengguna tidak ditemukan");
    }

    // If updating email, check for duplicates
    if (body.email && body.email !== existingUsers[0].email) {
      const duplicateUser = await db.select().from(user).where(eq(user.email, body.email!)).limit(1);
      if (duplicateUser.length > 0) {
        return errorResponse("Email sudah terdaftar", 409);
      }
    }

    const updatedUser = {
      ...body,
      updatedAt: new Date(),
    };

    await db.update(user).set(updatedUser).where(eq(user.id, id));

    // Return updated user (without password)
    const [result] = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }).from(user).where(eq(user.id, id));

    return successResponse(result, "Pengguna berhasil diperbarui");
  } catch (error: any) {
    if (error.errors) {
      return validationErrorResponse(error.errors);
    }
    console.error("Error updating user:", error);
    return errorResponse("Terjadi kesalahan saat memperbarui pengguna", 500);
  }
}

// DELETE /api/users/[id] - Delete user (superadmin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Protect endpoint
  const protection = await protectApiEndpoint(
    request,
    PERMISSIONS["users:delete"]
  );
  if (protection.error) {
    return errorResponse(protection.error, protection.status);
  }

  try {
    const { id } = await params;
    const session = protection.session;

    // Prevent self-deletion
    if (session?.user?.id === id) {
      return errorResponse("Tidak dapat menghapus akun sendiri", 400);
    }

    // Check if user exists
    const existingUsers = await db.select().from(user).where(eq(user.id, id)).limit(1);
    if (existingUsers.length === 0) {
      return notFoundResponse("Pengguna tidak ditemukan");
    }

    await db.delete(user).where(eq(user.id, id));

    return successResponse(null, "Pengguna berhasil dihapus");
  } catch (error) {
    console.error("Error deleting user:", error);
    return errorResponse("Terjadi kesalahan saat menghapus pengguna", 500);
  }
}