import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  industry: z.string().min(1, "Industry is required"),
  size: z.string().min(1, "Company size is required"),
  departments: z.array(z.string()).optional(),
  logo: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: "AUTH_ERROR", message: "User ID is required" } }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: userId }, include: { company: true, department: true } });
    if (!user || !user.companyId) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "User or company not found" } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { name: user.company?.name || "", departmentId: user.departmentId || "", departmentName: user.department?.name || "" } }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch organization" } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = organizationSchema.parse(body);

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: "AUTH_ERROR", message: "User ID is required" } }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: userId }, include: { company: true } });
    if (!user || !user.companyId) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "User or company not found" } }, { status: 404 });
    }

    const company = await db.company.update({
      where: { id: user.companyId },
      data: {
        name: data.name,
        industry: data.industry,
        size: data.size,
        logo: data.logo || null,
      },
    });

    if (data.departments && data.departments.length > 0) {
      for (const deptName of data.departments) {
        const existing = await db.department.findFirst({
          where: { name: deptName },
        });
        if (!existing) {
          await db.department.create({
            data: { name: deptName },
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: company }, { status: 200 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: error.issues.map((e: any) => e.message).join("; ") } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to save organization settings" } }, { status: 500 });
  }
}
