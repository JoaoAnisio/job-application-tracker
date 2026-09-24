"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const STAGES = [
  "APLICADO",
  "TRIAGEM",
  "TESTE_TECNICO",
  "DINAMICA",
  "ENTREVISTA",
  "OFERTA",
  "REJEITADO",
  "DESISTIU",
] as const;

export type Stage = (typeof STAGES)[number];

const applicationSchema = z.object({
  vacancy: z.string().min(1, "O título da vaga é obrigatório"),
  companyId: z.string().min(1, "Selecione uma empresa"),
  url: z.string().optional(),
  workMode: z.enum(["REMOTO", "PRESENCIAL", "HIBRIDO"]).optional(),
  salary: z.string().optional(),
  notes: z.string().optional(),
  appliedAt: z.coerce.date().optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export async function createApplication(input: ApplicationInput) {
  const user = await requireUser();
  const data = applicationSchema.parse(input);

  const company = await prisma.company.findFirst({
    where: { id: data.companyId, userId: user.id },
  });

  if (!company) {
    throw new Error("Empresa não encontrada");
  }

  const application = await prisma.application.create({
    data: {
      vacancy: data.vacancy,
      companyId: data.companyId,
      userId: user.id,
      url: data.url || null,
      workMode: data.workMode ?? null,
      salary: data.salary || null,
      notes: data.notes || null,
      appliedAt: data.appliedAt ?? new Date(),
      stage: "APLICADO",
      history: {
        create: {
          status: "APLICADO",
          note: "Candidatura registrada",
        },
      },
    },
  });

  revalidatePath("/dashboard");
  return application;
}

export async function listApplications(stage?: Stage) {
  const user = await requireUser();
  return prisma.application.findMany({
    where: { userId: user.id, ...(stage && { stage }) },
    include: { company: true },
    orderBy: { appliedAt: "desc" },
  });
}

export async function getApplication(id: string) {
  const user = await requireUser();

  const application = await prisma.application.findFirst({
    where: { id, userId: user.id },
    include: {
      company: true,
      history: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!application) {
    throw new Error("Candidatura não encontrada");
  }

  return application;
}

export async function updateApplicationStage(
  id: string,
  stage: Stage,
  note?: string,
) {
  const user = await requireUser();
  const parsedStage = z.enum(STAGES).parse(stage);

  const existing = await prisma.application.findFirst({
    where: { id, userId: user.id },
    select: { id: true, stage: true },
  });

  if (!existing) {
    throw new Error("Candidatura não encontrada");
  }

  if (existing.stage === parsedStage) {
    return existing;
  }

  const updated = await prisma.application.update({
    where: { id },
    data: {
      stage: parsedStage,
      history: {
        create: { status: parsedStage, note: note || null },
      },
    },
  });

  revalidatePath("/dashboard");
  return updated;
}

export async function deleteApplication(id: string) {
  const user = await requireUser();

  const result = await prisma.application.deleteMany({
    where: { id, userId: user.id },
  });

  if (result.count === 0) {
    throw new Error("Candidatura não encontrada");
  }

  revalidatePath("/dashboard");
}

export async function updateApplicationNotes(id: string, notes: string) {
  const user = await requireUser();

  const existing = await prisma.application.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Candidatura não encontrada");
  }

  const updated = await prisma.application.update({
    where: { id },
    data: {
      notes: notes || null,
    },
  });

  revalidatePath("/dashboard");
  return updated;
}
  