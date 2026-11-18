import type { Metadata } from 'next'
import { getPublishedPosts } from '@/lib/data'
import { PageHeader } from '@/components/site/section'
import { PostCard } from '@/components/site/post-card'

export const metadata: Metadata = { title: 'Blog' }

export default async function BlogPage() {
  const posts = await getPublishedPosts()
  return (
    <>
      <PageHeader title="Blog" subtitle="Aktualności z życia zespołu Iron Warriors." image="/images/team-1.jpg" />
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          {posts.length === 0 ? (
            <p className="text-muted-foreground">Brak wpisów.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
