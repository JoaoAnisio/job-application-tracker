import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listCompanies } from "@/lib/actions/companies";
import { CompanyForm } from "@/components/company-form";
import { ApplicationForm } from "@/components/application-form";
import { ApplicationList } from "@/components/application-list";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const companies = await listCompanies();

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-8">
      <header>
        <h1 className="text-2xl font-bold">Minhas candidaturas</h1>
        <p className="text-sm text-gray-600">{session.user.email}</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded border p-4">
          <h2 className="mb-3 font-semibold">Nova empresa</h2>
          <CompanyForm />
        </div>

        <div className="rounded border p-4">
          <h2 className="mb-3 font-semibold">Nova candidatura</h2>
          <ApplicationForm companies={companies} />
        </div>
      </section>

      <section>
        <ApplicationList />
      </section>
    </main>
  );
}