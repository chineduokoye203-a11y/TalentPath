"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { activateAccountSchema, type ActivateAccountInput } from "@/features/identity/validations/invitation.schema";
import { Path } from "@phosphor-icons/react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { Card } from "@/components/Card/Card";
import styles from "../login/login.module.css";
import authStyles from "../auth/auth.module.css";

interface InviteData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

function ActivateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setInviteError("No invitation token provided");
      setLoading(false);
      return;
    }
    fetch(`/api/invitations/${token}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setInvite(json.data);
        } else {
          setInviteError(json.error?.message || "Invalid or expired invitation");
        }
      })
      .catch(() => setInviteError("Failed to validate invitation"))
      .finally(() => setLoading(false));
  }, [token]);

  const [step, setStep] = useState(1);

  const requirements = [
    { label: "Must contain one uppercase letter", check: (v: string) => /[A-Z]/.test(v) },
    { label: "Must contain a number", check: (v: string) => /[0-9]/.test(v) },
    { label: "Must contain a special character", check: (v: string) => /[^a-zA-Z0-9]/.test(v) },
    { label: "Must be at least 8 characters", check: (v: string) => v.length >= 8 },
  ];
  const currentRequirement = passwordValue ? requirements.find((r) => !r.check(passwordValue)) : null;

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ActivateAccountInput>({
    mode: "onTouched",
    resolver: zodResolver(activateAccountSchema),
    defaultValues: { token: token || "", firstName: "", lastName: "", email: "" },
  });

  useEffect(() => {
    if (invite) {
      reset({
        token: token || "",
        firstName: invite.firstName,
        lastName: invite.lastName,
        email: invite.email,
      });
    }
  }, [invite, token, reset]);

  const handleContinue = async () => {
    const valid = await trigger(["firstName", "lastName", "email"]);
    if (valid) setStep(2);
  };

  const onSubmit = async (data: ActivateAccountInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/invitations/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/onboarding");
      } else {
        setServerError(json.error?.message || "Activation failed");
      }
    } catch {
      setServerError("An error occurred. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Card className={styles.card}><p>Validating invitation...</p></Card>
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className={styles.container}>
        <Card className={styles.card}>
          <h1 className={styles.title}>Invalid Invitation</h1>
          <p className={styles.subtitle}>{inviteError}</p>
          <p className={styles.subtitle}>Please contact your HR administrator for a new invitation.</p>
          <Button onClick={() => router.push("/auth?mode=login")} className={styles.submitBtn}>Go to Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={`${styles.card} ${styles.activateCard}`}>
        <div className={authStyles.logo}>
          <div className={authStyles.logoIcon}>
            <Path size={20} weight="fill" />
          </div>
          <span className={authStyles.logoText}>TalentPath</span>
        </div>
        <h1 className={styles.title}>Activate Your Account</h1>

        {serverError && <div className={styles.errorAlert}>{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <input type="hidden" {...register("token")} />

          {step === 1 && (
            <>
              <Input label="First Name" required error={errors.firstName?.message} {...register("firstName")} />
              <Input label="Last Name" required error={errors.lastName?.message} {...register("lastName")} />
              <Input label="Work Email" type="email" readOnly hint="Provided by your organization" error={errors.email?.message} {...register("email")} />
              <Button type="button" onClick={handleContinue} className={styles.submitBtn}>Continue <ArrowRight size={20} className="mobile-hide" style={{ marginLeft: "var(--spacing-xs)" }} /></Button>
            </>
          )}

          {step === 2 && (
            <>
              <Input label="Password" type={showPassword ? "text" : "password"} required error={currentRequirement ? undefined : errors.password?.message} suffix={passwordValue ? <span onClick={() => setShowPassword(!showPassword)} style={{ display: "flex" }}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</span> : undefined} {...register("password", { onChange: (e) => setPasswordValue(e.target.value) })} />
              {currentRequirement && <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-error)" }}>{currentRequirement.label}</span>}
              <Input label="Confirm Password" type={showConfirmPassword ? "text" : "password"} required error={confirmPasswordValue && passwordValue !== confirmPasswordValue ? "Password does not match" : errors.confirmPassword?.message} suffix={confirmPasswordValue ? <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ display: "flex" }}>{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</span> : undefined} {...register("confirmPassword", { onChange: (e) => setConfirmPasswordValue(e.target.value) })} />
              <Button type="submit" isLoading={isSubmitting} className={styles.submitBtn}>Activate Account</Button>
              <button type="button" onClick={() => setStep(1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-on-surface)", fontSize: "var(--font-size-body-sm)", padding: "var(--spacing-xs) 0", margin: "4px auto 0", display: "block" }}>Go Back</button>
            </>
          )}
        </form>
      </Card>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<div className={styles.container}><Card className={styles.card}><p>Loading...</p></Card></div>}>
      <ActivateForm />
    </Suspense>
  );
}
