import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { getPublishedPost } from '@/lib/data'
import { Paragraphs } from '@/components/site/section'
import { formatDate } from '@/components/site/post-card'
import { FillImage } from '@/components/site/smart-image'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPublishedPost((await params).slug)
  return { title: p?.title ?? 'Blog', description: p?.excerpt || undefined }
}

export default async function PostPage({ params }: Props) {
  const post = await getPublishedPost((await params).slug)
  if (!post) notFound()

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16 md:px-6">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Wróć do bloga
      </Link>
      <header className="flex flex-col gap-3">
        <time dateTime={post.publishedAt.toISOString()} className="text-sm uppercase tracking-wider text-primary">
          {formatDate(post.publishedAt)}
        </time>
        <h1 className="text-balance text-4xl font-bold md:text-5xl">{post.title}</h1>
      </header>
      {post.coverImage && (
        <div className="relative aspect-video w-full overflow-hidden rounded-md">
          <FillImage src={post.coverImage} alt="" sizes="(min-width: 768px) 768px, 100vw" />
        </div>
      )}
      <Paragraphs text={post.content} className="text-lg text-foreground/85" />
    </article>
  )
}
