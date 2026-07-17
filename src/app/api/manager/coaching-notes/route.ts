import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authorize";
import { handleError } from "@/lib/error-handler";

interface CoachingNote {
  id: string;
  managerId: string;
  employeeId: string;
  content: string;
  createdAt: string;
}

const coachingNotes: CoachingNote[] = [];

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "employeeId query parameter is required" },
        },
        { status: 400 },
      );
    }

    const notes = coachingNotes
      .filter((note) => note.employeeId === employeeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const body = await request.json();

    const { employeeId, content } = body;

    if (!employeeId || !content) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "employeeId and content are required" },
        },
        { status: 400 },
      );
    }

    const note: CoachingNote = {
      id: `coaching-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      managerId: userId,
      employeeId,
      content,
      createdAt: new Date().toISOString(),
    };

    coachingNotes.push(note);

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
