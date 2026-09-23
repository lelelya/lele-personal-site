import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const guestbookMessages = sqliteTable('guestbook_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nickname: text('nickname').notNull(),
  message: text('message').notNull(),
  createdAt: text('created_at').notNull(),
  status: text('status').notNull().default('published')
}, (table) => [
  index('idx_guestbook_messages_status_created_at').on(table.status, table.createdAt)
]);

export const guestbookRateLimits = sqliteTable('guestbook_rate_limits', {
  fingerprint: text('fingerprint').notNull(),
  windowKey: text('window_key').notNull(),
  submissionCount: integer('submission_count').notNull().default(1),
  updatedAt: integer('updated_at').notNull()
}, (table) => [
  primaryKey({ columns: [table.fingerprint, table.windowKey] })
]);
