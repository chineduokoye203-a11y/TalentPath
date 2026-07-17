import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { learningService } from "@/features/learning/services/learning.service";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { Badge } from "@/components/Badge/Badge";
import { enrollInCourseAction } from "@/features/learning/actions/learning.actions";
import { CancelEnrollmentButton } from "./CancelEnrollmentButton";
import type { Course } from "@/features/learning/types/learning.types";
import styles from "./learning.module.css";
import { ArrowRight, X } from "lucide-react";
import { SearchInput } from "./SearchInput";

function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function CourseCard({ course, enroll }: { course: Course; enroll?: boolean }) {
  return (
    <div
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
          style={{
            width: "100%",
            height: "160px",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
      <div style={{ padding: "1rem" }}>
        <h3
          style={{
            fontSize: "var(--font-size-body)",
            fontWeight: "var(--font-weight-bold)",
            marginBottom: "0.5rem",
            lineHeight: 1.3,
          }}
        >
          {course.title}
        </h3>

        {course.instructor && (
          <p
            style={{
              fontSize: "var(--font-size-body-sm)",
              color: "var(--color-on-surface-variant)",
              marginBottom: "0.125rem",
            }}
          >
            By {course.instructor}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginBottom: "0.3125rem",
            alignItems: "center",
          }}
        >
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
            <span
              style={{
                fontSize: "var(--font-size-body-sm)",
                color: "var(--color-on-surface-variant)",
              }}
            >
              {formatDuration(course.duration)}
            </span>
          )}
        </div>

        <p
          style={{
            fontSize: "var(--font-size-body-sm)",
            color: "var(--color-on-surface-variant)",
            marginBottom: "1rem",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {course.description}
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {enroll !== false && (
            <form action={enrollInCourseAction} style={{ margin: 0, padding: 0 }}>
              <input type="hidden" name="courseId" value={course.id} />
              <input type="hidden" name="courseTitle" value={course.title} />
              <input type="hidden" name="courseDescription" value={course.description} />
              <input type="hidden" name="courseUrl" value={course.url} />
              <input type="hidden" name="courseProvider" value={course.provider} />
              <input type="hidden" name="courseImageUrl" value={course.imageUrl} />
              <input type="hidden" name="courseInstructor" value={course.instructor} />
              <input type="hidden" name="courseDuration" value={String(course.duration)} />
              <input type="hidden" name="courseCategory" value={course.category} />
              <input type="hidden" name="courseLevel" value={course.level} />
              <button
                type="submit"
                className={styles.enrollButton}
              >
                Enroll
              </button>
            </form>
          )}
          <a
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "8px 16px",
              color: "var(--color-primary)",
              fontWeight: 500,
              textDecoration: "none",
              fontSize: "var(--font-size-body-sm)",
              marginLeft: "auto",
            }}
          >
            View on Udemy <ArrowRight size={14} style={{ marginLeft: "4px" }} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default async function LearningPage(props: { searchParams?: Promise<{ q?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth?mode=login");

  const searchParams = await props.searchParams;
  const searchQuery = searchParams?.q;

  const enrollments = await learningService.getEmployeeEnrollments(session.user.id);

  let searchResults: Course[] = [];
  let recommendedCourses: Course[] = [];
  let popularCourses: Course[] = [];

  if (searchQuery) {
    searchResults = await learningService.searchExternalCourses(searchQuery);
  } else {
    recommendedCourses = await learningService.getRecommendedCourses(session.user.id);
    popularCourses = await learningService.getPopularCourses(session.user.id);
  }

  return (
    <div>
      <PageHeader
        title="Learning & Development"
        description="Discover courses from Udemy Business, enroll, and track your progress."
      />

      <form
        method="GET"
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "2rem",
        }}
      >
        <SearchInput defaultValue={searchQuery ?? ""} />
        <button
          type="submit"
          style={{
            cursor: "pointer",
            padding: "10px 24px",
            background: "var(--color-primary)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontWeight: 500,
            fontSize: "var(--font-size-body)",
          }}
        >
          Search Udemy
        </button>
      </form>

      {searchQuery ? (
        <div data-search-results>
          {searchResults.length > 0 ? (
            <>
              <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "1rem" }}>
                Search Results for &quot;{searchQuery}&quot;
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1rem",
                  marginBottom: "3rem",
                }}
              >
                {searchResults.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "2rem" }}>
              No courses found for &quot;{searchQuery}&quot; on Udemy Business.
            </p>
          )}
        </div>
      ) : (
        <>
          {recommendedCourses.length > 0 && (
            <>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Recommended for You</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1rem",
                  marginBottom: "3rem",
                }}
              >
                {recommendedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}

          {popularCourses.length > 0 && (
            <>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Popular in Your Company</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1rem",
                  marginBottom: "3rem",
                }}
              >
                {popularCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>My Enrollments</h2>
      {enrollments.length === 0 ? (
        <p
          style={{
            fontSize: "var(--font-size-body)",
            color: "var(--color-on-surface-variant)",
            marginBottom: "1rem",
          }}
        >
          You are not enrolled in any course yet. Search for a course above and click Enroll to get started.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {enrollments.map((e) => (
            <div
              key={e.id}
              className={styles.enrollmentCard}
              style={{
                border: "1px solid var(--color-outline-variant)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                background: "var(--color-surface)",
              }}
            >
              {e.resource?.imageUrl && (
                <img
                  src={e.resource.imageUrl}
                  alt={e.resource.title}
                  style={{
                    width: "100%",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "0.75rem",
                    display: "block",
                  }}
                />
              )}
              <h3 style={{ fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-bold)", marginBottom: "0.5rem" }}>
                {e.resource?.title ?? "Untitled"}
              </h3>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
            marginBottom: "0.25rem",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--font-size-body-sm)",
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  {e.resource?.provider ?? "Unknown"}
                </span>
                <span style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-primary)", fontWeight: 500 }}>
                  {e.status === "COMPLETED" ? "Completed" : e.status === "IN_PROGRESS" ? "In progress" : e.status.replace("_", " ").toLowerCase()}
                </span>
              </div>
              {e.resource?.url && (
                <a
                  href={e.resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: "var(--font-size-body-sm)",
                    color: "var(--color-primary)",
                    fontWeight: 500,
                    textDecoration: "none",
                    marginTop: "var(--spacing-sm)",
                  }}
                >
                  Continue on Udemy <ArrowRight size={14} style={{ marginLeft: "4px" }} />
                </a>
              )}
              {e.status !== "COMPLETED" && (
                <CancelEnrollmentButton enrollmentId={e.id} className={styles.cancelButton} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
