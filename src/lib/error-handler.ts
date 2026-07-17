import { NextResponse } from "next/server";
import { AppError } from "./errors";
import { logger } from "./logger";

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger("error", error.message, { stack: error.stack, code: error.code });
    } else {
      logger("warn", error.message, { code: error.code });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.statusCode },
    );
  }

  logger("error", "Unhandled error occurred", { error });

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 },
  );
}
