import type { Metadata } from 'next'
import { getProjects } from '@/lib/data'
import { JoinCta, PageHeader } from '@/components/site/section'

export const metadata: Metadata = { title: 'Projekty' }

export default async function ProjectsPage() {
  const projects = await getProjects()
  const categories = [...new Set(projects.map((p) => p.category))]

  return (
    <>
      <PageHeader title="Projekty" subtitle="Działania i projekty dofinansowane ze środków publicznych." />
      <section className="py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 md:px-6">
          {categories.map((cat) => (
            <div key={cat} className="flex flex-col gap-6">
              <h2 className="border-l-4 border-primary pl-4 text-3xl font-bold">{cat}</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {projects
                  .filter((p) => p.category === cat)
                  .map((p) => (
                    <article key={p.id} className="flex flex-col gap-4 rounded-md bg-card p-6">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-bold text-balance">{p.title}</h3>
                        {p.period && <span className="shrink-0 rounded-sm bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">{p.period}</span>}
                      </div>
                      {p.program && <p className="text-sm italic text-muted-foreground">{p.program}</p>}
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        {p.funding && (
                          <div>
                            <dt className="text-muted-foreground">Dofinansowanie</dt>
                            <dd className="font-semibold">{p.funding}</dd>
                          </div>
                        )}
                        {p.ownContribution && (
                          <div>
                            <dt className="text-muted-foreground">Wkład własny</dt>
                            <dd className="font-semibold">{p.ownContribution}</dd>
                          </div>
                        )}
                        {p.totalValue && (
                          <div>
                            <dt className="text-muted-foreground">Całkowita wartość</dt>
                            <dd className="font-semibold">{p.totalValue}</dd>
                          </div>
                        )}
                      </dl>
                      <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                    </article>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <JoinCta />
    </>
  )
}
