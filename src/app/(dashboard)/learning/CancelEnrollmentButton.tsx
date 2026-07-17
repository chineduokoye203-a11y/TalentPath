"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Modal } from "@/components/Modal/Modal";
import { Button } from "@/components/Button/Button";
import { cancelEnrollmentAction } from "@/features/learning/actions/learning.actions";

export function CancelEnrollmentButton({
  enrollmentId,
  className,
}: {
  enrollmentId: string;
  className?: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleConfirm = async () => {
    setCancelling(true);
    await cancelEnrollmentAction(enrollmentId);
    setCancelling(false);
    setShowConfirm(false);
  };

  return (
    <>
      <button type="button" onClick={() => setShowConfirm(true)} className={className}>
        Cancel Enrollment
        <X size={16} style={{ marginLeft: 4 }} />
      </button>

      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Cancel Enrollment" size="md">
        <p style={{ marginBottom: "var(--spacing-md)", color: "var(--color-on-surface-variant)", textAlign: "center" }}>
          Do you want to cancel this enrollment?
        </p>
          <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "center" }}>
          <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={cancelling}>
            No
          </Button>
          <Button variant="danger" onClick={handleConfirm} isLoading={cancelling}>
            Yes, Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}
