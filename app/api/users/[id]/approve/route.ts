import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  protectApiEndpoint,
} from "@/lib/api-utils";
import { PERMISSIONS } from "@/middleware/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/users/[id]/approve - Approve user (superadmin only)
export async function POST(request: NextRequest, { params }: RouteParams) {
  // Protect endpoint
  const protection = await protectApiEndpoint(
    request,
    PERMISSIONS["users:approve"]
  );
  if (protection.error) {
    return errorResponse(protection.error, protection.status);
  }

  try {
    const { id } = await params;

    // Check if user exists
    const existingUsers = await db.select().from(user).where(eq(user.id, id)).limit(1);
    if (existingUsers.length === 0) {
      return notFoundResponse("Pengguna tidak ditemukan");
    }

    const currentUser = existingUsers[0];

    // Check if user is already active
    if (currentUser.status === "active") {
      return errorResponse("Pengguna sudah aktif", 400);
    }

    // Update user status to active
    await db.update(user).set({
      status: "active",
      updatedAt: new Date(),
    }).where(eq(user.id, id));

    return successResponse(
      { id, name: currentUser.name, email: currentUser.email, status: "active" },
      "Pengguna berhasil disetujui dan diaktifkan"
    );
  } catch (error) {
    console.error("Error approving user:", error);
    return errorResponse("Terjadi kesalahan saat menyetujui pengguna", 500);
  }
}