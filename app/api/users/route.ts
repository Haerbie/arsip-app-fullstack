import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user, account } from "@/db/schema";
import { eq, like, count, desc, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  parseQueryParams,
  parseRequestBody,
  getPaginationParams,
  calculatePagination,
  protectApiEndpoint,
} from "@/lib/api-utils";
import {
  userCreateSchema,
  userUpdateSchema,
  paginationQuerySchema,
} from "@/lib/validations";
import { PERMISSIONS } from "@/middleware/auth";

// GET /api/users - List all users (superadmin only)
export async function GET(request: NextRequest) {
  // Protect endpoint
  const protection = await protectApiEndpoint(
    request,
    PERMISSIONS["users:view"]
  );
  if (protection.error) {
    return errorResponse(protection.error, protection.status);
  }

  try {
    const params = parseQueryParams(request, paginationQuerySchema);
    const { page, limit, search, sortBy, sortOrder } = params;

    let query = db.select().from(user);

    // Apply search filter
    if (search) {
      query = query.where(
        like(user.name, `%${search}%`)
      ).$dynamic();
    }

    // Get total count
    const totalQuery = db.select({ count: count() }).from(user);
    if (search) {
      totalQuery.where(like(user.name, `%${search}%`));
    }
    const [{ count: total }] = await totalQuery;

    // Apply sorting and pagination
    const sortColumn = sortBy === "name" ? user.name :
                      sortBy === "email" ? user.email :
                      sortBy === "role" ? user.role :
                      sortBy === "status" ? user.status :
                      user.createdAt;

    const sortFunction = sortOrder === "asc" ? asc : desc;
    query = query.orderBy(sortFunction(sortColumn));

    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    const users = await query;

    // Remove sensitive information
    const sanitizedUsers = users.map(({ password, ...user }) => user);

    return successResponse(
      sanitizedUsers,
      "Berhasil mengambil daftar pengguna",
      calculatePagination(page, limit, total)
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return errorResponse("Terjadi kesalahan saat mengambil data pengguna", 500);
  }
}

// POST /api/users - Create new user (superadmin only)
export async function POST(request: NextRequest) {
  // Protect endpoint
  const protection = await protectApiEndpoint(
    request,
    PERMISSIONS["users:create"]
  );
  if (protection.error) {
    return errorResponse(protection.error, protection.status);
  }

  try {
    const body = await parseRequestBody(request, userCreateSchema);
    const { name, email, role, password } = body;

    // Check if email already exists
    const existingUser = await db.select().from(user).where(eq(user.email, email)).limit(1);
    if (existingUser.length > 0) {
      return errorResponse("Email sudah terdaftar", 409);
    }

    // Create new user with pending status
    const userId = crypto.randomUUID();
    const now = new Date();

    const newUser = {
      id: userId,
      name,
      email,
      role,
      status: "pending", // New users start as pending
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    };

    // Hash password using Better Auth
    const hashedPassword = await auth.api.hashPassword({ password });

    await db.insert(user).values({
      ...newUser,
      // We'll handle password separately through the account table
    });

    // Create account record with password
    await db.insert(account).values({
      id: crypto.randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId: userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    return successResponse(
      { id: userId, name, email, role, status: "pending" },
      "Pengguna berhasil dibuat dan menunggu persetujuan"
    );
  } catch (error: any) {
    if (error.errors) {
      return validationErrorResponse(error.errors);
    }
    console.error("Error creating user:", error);
    return errorResponse("Terjadi kesalahan saat membuat pengguna", 500);
  }
}