import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAuth } from "@/lib/authorize";
import { db } from "@/lib/db";
import { skillService } from "@/features/skills/services/skill.service";
import { addSkillSchema } from "@/features/skills/validations/skill.schema";

async function getDefaultCategoryId() {
  let category = await db.skillCategory.findFirst({ where: { name: "General" } });
  if (!category) {
    category = await db.skillCategory.create({ data: { name: "General", description: "Default category for skills" } });
  }
  return category.id;
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const formData = await request.formData();

    const skillName = formData.get("skillName") as string;
    const description = formData.get("description") as string | null;
    const level = Number(formData.get("level"));
    const file = formData.get("evidence") as File | null;

    const parsed = addSkillSchema.parse({ skillName, description: description || undefined, level });

    let evidenceUrl: string | undefined;

    if (file && file.size > 0) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: { message: "File must be PDF, PNG, or JPEG" } },
          { status: 400 },
        );
      }

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadsDir, fileName), buffer);

      evidenceUrl = `/uploads/${fileName}`;
    }

    let skill = await db.skill.findFirst({
      where: { name: parsed.skillName, deletedAt: null },
    });

    if (!skill) {
      const categoryId = await getDefaultCategoryId();
      skill = await skillService.createSkill(
        { name: parsed.skillName, description: parsed.description, categoryId },
        session.user.id,
      );
    }

    const assessment = await skillService.assessSkill(session.user.id, {
      skillId: skill.id,
      level: parsed.level,
      evidence: evidenceUrl,
    });

    return NextResponse.json({ success: true, data: assessment });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || "An error occurred" } },
      { status: error.name === "ZodError" ? 400 : 500 },
    );
  }
}
