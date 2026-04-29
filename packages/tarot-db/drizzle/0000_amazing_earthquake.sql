CREATE TYPE "public"."chat_role" AS ENUM('User', 'Assistant', 'System');--> statement-breakpoint
CREATE TYPE "public"."reading_event_type" AS ENUM('session_created', 'message_appended', 'card_drawn', 'pix_generated', 'pix_verified', 'payment_credited', 'reflection_saved');--> statement-breakpoint
CREATE TYPE "public"."payment_gateway" AS ENUM('abacatepay', 'manual', 'sandbox');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'expired', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."reading_source" AS ENUM('DailyFree', 'PurchasedExtra');--> statement-breakpoint
CREATE TYPE "public"."reading_spread" AS ENUM('SingleCard');--> statement-breakpoint
CREATE TYPE "public"."tarot_arcana" AS ENUM('Major', 'Minor');--> statement-breakpoint
CREATE TYPE "public"."tarot_suit" AS ENUM('Ouros', 'Espadas', 'Copas', 'Paus');--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_sessions_session_hash_unique" UNIQUE("session_hash")
);
--> statement-breakpoint
CREATE TABLE "daily_reading_entitlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"reading_date" varchar(10) NOT NULL,
	"cards_granted" integer DEFAULT 1 NOT NULL,
	"cards_consumed" integer DEFAULT 0 NOT NULL,
	"timezone" varchar(64) DEFAULT 'America/Sao_Paulo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_magic_link_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"normalized_email" varchar(320) NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_magic_link_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "payment_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gateway" "payment_gateway" NOT NULL,
	"external_event_id" varchar(255),
	"payload" jsonb NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pix_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"gateway" "payment_gateway" NOT NULL,
	"external_payment_id" varchar(255) NOT NULL,
	"amount_cents" integer NOT NULL,
	"item_quantity" integer DEFAULT 1 NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"pix_code" text NOT NULL,
	"qr_code_base64" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"paid_at" timestamp with time zone,
	"credited_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pix_payments_external_payment_id_unique" UNIQUE("external_payment_id")
);
--> statement-breakpoint
CREATE TABLE "reading_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "reading_event_type" NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" "chat_role" NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT 'null'::jsonb,
	"embedding" vector(1536),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"spread" "reading_spread" DEFAULT 'SingleCard' NOT NULL,
	"cards_remaining_today" integer DEFAULT 1 NOT NULL,
	"purchased_cards_available" integer DEFAULT 0 NOT NULL,
	"pending_payment_count" integer DEFAULT 0 NOT NULL,
	"last_reset_at" timestamp with time zone NOT NULL,
	"current_reading_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"card_id" varchar(120) NOT NULL,
	"source" "reading_source" NOT NULL,
	"entitlement_id" uuid,
	"revealed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_reflections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"reading_id" uuid,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tarot_cards" (
	"id" varchar(120) PRIMARY KEY NOT NULL,
	"slug" varchar(160) NOT NULL,
	"name" varchar(160) NOT NULL,
	"arcana" "tarot_arcana" NOT NULL,
	"suit" "tarot_suit",
	"keywords" jsonb NOT NULL,
	"reversed_keywords" jsonb NOT NULL,
	"visual_description" text NOT NULL,
	"detailed_description" text NOT NULL,
	"embedding" vector(1536),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tarot_cards_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_themes" (
	"user_id" uuid NOT NULL,
	"theme" varchar(120) NOT NULL,
	"confidence" integer DEFAULT 0 NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_themes_user_id_theme_pk" PRIMARY KEY("user_id","theme")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"normalized_email" varchar(320) NOT NULL,
	"display_name" varchar(120),
	"email_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_normalized_email_unique" UNIQUE("normalized_email")
);
--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_reading_entitlements" ADD CONSTRAINT "daily_reading_entitlements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_magic_link_tokens" ADD CONSTRAINT "auth_magic_link_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pix_payments" ADD CONSTRAINT "pix_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_events" ADD CONSTRAINT "reading_events_session_id_reading_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."reading_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_events" ADD CONSTRAINT "reading_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_messages" ADD CONSTRAINT "reading_messages_session_id_reading_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."reading_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_sessions" ADD CONSTRAINT "reading_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "readings" ADD CONSTRAINT "readings_session_id_reading_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."reading_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "readings" ADD CONSTRAINT "readings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "readings" ADD CONSTRAINT "readings_card_id_tarot_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."tarot_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "readings" ADD CONSTRAINT "readings_entitlement_id_daily_reading_entitlements_id_fk" FOREIGN KEY ("entitlement_id") REFERENCES "public"."daily_reading_entitlements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_reflections" ADD CONSTRAINT "reading_reflections_session_id_reading_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."reading_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_reflections" ADD CONSTRAINT "reading_reflections_reading_id_readings_id_fk" FOREIGN KEY ("reading_id") REFERENCES "public"."readings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_reflections" ADD CONSTRAINT "reading_reflections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_themes" ADD CONSTRAINT "user_themes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "daily_reading_entitlements_user_date_idx" ON "daily_reading_entitlements" USING btree ("user_id","reading_date");--> statement-breakpoint
CREATE INDEX "pix_payments_user_status_idx" ON "pix_payments" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "reading_events_session_created_at_idx" ON "reading_events" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "reading_messages_session_id_idx" ON "reading_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "reading_sessions_user_id_idx" ON "reading_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "readings_session_revealed_at_idx" ON "readings" USING btree ("session_id","revealed_at");