"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { STAGES, type Stage } from "@/lib/stages";

/** Estágios que indicam avanço real no processo seletivo. */
const ADVANCED_STAGES: Stage[] = [
  "TESTE_TECNICO",
  "DINAMICA",
  "ENTREVISTA",
  "OFERTA",
];

/** Estágios que encerram o processo, com ou sem sucesso. */
const CLOSED_STAGES: Stage[] = ["REJEITADO", "DESISTIU"];

export type Metrics = {
  total: number;
  byStage: Record<Stage, number>;
  advancedCount: number;
  conversionRate: number;
  activeCount: number;
  offerCount: number;
};

export async function getMetrics(): Promise<Metrics> {
  const user = await requireUser();

  const [total, grouped, advancedCount, activeCount, offerCount] =
    await Promise.all([
      prisma.application.count({
        where: { userId: user.id },
      }),

      prisma.application.groupBy({
        by: ["stage"],
        where: { userId: user.id },
        _count: { _all: true },
      }),

      // Conta pelo HISTÓRICO, não pelo estágio atual: uma candidatura
      // rejeitada após a entrevista ainda conta como avanço.
      prisma.application.count({
        where: {
          userId: user.id,
          history: { some: { status: { in: ADVANCED_STAGES } } },
        },
      }),

      prisma.application.count({
        where: { userId: user.id, stage: { notIn: CLOSED_STAGES } },
      }),

      prisma.application.count({
        where: {
          userId: user.id,
          history: { some: { status: "OFERTA" } },
        },
      }),
    ]);

  // groupBy omite estágios sem registros, então parte-se de zero em todos.
  const byStage = Object.fromEntries(
    STAGES.map((stage) => [stage, 0]),
  ) as Record<Stage, number>;

  for (const row of grouped) {
    byStage[row.stage as Stage] = row._count._all;
  }

  const conversionRate =
    total === 0 ? 0 : Math.round((advancedCount / total) * 1000) / 10;

  return {
    total,
    byStage,
    advancedCount,
    conversionRate,
    activeCount,
    offerCount,
  };
}