"use client";

import { useState, useTransition } from "react";
import { updateApplicationStage, type Stage } from "@/lib/actions/applications";

const STAGE_LABELS: Record<Stage, string> = {
  APLICADO: "Aplicado",
  TRIAGEM: "Triagem",
  TESTE_TECNICO: "Teste técnico",
  DINAMICA: "Dinâmica",
  ENTREVISTA: "Entrevista",
  OFERTA: "Oferta",
  REJEITADO: "Rejeitado",
  DESISTIU: "Desistiu",
};

export function StageSelect({
  applicationId,
  currentStage,
}: {
  applicationId: string;
  currentStage: Stage;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newStage = event.target.value as Stage;
    setError(null);

    startTransition(async () => {
      const result = await updateApplicationStage(applicationId, newStage);
      if (!result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <select
        value={currentStage}
        onChange={handleChange}
        disabled={isPending}
        className="rounded border px-2 py-1 text-sm disabled:opacity-50"
      >
        {Object.entries(STAGE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}