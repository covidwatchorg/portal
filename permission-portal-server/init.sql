-- This file will contain code to create the db

CREATE TABLE "public"."Organization" (
  id SERIAL PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  slug TEXT,
  phone VARCHAR(10) NOT NULL
);

CREATE TABLE "public"."User" (
  id SERIAL PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL,
  is_super_admin BOOLEAN NOT NULL,
  org_id INTEGER NOT NULL,
  FOREIGN KEY ("org_id") REFERENCES "public"."Organization"(id)
);

CREATE TABLE "public"."Permission" (
  id SERIAL PRIMARY KEY NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  match_key TEXT NOT NULL,
  org_id INTEGER NOT NULL,
  FOREIGN KEY ("org_id") REFERENCES "public"."Organization"(id)
);

-- DROP TABLE "public"."User";
-- DROP TABLE "public"."Permission";
-- DROP TABLE "public"."Organization";