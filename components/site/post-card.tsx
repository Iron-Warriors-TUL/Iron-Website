import Link from 'next/link'
import type { Post } from '@/lib/db/schema'

export const formatDate = (d: Date) =>
  new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-md bg-card">
      <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col">
        <img
          src={post.coverImage ?? '/images/team-2.jpg'}
          alt=""
          className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="flex flex-1 flex-col gap-2 p-5">
          <time dateTime={post.publishedAt.toISOString()} className="text-xs uppercase tracking-wider text-primary">
            {formatDate(post.publishedAt)}
          </time>
          <h3 className="text-xl font-bold group-hover:text-primary">{post.title}</h3>
          {post.excerpt && <p className="text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>}
        </div>
      </Link>
    </article>
  )
}
