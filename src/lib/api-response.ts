import { NextResponse } from "next/server";

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function isNextBailoutError(error: unknown): boolean {
  if (typeof error === "object" && error !== null) {
    if ("digest" in error && typeof (error as { digest?: unknown }).digest === "string") {
      const digest = (error as { digest: string }).digest;
      if (digest.startsWith("NEXT_")) return true;
    }
    if ("message" in error && typeof (error as { message?: unknown }).message === "string") {
      const msg = (error as { message: string }).message;
      if (msg.includes("bail out of prerendering")) return true;
    }
  }
  return false;
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {

  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  code = "BAD_REQUEST",
  status = 400,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

