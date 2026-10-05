"use client";

import { useTransition } from "react";
import { deleteApplication } from "@/lib/actions/applications";

export function DeleteApplicationButton({
  applicationId,
}: {
  applicationId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Excluir esta candidatura?")) return;

    startTransition(async () => {
      await deleteApplication(applicationId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
      aria-label="Excluir candidatura"
    >
      ×
    </button>
  );
}