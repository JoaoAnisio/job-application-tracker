"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ActionResult } from "./applications";
import { Prisma } from "@prisma/client";

const companySchema = z.object({
  name: z.string().min(1, "O nome da empresa é obrigatório"),
  site: z.string().optional(),
  sector: z.string().optional(),
  description: z.string().optional(),
});

export type CompanyInput = z.infer<typeof companySchema>;

export async function createCompany(
  input: CompanyInput,
): Promise<ActionResult<{ id: string; name: string }>> {
  const user = await requireUser();

  const parsed = companySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const company = await prisma.company.create({
      data: {
        name: parsed.data.name,
        site: parsed.data.site || null,
        sector: parsed.data.sector || null,
        description: parsed.data.description || null,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: { id: company.id, name: company.name } };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "Você já cadastrou uma empresa com esse nome.",
      };
    }
    throw error;
  }
}

export async function deleteCompany(id: string): Promise<ActionResult> {
  const user = await requireUser();

  const count = await prisma.application.count({
    where: { companyId: id, userId: user.id },
  });

  if (count > 0) {
    return {
      success: false,
      error: `Não é possível excluir: existem ${count} candidatura(s) vinculadas a esta empresa.`,
    };
  }

  const result = await prisma.company.deleteMany({
    where: { id, userId: user.id },
  });

  if (result.count === 0) {
    return { success: false, error: "Empresa não encontrada" };
  }

  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function listCompanies() {
  const user = await requireUser();

  return prisma.company.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });
}