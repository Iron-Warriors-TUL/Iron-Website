import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { ADMIN_PATH } from '@/lib/admin'
import { deletePost, savePost } from '../../../actions'
import { AdminForm } from '@/components/admin/admin-form'
import { DeleteButton } from '@/components/admin/delete-button'
import { Checkbox, Field, inputClass } from '@/components/admin/fields'
import { BlockEditor } from '@/components/admin/block-editor'
import { ImageField } from '@/components/admin/image-field'
import { BackLink } from '@/components/admin/list'
import { SlugField } from '@/components/admin/slug-field'
import { parseBlocks } from '@/lib/blocks'
import { postBlocks } from '@/lib/entity-blocks'

export default async function PostEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'nowy'
  const numId = Number(id)
  if (!isNew && !Number.isInteger(numId)) notFound()
  const post = isNew ? null : (await db.select().from(posts).where(eq(posts.id, numId)).limit(1))[0]
  if (!isNew && !post) notFound()
  const stored = parseBlocks(post?.blocks)
  const initialBlocks = post ? (stored.length > 0 ? stored : postBlocks(post)) : []

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <BackLink href={`${ADMIN_PATH}/blog`} />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{isNew ? 'Nowy wpis' : 'Edycja wpisu'}</h1>
        {post && <DeleteButton action={deletePost} id={post.id} />}
      </div>
      <AdminForm action={savePost}>
        {post && <input type="hidden" name="id" value={post.id} />}
        <Field label="Tytuł" htmlFor="title">
          <input id="title" name="title" defaultValue={post?.title} required maxLength={200} className={inputClass} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <SlugField sourceId="title" defaultValue={post?.slug} hint="np. shell-eco-marathon-2026" />
          <Field label="Data publikacji" htmlFor="publishedAt">
            <input
              id="publishedAt"
              name="publishedAt"
              type="date"
              defaultValue={(post?.publishedAt ?? new Date()).toISOString().slice(0, 10)}
              className={inputClass}
            />
          </Field>
        </div>
        <ImageField name="coverImage" label="Obraz główny" defaultValue={post?.coverImage} />
        <Field label="Zajawka" htmlFor="excerpt">
          <textarea id="excerpt" name="excerpt" defaultValue={post?.excerpt} rows={2} maxLength={500} className={inputClass} />
        </Field>
        <section className="rounded-md border border-border bg-card p-4">
          <BlockEditor initial={initialBlocks} />
        </section>
        <Checkbox name="published" label="Opublikowany" defaultChecked={post?.published ?? true} />
      </AdminForm>
    </div>
  )
}
