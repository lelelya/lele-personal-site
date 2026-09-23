CREATE TABLE `guestbook_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nickname` text NOT NULL,
	`message` text NOT NULL,
	`created_at` text NOT NULL,
	`status` text DEFAULT 'published' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_guestbook_messages_status_created_at` ON `guestbook_messages` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `guestbook_rate_limits` (
	`fingerprint` text NOT NULL,
	`window_key` text NOT NULL,
	`submission_count` integer DEFAULT 1 NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`fingerprint`, `window_key`)
);
