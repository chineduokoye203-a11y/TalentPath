"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { loginSchema, type LoginInput } from "@/features/identity/validations/auth.schema";
import { signUpAction } from "@/features/identity/actions/register";
import { Path } from "@phosphor-icons/react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import styles from "../login/login.module.css";
import authStyles from "./auth.module.css";

const step1Schema = z.object({
  companyName: z.string().min(1, "This field cannot be empty"),
  email: z.string().min(1, "This field cannot be empty"),
});

const step2Schema = z
  .object({
    password: z.string().min(1, "This field cannot be empty").min(8, "Must be at least 8 characters").regex(/[A-Z]/, "Must contain one uppercase letter").regex(/[0-9]/, "Must contain a number").regex(/[^a-zA-Z0-9]/, "Must contain a special character"),
    confirmPassword: z.string().min(1, "This field cannot be empty"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "register";
  const token = searchParams.get("token");
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "activate" && token) {
      router.replace(`/activate?token=${token}`);
    }
  }, [mode, token, router]);
  const [registerStep, setRegisterStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");

  const requirements = [
    { label: "Must contain one uppercase letter", check: (v: string) => /[A-Z]/.test(v) },
    { label: "Must contain a number", check: (v: string) => /[0-9]/.test(v) },
    { label: "Must contain a special character", check: (v: string) => /[^a-zA-Z0-9]/.test(v) },
    { label: "Must be at least 8 characters", check: (v: string) => v.length >= 8 },
  ];

  const currentRequirement = passwordValue ? requirements.find((r) => !r.check(passwordValue)) : null;

  const validateEmail = (value: string) => {
    if (!value) { setEmailError(""); return; }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("");
    } else {
      setEmailError("Enter a Valid Email Address");
    }
  };

  const loginForm = useForm<LoginInput>({
    mode: "onTouched",
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const step1Form = useForm({ mode: "onTouched", resolver: zodResolver(step1Schema), defaultValues: { companyName: "", email: "" } });
  const step2Form = useForm({ mode: "onTouched", resolver: zodResolver(step2Schema) });

  const switchMode = (newMode: string) => {
    setServerError(null);
    setRegisterStep(1);
    setCompanyName("");
    setEmail("");
    loginForm.clearErrors();
    router.push(`/auth?mode=${newMode}`);
  };

  const onLogin = async (data: LoginInput) => {
    setServerError(null);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setServerError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setServerError("Authentication service unavailable. Please try again.");
    }
  };

  const onStep1 = (data: { companyName: string; email: string }) => {
    setCompanyName(data.companyName);
    setEmail(data.email);
    setRegisterStep(2);
  };

  const onStep2 = async (data: { password: string; confirmPassword: string }) => {
    setServerError(null);
    const formData = new FormData();
    formData.append("companyName", companyName);
    formData.append("email", email);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);
    const result = await signUpAction(formData);
    if (result.success) {
      await signIn("credentials", { email: email, password: data.password, redirect: false });
      window.location.href = "/onboarding";
    } else {
      setServerError(result.error || "Sign up failed");
    }
  };

  return (
    <div className={styles.container}>
          {serverError && <div className={styles.errorAlert}>{serverError}</div>}

      {mode === "login" && (
        <>
          <Link href="/" className={authStyles.logo}>
            <div className={authStyles.logoIcon}>
              <Path size={20} weight="fill" />
            </div>
            <span className={authStyles.logoText}>TalentPath</span>
          </Link>
          <h1 className={styles.title}>Login to TalentPath</h1>
          <p className={styles.subtitle}>Welcome back! Please enter your details.</p>
          <form onSubmit={loginForm.handleSubmit(onLogin)} className={styles.form} autoComplete="off">
            <Input label="Email" type="email" autoFocus autoComplete="new-email" error={loginForm.formState.errors.email?.message} onFocus={() => setServerError(null)} {...loginForm.register("email")} />
            <Input label="Password" type={showLoginPassword ? "text" : "password"} autoComplete="new-password" labelRight={<button type="button" onClick={() => switchMode("forgot")} className={authStyles.link} style={{ fontSize: "inherit", color: "var(--color-on-background)" }}>Forgot password?</button>} error={loginForm.formState.errors.password?.message} onFocus={() => setServerError(null)} suffix={<span onClick={() => setShowLoginPassword(!showLoginPassword)} style={{ display: "flex" }}>{showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}</span>} {...loginForm.register("password")} />
            <Button type="submit" isLoading={loginForm.formState.isSubmitting} className={styles.submitBtn}>Login</Button>
          </form>
          <p className={styles.footer}>
            Don't have an account?{" "}
            <button type="button" onMouseDown={(e) => { e.preventDefault(); switchMode("register"); }} className={authStyles.link}>Sign Up</button>
          </p>
        </>
      )}

      {mode === "forgot" && (
        <>
          <Link href="/" className={authStyles.logo}>
            <div className={authStyles.logoIcon}>
              <Path size={20} weight="fill" />
            </div>
            <span className={authStyles.logoText}>TalentPath</span>
          </Link>
          <h1 className={styles.title}>Forgot Password</h1>
          <p className={styles.subtitle}>Enter your email address and we'll send you a reset link.</p>
          <form onSubmit={(e) => { e.preventDefault(); setServerError(null); const form = new FormData(e.currentTarget); fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email") }) }).then(r => r.json()).then(d => { if (d.success) { switchMode("login"); } else { setServerError(d.error?.message || "Something went wrong"); } }).catch(() => setServerError("Network error. Please try again.")); }} className={styles.form}>
            <Input label="Email" type="email" name="email" autoFocus />
            <Button type="submit" className={styles.submitBtn}>Send Reset Link</Button>
          </form>
          <p className={styles.footer}>
            Remember your password?{" "}
            <button type="button" onMouseDown={(e) => { e.preventDefault(); switchMode("login"); }} className={authStyles.link}>Login</button>
          </p>
        </>
      )}

      {mode === "reset" && (
        <>
          <Link href="/" className={authStyles.logo}>
            <div className={authStyles.logoIcon}>
              <Path size={20} weight="fill" />
            </div>
            <span className={authStyles.logoText}>TalentPath</span>
          </Link>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>Enter your new password below.</p>
          <form onSubmit={(e) => { e.preventDefault(); setServerError(null); const form = new FormData(e.currentTarget); const token = new URLSearchParams(window.location.search).get("token"); fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password: form.get("password"), confirmPassword: form.get("confirmPassword") }) }).then(r => r.json()).then(d => { if (d.success) { switchMode("login"); } else { setServerError(d.error?.message || "Something went wrong"); } }).catch(() => setServerError("Network error. Please try again.")); }} className={styles.form}>
            <Input label="New Password" type="password" name="password" autoFocus />
            <Input label="Confirm Password" type="password" name="confirmPassword" />
            <Button type="submit" className={styles.submitBtn}>Reset Password</Button>
          </form>
          <p className={styles.footer}>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); switchMode("login"); }} className={authStyles.link}>Back to Login</button>
          </p>
        </>
      )}

      {mode === "activate" && (
        <div className={styles.container}>
          <p>Redirecting to activation page...</p>
        </div>
      )}

      {mode === "register" && (
        <>
          <Link href="/" className={authStyles.logo}>
            <div className={authStyles.logoIcon}>
              <Path size={20} weight="fill" />
            </div>
            <span className={authStyles.logoText}>TalentPath</span>
          </Link>
          <h1 className={styles.title}>Create Your Account</h1>

          {registerStep === 1 && (
            <form onSubmit={step1Form.handleSubmit(onStep1)} className={styles.form}>
              <Input label="Organization Name" type="text" autoFocus error={step1Form.formState.errors.companyName?.message} {...step1Form.register("companyName")} />
              <Input label="Enter Email" type="email" error={emailError || step1Form.formState.errors.email?.message} {...step1Form.register("email", { onChange: (e) => validateEmail(e.target.value) })} />
              <Button type="submit" className={styles.submitBtn}>Continue <ArrowRight size={20} className="mobile-hide" style={{ marginLeft: "var(--spacing-xs)" }} /></Button>
            </form>
          )}

          {registerStep === 2 && (
            <form onSubmit={step2Form.handleSubmit(onStep2)} className={styles.form}>
              <Input label="Password" type={showPassword ? "text" : "password"} error={!passwordValue ? step2Form.formState.errors.password?.message : undefined} suffix={passwordValue ? <span onClick={() => setShowPassword(!showPassword)} style={{ display: "flex" }}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</span> : undefined} {...step2Form.register("password", { onChange: (e) => setPasswordValue(e.target.value) })} />
              {currentRequirement && <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-error)" }}>{currentRequirement.label}</span>}
              <Input label="Confirm Password" type={showConfirmPassword ? "text" : "password"} error={confirmPasswordValue && passwordValue !== confirmPasswordValue ? "Password does not match" : step2Form.formState.errors.confirmPassword?.message} suffix={confirmPasswordValue ? <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ display: "flex" }}>{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</span> : undefined} {...step2Form.register("confirmPassword", { onChange: (e) => setConfirmPasswordValue(e.target.value) })} />
              <Button type="submit" isLoading={step2Form.formState.isSubmitting} className={styles.submitBtn}>Create Account</Button>
              <button type="button" onClick={() => setRegisterStep(1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-on-surface)", fontSize: "var(--font-size-body-sm)", padding: "var(--spacing-xs) 0", textAlign: "center", width: "100%", marginTop: "calc(-0.5 * var(--spacing-md))" }}>Back</button>
            </form>
          )}

          <p className={styles.footer}>
            Already have an account?{" "}
            <button type="button" onMouseDown={(e) => { e.preventDefault(); switchMode("login"); }} className={authStyles.link}>Login</button>
          </p>
          <p className={styles.footer}><small>Register your company as the HR administrator. Subsequent users must be invited.</small></p>
        </>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className={styles.container}><p>Loading...</p></div>}>
      <AuthContent />
    </Suspense>
  );
}
