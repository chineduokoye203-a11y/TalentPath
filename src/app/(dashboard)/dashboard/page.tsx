"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInvitationSchema, type CreateInvitationInput } from "@/features/identity/validations/invitation.schema";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { Card } from "@/components/Card/Card";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { Select } from "@/components/Select/Select";
import { Modal } from "@/components/Modal/Modal";

import { enrollInCourseAction } from "@/features/learning/actions/learning.actions";
import { UserPlus, Users, BookOpen, Map, Compass, ArrowRight, Sparkles } from "lucide-react";
import dashboardStyles from "./dashboard.module.css";

interface Department { id: string; name: string; }
interface Team { id: string; name: string; }

const roleOptions = [{ value: "EMPLOYEE", label: "Employee" }, { value: "MANAGER", label: "Line Manager" }];

interface RecommendedCourse {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  instructor: string;
  duration: number;
  category: string;
  level: string;
  provider: string;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function RecommendedCourses() {
  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recommendations/courses")
      .then((r) => r.json())
      .then((j) => { if (j.success) setCourses(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card title="Recommended For You">
        <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>Loading recommendations...</p>
      </Card>
    );
  }

  if (courses.length === 0) return null;

  return (
    <Card
      title="Recommended For You"
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", color: "var(--color-on-surface-variant)", fontSize: "var(--font-size-body-sm)" }}>
          <Sparkles size={14} />
          <span>AI-powered</span>
        </div>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "var(--spacing-md)",
        }}
      >
        {courses.map((course) => (
          <div
            key={course.id}
            style={{
              border: "1px solid var(--color-outline-variant)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              background: "var(--color-surface)",
              transition: "box-shadow 150ms ease",
            }}
          >
            {course.imageUrl && (
              <img
                src={course.imageUrl}
                alt={course.title}
                style={{ width: "100%", height: "160px", objectFit: "cover", display: "block" }}
              />
            )}
            <div style={{ padding: "1rem" }}>
              <h3 style={{ fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-bold)", marginBottom: "0.5rem", lineHeight: 1.3 }}>
                {course.title}
              </h3>
              {course.instructor && (
                <p style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)", marginBottom: "0.125rem" }}>
                  By {course.instructor}
                </p>
              )}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.3125rem", alignItems: "center" }}>
                {course.category && (
                  <span style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-primary)", fontWeight: 500 }}>
                    {course.category}
                  </span>
                )}
                {course.category && (course.level || course.duration > 0) && (
                  <span style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface)", fontWeight: 700 }}>|</span>
                )}
                {course.level && (
                  <span style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)", fontWeight: 500 }}>
                    {course.level}
                  </span>
                )}
                {course.level && course.duration > 0 && (
                  <span style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface)", fontWeight: 700 }}>|</span>
                )}
                {course.duration > 0 && (
                  <span style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>
                    {formatDuration(course.duration)}
                  </span>
                )}
              </div>
              {course.description && (
                <p style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)", marginBottom: "1rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {course.description}
                </p>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <form action={enrollInCourseAction} style={{ margin: 0, padding: 0 }}>
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="courseTitle" value={course.title} />
                  <input type="hidden" name="courseDescription" value={course.description} />
                  <input type="hidden" name="courseUrl" value={course.url} />
                  <input type="hidden" name="courseProvider" value={course.provider ?? ""} />
                  <input type="hidden" name="courseImageUrl" value={course.imageUrl ?? ""} />
                  <input type="hidden" name="courseInstructor" value={course.instructor ?? ""} />
                  <input type="hidden" name="courseDuration" value={String(course.duration)} />
                  <input type="hidden" name="courseCategory" value={course.category} />
                  <input type="hidden" name="courseLevel" value={course.level} />
                  <button
                    type="submit"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "8px 16px",
                      background: "var(--color-primary)",
                      color: "var(--color-on-primary)",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      fontWeight: "var(--font-weight-medium)",
                      fontSize: "var(--font-size-body-sm)",
                      cursor: "pointer",
                      transition: "all 150ms ease",
                    }}
                  >
                    Enroll
                  </button>
                </form>
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", padding: "8px 0", color: "var(--color-primary)", fontWeight: 500, textDecoration: "none", fontSize: "var(--font-size-body-sm)" }}
                >
                  View on Udemy <ArrowRight size={14} style={{ marginLeft: "4px" }} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function DashboardHomePage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "var(--color-on-surface-variant)" }}>Loading...</div>}>
      <DashboardHomeContent />
    </Suspense>
  );
}

function DashboardHomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth?mode=login");
  }, [status, router]);

  const role = (session?.user as any)?.role;
  const rawName = session?.user?.name || "User";
  const name = role === "HR" ? rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase() : rawName;

  const [serverError, setServerError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    fetch("/api/departments").then((r) => r.json()).then((j) => { if (j.success) setDepartments(j.data); }).catch(() => {});
    fetch("/api/teams").then((r) => r.json()).then((j) => { if (j.success) setTeams(j.data); }).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateInvitationInput>({
    resolver: zodResolver(createInvitationSchema),
  });

  const onSubmit = async (data: CreateInvitationInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        reset();
        setShowInviteModal(false);
        setTimeout(() => {
          setInviteSuccess(true);
          setTimeout(() => {
            setInviteSuccess(false);
            router.push("/admin/invitations");
          }, 10000);
        }, 300);
      } else {
        setServerError(json.error?.message || "Failed to create invitation");
      }
    } catch {
      setServerError("An error occurred");
    }
  };

  if (!session) return null;

  if (role === "HR") {
    return (
      <div>
        <PageHeader
          title={`Welcome back, ${name}`}
          description="Manage your workforce and develop talent."
          action={
            <Button onClick={() => setShowInviteModal(true)}>
              <UserPlus size={16} style={{ marginRight: "var(--spacing-xs)" }} /> Invite New Users
            </Button>
          }
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <Card title="Invite Users" className={dashboardStyles.hrCard}>
            <div style={{ padding: "1rem 0" }}>
              <p style={{ marginBottom: "1rem" }}>Bring your team members onboard to start building your talent pool.</p>
              <Button onClick={() => setShowInviteModal(true)}>
                <UserPlus size={16} style={{ marginRight: "var(--spacing-xs)" }} /> Invite New Users
              </Button>
            </div>
          </Card>

          <Card title="Workforce Overview" className={dashboardStyles.hrCard}>
            <div style={{ padding: "1rem 0" }}>
              <p style={{ marginBottom: "1rem" }}>View skills, gaps, and development across your entire organization.</p>
              <Link href="/workforce" style={{ color: "var(--color-primary)", fontWeight: "var(--font-weight-semibold)", display: "inline-flex", alignItems: "center", gap: "var(--spacing-xs)" }}>
                View Workforce Analytics <ArrowRight size={16} />
              </Link>
            </div>
          </Card>

          <Card title="Team Skills" className={dashboardStyles.hrCard}>
            <div style={{ padding: "1rem 0" }}>
              <p style={{ marginBottom: "1rem" }}>Track skill development and identify gaps across teams.</p>
              <Link href="/team" style={{ color: "var(--color-primary)", fontWeight: "var(--font-weight-semibold)", display: "inline-flex", alignItems: "center", gap: "var(--spacing-xs)" }}>
                Manage Skills <ArrowRight size={16} />
              </Link>
            </div>
          </Card>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <RecommendedCourses />
        </div>

        <Modal isOpen={showInviteModal} onClose={() => { setShowInviteModal(false); setServerError(null); }} title="Create Invitation" size="lg">
          {serverError && <div style={{ color: "var(--color-error)", marginBottom: "var(--spacing-sm)" }}>{serverError}</div>}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
              <Input label="First Name" error={errors.firstName?.message} {...register("firstName")} />
              <Input label="Last Name" error={errors.lastName?.message} {...register("lastName")} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
              <Input label="Work Email" type="email" error={errors.email?.message} {...register("email")} />
              <Select label="Role" error={errors.role?.message} options={roleOptions} {...register("role")} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
              <Select label="Department" options={departments.map((d) => ({ label: d.name, value: d.id }))} {...register("departmentId")} />
              <Input label="Job Title" {...register("jobTitle")} />
            </div>
            <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "flex-end", marginTop: "var(--spacing-md)" }}>
              <Button variant="secondary" type="button" onClick={() => { setShowInviteModal(false); setServerError(null); }}>Cancel</Button>
              <Button type="submit" isLoading={isSubmitting}>Send Invitation</Button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={inviteSuccess} onClose={() => { setInviteSuccess(false); router.push("/admin/invitations"); }} title="Invitation Sent" size="sm">
          <div style={{ textAlign: "center", padding: "var(--spacing-md) 0" }}>
            <p style={{ margin: 0, fontSize: "var(--font-size-body)", color: "var(--color-on-surface)" }}>User has been invited successfully.</p>
            <p style={{ margin: "var(--spacing-sm) 0 0 0", fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>Redirecting to invitations page...</p>
          </div>
        </Modal>
      </div>
    );
  }

  if (role === "MANAGER") {
    return (
      <div>
        
        <PageHeader title={`Welcome back, ${name}`} description="Manager Dashboard — guide your team's growth and development." />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <Card title="My Team">
            <div style={{ padding: "1rem 0" }}>
              <p style={{ marginBottom: "1rem" }}>View your team members, their skills, and development progress.</p>
              <Link href="/team" style={{ color: "var(--color-primary)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "var(--spacing-xs)" }}>
                <Users size={16} /> View Team &rarr;
              </Link>
            </div>
          </Card>

          <Card title="Skills Progress">
            <div style={{ padding: "1rem 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span>Profile Completion</span>
                <span>80%</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "var(--color-surface-variant)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: "80%", height: "100%", background: "var(--color-primary)" }} />
              </div>
            </div>
          </Card>

          <Card title="Next Learning Goal">
            <p style={{ margin: "1rem 0" }}>Complete "Leadership Fundamentals" by end of week.</p>
            <Link href="/learning" style={{ color: "var(--color-primary)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "var(--spacing-xs)" }}>
              <BookOpen size={16} /> Go to Learning &rarr;
            </Link>
          </Card>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <RecommendedCourses />
        </div>
      </div>
    );
  }

  return (
    <div>
      
      <PageHeader title={`Welcome back, ${name}`} description="Here is your personalized workforce development overview." />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <Card title="Skills Progress">
          <div style={{ padding: "1rem 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span>Profile Completion</span>
              <span>80%</span>
            </div>
            <div style={{ width: "100%", height: "8px", background: "var(--color-surface-variant)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: "80%", height: "100%", background: "var(--color-primary)" }} />
            </div>
          </div>
        </Card>

        <Card title="Next Learning Goal">
          <p style={{ margin: "1rem 0" }}>Complete "Leadership Fundamentals" by end of week.</p>
          <Link href="/learning" style={{ color: "var(--color-primary)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "var(--spacing-xs)" }}>
            <BookOpen size={16} /> Go to Learning &rarr;
          </Link>
        </Card>

          <Card title="Career Track">
            <p style={{ margin: "1rem 0" }}>You are on track for Senior Engineer. 2 skills need development.</p>
            <Link href="/career" style={{ color: "var(--color-primary)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "var(--spacing-xs)" }}>
              <Map size={16} /> View Career Path &rarr;
            </Link>
          </Card>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <RecommendedCourses />
        </div>
      </div>
    );
  }
