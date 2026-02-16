/**
 * Sanitizes vehicle payload based on categorySlug.
 *
 * WHY a separate utility?
 * Both POST (create) and PATCH (update) need the same logic.
 * Doing it here means one place to maintain, zero duplication.
 *
 * HOW admin APIs handle this:
 * 1. API receives raw body from admin
 * 2. This function strips fields that don't belong to the category
 * 3. Cleaned body goes to Mongoose
 * 4. Schema-level validation is the final guard (rejects if wrong fields survive)
 *
 * Two layers of protection: API sanitization + schema validation.
 */
export function sanitizeVehiclePayload(body: Record<string, any>) {
  const category = body.categorySlug;

  if (category === "ev") {
    // Strip ICE fields — EV cannot have these
    delete body.engine;
    delete body.performance;
  } else if (category === "scooter" || category === "motorcycle") {
    // Strip EV fields — ICE cannot have these
    delete body.electric;
  }

  return body;
}

/**
 * Extracts readable validation errors from Mongoose ValidationError.
 */
export function formatValidationError(error: any): string | null {
  if (error.name === "ValidationError" && error.errors) {
    const messages = Object.values(error.errors).map(
      (e: any) => e.message
    );
    return messages.join(". ");
  }
  return null;
}
