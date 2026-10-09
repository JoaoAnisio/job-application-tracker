import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplication } from "@/lib/actions/applications";
import { STAGE_LABELS } from "@/lib/stages";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let application;
  try {
    application = await getApplication(id);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <Link href="/dashboard" className="text-sm text-gray-600 hover:underline">
        ← Voltar
      </Link>

      <header>
        <h1 className="text-2xl font-bold">{application.vacancy}</h1>
        <p className="text-gray-600">{application.company.name}</p>
      </header>

      <dl className="grid grid-cols-2 gap-4 rounded border p-4 text-sm">
        <div>
          <dt className="text-gray-500">Estágio atual</dt>
          <dd className="font-medium">{STAGE_LABELS[application.stage]}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Candidatura em</dt>
          <dd className="font-medium">
            {application.appliedAt.toLocaleDateString("pt-BR")}
          </dd>
        </div>
        {application.salary && (
          <div>
            <dt className="text-gray-500">Faixa salarial</dt>
            <dd className="font-medium">{application.salary}</dd>
          </div>
        )}
        {application.workMode && (
          <div>
            <dt className="text-gray-500">Modalidade</dt>
            <dd className="font-medium">{application.workMode}</dd>
          </div>
        )}
        {application.url && (
          <div className="col-span-2">
            <dt className="text-gray-500">Link da vaga</dt>
            <dd>
              <a
                href={application.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {application.url}
              </a>
            </dd>
          </div>
        )}
      </dl>

      <section>
        <h2 className="mb-3 font-semibold">Histórico</h2>
        <ol className="space-y-3 border-l-2 border-gray-200 pl-4">
          {application.history.map((event) => (
            <li key={event.id} className="relative">
              <span className="absolute -left-[1.4rem] top-1.5 h-2 w-2 rounded-full bg-gray-400" />
              <p className="text-sm font-medium">
                {STAGE_LABELS[event.status]}
              </p>
              <p className="text-xs text-gray-500">
                {event.createdAt.toLocaleString("pt-BR")}
              </p>
              {event.note && (
                <p className="mt-1 text-sm text-gray-600">{event.note}</p>
              )}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}