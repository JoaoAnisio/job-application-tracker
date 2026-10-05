"use client";

import { useActionState } from "react";
import { createCompany } from "@/lib/actions/companies";

type FormState = { error?: string; success?: boolean };

export function CompanyForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const result = await createCompany({
        name: formData.get("name") as string,
        site: (formData.get("site") as string) || undefined,
        sector: (formData.get("sector") as string) || undefined,
      });

      if (!result.success) {
        return { error: result.error };
      }
      return { success: true };
    },
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <input
        name="name"
        placeholder="Nome da empresa"
        className="w-full rounded border px-3 py-2"
      />
      <input
        name="site"
        placeholder="Site (opcional)"
        className="w-full rounded border px-3 py-2"
      />
      <input
        name="sector"
        placeholder="Setor (opcional)"
        className="w-full rounded border px-3 py-2"
      />

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
        {isPending ? "Salvando..." : "Adicionar empresa"}
      </button>
    </form>
  );
}