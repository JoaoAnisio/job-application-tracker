import { getMetrics } from "@/lib/actions/metrics";

export async function MetricsCards() {
  const metrics = await getMetrics();

  const cards = [
    { label: "Total", value: metrics.total },
    { label: "Em andamento", value: metrics.activeCount },
    { label: "Chegou a avançar", value: metrics.advancedCount },
    { label: "Taxa de avanço", value: `${metrics.conversionRate}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded border p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {card.label}
          </p>
          <p className="mt-1 text-2xl font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}