import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { kategori } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  parseRequestBody,
  protectApiEndpoint,
} from "@/lib/api-utils";
import { kategoriUpdateSchema } from "@/lib/validations";
import { PERMISSIONS } from "@/middleware/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/kategori/[id] - Get single kategori
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Protect endpoint
  const protection = await protectApiEndpoint(
    request,
    PERMISSIONS["kategori:view"]
  );
  if (protection.error) {
    return errorResponse(protection.error, protection.status);
  }

  try {
    const { id } = await params;
    const kategories = await db.select().from(kategori).where(eq(kategori.id, parseInt(id))).limit(1);

    if (kategories.length === 0) {
      return notFoundResponse("Kategori tidak ditemukan");
    }

    return successResponse(kategories[0], "Berhasil mengambil data kategori");
  } catch (error) {
    console.error("Error fetching kategori:", error);
    return errorResponse("Terjadi kesalahan saat mengambil data kategori", 500);
  }
}

// PUT /api/kategori/[id] - Update kategori
export async function PUT(request: NextRequest, { params }: RouteParams) {
  // Protect endpoint
  const protection = await protectApiEndpoint(
    request,
    PERMISSIONS["kategori:update"]
  );
  if (protection.error) {
    return errorResponse(protection.error, protection.status);
  }

  try {
    const { id } = await params;
    const body = await parseRequestBody(request, kategoriUpdateSchema);

    // Check if kategori exists
    const existingKategori = await db.select().from(kategori).where(eq(kategori.id, parseInt(id))).limit(1);
    if (existingKategori.length === 0) {
      return notFoundResponse("Kategori tidak ditemukan");
    }

    // If updating kode, check for duplicates
    if (body.kode && body.kode !== existingKategori[0].kode) {
      const duplicateKategori = await db.select().from(kategori).where(eq(kategori.kode, body.kode)).limit(1);
      if (duplicateKategori.length > 0) {
        return errorResponse("Kode kategori sudah ada", 409);
      }
    }

    const updatedKategori = {
      ...body,
      updatedAt: new Date(),
    };

    await db.update(kategori).set(updatedKategori).where(eq(kategori.id, parseInt(id)));

    const [result] = await db.select().from(kategori).where(eq(kategori.id, parseInt(id)));

    return successResponse(result, "Kategori berhasil diperbarui");
  } catch (error: any) {
    if (error.errors) {
      return validationErrorResponse(error.errors);
    }
    console.error("Error updating kategori:", error);
    return errorResponse("Terjadi kesalahan saat memperbarui kategori", 500);
  }
}

// DELETE /api/kategori/[id] - Delete kategori
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Protect endpoint
  const protection = await protectApiEndpoint(
    request,
    PERMISSIONS["kategori:delete"]
  );
  if (protection.error) {
    return errorResponse(protection.error, protection.status);
  }

  try {
    const { id } = await params;
    const kategoriId = parseInt(id);

    // Check if kategori exists
    const existingKategori = await db.select().from(kategori).where(eq(kategori.id, kategoriId)).limit(1);
    if (existingKategori.length === 0) {
      return notFoundResponse("Kategori tidak ditemukan");
    }

    // TODO: Check if kategori is being used by other records
    // This would require checking sub_kategori, arsip_unit, and berkas_arsip tables

    await db.delete(kategori).where(eq(kategori.id, kategoriId));

    return successResponse(null, "Kategori berhasil dihapus");
  } catch (error) {
    console.error("Error deleting kategori:", error);
    return errorResponse("Terjadi kesalahan saat menghapus kategori", 500);
  }
}