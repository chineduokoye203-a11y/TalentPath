const fs = require("fs");
const path = require("path");

const components = [
  {
    name: "Card",
    tsx: `import React from "react";\nimport styles from "./Card.module.css";\n\nexport function Card({ children, title, className = "" }: { children: React.ReactNode; title?: string; className?: string }) {\n  return (\n    <div className={\`\${styles.card} \${className}\`}>\n      {title && (\n        <div className={styles.header}>\n          <h3 className={styles.title}>{title}</h3>\n        </div>\n      )}\n      <div className={styles.content}>{children}</div>\n    </div>\n  );\n}`,
    css: `.card {\n  background: var(--color-surface);\n  border: 1px solid var(--color-outline-variant);\n  border-radius: var(--radius-md);\n  box-shadow: var(--shadow-sm);\n  overflow: hidden;\n}\n\n.header {\n  border-bottom: 1px solid var(--color-outline-variant);\n  padding: var(--spacing-sm) var(--spacing-md);\n  background-color: var(--color-surface-variant);\n}\n\n.title {\n  font-size: var(--font-size-h3);\n  font-weight: var(--font-weight-semibold);\n  color: var(--color-on-surface);\n}\n\n.content {\n  padding: var(--spacing-md);\n}`,
  },
  {
    name: "Badge",
    tsx: `import React from "react";\nimport styles from "./Badge.module.css";\n\nexport function Badge({ children, variant = "neutral", className = "" }: { children: React.ReactNode; variant?: "neutral" | "success" | "warning" | "danger" | "primary"; className?: string }) {\n  return <span className={\`\${styles.badge} \${styles[variant]} \${className}\`}>{children}</span>;\n}`,
    css: `.badge {\n  display: inline-flex;\n  align-items: center;\n  padding: 2px var(--spacing-sm);\n  border-radius: var(--radius-full);\n  font-size: var(--font-size-caption);\n  font-weight: var(--font-weight-medium);\n}\n\n.neutral {\n  background: var(--color-surface-variant);\n  color: var(--color-on-surface-variant);\n}\n.primary {\n  background: var(--color-primary-container);\n  color: var(--color-on-primary-container);\n}\n.success {\n  background: hsl(120, 50%, 90%);\n  color: hsl(120, 60%, 25%);\n}\n.warning {\n  background: var(--color-tertiary);\n  color: var(--color-on-primary);\n}\n.danger {\n  background: var(--color-error-container);\n  color: var(--color-error);\n}`,
  },
  {
    name: "Skeleton",
    tsx: `import React from "react";\nimport styles from "./Skeleton.module.css";\n\nexport function Skeleton({ variant = "line", className = "" }: { variant?: "line" | "title" | "avatar" | "card"; className?: string }) {\n  return <div className={\`\${styles.skeleton} \${styles[variant]} \${className}\`} />;\n}`,
    css: `.skeleton {\n  background: var(--color-surface-variant);\n  border-radius: var(--radius-sm);\n  animation: pulse 1.5s infinite;\n}\n\n.line { height: 1rem; width: 100%; }\n.title { height: 1.5rem; width: 60%; }\n.avatar { height: 2.5rem; width: 2.5rem; border-radius: var(--radius-full); }\n.card { height: 120px; border-radius: var(--radius-md); }\n\n@keyframes pulse {\n  0%, 100% { opacity: 1; }\n  50% { opacity: 0.4; }\n}`,
  },
  {
    name: "CanAccess",
    tsx: `"use client";\nimport React from "react";\nimport { useSession } from "next-auth/react";\n\nexport function CanAccess({ allowedRoles, children, fallback = null }: { allowedRoles: string[]; children: React.ReactNode; fallback?: React.ReactNode }) {\n  const { data: session } = useSession();\n  const userRole = (session?.user as any)?.role;\n  \n  if (!userRole || !allowedRoles.includes(userRole)) {\n    return <>{fallback}</>;\n  }\n  return <>{children}</>;\n}`,
    css: ``,
  },
  {
    name: "Select",
    tsx: `import React from "react";\nimport styles from "../Input/Input.module.css";\n\nexport interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {\n  label?: string;\n  error?: string;\n  options: { label: string; value: string }[];\n}\n\nexport const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className = "", label, error, options, ...props }, ref) => {\n  return (\n    <div className={styles.container}>\n      {label && <label className={styles.label}>{label}</label>}\n      <select ref={ref} className={\`\${styles.input} \${error ? styles.hasError : ""} \${className}\`} aria-invalid={!!error} {...props}>\n        <option value="">Select an option</option>\n        {options.map((opt) => (\n          <option key={opt.value} value={opt.value}>{opt.label}</option>\n        ))}\n      </select>\n      {error && <span className={styles.error}>{error}</span>}\n    </div>\n  );\n});\nSelect.displayName = "Select";`,
    css: ``,
  },
  {
    name: "Textarea",
    tsx: `import React from "react";\nimport styles from "../Input/Input.module.css";\n\nexport interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {\n  label?: string;\n  error?: string;\n}\n\nexport const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className = "", label, error, ...props }, ref) => {\n  return (\n    <div className={styles.container}>\n      {label && <label className={styles.label}>{label}</label>}\n      <textarea ref={ref} className={\`\${styles.input} \${error ? styles.hasError : ""} \${className}\`} aria-invalid={!!error} {...props} />\n      {error && <span className={styles.error}>{error}</span>}\n    </div>\n  );\n});\nTextarea.displayName = "Textarea";`,
    css: ``,
  },
  {
    name: "Checkbox",
    tsx: `import React from "react";\nimport styles from "./Checkbox.module.css";\n\nexport interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {\n  label: string;\n}\n\nexport const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className = "", label, ...props }, ref) => {\n  return (\n    <label className={\`\${styles.container} \${className}\`}>\n      <input ref={ref} type="checkbox" className={styles.input} {...props} />\n      <span className={styles.label}>{label}</span>\n    </label>\n  );\n});\nCheckbox.displayName = "Checkbox";`,
    css: `.container {\n  display: flex;\n  align-items: center;\n  gap: var(--spacing-sm);\n  cursor: pointer;\n}\n\n.input {\n  width: 16px;\n  height: 16px;\n  cursor: pointer;\n  accent-color: var(--color-primary);\n}\n\n.label {\n  font-size: var(--font-size-body-sm);\n  color: var(--color-on-surface);\n}`,
  },
  {
    name: "Toast",
    tsx: `import React, { useEffect, useState } from "react";\nimport styles from "./Toast.module.css";\n\nexport function Toast({ message, type = "info", onClose, duration = 5000 }: { message: string; type?: "success" | "error" | "warning" | "info"; onClose: () => void; duration?: number }) {\n  useEffect(() => {\n    const timer = setTimeout(() => onClose(), duration);\n    return () => clearTimeout(timer);\n  }, [duration, onClose]);\n\n  return (\n    <div className={\`\${styles.toast} \${styles[type]}\`}>\n      <span className={styles.message}>{message}</span>\n      <button className={styles.close} onClick={onClose}>&times;</button>\n    </div>\n  );\n}`,
    css: `.toast {\n  position: fixed;\n  bottom: var(--spacing-lg);\n  right: var(--spacing-lg);\n  z-index: 60;\n  display: flex;\n  align-items: center;\n  gap: var(--spacing-sm);\n  padding: var(--spacing-sm) var(--spacing-md);\n  border-radius: var(--radius-md);\n  box-shadow: var(--shadow-md);\n  font-size: var(--font-size-body-sm);\n  animation: slideIn 300ms ease-out;\n}\n\n.success { background: var(--color-primary-container); color: var(--color-on-primary-container); border-left: 4px solid var(--color-primary); }\n.error { background: var(--color-error-container); color: var(--color-error); border-left: 4px solid var(--color-error); }\n.warning { background: var(--color-tertiary); color: var(--color-on-primary); border-left: 4px solid var(--color-tertiary); }\n.info { background: var(--color-surface-variant); color: var(--color-on-surface); border-left: 4px solid var(--color-primary); }\n\n.close {\n  background: none;\n  border: none;\n  font-size: 1.2rem;\n  cursor: pointer;\n  color: inherit;\n  opacity: 0.7;\n}\n.close:hover { opacity: 1; }\n\n@keyframes slideIn {\n  from { transform: translateX(100%); opacity: 0; }\n  to { transform: translateX(0); opacity: 1; }\n}`,
  },
  {
    name: "Table",
    tsx: `import React from "react";\nimport styles from "./Table.module.css";\n\nexport function Table({ children, className = "" }: { children: React.ReactNode; className?: string }) {\n  return (\n    <div className={styles.wrapper}>\n      <table className={\`\${styles.table} \${className}\`}>{children}</table>\n    </div>\n  );\n}`,
    css: `.wrapper {\n  width: 100%;\n  overflow-x: auto;\n}\n\n.table {\n  width: 100%;\n  border-collapse: collapse;\n  text-align: left;\n}\n\n.table th {\n  padding: var(--spacing-sm) var(--spacing-md);\n  font-size: var(--font-size-caption);\n  font-weight: var(--font-weight-semibold);\n  color: var(--color-on-surface-variant);\n  border-bottom: 2px solid var(--color-outline);\n}\n\n.table td {\n  padding: var(--spacing-sm) var(--spacing-md);\n  font-size: var(--font-size-body-sm);\n  border-bottom: 1px solid var(--color-outline-variant);\n}\n\n.table tbody tr:hover {\n  background: var(--color-surface-variant);\n}`,
  },
  {
    name: "Modal",
    tsx: `import React, { useEffect } from "react";\nimport styles from "./Modal.module.css";\n\nexport function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {\n  useEffect(() => {\n    const handleEscape = (e: KeyboardEvent) => {\n      if (e.key === "Escape") onClose();\n    };\n    if (isOpen) document.addEventListener("keydown", handleEscape);\n    return () => document.removeEventListener("keydown", handleEscape);\n  }, [isOpen, onClose]);\n\n  if (!isOpen) return null;\n\n  return (\n    <div className={styles.overlay} onClick={onClose}>\n      <div className={styles.dialog} onClick={e => e.stopPropagation()}>\n        <div className={styles.header}>\n          <h2 className={styles.title}>{title}</h2>\n          <button className={styles.close} onClick={onClose}>&times;</button>\n        </div>\n        <div className={styles.content}>{children}</div>\n      </div>\n    </div>\n  );\n}`,
    css: `.overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 50;\n  background: rgba(0,0,0,0.5);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: var(--spacing-md);\n}\n\n.dialog {\n  background: var(--color-surface);\n  border-radius: var(--radius-md);\n  box-shadow: var(--shadow-lg);\n  width: 100%;\n  max-width: 480px;\n  max-height: 90vh;\n  display: flex;\n  flex-direction: column;\n  animation: scaleIn 200ms ease-out;\n}\n\n.header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: var(--spacing-md);\n  border-bottom: 1px solid var(--color-outline-variant);\n}\n\n.title {\n  font-size: var(--font-size-h3);\n  font-weight: var(--font-weight-semibold);\n  color: var(--color-on-surface);\n  margin: 0;\n}\n\n.close {\n  background: none;\n  border: none;\n  font-size: 1.5rem;\n  cursor: pointer;\n  color: var(--color-on-surface-variant);\n}\n\n.content {\n  padding: var(--spacing-md);\n  overflow-y: auto;\n}\n\n@keyframes scaleIn {\n  from { transform: scale(0.95); opacity: 0; }\n  to { transform: scale(1); opacity: 1; }\n}`,
  },
  {
    name: "EmptyState",
    tsx: `import React from "react";\nimport styles from "./EmptyState.module.css";\n\nexport function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {\n  return (\n    <div className={styles.container}>\n      <div className={styles.iconPlaceholder} />\n      <h3 className={styles.title}>{title}</h3>\n      <p className={styles.description}>{description}</p>\n      {action && <div className={styles.action}>{action}</div>}\n    </div>\n  );\n}`,
    css: `.container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: var(--spacing-xl);\n  text-align: center;\n}\n\n.iconPlaceholder {\n  width: 64px;\n  height: 64px;\n  background: var(--color-surface-variant);\n  border-radius: 50%;\n  margin-bottom: var(--spacing-md);\n}\n\n.title {\n  font-size: var(--font-size-h3);\n  color: var(--color-on-surface);\n  margin-bottom: var(--spacing-sm);\n}\n\n.description {\n  font-size: var(--font-size-body);\n  color: var(--color-on-surface-variant);\n  max-width: 400px;\n}\n\n.action {\n  margin-top: var(--spacing-lg);\n}`,
  },
  {
    name: "PageHeader",
    tsx: `import React from "react";\nimport styles from "./PageHeader.module.css";\n\nexport function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {\n  return (\n    <div className={styles.header}>\n      <div>\n        <h1 className={styles.title}>{title}</h1>\n        {description && <p className={styles.description}>{description}</p>}\n      </div>\n      {action && <div className={styles.action}>{action}</div>}\n    </div>\n  );\n}`,
    css: `.header {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: var(--spacing-lg);\n  gap: var(--spacing-md);\n}\n\n.title {\n  font-size: var(--font-size-h1);\n  font-weight: var(--font-weight-bold);\n  color: var(--color-on-surface);\n  line-height: var(--line-height-tight);\n}\n\n.description {\n  font-size: var(--font-size-body);\n  color: var(--color-on-surface-variant);\n  margin-top: var(--spacing-xs);\n  max-width: 600px;\n}\n\n@media (max-width: 640px) {\n  .header {\n    flex-direction: column;\n  }\n}`,
  },
  {
    name: "Avatar",
    tsx: `import React from "react";\nimport styles from "./Avatar.module.css";\n\nexport function Avatar({ name, url, size = "md" }: { name: string; url?: string | null; size?: "sm" | "md" | "lg" }) {\n  const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();\n  \n  return (\n    <div className={\`\${styles.avatar} \${styles[size]}\`}>\n      {url ? (\n        <img src={url} alt={name} className={styles.image} />\n      ) : (\n        <span className={styles.initials}>{initials}</span>\n      )}\n    </div>\n  );\n}`,
    css: `.avatar {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: var(--radius-full);\n  background: var(--color-primary-container);\n  color: var(--color-on-primary-container);\n  overflow: hidden;\n  flex-shrink: 0;\n}\n\n.sm { width: 32px; height: 32px; font-size: 12px; }\n.md { width: 40px; height: 40px; font-size: 14px; }\n.lg { width: 64px; height: 64px; font-size: 24px; }\n\n.image {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.initials {\n  font-weight: var(--font-weight-medium);\n}`,
  },
];

const basePath = path.join(__dirname, "src", "components");

if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });

components.forEach((comp) => {
  const compDir = path.join(basePath, comp.name);
  if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });

  if (comp.tsx) {
    fs.writeFileSync(path.join(compDir, comp.name + ".tsx"), comp.tsx);
  }
  if (comp.css) {
    fs.writeFileSync(path.join(compDir, comp.name + ".module.css"), comp.css);
  }
  console.log("Created component: " + comp.name);
});
