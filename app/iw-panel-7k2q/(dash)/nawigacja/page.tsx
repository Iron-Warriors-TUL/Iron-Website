import Link from 'next/link'
import { ChevronDown, ChevronUp, CornerDownRight, Pencil, Plus } from 'lucide-react'
import { getNavTree } from '@/lib/data'
import { getSiteLinks } from '@/lib/site-links'
import { ADMIN_PATH, requireAdminPage } from '@/lib/admin'
import { deleteNavItem, moveNavItem, saveNavItem } from '../../actions'
import { AdminForm } from '@/components/admin/admin-form'
import { DeleteButton } from '@/components/admin/delete-button'
import { NavFields } from '@/components/admin/nav-fields'

const BASE = `${ADMIN_PATH}/nawigacja`

function MoveButton({
  id,
  direction,
  disabled,
}: {
  id: number
  direction: 'up' | 'down'
  disabled: boolean
}) {
  const label = direction === 'up' ? 'Przesuń w górę' : 'Przesuń w dół'
  return (
    <form action={moveNavItem}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button
        type="submit"
        disabled={disabled}
        aria-label={label}
        title={label}
        className="rounded-sm border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        {direction === 'up' ? (
          <ChevronUp className="size-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-4" aria-hidden="true" />
        )}
      </button>
    </form>
  )
}

export default async function NavAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; add?: string }>
}) {
  await requireAdminPage()
  const { edit, add } = await searchParams
  const [tree, links] = await Promise.all([getNavTree(), getSiteLinks()])
  const parents = tree.filter((item) => !item.isButton)
  const allItems = tree.flatMap((item) => [item, ...item.children])

  const editItem = edit ? allItems.find((item) => String(item.id) === edit) : undefined
  const addParent = add ? parents.find((item) => String(item.id) === add) : undefined

  const rows = tree.flatMap((parent, parentIndex) => [
    { item: parent, depth: 0 as const, position: parentIndex, count: tree.length },
    ...parent.children.map((child, childIndex) => ({
      item: child,
      depth: 1 as const,
      position: childIndex,
      count: parent.children.length,
    })),
  ])

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Menu strony</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ułóż menu w strukturze drzewa: elementy główne i ich podelementy. Kolejność zmieniasz strzałkami,
          a edycja otwiera tylko jeden formularz — bez przewijania dziesiątek pól.
        </p>
      </div>

      {editItem && (
        <section className="rounded-md border border-primary/60 bg-card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Edytuj: {editItem.label}</h2>
              <p className="text-xs text-muted-foreground">
                Poziom: {editItem.parentId ? 'podelement' : 'element główny'}
              </p>
            </div>
            <Link href={BASE} className="text-sm text-primary hover:underline">
              Anuluj edycję
            </Link>
          </div>
          <AdminForm action={saveNavItem}>
            <NavFields item={editItem} parents={parents} links={links} />
          </AdminForm>
          <div className="mt-4 border-t border-border pt-4">
            <DeleteButton action={deleteNavItem} id={editItem.id} label="Usuń element" />
          </div>
        </section>
      )}

      <section className="rounded-md border border-border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              {addParent ? `Dodaj podelement do „${addParent.label}”` : 'Dodaj element nawigacji'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {addParent
                ? 'Nowy element pojawi się na końcu grupy podelementów.'
                : 'Nowy element pojawi się na końcu menu głównego.'}
            </p>
          </div>
          {addParent && (
            <Link href={BASE} className="text-sm text-primary hover:underline">
              Dodaj zamiast tego element główny
            </Link>
          )}
        </div>
        <AdminForm
          action={saveNavItem}
          submitLabel={addParent ? 'Dodaj podelement' : 'Dodaj element'}
          resetOnSuccess
        >
          <NavFields parents={parents} defaultParentId={addParent?.id ?? null} links={links} />
        </AdminForm>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold">Struktura menu</h2>
          <p className="text-xs text-muted-foreground">
            {tree.length} elementów głównych, {allItems.length - tree.length} podelementów.
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {rows.map(({ item, depth, position, count }) => (
            <li key={item.id}>
              <div
                className={`flex flex-wrap items-center gap-3 rounded-md border bg-card px-4 py-3 ${
                  editItem?.id === item.id ? 'border-primary' : 'border-border'
                } ${depth === 1 ? 'ml-6 border-l-2 border-l-border pl-3 md:ml-12' : ''}`}
              >
                {depth === 1 && (
                  <CornerDownRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-heading">{item.label}</span>
                    {item.isButton && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Przycisk
                      </span>
                    )}
                    {depth === 0 && item.children.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {item.children.length} podelementów
                      </span>
                    )}
                  </div>
                  <code className="mt-0.5 block truncate text-xs text-muted-foreground">{item.href}</code>
                </div>

                <div className="flex w-full flex-wrap items-center gap-1 sm:w-auto sm:shrink-0">
                  <MoveButton id={item.id} direction="up" disabled={position === 0} />
                  <MoveButton id={item.id} direction="down" disabled={position === count - 1} />
                  {depth === 0 && (
                    <Link
                      href={`${BASE}?add=${item.id}`}
                      className="inline-flex items-center gap-1 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-primary"
                    >
                      <Plus className="size-4" aria-hidden="true" />
                      Podelement
                    </Link>
                  )}
                  <Link
                    href={`${BASE}?edit=${item.id}`}
                    className="inline-flex items-center gap-1 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-primary"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    Edytuj
                  </Link>
                  <DeleteButton action={deleteNavItem} id={item.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
