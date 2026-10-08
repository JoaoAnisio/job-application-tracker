"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { STAGES, type Stage } from "@/lib/stages";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type { Stage };

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

export async function createApplication(
  input: ApplicationInput,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  const company = await prisma.company.findFirst({
    where: { id: data.companyId, userId: user.id },
    select: { id: true },
  });

  if (!company) {
    return { success: false, error: "Empresa não encontrada" };
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
        create: { status: "APLICADO", note: "Candidatura registrada" },
      },
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");
  return { success: true, data: { id: application.id } };
}

export async function updateApplicationStage(
  id: string,
  stage: Stage,
  note?: string,
): Promise<ActionResult<{ id: string; stage: Stage }>> {
  const user = await requireUser();

  const parsedStage = z.enum(STAGES).safeParse(stage);
  if (!parsedStage.success) {
    return { success: false, error: "Estágio inválido" };
  }

  const existing = await prisma.application.findFirst({
    where: { id, userId: user.id },
    select: { id: true, stage: true },
  });

  if (!existing) {
    return { success: false, error: "Candidatura não encontrada" };
  }

  if (existing.stage === parsedStage.data) {
    return { success: true, data: { id: existing.id, stage: existing.stage } };
  }

  const updated = await prisma.application.update({
    where: { id },
    data: {
      stage: parsedStage.data,
      history: {
        create: { status: parsedStage.data, note: note || null },
      },
    },
    select: { id: true, stage: true },
  });

  revalidatePath("/dashboard");
  return { success: true, data: updated };
}

export async function updateApplicationNotes(
  id: string,
  notes: string,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const existing = await prisma.application.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!existing) {
    return { success: false, error: "Candidatura não encontrada" };
  }

  await prisma.application.update({
    where: { id },
    data: { notes: notes || null },
  });

  revalidatePath("/dashboard");
  return { success: true, data: { id } };
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  const user = await requireUser();

  const result = await prisma.application.deleteMany({
    where: { id, userId: user.id },
  });

  if (result.count === 0) {
    return { success: false, error: "Candidatura não encontrada" };
  }

  revalidatePath("/dashboard");
  return { success: true, data: undefined };
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