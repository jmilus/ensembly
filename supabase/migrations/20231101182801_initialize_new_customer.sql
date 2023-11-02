alter table "public"."Ensemble" drop constraint "Ensemble_type_fkey";

alter table "public"."EventModel" drop constraint "EventModel_type_fkey";

drop function if exists "public"."create_new_user_profile"(user_email text);

alter table "public"."Ensemble" alter column "type" set data type text using "type"::text;

alter table "public"."Ensemble" add constraint "Ensemble_type_fkey" FOREIGN KEY (type) REFERENCES "EnsembleType"(type) not valid;

alter table "public"."Ensemble" validate constraint "Ensemble_type_fkey";

alter table "public"."EventModel" add constraint "EventModel_type_fkey" FOREIGN KEY (type) REFERENCES "EventType"(type) not valid;

alter table "public"."EventModel" validate constraint "EventModel_type_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_new_member(first_name text, last_name text, tenant_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$declare
  new_member_id uuid;
begin
  insert into "Member" ("firstName", "lastName", "tenant") 
    values (first_name, last_name, tenant_id) returning id into new_member_id;
  return new_member_id;
end;$function$
;

CREATE OR REPLACE FUNCTION public.create_new_tenant(new_tenant_name text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$declare
  new_id uuid;
begin
  insert into "Tenant" ("name") values (new_tenant_name) returning id into new_id;
  return new_id;
end;$function$
;

CREATE OR REPLACE FUNCTION public.create_new_user_profile(tenant_id uuid, user_email text, member_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$declare
  user_id uuid := (select "id" from auth."users" where "email" = user_email);
begin
  insert into "Profile" (tenant, email, member, "user", roles)
    values (tenant_id, user_email, member_id, user_id, '{"admin"}');
end;$function$
;

CREATE OR REPLACE FUNCTION public.initialize_new_customer(customer_name text, first_name text, last_name text, user_email text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$declare
  tenant_id uuid;
  member_id uuid;
begin
  tenant_id := create_new_tenant(customer_name);
  member_id := create_new_member(first_name, last_name, tenant_id);
  perform create_new_member_email(member_id, user_email);
  perform create_new_user_profile(tenant_id, user_email, member_id);
end;$function$
;

CREATE OR REPLACE FUNCTION public.calc_membership_expiration()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin
  IF new.membership_expires IS NULL
  THEN
    new.membership_expires:= new.membership_start + (
      select (concat (t.term_length, ' ', r.type, 's')::interval)
      from "MembershipType" t JOIN "RecurrencePeriod" r ON r.id = t.term_period
      where t."id" = new.membership_type
    );
  END if;
  return new;
end$function$
;

CREATE OR REPLACE FUNCTION public.create_new_member_email(new_member_id uuid, new_member_email text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  insert into public."EmailAddress" (member, email, type)
  VALUES (new_member_id, new_member_email, 'Primary');
end;
$function$
;


