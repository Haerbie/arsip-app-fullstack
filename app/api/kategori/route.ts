import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { kategori } from "@/db/schema";
import { eq, like, count, desc, asc } from "drizzle-orm";
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
  kategoriCreateSchema,
  kategoriUpdateSchema,
  paginationQuerySchema,
} from "@/lib/validations";
import { PERMISSIONS } from "@/middleware/auth";

// GET /api/kategori - List all kategori
export async function GET(request: NextRequest) {
  // Protect endpoint
  const protection = await protectApiEndpoint(
    request,
    PERMISSIONS["kategori:view"]
  );
  if (protection.error) {
    return errorResponse(protection.error, protection.status);
  }

  try {
    const params = parseQueryParams(request, paginationQuerySchema);
    const { page, limit, search, sortBy, sortOrder } = params;

    let query = db.select().from(kategori);

    // Apply search filter
    if (search) {
      query = query.where(
        like(kategori.nama, `%${search}%`)
      ).$dynamic();
    }

    // Get total count
    const totalQuery = db.select({ count: count() }).from(kategori);
    if (search) {
      totalQuery.where(like(kategori.nama, `%${search}%`));
    }
    const [{ count: total }] = await totalQuery;

    // Apply sorting
    const sortColumn = sortBy === "nama" ? kategori.nama :
                      sortBy === "kode" ? kategori.kode :
                      kategori.createdAt;

    const sortFunction = sortOrder === "asc" ? asc : desc;
    query = query.orderBy(sortFunction(sortColumn));

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    const kategories = await query;

    return successResponse(
      kategories,
      "Berhasil mengambil daftar kategori",
      calculatePagination(page, limit, total)
    );
  } catch (error) {
    console.error("Error fetching kategori:", error);
    return errorResponse("Terjadi kesalahan saat mengambil data kategori", 500);
  }
}

// POST /api/kategori - Create new kategori
export async function POST(request: NextRequest) {
  // Protect endpoint
  const protection = await protectApiEndpoint(
    request,
    PERMISSIONS["kategori:create"]
  );
  if (protection.error) {
    return errorResponse(protection.error, protection.status);
  }

  try {
    const body = await parseRequestBody(request, kategoriCreateSchema);
    const { nama, deskripsi, kode } = body;

    // Check if kode already exists
    const existingKategori = await db.select().from(kategori).where(eq(kategori.kode, kode)).limit(1);
    if (existingKategori.length > 0) {
      return errorResponse("Kode kategori sudah ada", 409);
    }

    const newKategori = {
      nama,
      deskripsi,
      kode,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [result] = await db.insert(kategori).values(newKategori);
    const id = result.insertId;

    const createdKategori = await db.select().from(kategori).where(eq(kategori.id, id)).limit(1);

    return successResponse(
      createdKategori[0],
      "Kategori berhasil dibuat"
    );
  } catch (error: any) {
    if (error.errors) {
      return validationErrorResponse(error.errors);
    }
    console.error("Error creating kategori:", error);
    return errorResponse("Terjadi kesalahan saat membuat kategori", 500);
  }
}