import { boolean, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('editor'),
  theme: text('theme').notNull().default('light'),
  twoFactorEnabled: boolean('twoFactorEnabled').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export type Spec = { label: string; value: string }
export type Stat = { label: string; value: string; unit: string }
export type Achievement = { title: string; location: string; result: string; countryCode?: string }

export const navItems = pgTable('nav_items', {
  id: serial('id').primaryKey(),
  label: text('label').notNull(),
  href: text('href').notNull(),
  parentId: integer('parent_id'),
  sortOrder: integer('sort_order').notNull().default(0),
  isButton: boolean('is_button').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull().default(''),
  content: text('content').notNull().default(''),
  coverImage: text('cover_image'),
  published: boolean('published').notNull().default(true),
  publishedAt: timestamp('published_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  debutYear: integer('debut_year'),
  imageUrl: text('image_url'),
  description: text('description').notNull().default(''),
  goal: text('goal').notNull().default(''),
  specs: jsonb('specs').$type<Spec[]>().notNull().default([]),
  stats: jsonb('stats').$type<Stat[]>().notNull().default([]),
  achievements: jsonb('achievements').$type<Achievement[]>().notNull().default([]),
  bestResult: text('best_result'),
  featured: boolean('featured').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  program: text('program').notNull().default(''),
  funding: text('funding').notNull().default(''),
  ownContribution: text('own_contribution'),
  totalValue: text('total_value'),
  period: text('period').notNull().default(''),
  description: text('description').notNull().default(''),
  heading: text('heading').notNull().default(''),
  imageUrls: text('image_urls').notNull().default(''),
  fundingBar: boolean('funding_bar').notNull().default(false),
  fundingBarText: text('funding_bar_text').notNull().default(''),
  fundingBarLogo: text('funding_bar_logo').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const siteContent = pgTable(
  'site_content',
  {
    id: serial('id').primaryKey(),
    area: text('area').notNull(),
    entryKey: text('entry_key').notNull(),
    data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [uniqueIndex('site_content_area_key_idx').on(table.area, table.entryKey)],
)

export type NavItem = typeof navItems.$inferSelect
export type Post = typeof posts.$inferSelect
export type Vehicle = typeof vehicles.$inferSelect
export type Project = typeof projects.$inferSelect
