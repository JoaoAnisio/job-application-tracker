export const STAGES = [
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

export const STAGE_LABELS: Record<Stage, string> = {
  APLICADO: "Aplicado",
  TRIAGEM: "Triagem",
  TESTE_TECNICO: "Teste técnico",
  DINAMICA: "Dinâmica",
  ENTREVISTA: "Entrevista",
  OFERTA: "Oferta",
  REJEITADO: "Rejeitado",
  DESISTIU: "Desistiu",
};