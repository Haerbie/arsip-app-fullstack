import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/middleware/auth";
import { Permission, hasPermission } from "@/middleware/auth";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  pagination?: ApiResponse["pagination"]
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    pagination,
  });
}

/**
 * Error response helper
 */
export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

/**
 * Validation error response helper
 */
export function validationErrorResponse(
  errors: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: "Validasi gagal",
      data: errors,
    },
    { status: 400 }
  );
}

/**
 * Unauthorized response helper
 */
export function unauthorizedResponse(
  message: string = "Anda tidak memiliki izin untuk mengakses resource ini"
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 403 }
  );
}

/**
 * Not found response helper
 */
export function notFoundResponse(
  message: string = "Resource tidak ditemukan"
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 404 }
  );
}

/**
 * Parse and validate query parameters
 */
export function parseQueryParams<T extends z.ZodSchema>(
  request: NextRequest,
  schema: T
): z.infer<T> {
  const { searchParams } = new URL(request.url);
  const params: Record<string, any> = {};

  for (const [key, value] of searchParams.entries()) {
    // Handle array parameters (e.g., filter[key]=value1&filter[key]=value2)
    if (key.includes('[') && key.includes(']')) {
      const matches = key.match(/([^\[]+)\[([^\]]+)\]/);
      if (matches) {
        const [, parentKey, childKey] = matches;
        if (!params[parentKey]) params[parentKey] = {};
        params[parentKey][childKey] = value;
      }
    } else {
      params[key] = value;
    }
  }

  return schema.parse(params);
}

/**
 * Parse and validate request body
 */
export async function parseRequestBody<T extends z.ZodSchema>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      throw new ValidationError(errors);
    }
    throw error;
  }
}

/**
 * Custom validation error
 */
export class ValidationError extends Error {
  constructor(public errors: Record<string, string[]>) {
    super("Validation error");
    this.name = "ValidationError";
  }
}

/**
 * Get pagination parameters from query
 */
export function getPaginationParams(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url);
  return {
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "10"),
    search: searchParams.get("search") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
  };
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): ApiResponse["pagination"] {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
  };
}

/**
 * Apply search filter to query (for string columns)
 */
export function applySearchFilter(
  query: any,
  searchColumns: string[],
  searchTerm?: string
) {
  if (searchTerm && searchColumns.length > 0) {
    const searchConditions = searchColumns.map(column =>
      `${column} LIKE ${`'%${searchTerm}%'`}`
    );
    query = query.where(`(${searchConditions.join(' OR ')})`);
  }
  return query;
}

/**
 * Apply sorting to query
 */
export function applySorting(
  query: any,
  sortBy?: string,
  sortOrder: "asc" | "desc" = "desc"
) {
  if (sortBy) {
    query = query.orderBy(`${sortBy} ${sortOrder.toUpperCase()}`);
  }
  return query;
}

/**
 * Apply pagination to query
 */
export function applyPagination(query: any, page: number, limit: number) {
  const offset = (page - 1) * limit;
  return query.limit(limit).offset(offset);
}

/**
 * Protect API endpoint with authentication and permission check
 */
export async function protectApiEndpoint(
  request: NextRequest,
  requiredPermission?: Permission,
  requiredRoles?: string[]
) {
  const session = await getCurrentSession(request);

  if (!session) {
    return {
      error: "Anda harus login untuk mengakses endpoint ini",
      status: 401,
    };
  }

  if (requiredPermission && !hasPermission(session.user.role as any, requiredPermission)) {
    return {
      error: "Anda tidak memiliki izin untuk mengakses resource ini",
      status: 403,
    };
  }

  if (requiredRoles && !requiredRoles.includes(session.user.role)) {
    return {
      error: "Anda tidak memiliki role yang tepat untuk mengakses resource ini",
      status: 403,
    };
  }

  return { session };
}