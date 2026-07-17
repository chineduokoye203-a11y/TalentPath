import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authorize";
import { skillService } from "@/features/skills/services/skill.service";
import { assessSkillSchema } from "@/features/skills/validations/skill.schema";
import { NotFoundError } from "@/lib/errors";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ skillId: string }> },
) {
  try {
    const session = await requireAuth();
    const { skillId } = await params;

    const userId = (session.user as { id: string }).id;
    await skillService.removeSkill(userId, skillId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: { message: "Skill assessment not found" } },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { success: false, error: { message: error.message || "An error occurred" } },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ skillId: string }> },
) {
  try {
    const session = await requireAuth();
    const { skillId } = await params;

    const body = await request.json();
    const data = assessSkillSchema.parse({
      skillId,
      level: body.level,
      evidence: body.evidence,
    });

    const userId = (session.user as { id: string }).id;
    const updated = await skillService.updateSkill(userId, skillId, {
      level: data.level,
      evidence: data.evidence,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: { message: "Skill assessment not found" } },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { success: false, error: { message: error.message || "An error occurred" } },
      { status: error.name === "ZodError" ? 400 : 500 },
    );
  }
}
