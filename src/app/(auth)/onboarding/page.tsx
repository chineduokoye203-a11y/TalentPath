"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { DropdownSelect } from "@/components/DropdownSelect/DropdownSelect";
import { Card } from "@/components/Card/Card";
import { Path } from "@phosphor-icons/react";
import { ArrowRight, Check, Plus, Trash2, X } from "lucide-react";
import { Modal } from "@/components/Modal/Modal";
import styles from "../login/login.module.css";
import authStyles from "../auth/auth.module.css";
import onboardingStyles from "./onboarding.module.css";

const companySizes = [
  { label: "1–50", value: "1-50" },
  { label: "51–200", value: "51-200" },
  { label: "201–500", value: "201-500" },
  { label: "501–1000", value: "501-1000" },
  { label: "1000+", value: "1000+" },
];

const roles = [
  { label: "Employee", value: "EMPLOYEE" },
  { label: "Manager", value: "MANAGER" },
  { label: "HR", value: "HR" },
];

const proficiencyLevels = [
  { label: "Beginner (1)", value: "1" },
  { label: "Elementary (2)", value: "2" },
  { label: "Intermediate (3)", value: "3" },
  { label: "Advanced (4)", value: "4" },
  { label: "Expert (5)", value: "5" },
];

const careerGoals = [
  { label: "Advance to senior role", value: "senior_role" },
  { label: "Transition to management", value: "management" },
  { label: "Deepen technical expertise", value: "technical_expertise" },
  { label: "Move to different department", value: "department_change" },
  { label: "Lead strategic initiatives", value: "strategic_initiatives" },
  { label: "Develop leadership skills", value: "leadership_skills" },
];

interface Department {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  departmentId: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const userRole = (session?.user as any)?.role;
  const isEmployee = userRole === "EMPLOYEE";
  const isManager = userRole === "MANAGER";
  const isSessionLoaded = status !== "loading";

  if (!isSessionLoaded) {
    return (
      <div className={styles.container}>
        <p style={{ color: "var(--color-on-surface-variant)", textAlign: "center" }}>Loading...</p>
      </div>
    );
  }

  const [orgForm, setOrgForm] = useState({ name: "", industry: "", size: "" });
  const [orgErrors, setOrgErrors] = useState<Record<string, string>>({});
  const [newDepartments, setNewDepartments] = useState<string[]>([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [inviteForm, setInviteForm] = useState({ fullName: "", email: "", role: "EMPLOYEE", department: "", jobTitle: "" });
  const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({});

  const [skills, setSkills] = useState<Array<{ id: string; name: string; category: { name: string } }>>([]);
  const [selectedSkills, setSelectedSkills] = useState<Array<{ skillId: string; level: number }>>([]);
  const [skillErrors, setSkillErrors] = useState<string | null>(null);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [modalSkillName, setModalSkillName] = useState("");
  const [modalSkillLevel, setModalSkillLevel] = useState("3");

  const [careerForm, setCareerForm] = useState({ targetRole: "", careerGoal: "" });
  const [careerErrors, setCareerErrors] = useState<Record<string, string>>({});

  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [departmentSize, setDepartmentSize] = useState("");
  const [teamErrors, setTeamErrors] = useState<Record<string, string>>({});
  const [teamSaving, setTeamSaving] = useState(false);

  const filteredTeams = teams.filter((t) => t.departmentId === selectedDepartmentId);

  useEffect(() => {
    if (isEmployee || isManager) {
      fetch("/api/skills")
        .then((res) => res.json())
        .then((json) => { if (json.success) setSkills(json.data?.skills || []); })
        .catch(() => {});
      if (isEmployee) {
        fetch("/api/departments")
          .then((res) => res.json())
          .then((json) => { if (json.success) setDepartments(json.data || []); })
          .catch(() => {});
      }
      if (isManager) {
        const userId = (session?.user as any)?.id;
        if (userId) {
          fetch(`/api/onboarding/organization?userId=${userId}`)
            .then((res) => res.json())
            .then((json) => {
              if (json.success && json.data) {
                if (json.data.departmentId) setSelectedDepartmentId(json.data.departmentId);
                if (json.data.departmentName) setOrgForm((prev) => ({ ...prev, name: json.data.departmentName }));
              }
            })
            .catch(() => {});
        }
      }
    } else {
      const companyName = (session?.user as any)?.companyName;
      if (companyName) {
        setOrgForm((prev) => ({ ...prev, name: companyName }));
        return;
      }
      const userId = (session?.user as any)?.id;
      if (!userId) return;
      fetch(`/api/onboarding/organization?userId=${userId}`)
        .then((res) => res.json())
        .then((json) => { if (json.success && json.data?.name) setOrgForm((prev) => ({ ...prev, name: json.data.name })); })
        .catch(() => {});
    }
  }, [session, isEmployee, isManager]);

  useEffect(() => {
    if (isManager && step === 2) {
      fetch("/api/departments")
        .then((res) => res.json())
        .then((json) => { if (json.success) setDepartments(json.data || []); })
        .catch(() => {});
      fetch("/api/teams")
        .then((res) => res.json())
        .then((json) => { if (json.success) setTeams(json.data || []); })
        .catch(() => {});
    }
  }, [isManager, step]);

  const updateOrg = (field: string, value: string) => {
    setOrgForm((prev) => ({ ...prev, [field]: value }));
    if (orgErrors[field]) {
      setOrgErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleOrgSubmit = async () => {
    setServerError(null);
    const errors: Record<string, string> = {};
    if (!orgForm.industry) errors.industry = "This field cannot be empty";
    if (!orgForm.size) errors.size = "This field cannot be empty";
    setOrgErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const userId = (session?.user as any)?.id;
      const res = await fetch(`/api/onboarding/organization?userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orgForm, departments: newDepartments }),
      });
      const json = await res.json();
      if (json.success) setStep(2);
      else setServerError(json.error?.message || "Failed to save organization settings");
    } catch {
      setServerError("An error occurred. Please try again.");
    }
  };

  const addDepartment = () => {
    const name = newDepartment.trim();
    if (!name) return;
    if (newDepartments.includes(name)) return;
    setNewDepartments([...newDepartments, name]);
    setNewDepartment("");
  };

  const removeDepartment = (dept: string) => {
    setNewDepartments(newDepartments.filter((d) => d !== dept));
  };

  const updateInvite = (field: string, value: string) => {
    setInviteForm((prev) => ({ ...prev, [field]: value }));
    if (inviteErrors[field]) {
      setInviteErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleInvite = async () => {
    setServerError(null);
    const errors: Record<string, string> = {};
    if (!inviteForm.fullName) errors.fullName = "This field cannot be empty";
    if (!inviteForm.email) errors.email = "This field cannot be empty";
    setInviteErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const nameParts = inviteForm.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName, lastName, email: inviteForm.email,
          role: inviteForm.role === "EMPLOYEE" ? "EMPLOYEE" : inviteForm.role === "MANAGER" ? "MANAGER" : "HR",
          departmentId: inviteForm.department || undefined,
          jobTitle: inviteForm.jobTitle || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) setInviteSuccess(true);
      else setServerError(json.error?.message || "Failed to send invitation");
    } catch {
      setServerError("An error occurred. Please try again.");
    }
  };

  const handleSkipInvite = () => setStep(3);

  const addSkill = () => {
    if (selectedSkills.length >= 4) return;
    setModalSkillName("");
    setModalSkillLevel("");
    setSkillModalOpen(true);
  };

  const confirmAddSkill = () => {
    if (!modalSkillName.trim() || !modalSkillLevel) return;
    setSelectedSkills((prev) => [...prev, { skillId: modalSkillName.trim(), level: parseInt(modalSkillLevel) || 3 }]);
    setSkillModalOpen(false);
  };

  const updateSkill = (index: number, field: string, value: string | number) => {
    setSelectedSkills((prev) => prev.map((s, i) => i === index ? { ...s, [field]: field === "level" ? parseInt(value as string) || 3 : value } : s));
    setSkillErrors(null);
  };

  const removeSkill = (index: number) => {
    setSelectedSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSkillsSubmit = async () => {
    setServerError(null);
    setSkillErrors(null);
    const validSkills = selectedSkills.filter((s) => s.skillId);
    try {
      const res = await fetch("/api/onboarding/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: validSkills }),
      });
      const json = await res.json();
      if (json.success) {
        if (isManager) {
          setStep(2);
        } else {
          setStep(3);
        }
      } else {
        setServerError(json.error?.message || "Failed to save skills");
      }
    } catch {
      setServerError("An error occurred. Please try again.");
    }
  };

  const updateCareer = (field: string, value: string) => {
    setCareerForm((prev) => ({ ...prev, [field]: value }));
    if (careerErrors[field]) {
      setCareerErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleCareerSubmit = async () => {
    setServerError(null);
    const errors: Record<string, string> = {};
    if (!careerForm.targetRole) errors.targetRole = "This field cannot be empty";
    if (!careerForm.careerGoal) errors.careerGoal = "This field cannot be empty";
    setCareerErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const res = await fetch("/api/onboarding/career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(careerForm),
      });
      const json = await res.json();
      if (json.success) setStep(2);
      else setServerError(json.error?.message || "Failed to save career goals");
    } catch {
      setServerError("An error occurred. Please try again.");
    }
  };

  const handleTeamSubmit = async () => {
    setServerError(null);
    setTeamErrors({});
    const errors: Record<string, string> = {};
    if (!selectedDepartmentId) errors.departmentId = "Please select a department";
    setTeamErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setTeamSaving(true);
    try {
      const res = await fetch("/api/onboarding/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departmentId: selectedDepartmentId, departmentSize }),
      });
      const json = await res.json();
      if (json.success) setStep(3);
      else setServerError(json.error?.message || "Failed to save department details");
    } catch {
      setServerError("An error occurred. Please try again.");
    } finally {
      setTeamSaving(false);
    }
  };

  const totalSteps = 3;

  const departmentOptions = [
    ...departments.map((d) => ({ label: d.name, value: d.id })),
    ...newDepartments
      .filter((name) => !departments.some((d) => d.name === name))
      .map((name) => ({ label: name, value: name })),
  ];
  const teamOptions = filteredTeams.map((t) => ({ label: t.name, value: t.id }));

  return (
    <>
    <div className={styles.container}>
      <Card className={`${styles.card} ${onboardingStyles.card} onboarding-input`}>
        <style>{`
          .onboarding-input input,
          .onboarding-input select {
            padding: clamp(8px, 2.5vw, 12px) clamp(12px, 3.5vw, 20px) !important;
            font-size: clamp(14px, 4vw, 16px) !important;
          }
          .onboarding-input button {
            padding: clamp(8px, 2.5vw, 12px) clamp(12px, 3.5vw, 20px) !important;
            font-size: clamp(14px, 4vw, 16px) !important;
          }
          @media (max-width: 768px) {
            .onboarding-input .nav-link-btn {
              background: none !important;
              border: none !important;
              padding: 0 !important;
              color: var(--color-on-surface) !important;
              font-weight: var(--font-weight-medium) !important;
              flex: none !important;
              width: auto !important;
            }
            .onboarding-input .nav-link-btn:active {
              opacity: 0.6;
            }
            .onboarding-input [class*="navRow"] {
              padding: 0 !important;
            }
          }
        `}</style>
        {serverError && <div className={styles.errorAlert}>{serverError}</div>}
        <div className={authStyles.logo}>
          <div className={authStyles.logoIcon}>
            <Path size={20} weight="fill" />
          </div>
          <span className={authStyles.logoText}>TalentPath</span>
        </div>

        <div style={{ marginBottom: "var(--spacing-lg)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0" }}>
          {[1, 2, 3].map((s) => {
            const completed = isManager
              ? step > s - 1 || (s === 3 && step === 2)
              : isEmployee
                ? step > s - 1
                : step > s - 1 || (s === 3 && step === 2 && inviteSuccess);
            const active = isManager
              ? step >= s - 1
              : isEmployee
                ? step >= s - 1
                : step >= s - 1 || (s === 3 && step === 2 && inviteSuccess);
            return (
              <React.Fragment key={s}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--font-size-body-sm)", fontWeight: "var(--font-weight-semibold)", color: active ? "#fff" : "var(--color-on-surface-variant)", background: active ? "var(--color-primary)" : "var(--color-background)", border: active ? "none" : "1px solid var(--color-outline-variant)" }}>{completed ? <Check size={16} /> : s}</div>
                {s < 3 && <div style={{ width: 48, height: 2, background: step >= s ? "var(--color-primary)" : "var(--color-surface-variant)" }} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step 0: Welcome */}
        {!isEmployee && !isManager && step === 0 && (
          <>
            <h1 className={styles.title}>Welcome to TalentPath!</h1>
            <p className={styles.subtitle}>Identify skill gaps, develop people, track progress, and build leadership pipelines for lasting success.</p>
            <Button onClick={() => setStep(1)} className={styles.submitBtn}>Let's Get Started</Button>
            <button type="button" onClick={() => router.push("/dashboard")} className={`${onboardingStyles.skipLink} ${onboardingStyles.skipOnboarding}`}>Skip Onboarding</button>
          </>
        )}

        {(isEmployee || isManager) && step === 0 && (
          <>
            <h1 className={styles.title}>Welcome to TalentPath!</h1>
            <p className={styles.subtitle}>{isManager ? "You're all set to support your team's learning, development, and career growth." : "Showcase your skills and begin your\u00A0career growth journey."}</p>
            <Button onClick={() => setStep(1)} className={styles.submitBtn}>{isManager ? "Let's Get Started" : "Get Started"}</Button>
            <button type="button" onClick={() => router.push("/dashboard")} className={`${onboardingStyles.skipLink} ${onboardingStyles.skipOnboarding}`}>Skip Onboarding</button>
          </>
        )}

        {/* Step 1: Configure Organization (HR/Leadership/Admin) */}
        {!isEmployee && !isManager && step === 1 && (
          <>
            <h1 className={styles.title}>Configure Your Organization</h1>
            <p className={`${styles.subtitle} ${onboardingStyles.hideMobile}`}>Tell us about your organization so we can personalize your TalentPath workspace.</p>
            <div className={styles.form}>
              <Input label="Organization Name" value={orgForm.name} onChange={(e) => updateOrg("name", e.target.value)} error={orgErrors.name} disabled />
              <Input label="Industry" value={orgForm.industry} onChange={(e) => updateOrg("industry", e.target.value)} error={orgErrors.industry} />
              <DropdownSelect label="Company Size" options={companySizes} value={orgForm.size} onChange={(v) => updateOrg("size", v)} required={false} error={orgErrors.size} />

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)" }}>
                <label style={{ fontSize: "var(--font-size-body-sm)", fontWeight: 500, color: "var(--color-on-surface)" }}>Departments</label>
                <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDepartment(); } }}
                    placeholder="e.g. Engineering, Marketing"
                    className="fieldInput"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={addDepartment}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "var(--spacing-xs)",
                      padding: "var(--spacing-sm) var(--spacing-md)",
                      background: "var(--color-primary)",
                      color: "var(--color-on-primary)",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      fontWeight: 500,
                      fontSize: "var(--font-size-body-sm)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
                {newDepartments.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)", marginTop: "var(--spacing-xs)" }}>
                    {newDepartments.map((dept) => (
                      <div
                        key={dept}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "var(--spacing-sm) var(--spacing-md)",
                          background: "var(--color-inverse-on-surface)",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        <span style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface)" }}>{dept}</span>
                        <button
                          type="button"
                          onClick={() => removeDepartment(dept)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-on-surface-variant)", display: "flex", padding: 0 }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleOrgSubmit} className={styles.submitBtn}>Save & Continue</Button>
              <div style={{ display: "flex", justifyContent: "space-between", marginLeft: "calc(-1 * var(--spacing-md))", width: "calc(100% + var(--spacing-md) * 2)", marginTop: "-8px" }}>
                <button type="button" onClick={() => setStep(0)} className={onboardingStyles.skipLink} style={{ textAlign: "left", padding: 0, width: "auto" }}>Go Back</button>
                <button type="button" onClick={() => setStep(2)} className={onboardingStyles.skipLink} style={{ textAlign: "right", padding: 0, width: "auto" }}>Skip</button>
              </div>
            </div>
          </>
        )}

        {/* Step 1: Set Career Goals (Employee only) */}
        {isEmployee && step === 1 && (
          <>
            <h1 className={styles.title}>Set Career Goals</h1>
            <p className={`${styles.subtitle} ${onboardingStyles.hideMobile}`}>Define where you want to go in your career.</p>
            <div className={styles.form}>
              <Input label="Target Role" value={careerForm.targetRole} onChange={(e) => updateCareer("targetRole", e.target.value)} placeholder="e.g., Senior Software Engineer" error={careerErrors.targetRole} />
              <DropdownSelect label="Primary Career Goal" options={careerGoals} value={careerForm.careerGoal} onChange={(v) => updateCareer("careerGoal", v)} error={careerErrors.careerGoal} />
              <Button onClick={handleCareerSubmit} className={styles.submitBtn}>Save & Continue</Button>
              <div style={{ display: "flex", justifyContent: "space-between", marginLeft: "calc(-1 * var(--spacing-md))", width: "calc(100% + var(--spacing-md) * 2)", marginTop: "-8px" }}>
                <button type="button" onClick={() => setStep(0)} className={onboardingStyles.skipLink} style={{ textAlign: "left", padding: 0, width: "auto" }}>Go Back</button>
                <button type="button" onClick={() => setStep(2)} className={onboardingStyles.skipLink} style={{ textAlign: "right", padding: 0, width: "auto" }}>Skip</button>
              </div>
            </div>
          </>
        )}

        {/* Step 1: Your Role (Manager only) */}
        {isManager && step === 1 && (
          <>
            <h1 className={styles.title}>Support Your Team's Growth</h1>
            <p className={styles.subtitle}>Monitor learning progress, identify skill gaps, and help your team build the skills they need to succeed.</p>
            <Button onClick={() => setStep(2)} className={styles.submitBtn}>Continue</Button>
          </>
        )}

        {/* Step 2: You're Ready (Manager only) */}
        {isManager && step === 2 && (
          <>
            <h1 className={styles.title}>Your Dashboard is Ready</h1>
            <p className={styles.subtitle}>Everything you need to manage your team's development is waiting for you in your dashboard.</p>
            <Button onClick={() => router.push("/dashboard")} className={styles.submitBtn}>Go to Dashboard</Button>
          </>
        )}

        {/* Step 2: Add Skills (Employee only) */}
        {isEmployee && step === 2 && (
          <>
            <h1 className={styles.title}>Add Your Skills</h1>
            <p className={`${styles.subtitle} ${onboardingStyles.hideMobile}`} style={{ marginBottom: "var(--spacing-lg)" }}>Add the skills you have and rate your proficiency level</p>
            <div className={styles.form}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--spacing-md)" }}>
                {selectedSkills.map((selectedSkill, index) => {
                  const level = proficiencyLevels.find((l) => l.value === String(selectedSkill.level));
                  return (
                    <div key={index} style={{ display: "flex", alignItems: "center", padding: "8px 16px", background: "var(--color-on-primary)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "16px", fontWeight: "var(--font-weight-medium)", marginBottom: "4px" }}>{selectedSkill.skillId}</div>
                        <div style={{ fontSize: "12px", color: "var(--color-on-surface-variant)" }}>{level?.label?.split(" ")[0] || "Level"}</div>
                      </div>
                      <button type="button" onClick={() => removeSkill(index)} title="Remove" style={{ cursor: "pointer", background: "none", border: "none", color: "var(--color-error)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", marginLeft: "auto", flexShrink: 0, borderRadius: "var(--radius-sm)" }}>
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
              {selectedSkills.length < 4 && (
                <button
                  type="button"
                  onClick={addSkill}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-outline)")}
                  style={{ background: "none", border: "1px dashed var(--color-outline)", borderRadius: "var(--radius-md)", padding: "var(--spacing-sm)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--spacing-xs)", color: "var(--color-primary)", fontSize: "var(--font-size-body-sm)" }}
                >
                  <Plus size={16} /> {selectedSkills.length === 0 ? "Add Skill" : "Add Another Skill"}
                </button>
              )}
              <Button onClick={handleSkillsSubmit} className={styles.submitBtn}>Complete Onboarding</Button>
              <div style={{ display: "flex", justifyContent: "space-between", marginLeft: "calc(-1 * var(--spacing-md))", width: "calc(100% + var(--spacing-md) * 2)", marginTop: "-8px" }}>
                <button type="button" onClick={() => setStep(1)} className={onboardingStyles.skipLink} style={{ textAlign: "left", padding: 0, width: "auto" }}>Go Back</button>
                <button type="button" onClick={() => setStep(3)} className={onboardingStyles.skipLink} style={{ textAlign: "right", padding: 0, width: "auto" }}>Skip</button>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Invite Users (HR/Leadership/Admin) */}
        {!isEmployee && !isManager && step === 2 && (
          <>
            <h1 className={styles.title}>{inviteSuccess ? "Invitation Sent!" : "Invite Your First User"}</h1>
            {!inviteSuccess ? (
              <>
                <p className={`${styles.subtitle} ${onboardingStyles.hideMobile}`}>Send an invitation to get your team onboarded.</p>
                <div className={styles.form}>
                  <Input label="Full Name" value={inviteForm.fullName} onChange={(e) => updateInvite("fullName", e.target.value)} error={inviteErrors.fullName} />
                  <Input label="Email" type="email" value={inviteForm.email} onChange={(e) => updateInvite("email", e.target.value)} error={inviteErrors.email} />
                  <DropdownSelect label="Role" options={roles} value={inviteForm.role} onChange={(v) => updateInvite("role", v)} required={false} />
                  <DropdownSelect label="Department" options={departmentOptions} value={inviteForm.department} onChange={(v) => updateInvite("department", v)} required={false} disabled={departmentOptions.length === 0} />
                  {departmentOptions.length === 0 && <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-on-surface-variant)", marginTop: "calc(4px - var(--spacing-md))" }}>HR Administrator has not added any department yet</span>}
                  <Input label="Job Title" value={inviteForm.jobTitle} onChange={(e) => updateInvite("jobTitle", e.target.value)} required={false} />
                  <Button onClick={handleInvite} className={styles.submitBtn}>Send Invitation</Button>
                  <div style={{ display: "flex", justifyContent: "space-between", marginLeft: "calc(-1 * var(--spacing-md))", width: "calc(100% + var(--spacing-md) * 2)", marginTop: "-8px" }}>
                    <button type="button" onClick={() => setStep(1)} className={onboardingStyles.skipLink} style={{ textAlign: "left", padding: 0, width: "auto" }}>Go Back</button>
                    <button type="button" onClick={handleSkipInvite} className={onboardingStyles.skipLink} style={{ textAlign: "right", padding: 0, width: "auto" }}>Skip For Now</button>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.form}>
                <p className={styles.subtitle}>An invitation has been sent to {inviteForm.email}.</p>
                <Button onClick={() => router.push("/dashboard")} className={styles.submitBtn}>Go To Dashboard</Button>
              </div>
            )}
          </>
        )}

        {/* Completion */}
        {step === totalSteps && (
          <>
            <h1 className={styles.title}>You're All Set!</h1>
            <p className={styles.subtitle}>{isManager ? "Your profile is ready. Start managing your team and developing talent." : isEmployee ? "Your profile is ready. Start exploring your career path and developing new skills." : "Your TalentPath workspace is ready. Start developing talent, tracking workforce skills, and building future leaders."}</p>
            <Button onClick={() => router.push("/dashboard")} className={styles.submitBtn}>Go To Dashboard</Button>
          </>
        )}
      </Card>
      </div>

      <Modal isOpen={skillModalOpen} onClose={() => setSkillModalOpen(false)} title="Add Skill" size="md">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)", minHeight: "200px" }}>
          <Input
            label="Skill"
            value={modalSkillName}
            onChange={(e) => setModalSkillName(e.target.value)}
            placeholder="e.g., JavaScript, Project Management"
          />
          <DropdownSelect
            label="Proficiency"
            options={proficiencyLevels}
            value={modalSkillLevel}
            onChange={(v) => setModalSkillLevel(v)}
            required={false}
          />
          <Button onClick={confirmAddSkill} disabled={!modalSkillName.trim() || !modalSkillLevel}>Add Skill</Button>
        </div>
      </Modal>
    </>
  );
}
