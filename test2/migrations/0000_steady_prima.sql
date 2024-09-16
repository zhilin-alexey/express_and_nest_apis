CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"surname" varchar,
	"age" smallint,
	"has_problem" boolean DEFAULT false
);
