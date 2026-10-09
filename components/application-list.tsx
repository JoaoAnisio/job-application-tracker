import { listApplications } from "@/lib/actions/applications";
import { StageSelect } from "./stage-select";
import { DeleteApplicationButton } from "./delete-application-button";
import Link from "next/link";

export async function ApplicationList() {
  const applications = await listApplications();

  if (applications.length === 0) {
    return (
      <p className="rounded border border-dashed px-4 py-8 text-center text-gray-500">
        Nenhuma candidatura registrada ainda.
      </p>
    );
  }

  return (
    <ul className="divide-y rounded border">
      {applications.map((app) => (
        <li key={app.id} className="flex items-center justify-between gap-4 p-4">
          <Link href={`/dashboard/${app.id}`} className="min-w-0">
            <p className="truncate font-medium">{app.vacancy}</p>
            <p className="text-sm text-gray-600">{app.company.name}</p>
            <p className="text-xs text-gray-400">
              {app.appliedAt.toLocaleDateString("pt-BR")}
            </p>
          </Link>

          <div className="flex items-center gap-2">
            <StageSelect applicationId={app.id} currentStage={app.stage} />
            <DeleteApplicationButton applicationId={app.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}