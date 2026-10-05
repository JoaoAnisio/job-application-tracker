"use client";

import { useActionState } from "react";
import { createApplication } from "@/lib/actions/applications";

type FormState = { error?: string; success?: boolean };

export function ApplicationForm({
  companies,
}: {
  companies: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const workMode = formData.get("workMode") as string;

      const result = await createApplication({
        vacancy: formData.get("vacancy") as string,
        companyId: formData.get("companyId") as string,
        url: (formData.get("url") as string) || undefined,
        salary: (formData.get("salary") as string) || undefined,
        workMode: workMode
          ? (workMode as "REMOTO" | "PRESENCIAL" | "HIBRIDO")
          : undefined,
      });

      if (!result.success) {
        return { error: result.error };
      }
      return { success: true };
    },
    {},
  );

  if (companies.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Cadastre uma empresa antes de registrar uma candidatura.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input
        name="vacancy"
        placeholder="Título da vaga"
        className="w-full rounded border px-3 py-2"
      />

      <select
        name="companyId"
        defaultValue=""
        className="w-full rounded border px-3 py-2"
      >
        <option value="" disabled>
          Selecione a empresa
        </option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>

      <input
        name="url"
        placeholder="Link da vaga (opcional)"
        className="w-full rounded border px-3 py-2"
      />

      <input
        name="salary"
        placeholder="Faixa salarial (opcional)"
        className="w-full rounded border px-3 py-2"
      />

      <select
        name="workMode"
        defaultValue=""
        className="w-full rounded border px-3 py-2"
      >
        <option value="">Modalidade (opcional)</option>
        <option value="REMOTO">Remoto</option>
        <option value="PRESENCIAL">Presencial</option>
        <option value="HIBRIDO">Híbrido</option>
      </select>

      {state.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "Salvando..." : "Adicionar candidatura"}
      </button>
    </form>
  );
}