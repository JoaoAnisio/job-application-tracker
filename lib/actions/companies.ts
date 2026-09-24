"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const companySchema = z.object({
  name: z.string().min(1, "O nome da empresa é obrigatório"),
  site: z.string().optional(),
  sector: z.string().optional(),
  description: z.string().optional(),
});

export type CompanyInput = z.infer<typeof companySchema>;

export async function createCompany(input: CompanyInput) {
  const user = await requireUser();
  const data = companySchema.parse(input);

  const company = await prisma.company.create({
    data: {
      name: data.name,
      site: data.site || null,
      sector: data.sector || null,
      description: data.description || null,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  return company;
}

export async function listCompanies() {
  const user = await requireUser();

  return prisma.company.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });
}

export async function deleteCompany(id: string) {
  const user = await requireUser();

  const count = await prisma.application.count({
    where: { companyId: id, userId: user.id },
  });

  if (count > 0) {
    throw new Error(
      `Não é possível excluir: existem ${count} candidatura(s) vinculadas a esta empresa.`,
    );
  }

  const result = await prisma.company.deleteMany({
    where: { id, userId: user.id },
  });

  if (result.count === 0) {
    throw new Error("Empresa não encontrada");
  }

  revalidatePath("/dashboard");
}