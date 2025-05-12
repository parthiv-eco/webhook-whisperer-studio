create extension if not exists "vector" with schema "public" version '0.8.0';

create table "public"."categories" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "color" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."categories" enable row level security;

create table "public"."demo_credentials" (
    "id" uuid not null default gen_random_uuid(),
    "email" text not null,
    "password" text not null,
    "role" text not null default 'user'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."demo_credentials" enable row level security;

create table "public"."webhook_responses" (
    "id" uuid not null default gen_random_uuid(),
    "webhook_id" uuid not null,
    "status" integer not null,
    "status_text" text not null,
    "headers" jsonb not null,
    "data" jsonb,
    "timestamp" timestamp with time zone not null default now()
);


alter table "public"."webhook_responses" enable row level security;

create table "public"."webhooks" (
    "id" uuid not null default gen_random_uuid(),
    "category_id" uuid,
    "name" text not null,
    "description" text,
    "url" text not null,
    "method" text not null,
    "headers" jsonb not null default '[]'::jsonb,
    "default_payload" text default ''::text,
    "example_payloads" jsonb not null default '[]'::jsonb,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."webhooks" enable row level security;

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE INDEX demo_credentials_email_idx ON public.demo_credentials USING btree (email);

CREATE UNIQUE INDEX demo_credentials_email_key ON public.demo_credentials USING btree (email);

CREATE UNIQUE INDEX demo_credentials_pkey ON public.demo_credentials USING btree (id);

CREATE UNIQUE INDEX webhook_responses_pkey ON public.webhook_responses USING btree (id);

CREATE UNIQUE INDEX webhooks_pkey ON public.webhooks USING btree (id);

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."demo_credentials" add constraint "demo_credentials_pkey" PRIMARY KEY using index "demo_credentials_pkey";

alter table "public"."webhook_responses" add constraint "webhook_responses_pkey" PRIMARY KEY using index "webhook_responses_pkey";

alter table "public"."webhooks" add constraint "webhooks_pkey" PRIMARY KEY using index "webhooks_pkey";

alter table "public"."demo_credentials" add constraint "demo_credentials_email_key" UNIQUE using index "demo_credentials_email_key";

alter table "public"."webhook_responses" add constraint "webhook_responses_webhook_id_fkey" FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE not valid;

alter table "public"."webhook_responses" validate constraint "webhook_responses_webhook_id_fkey";

alter table "public"."webhooks" add constraint "webhooks_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) not valid;

alter table "public"."webhooks" validate constraint "webhooks_category_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_demo_credentials(p_email text, p_password text)
 RETURNS TABLE(is_valid boolean, user_role text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    true as is_valid,
    role as user_role
  FROM 
    public.demo_credentials
  WHERE 
    email = p_email
    AND password = p_password;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.exec_sql(sql_commands text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  EXECUTE sql_commands;
END;
$function$
;

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."demo_credentials" to "anon";

grant insert on table "public"."demo_credentials" to "anon";

grant references on table "public"."demo_credentials" to "anon";

grant select on table "public"."demo_credentials" to "anon";

grant trigger on table "public"."demo_credentials" to "anon";

grant truncate on table "public"."demo_credentials" to "anon";

grant update on table "public"."demo_credentials" to "anon";

grant delete on table "public"."demo_credentials" to "authenticated";

grant insert on table "public"."demo_credentials" to "authenticated";

grant references on table "public"."demo_credentials" to "authenticated";

grant select on table "public"."demo_credentials" to "authenticated";

grant trigger on table "public"."demo_credentials" to "authenticated";

grant truncate on table "public"."demo_credentials" to "authenticated";

grant update on table "public"."demo_credentials" to "authenticated";

grant delete on table "public"."demo_credentials" to "service_role";

grant insert on table "public"."demo_credentials" to "service_role";

grant references on table "public"."demo_credentials" to "service_role";

grant select on table "public"."demo_credentials" to "service_role";

grant trigger on table "public"."demo_credentials" to "service_role";

grant truncate on table "public"."demo_credentials" to "service_role";

grant update on table "public"."demo_credentials" to "service_role";

grant delete on table "public"."webhook_responses" to "anon";

grant insert on table "public"."webhook_responses" to "anon";

grant references on table "public"."webhook_responses" to "anon";

grant select on table "public"."webhook_responses" to "anon";

grant trigger on table "public"."webhook_responses" to "anon";

grant truncate on table "public"."webhook_responses" to "anon";

grant update on table "public"."webhook_responses" to "anon";

grant delete on table "public"."webhook_responses" to "authenticated";

grant insert on table "public"."webhook_responses" to "authenticated";

grant references on table "public"."webhook_responses" to "authenticated";

grant select on table "public"."webhook_responses" to "authenticated";

grant trigger on table "public"."webhook_responses" to "authenticated";

grant truncate on table "public"."webhook_responses" to "authenticated";

grant update on table "public"."webhook_responses" to "authenticated";

grant delete on table "public"."webhook_responses" to "service_role";

grant insert on table "public"."webhook_responses" to "service_role";

grant references on table "public"."webhook_responses" to "service_role";

grant select on table "public"."webhook_responses" to "service_role";

grant trigger on table "public"."webhook_responses" to "service_role";

grant truncate on table "public"."webhook_responses" to "service_role";

grant update on table "public"."webhook_responses" to "service_role";

grant delete on table "public"."webhooks" to "anon";

grant insert on table "public"."webhooks" to "anon";

grant references on table "public"."webhooks" to "anon";

grant select on table "public"."webhooks" to "anon";

grant trigger on table "public"."webhooks" to "anon";

grant truncate on table "public"."webhooks" to "anon";

grant update on table "public"."webhooks" to "anon";

grant delete on table "public"."webhooks" to "authenticated";

grant insert on table "public"."webhooks" to "authenticated";

grant references on table "public"."webhooks" to "authenticated";

grant select on table "public"."webhooks" to "authenticated";

grant trigger on table "public"."webhooks" to "authenticated";

grant truncate on table "public"."webhooks" to "authenticated";

grant update on table "public"."webhooks" to "authenticated";

grant delete on table "public"."webhooks" to "service_role";

grant insert on table "public"."webhooks" to "service_role";

grant references on table "public"."webhooks" to "service_role";

grant select on table "public"."webhooks" to "service_role";

grant trigger on table "public"."webhooks" to "service_role";

grant truncate on table "public"."webhooks" to "service_role";

grant update on table "public"."webhooks" to "service_role";

create policy "Allow authenticated users full access to categories"
on "public"."categories"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Admin users can read all demo credentials"
on "public"."demo_credentials"
as permissive
for select
to authenticated
using (true);


create policy "Allow authenticated users full access to webhook_responses"
on "public"."webhook_responses"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Allow authenticated users full access to webhooks"
on "public"."webhooks"
as permissive
for all
to authenticated
using (true)
with check (true);



