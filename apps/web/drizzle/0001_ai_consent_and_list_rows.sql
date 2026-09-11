ALTER TABLE "trail_missions" ADD COLUMN "rows" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ai_consent_at" timestamp with time zone;