import { NextResponse } from "next/server";
import { userService } from "@/features/identity/services/user.service";
import { requireRole } from "@/lib/authorize";
import { handleError } from "@/lib/error-handler";

export async function GET(request: Request) {
  try {
    await requireRole(["HR", "ADMINISTRATOR"]);

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const take = parseInt(searchParams.get("take") || "20", 10);

    const result = await userService.listUsers(skip, take);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return handleError(error);
  }
}
