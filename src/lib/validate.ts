import { z } from "zod";
import { ValidationError } from "./errors";

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    // Join all error messages for a clearer response
    const errorMessages = result.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    throw new ValidationError(errorMessages || "Validation failed");
  }
  return result.data;
}
