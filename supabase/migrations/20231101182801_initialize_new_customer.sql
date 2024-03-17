
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."broadcast_update_date"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
  new.status_date := now();
  return new;
end;$$;

ALTER FUNCTION "public"."broadcast_update_date"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."calc_membership_expiration"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
  IF new.membership_expires IS null
  THEN
    new.membership_expires:= new.membership_start + (
      select (concat (t.term_length, ' ', r.type, 's')::interval)
      from "MembershipType" t JOIN "RecurrencePeriod" r ON r.type = t.term_period
      where t."id" = new.membership_type
    );
  END if;
  if new.membership_expires = new.membership_start
  then
    new.membership_expires:= null;
  end if;
  return new;
end$$;

ALTER FUNCTION "public"."calc_membership_expiration"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."clone_broadcast"("broadcast_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$declare
  clone_id uuid;
begin
  insert into "Broadcast" ("subject", "body", "status", "tenant", "to_address", "cc_address", "bcc_address")
  select "subject", "body", 'DRAFT', "tenant", "to_address", "cc_address", "bcc_address"
  from "Broadcast"
  where id = broadcast_id
  returning "id" into clone_id;
  return clone_id;
end$$;

ALTER FUNCTION "public"."clone_broadcast"("broadcast_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."clone_lineup"("lineup_id" "uuid", "new_name" "text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
declare clone_id uuid;
begin
  insert into "Lineup" (name, ensemble, is_primary)
  select new_name, ensemble, false from "Lineup" where "id" = lineup_id
  returning id into clone_id;
  INSERT INTO "LineupAssignment" ("lineup", "membership", "division", "title")
  SELECT clone_id, "membership", "division", "title"
  FROM "LineupAssignment"
  WHERE lineup = lineup_id;
  return clone_id;
end;
$$;

ALTER FUNCTION "public"."clone_lineup"("lineup_id" "uuid", "new_name" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."conform_subdivision_capacities"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
  update "Division"
  set "capacity" = new.capacity
  where "parent_division" = new.id;
  return new;
end$$;

ALTER FUNCTION "public"."conform_subdivision_capacities"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_ensemble_prime_lineup"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    insert into "Lineup" ("name", ensemble, is_primary)
    values (concat(new.name, ' Primary Lineup'), new.id, true);
    return null;
end $$;

ALTER FUNCTION "public"."create_ensemble_prime_lineup"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_new_member"("first_name" "text", "last_name" "text", "tenant_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$declare
  new_member_id uuid;
begin
  insert into "Member" ("firstName", "lastName", "tenant") 
    values (first_name, last_name, tenant_id) returning id into new_member_id;
  return new_member_id;
end;$$;

ALTER FUNCTION "public"."create_new_member"("first_name" "text", "last_name" "text", "tenant_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_new_member_email"("new_member_id" "uuid", "new_member_email" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  insert into public."EmailAddress" (member, email, type)
  VALUES (new_member_id, new_member_email, 'Primary');
end;
$$;

ALTER FUNCTION "public"."create_new_member_email"("new_member_id" "uuid", "new_member_email" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_new_tenant"("new_tenant_name" "text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$declare
  new_id uuid;
begin
  insert into "Tenant" ("name") values (new_tenant_name) returning id into new_id;
  return new_id;
end;$$;

ALTER FUNCTION "public"."create_new_tenant"("new_tenant_name" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_new_user_profile"("tenant_id" "uuid", "user_email" "text", "member_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$declare
  user_id uuid := (select "id" from auth."users" where "email" = user_email);
begin
  insert into "Profile" (tenant, email, member, "user", roles)
    values (tenant_id, user_email, member_id, user_id, '{"admin"}');
end;$$;

ALTER FUNCTION "public"."create_new_user_profile"("tenant_id" "uuid", "user_email" "text", "member_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."delete_child_divisions"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
  delete
  from "Division"
  where "parent_division" = old.id;
  return null;
end$$;

ALTER FUNCTION "public"."delete_child_divisions"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_dates_by_occurrence"("start_date" timestamp with time zone, "end_date" "date", "interval_int" smallint, "period" bigint, "occurrence" "text"[]) RETURNS "date"[]
    LANGUAGE "plpgsql"
    AS $$
  DECLARE
    cursor_date DATE;
    occ TEXT;
    occd INT;
    date_list date[];
  BEGIN

    IF period = 1 THEN --period is "Week"
      -- Iterate through the occurrence array to...
      FOREACH occ IN ARRAY occurrence
      LOOP
        cursor_date = start_date::date;
        occd = array_position(ARRAY['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], occ) - 1;
        -- Find the first date on or after start_date that is an occurrence day
        WHILE EXTRACT('DOW' from cursor_date) != occd AND cursor_date <= end_date LOOP
          cursor_date = cursor_date + 1;
        END LOOP;
        -- ...generate a list of dates an interval of weeks apart
        WHILE cursor_date <= end_date LOOP
          -- date := cursor_date;
          date_list := array_append (date_list, cursor_date);
          cursor_date = cursor_date + (7 * interval_int);
          -- RETURN NEXT;
        END LOOP;
        --------
      END LOOP;
    ELSEIF period = 2 THEN --period is "Month"
      -- Iterate through the occurrence array to...
      FOREACH occ IN ARRAY occurrence
      LOOP
        cursor_date = start_date::date;
        WHILE EXTRACT('Day' from cursor_date) != occ::integer AND cursor_date <= end_date LOOP
          cursor_date = cursor_date + 1;
        END LOOP;
        -- ...generate a list of dates an interval of months apart
        WHILE cursor_date <= end_date LOOP
          -- date := cursor_date;
          date_list := array_append(date_list, cursor_date);
          cursor_date = cursor_date + make_interval(months => interval_int::integer);
          -- RETURN NEXT;
        END LOOP;
        --------
      END LOOP;
    END IF;

    RETURN date_list;
  END;
$$;

ALTER FUNCTION "public"."get_dates_by_occurrence"("start_date" timestamp with time zone, "end_date" "date", "interval_int" smallint, "period" bigint, "occurrence" "text"[]) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_divisions_json"() RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  divisions json;
  my_division record;
BEGIN

  -- Get all divisions
  SELECT json_agg(
    json_build_object(
      'id', id,
      'name', name,
      'parent', parent_division
    )) AS division
  INTO divisions
  FROM "Division";

  

  RETURN divisions;
END;
$$;

ALTER FUNCTION "public"."get_divisions_json"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_ensemble_emails"("ensemble_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
declare
  ensembles json;
begin
  select json_build_object('id', json_agg(e.id), 'name', json_agg(e.name)) into ensembles from "Ensemble" e where id::text like '%';
  return ensembles;
end;
$$;

ALTER FUNCTION "public"."get_ensemble_emails"("ensemble_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_ensemble_tenant"("ensemble_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
begin
  return (select tenant from "Ensemble" where "id" = ensemble_id);
end;
$$;

ALTER FUNCTION "public"."get_ensemble_tenant"("ensemble_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_member_tenant"("member_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
begin
  return (select tenant from "Member" where "id" = member_id);
end;
$$;

ALTER FUNCTION "public"."get_member_tenant"("member_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_tenant"() RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
begin
  return (
    select tenant 
    from "Profile" p
    where auth.uid() = p."user"
  );
end;
$$;

ALTER FUNCTION "public"."get_user_tenant"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_model_recurrence_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  event_date date;
  start_date timestamptz;
  end_date timestamptz;
  model_id uuid := old."id";
  model_start_date timestamptz := COALESCE (new."modelStartDate", old."modelStartDate");
  model_end_date timestamptz := COALESCE (new."modelEndDate", old."modelEndDate");
  recurrence_end_date date := COALESCE (new."recurrenceEndDate", old."recurrenceEndDate");
  model_interval smallint := COALESCE (new."interval", old."interval");
  model_period bigint := COALESCE (new."period", old."period");
  model_occurrence text[] := COALESCE (new."occurrence", old."occurrence");
  model_tenant uuid := old."tenant";
  it_exists boolean;
  date_list date[];
begin
  IF recurrence_end_date IS NOT NULL THEN
    date_list := get_dates_by_occurrence(model_start_date, recurrence_end_date, model_interval, model_period, model_occurrence);
  
    FOREACH event_date IN ARRAY date_list
    LOOP
      start_date = event_date + CONCAT(date_part('hour', model_start_date), ' hours ', date_part('minute', model_start_date), ' minutes ', date_part('second', model_start_date), ' seconds')::interval;

      IF EXISTS (select * from "Event" where "anchorDate" = event_date and "model" = model_id)
      THEN
       UPDATE "Event" SET "eventStartDate" = start_Date where "anchorDate" = event_date and "model" = model_id; 
      ELSE
        end_date = start_date + (model_end_date - model_start_date);

        INSERT INTO "Event" ("anchorDate", "eventStartDate", "eventEndDate", "model", "tenant")
        VALUES (event_date, start_date, end_date, model_id, model_tenant);
      END IF;
    END LOOP;

    DELETE from "Event"
    WHERE "exception" = false 
    AND NOT "anchorDate" = ANY(date_list)
    AND "eventStartDate" > now();
  END IF;

  return null;
end;
$$;

ALTER FUNCTION "public"."handle_model_recurrence_change"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."initialize_new_customer"("customer_name" "text", "first_name" "text", "last_name" "text", "user_email" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$declare
  tenant_id uuid;
  member_id uuid;
begin
  tenant_id := create_new_tenant(customer_name);
  member_id := create_new_member(first_name, last_name, tenant_id);
  perform create_new_member_email(member_id, user_email);
  perform create_new_user_profile(tenant_id, user_email, member_id);
end;$$;

ALTER FUNCTION "public"."initialize_new_customer"("customer_name" "text", "first_name" "text", "last_name" "text", "user_email" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."orphan_address_handler"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  IF new."address" IS NULL and old."address" is not null
  THEN
    if not exists (
      select 1 
      from "Address" 
      where "Address".id = old."address" and "Address".member is not null 
    ) and NOT EXISTS (
      SELECT 1
      FROM "Event"
      WHERE "Event".address = old."address" and "Event".id != old.id
    ) AND NOT EXISTS (
      SELECT 1
      FROM "EventModel"
      WHERE "EventModel".address = old."address" and "EventModel".id != old.id
    )
    THEN
      DELETE FROM "Address"
      WHERE "Address"."id" = old."address";
    END IF;
  END IF;
  RETURN new;
END;$$;

ALTER FUNCTION "public"."orphan_address_handler"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."prep_new_member"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    new.aka:= concat(new."firstName", ' ', new."lastName");
    return new;
end $$;

ALTER FUNCTION "public"."prep_new_member"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."setup_new_event_model"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    INSERT INTO "Event" ("anchorDate", "eventStartDate", "eventEndDate", "model")
    VALUES (new."modelStartDate", new."modelStartDate", new."modelEndDate", new."id");
    return null;
end $$;

ALTER FUNCTION "public"."setup_new_event_model"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."tenant_id_from_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  IF new.tenant IS NULL THEN
    new.tenant:= (
      SELECT tenant 
      FROM "Profile"
      WHERE auth.uid() = user
    );
  END IF;
  return new;
end $$;

ALTER FUNCTION "public"."tenant_id_from_user_profile"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."Address" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "street" "text",
    "street2" "text",
    "city" "text",
    "state" "text",
    "postalCode" "text",
    "country" "text",
    "poBox" "text",
    "type" "text",
    "member" "uuid",
    "tenant" "uuid" DEFAULT "public"."get_user_tenant"()
);

ALTER TABLE "public"."Address" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."AddressType" (
    "id" bigint NOT NULL,
    "type" "text" NOT NULL
);

ALTER TABLE "public"."AddressType" OWNER TO "postgres";

ALTER TABLE "public"."AddressType" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."AddressType_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."Attendance" (
    "event" "uuid" NOT NULL,
    "member" "uuid" NOT NULL,
    "tenant" "uuid" DEFAULT "public"."get_user_tenant"() NOT NULL,
    "status" bigint NOT NULL
);

ALTER TABLE "public"."Attendance" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."AttendanceStatus" (
    "id" bigint NOT NULL,
    "type" "text" NOT NULL
);

ALTER TABLE "public"."AttendanceStatus" OWNER TO "postgres";

ALTER TABLE "public"."AttendanceStatus" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."AttendanceStatus_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."Broadcast" (
    "created_at" timestamp with time zone DEFAULT "now"(),
    "subject" "text",
    "body" "json",
    "status" "text" DEFAULT 'DRAFT'::"text",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant" "uuid" DEFAULT "public"."get_user_tenant"() NOT NULL,
    "status_date" timestamp with time zone DEFAULT "now"(),
    "to_address" "text"[],
    "cc_address" "text"[],
    "bcc_address" "text"[]
);

ALTER TABLE "public"."Broadcast" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."BroadcastStatus" (
    "id" bigint NOT NULL,
    "type" "text" NOT NULL
);

ALTER TABLE "public"."BroadcastStatus" OWNER TO "postgres";

ALTER TABLE "public"."BroadcastStatus" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."BroadcastStatus_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."Division" (
    "name" "text" NOT NULL,
    "taxonomy" "text" NOT NULL,
    "capacity" "text",
    "ensemble" "uuid" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "parent_division" "uuid"
);

ALTER TABLE "public"."Division" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."EmailAddress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "email" "text" NOT NULL,
    "type" "text",
    "member" "uuid"
);

ALTER TABLE "public"."EmailAddress" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."EmailType" (
    "id" bigint NOT NULL,
    "type" "text" NOT NULL
);

ALTER TABLE "public"."EmailType" OWNER TO "postgres";

ALTER TABLE "public"."EmailType" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."EmailType_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."Ensemble" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" NOT NULL,
    "type" "text",
    "logoUrl" "text",
    "tenant" "uuid" DEFAULT "public"."get_user_tenant"() NOT NULL
);

ALTER TABLE "public"."Ensemble" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."EnsembleMembership" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "member" "uuid" NOT NULL,
    "ensemble" "uuid" NOT NULL,
    "status" "text" DEFAULT 'Active'::"text" NOT NULL,
    "membership_expires" "date",
    "membership_start" "date",
    "membership_type" bigint,
    "status_date" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "status_note" "text"
);

ALTER TABLE "public"."EnsembleMembership" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."EnsembleType" (
    "id" bigint NOT NULL,
    "type" "text" NOT NULL,
    "color" "text"
);

ALTER TABLE "public"."EnsembleType" OWNER TO "postgres";

ALTER TABLE "public"."EnsembleType" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."EnsembleType_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."Event" (
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text",
    "anchorDate" "date" NOT NULL,
    "eventStartDate" timestamp with time zone NOT NULL,
    "eventEndDate" timestamp with time zone NOT NULL,
    "exception" boolean DEFAULT false,
    "note" "text",
    "model" "uuid" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant" "uuid" DEFAULT "public"."get_user_tenant"(),
    "address" "uuid"
);

ALTER TABLE "public"."Event" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."EventLineup" (
    "event" "uuid" NOT NULL,
    "lineup" "uuid" NOT NULL
);

ALTER TABLE "public"."EventLineup" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."EventModel" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" NOT NULL,
    "modelStartDate" timestamp with time zone NOT NULL,
    "modelEndDate" timestamp with time zone NOT NULL,
    "details" "text",
    "interval" smallint,
    "recurrenceEndCount" integer,
    "recurrenceEndDate" "date",
    "address" "uuid",
    "period" bigint,
    "parent" "uuid",
    "tenant" "uuid" DEFAULT "public"."get_user_tenant"() NOT NULL,
    "occurrence" "text"[],
    "type" "text"
);

ALTER TABLE "public"."EventModel" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."EventType" (
    "id" bigint NOT NULL,
    "type" "text" NOT NULL,
    "color" "text"
);

ALTER TABLE "public"."EventType" OWNER TO "postgres";

ALTER TABLE "public"."EventType" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."EventType_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."EyeColor" (
    "id" smallint NOT NULL,
    "type" "text" NOT NULL
);

ALTER TABLE "public"."EyeColor" OWNER TO "postgres";

ALTER TABLE "public"."EyeColor" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."EyeColor_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."HairColor" (
    "id" smallint NOT NULL,
    "type" "text" NOT NULL
);

ALTER TABLE "public"."HairColor" OWNER TO "postgres";

ALTER TABLE "public"."HairColor" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."HairColor_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."Lineup" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" NOT NULL,
    "ensemble" "uuid" NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."Lineup" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."LineupAssignment" (
    "created_at" timestamp with time zone DEFAULT "now"(),
    "lineup" "uuid" NOT NULL,
    "membership" "uuid" NOT NULL,
    "capacity" "text",
    "title" "text",
    "division" "uuid" NOT NULL
);

ALTER TABLE "public"."LineupAssignment" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."Member" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "firstName" "text" DEFAULT ''::"text" NOT NULL,
    "middleName" "text" DEFAULT ''::"text" NOT NULL,
    "lastName" "text" DEFAULT ''::"text" NOT NULL,
    "suffix" "text" DEFAULT ''::"text" NOT NULL,
    "aka" "text",
    "avatarUrl" "text",
    "birthday" "text",
    "height" smallint DEFAULT '0'::smallint,
    "weight" smallint DEFAULT '0'::smallint,
    "ethnicity" "text" DEFAULT ''::"text",
    "race" "text",
    "hair" "text",
    "eyes" "text",
    "tenant" "uuid" DEFAULT "public"."get_user_tenant"() NOT NULL,
    "sex" "text",
    CONSTRAINT "Member_suffix_check" CHECK (("length"("suffix") < 8))
);

ALTER TABLE "public"."Member" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."MembershipCapacity" (
    "id" bigint NOT NULL,
    "type" "text" NOT NULL
);

ALTER TABLE "public"."MembershipCapacity" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."MembershipStatus" (
    "id" smallint NOT NULL,
    "type" "text" NOT NULL,
    "color" "text" DEFAULT ''::"text"
);

ALTER TABLE "public"."MembershipStatus" OWNER TO "postgres";

ALTER TABLE "public"."MembershipStatus" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."MembershipStatus_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."MembershipType" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" DEFAULT ''::"text",
    "tenant" "uuid" DEFAULT "public"."get_user_tenant"() NOT NULL,
    "capacity" "text"[],
    "term_length" smallint,
    "term_period" "text",
    "ensembles" "uuid"[]
);

ALTER TABLE "public"."MembershipType" OWNER TO "postgres";

ALTER TABLE "public"."MembershipType" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."MembershipType_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE "public"."MembershipCapacity" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."PerformanceCapacity_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."PhoneNumber" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "prefix" "text",
    "number" "text" NOT NULL,
    "type" "text",
    "member" "uuid"
);

ALTER TABLE "public"."PhoneNumber" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."PhoneType" (
    "id" bigint NOT NULL,
    "type" "text" NOT NULL
);

ALTER TABLE "public"."PhoneType" OWNER TO "postgres";

ALTER TABLE "public"."PhoneType" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."PhoneType_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."Profile" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "member" "uuid",
    "tenant" "uuid" DEFAULT "public"."get_user_tenant"(),
    "email" "text" NOT NULL,
    "user" "uuid",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "roles" "text"[]
);

ALTER TABLE "public"."Profile" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."Race" (
    "id" smallint NOT NULL,
    "type" "text" NOT NULL
);

ALTER TABLE "public"."Race" OWNER TO "postgres";

ALTER TABLE "public"."Race" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Race_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."RecurrencePeriod" (
    "id" bigint NOT NULL,
    "type" "text" NOT NULL
);

ALTER TABLE "public"."RecurrencePeriod" OWNER TO "postgres";

ALTER TABLE "public"."RecurrencePeriod" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."RecurrencePeriod_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."SecurityRole" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "role_name" "text" NOT NULL,
    "permissions" "json" NOT NULL
);

ALTER TABLE "public"."SecurityRole" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."Sex" (
    "id" smallint NOT NULL,
    "type" "text" NOT NULL
);

ALTER TABLE "public"."Sex" OWNER TO "postgres";

ALTER TABLE "public"."Sex" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Sex_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."Tenant" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" NOT NULL,
    "member_limit" integer DEFAULT 100,
    "ensemble_limit" smallint DEFAULT '1'::smallint
);

ALTER TABLE "public"."Tenant" OWNER TO "postgres";

ALTER TABLE ONLY "public"."AddressType"
    ADD CONSTRAINT "AddressType_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."AddressType"
    ADD CONSTRAINT "AddressType_type_key" UNIQUE ("type");

ALTER TABLE ONLY "public"."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."AttendanceStatus"
    ADD CONSTRAINT "AttendanceStatus_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."AttendanceStatus"
    ADD CONSTRAINT "AttendanceStatus_type_key" UNIQUE ("type");

ALTER TABLE ONLY "public"."Attendance"
    ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY ("event", "member");

ALTER TABLE ONLY "public"."BroadcastStatus"
    ADD CONSTRAINT "BroadcastStatus_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."BroadcastStatus"
    ADD CONSTRAINT "BroadcastStatus_type_key" UNIQUE ("type");

ALTER TABLE ONLY "public"."Broadcast"
    ADD CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."Tenant"
    ADD CONSTRAINT "Client_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."Division"
    ADD CONSTRAINT "Division_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."EmailAddress"
    ADD CONSTRAINT "EmailAddress_email_key" UNIQUE ("email");

ALTER TABLE ONLY "public"."EmailAddress"
    ADD CONSTRAINT "EmailAddress_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."EmailType"
    ADD CONSTRAINT "EmailType_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."EmailType"
    ADD CONSTRAINT "EmailType_type_key" UNIQUE ("type");

ALTER TABLE ONLY "public"."EnsembleMembership"
    ADD CONSTRAINT "EnsembleMembership_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."EnsembleType"
    ADD CONSTRAINT "EnsembleType_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."EnsembleType"
    ADD CONSTRAINT "EnsembleType_type_key" UNIQUE ("type");

ALTER TABLE ONLY "public"."Ensemble"
    ADD CONSTRAINT "Ensemble_name_key" UNIQUE ("name", "tenant");

ALTER TABLE ONLY "public"."Ensemble"
    ADD CONSTRAINT "Ensemble_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."EventLineup"
    ADD CONSTRAINT "EventLineup_pkey" PRIMARY KEY ("event", "lineup");

ALTER TABLE ONLY "public"."EventModel"
    ADD CONSTRAINT "EventModel_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."EventType"
    ADD CONSTRAINT "EventType_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."EventType"
    ADD CONSTRAINT "EventType_type_key" UNIQUE ("type");

ALTER TABLE ONLY "public"."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."EyeColor"
    ADD CONSTRAINT "EyeColor_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."EyeColor"
    ADD CONSTRAINT "EyeColor_type_key" UNIQUE ("type");

ALTER TABLE ONLY "public"."HairColor"
    ADD CONSTRAINT "HairColor_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."HairColor"
    ADD CONSTRAINT "HairColor_type_key" UNIQUE ("type");

ALTER TABLE ONLY "public"."LineupAssignment"
    ADD CONSTRAINT "LineupAssignment_pkey" PRIMARY KEY ("lineup", "membership", "division");

ALTER TABLE ONLY "public"."Member"
    ADD CONSTRAINT "Member_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."MembershipStatus"
    ADD CONSTRAINT "MembershipStatus_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."MembershipStatus"
    ADD CONSTRAINT "MembershipStatus_type_key" UNIQUE ("type");

ALTER TABLE ONLY "public"."MembershipType"
    ADD CONSTRAINT "MembershipType_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."MembershipType"
    ADD CONSTRAINT "MembershipType_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."MembershipCapacity"
    ADD CONSTRAINT "PerformanceCapacity_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."MembershipCapacity"
    ADD CONSTRAINT "PerformanceCapacity_type_key" UNIQUE ("type");

ALTER TABLE ONLY "public"."PhoneNumber"
    ADD CONSTRAINT "PhoneNumber_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."PhoneType"
    ADD CONSTRAINT "PhoneType_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."PhoneType"
    ADD CONSTRAINT "PhoneType_type_key" UNIQUE ("type");

ALTER TABLE ONLY "public"."Profile"
    ADD CONSTRAINT "Profile_member_key" UNIQUE ("member");

ALTER TABLE ONLY "public"."Profile"
    ADD CONSTRAINT "Profile_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."Profile"
    ADD CONSTRAINT "Profile_user_key" UNIQUE ("user");

ALTER TABLE ONLY "public"."Race"
    ADD CONSTRAINT "Race_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."Race"
    ADD CONSTRAINT "Race_type_key" UNIQUE ("type");

ALTER TABLE ONLY "public"."RecurrencePeriod"
    ADD CONSTRAINT "RecurrencePeriod_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."RecurrencePeriod"
    ADD CONSTRAINT "RecurrencePeriod_type_key" UNIQUE ("type");

ALTER TABLE ONLY "public"."Lineup"
    ADD CONSTRAINT "Schema_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."Lineup"
    ADD CONSTRAINT "Schema_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."SecurityRole"
    ADD CONSTRAINT "Security_name_key" UNIQUE ("role_name");

ALTER TABLE ONLY "public"."SecurityRole"
    ADD CONSTRAINT "Security_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."Sex"
    ADD CONSTRAINT "Sex_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."Sex"
    ADD CONSTRAINT "Sex_type_key" UNIQUE ("type");

CREATE UNIQUE INDEX "Member_uniqueName" ON "public"."Member" USING "btree" ("firstName", "middleName", "lastName", "suffix", "tenant");

CREATE TRIGGER "broadcast_update_date" BEFORE UPDATE ON "public"."Broadcast" FOR EACH ROW EXECUTE FUNCTION "public"."broadcast_update_date"();

CREATE TRIGGER "calc_membership_expiration_trigger" BEFORE INSERT ON "public"."EnsembleMembership" FOR EACH ROW EXECUTE FUNCTION "public"."calc_membership_expiration"();

CREATE TRIGGER "conform_division_capacity_trigger" AFTER UPDATE ON "public"."Division" FOR EACH ROW EXECUTE FUNCTION "public"."conform_subdivision_capacities"();

CREATE TRIGGER "create_ensemble_prime_lineup" AFTER INSERT ON "public"."Ensemble" FOR EACH ROW EXECUTE FUNCTION "public"."create_ensemble_prime_lineup"();

CREATE TRIGGER "delete_child_divisions_trigger" AFTER DELETE ON "public"."Division" FOR EACH ROW EXECUTE FUNCTION "public"."delete_child_divisions"();

CREATE TRIGGER "handle_model_recurrence_change" AFTER INSERT OR UPDATE ON "public"."EventModel" FOR EACH ROW WHEN ((("new"."modelStartDate" IS NOT NULL) OR ("new"."recurrenceEndDate" IS NOT NULL) OR ("new"."interval" IS NOT NULL) OR ("new"."period" IS NOT NULL) OR ("new"."occurrence" IS NOT NULL))) EXECUTE FUNCTION "public"."handle_model_recurrence_change"();

CREATE TRIGGER "orphan_address_handler_trigger" AFTER DELETE OR UPDATE ON "public"."Event" FOR EACH ROW EXECUTE FUNCTION "public"."orphan_address_handler"();

CREATE TRIGGER "prep_new_member" BEFORE INSERT ON "public"."Member" FOR EACH ROW WHEN (("new"."aka" IS NULL)) EXECUTE FUNCTION "public"."prep_new_member"();

CREATE TRIGGER "setup_new_event_model" AFTER INSERT ON "public"."EventModel" FOR EACH ROW EXECUTE FUNCTION "public"."setup_new_event_model"();

CREATE TRIGGER "tenant_id_from_user_profile" BEFORE INSERT ON "public"."Ensemble" FOR EACH ROW EXECUTE FUNCTION "public"."tenant_id_from_user_profile"();

ALTER TABLE ONLY "public"."Address"
    ADD CONSTRAINT "Address_member_fkey" FOREIGN KEY ("member") REFERENCES "public"."Member"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Address"
    ADD CONSTRAINT "Address_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Address"
    ADD CONSTRAINT "Address_type_fkey" FOREIGN KEY ("type") REFERENCES "public"."AddressType"("type") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."Attendance"
    ADD CONSTRAINT "Attendance_event_fkey" FOREIGN KEY ("event") REFERENCES "public"."Event"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Attendance"
    ADD CONSTRAINT "Attendance_member_fkey" FOREIGN KEY ("member") REFERENCES "public"."Member"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Attendance"
    ADD CONSTRAINT "Attendance_status_fkey" FOREIGN KEY ("status") REFERENCES "public"."AttendanceStatus"("id");

ALTER TABLE ONLY "public"."Attendance"
    ADD CONSTRAINT "Attendance_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "public"."Tenant"("id");

ALTER TABLE ONLY "public"."Broadcast"
    ADD CONSTRAINT "Broadcast_status_fkey" FOREIGN KEY ("status") REFERENCES "public"."BroadcastStatus"("type");

ALTER TABLE ONLY "public"."Broadcast"
    ADD CONSTRAINT "Broadcast_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "public"."Tenant"("id");

ALTER TABLE ONLY "public"."Division"
    ADD CONSTRAINT "Division_capacity_fkey" FOREIGN KEY ("capacity") REFERENCES "public"."MembershipCapacity"("type");

ALTER TABLE ONLY "public"."Division"
    ADD CONSTRAINT "Division_ensemble_fkey" FOREIGN KEY ("ensemble") REFERENCES "public"."Ensemble"("id");

ALTER TABLE ONLY "public"."Division"
    ADD CONSTRAINT "Division_parent_division_fkey" FOREIGN KEY ("parent_division") REFERENCES "public"."Division"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."EmailAddress"
    ADD CONSTRAINT "EmailAddress_member_fkey" FOREIGN KEY ("member") REFERENCES "public"."Member"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."EmailAddress"
    ADD CONSTRAINT "EmailAddress_type_fkey" FOREIGN KEY ("type") REFERENCES "public"."EmailType"("type");

ALTER TABLE ONLY "public"."EnsembleMembership"
    ADD CONSTRAINT "EnsembleMembership_ensemble_fkey" FOREIGN KEY ("ensemble") REFERENCES "public"."Ensemble"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."EnsembleMembership"
    ADD CONSTRAINT "EnsembleMembership_member_fkey" FOREIGN KEY ("member") REFERENCES "public"."Member"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."EnsembleMembership"
    ADD CONSTRAINT "EnsembleMembership_membership_type_fkey" FOREIGN KEY ("membership_type") REFERENCES "public"."MembershipType"("id");

ALTER TABLE ONLY "public"."EnsembleMembership"
    ADD CONSTRAINT "EnsembleMembership_status_fkey" FOREIGN KEY ("status") REFERENCES "public"."MembershipStatus"("type") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."Ensemble"
    ADD CONSTRAINT "Ensemble_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "public"."Tenant"("id");

ALTER TABLE ONLY "public"."Ensemble"
    ADD CONSTRAINT "Ensemble_type_fkey" FOREIGN KEY ("type") REFERENCES "public"."EnsembleType"("type");

ALTER TABLE ONLY "public"."EventLineup"
    ADD CONSTRAINT "EventLineup_event_fkey" FOREIGN KEY ("event") REFERENCES "public"."Event"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."EventLineup"
    ADD CONSTRAINT "EventLineup_lineup_fkey" FOREIGN KEY ("lineup") REFERENCES "public"."Lineup"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."EventModel"
    ADD CONSTRAINT "EventModel_address_fkey" FOREIGN KEY ("address") REFERENCES "public"."Address"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."EventModel"
    ADD CONSTRAINT "EventModel_parent_fkey" FOREIGN KEY ("parent") REFERENCES "public"."EventModel"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."EventModel"
    ADD CONSTRAINT "EventModel_period_fkey" FOREIGN KEY ("period") REFERENCES "public"."RecurrencePeriod"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."EventModel"
    ADD CONSTRAINT "EventModel_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."EventModel"
    ADD CONSTRAINT "EventModel_type_fkey" FOREIGN KEY ("type") REFERENCES "public"."EventType"("type");

ALTER TABLE ONLY "public"."Event"
    ADD CONSTRAINT "Event_address_fkey" FOREIGN KEY ("address") REFERENCES "public"."Address"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."Event"
    ADD CONSTRAINT "Event_model_fkey" FOREIGN KEY ("model") REFERENCES "public"."EventModel"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Event"
    ADD CONSTRAINT "Event_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."LineupAssignment"
    ADD CONSTRAINT "LineupAssignment_capacity_fkey" FOREIGN KEY ("capacity") REFERENCES "public"."MembershipCapacity"("type");

ALTER TABLE ONLY "public"."LineupAssignment"
    ADD CONSTRAINT "LineupAssignment_division_fkey" FOREIGN KEY ("division") REFERENCES "public"."Division"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."LineupAssignment"
    ADD CONSTRAINT "LineupAssignment_lineup_fkey" FOREIGN KEY ("lineup") REFERENCES "public"."Lineup"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."LineupAssignment"
    ADD CONSTRAINT "LineupAssignment_membership_fkey" FOREIGN KEY ("membership") REFERENCES "public"."EnsembleMembership"("id");

ALTER TABLE ONLY "public"."Lineup"
    ADD CONSTRAINT "Lineup_ensemble_fkey" FOREIGN KEY ("ensemble") REFERENCES "public"."Ensemble"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Member"
    ADD CONSTRAINT "Member_eyes_fkey" FOREIGN KEY ("eyes") REFERENCES "public"."EyeColor"("type");

ALTER TABLE ONLY "public"."Member"
    ADD CONSTRAINT "Member_hair_fkey" FOREIGN KEY ("hair") REFERENCES "public"."HairColor"("type");

ALTER TABLE ONLY "public"."Member"
    ADD CONSTRAINT "Member_race_fkey" FOREIGN KEY ("race") REFERENCES "public"."Race"("type");

ALTER TABLE ONLY "public"."Member"
    ADD CONSTRAINT "Member_sex_fkey" FOREIGN KEY ("sex") REFERENCES "public"."Sex"("type");

ALTER TABLE ONLY "public"."Member"
    ADD CONSTRAINT "Member_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "public"."Tenant"("id");

ALTER TABLE ONLY "public"."MembershipType"
    ADD CONSTRAINT "MembershipType_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."MembershipType"
    ADD CONSTRAINT "MembershipType_term_period_fkey" FOREIGN KEY ("term_period") REFERENCES "public"."RecurrencePeriod"("type");

ALTER TABLE ONLY "public"."PhoneNumber"
    ADD CONSTRAINT "PhoneNumber_member_fkey" FOREIGN KEY ("member") REFERENCES "public"."Member"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."PhoneNumber"
    ADD CONSTRAINT "PhoneNumber_type_fkey" FOREIGN KEY ("type") REFERENCES "public"."PhoneType"("type") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."Profile"
    ADD CONSTRAINT "Profile_member_fkey" FOREIGN KEY ("member") REFERENCES "public"."Member"("id");

ALTER TABLE ONLY "public"."Profile"
    ADD CONSTRAINT "Profile_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "public"."Tenant"("id");

ALTER TABLE ONLY "public"."Profile"
    ADD CONSTRAINT "Profile_user_fkey" FOREIGN KEY ("user") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."Address" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."AddressType" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Attendance" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."AttendanceStatus" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Broadcast" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."BroadcastStatus" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Division" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."EmailAddress" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."EmailType" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Ensemble" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."EnsembleMembership" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."EnsembleType" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Event" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."EventLineup" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."EventModel" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."EventType" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."EyeColor" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."HairColor" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Lineup" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."LineupAssignment" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Member" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."MembershipCapacity" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."MembershipStatus" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."MembershipType" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."PhoneNumber" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."PhoneType" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Profile" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Race" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."RecurrencePeriod" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."SecurityRole" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Sex" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Tenant" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read-only policy" ON "public"."AddressType" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "authenticated read-only policy" ON "public"."AttendanceStatus" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "authenticated read-only policy" ON "public"."BroadcastStatus" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "authenticated read-only policy" ON "public"."EmailType" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "authenticated read-only policy" ON "public"."EnsembleType" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "authenticated read-only policy" ON "public"."EventType" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "authenticated read-only policy" ON "public"."EyeColor" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "authenticated read-only policy" ON "public"."HairColor" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "authenticated read-only policy" ON "public"."MembershipCapacity" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "authenticated read-only policy" ON "public"."MembershipStatus" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "authenticated read-only policy" ON "public"."PhoneType" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "authenticated read-only policy" ON "public"."Race" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "authenticated read-only policy" ON "public"."RecurrencePeriod" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "authenticated read-only policy" ON "public"."SecurityRole" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "authenticated read-only policy" ON "public"."Sex" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "authenticated read-only policy" ON "public"."Tenant" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "authenticated_user Profile policy" ON "public"."Profile" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "tenant policy" ON "public"."Address" TO "authenticated" USING (("public"."get_user_tenant"() = "tenant")) WITH CHECK (("public"."get_user_tenant"() = "tenant"));

CREATE POLICY "tenant policy" ON "public"."Attendance" TO "authenticated" USING (("public"."get_user_tenant"() = "tenant")) WITH CHECK (("public"."get_user_tenant"() = "tenant"));

CREATE POLICY "tenant policy" ON "public"."Broadcast" TO "authenticated" USING (("public"."get_user_tenant"() = "tenant")) WITH CHECK (("public"."get_user_tenant"() = "tenant"));

CREATE POLICY "tenant policy" ON "public"."Division" TO "authenticated" USING (("public"."get_user_tenant"() = "public"."get_ensemble_tenant"("ensemble"))) WITH CHECK (("public"."get_user_tenant"() = "public"."get_ensemble_tenant"("ensemble")));

CREATE POLICY "tenant policy" ON "public"."EmailAddress" TO "authenticated" USING (("public"."get_user_tenant"() = "public"."get_member_tenant"("member"))) WITH CHECK (("public"."get_user_tenant"() = "public"."get_member_tenant"("member")));

CREATE POLICY "tenant policy" ON "public"."Ensemble" TO "authenticated" USING (("public"."get_user_tenant"() = "tenant")) WITH CHECK (("public"."get_user_tenant"() = "tenant"));

CREATE POLICY "tenant policy" ON "public"."EnsembleMembership" TO "authenticated" USING (("public"."get_user_tenant"() = "public"."get_ensemble_tenant"("ensemble"))) WITH CHECK (("public"."get_user_tenant"() = "public"."get_ensemble_tenant"("ensemble")));

CREATE POLICY "tenant policy" ON "public"."Event" TO "authenticated" USING (("public"."get_user_tenant"() = "tenant")) WITH CHECK (("public"."get_user_tenant"() = "tenant"));

CREATE POLICY "tenant policy" ON "public"."EventLineup" TO "authenticated" USING ((( SELECT "public"."get_ensemble_tenant"("Lineup"."ensemble") AS "get_ensemble_tenant"
   FROM "public"."Lineup"
  WHERE ("Lineup"."id" = "EventLineup"."lineup")) = "public"."get_user_tenant"())) WITH CHECK ((( SELECT "public"."get_ensemble_tenant"("Lineup"."ensemble") AS "get_ensemble_tenant"
   FROM "public"."Lineup"
  WHERE ("Lineup"."id" = "EventLineup"."lineup")) = "public"."get_user_tenant"()));

CREATE POLICY "tenant policy" ON "public"."EventModel" TO "authenticated" USING (("public"."get_user_tenant"() = "tenant")) WITH CHECK (("public"."get_user_tenant"() = "tenant"));

CREATE POLICY "tenant policy" ON "public"."Lineup" TO "authenticated" USING (("public"."get_user_tenant"() = "public"."get_ensemble_tenant"("ensemble"))) WITH CHECK (("public"."get_user_tenant"() = "public"."get_ensemble_tenant"("ensemble")));

CREATE POLICY "tenant policy" ON "public"."LineupAssignment" TO "authenticated" USING ((( SELECT "public"."get_ensemble_tenant"("Lineup"."ensemble") AS "get_ensemble_tenant"
   FROM "public"."Lineup"
  WHERE ("Lineup"."id" = "LineupAssignment"."lineup")) = "public"."get_user_tenant"())) WITH CHECK ((( SELECT "public"."get_ensemble_tenant"("Lineup"."ensemble") AS "get_ensemble_tenant"
   FROM "public"."Lineup"
  WHERE ("Lineup"."id" = "LineupAssignment"."lineup")) = "public"."get_user_tenant"()));

CREATE POLICY "tenant policy" ON "public"."Member" TO "authenticated" USING (("public"."get_user_tenant"() = "tenant")) WITH CHECK (("public"."get_user_tenant"() = "tenant"));

CREATE POLICY "tenant policy" ON "public"."MembershipType" TO "authenticated" USING (("public"."get_user_tenant"() = "tenant")) WITH CHECK (("public"."get_user_tenant"() = "tenant"));

CREATE POLICY "tenant policy" ON "public"."PhoneNumber" TO "authenticated" USING (("public"."get_user_tenant"() = "public"."get_member_tenant"("member"))) WITH CHECK (("public"."get_user_tenant"() = "public"."get_member_tenant"("member")));

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."broadcast_update_date"() TO "anon";
GRANT ALL ON FUNCTION "public"."broadcast_update_date"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."broadcast_update_date"() TO "service_role";

GRANT ALL ON FUNCTION "public"."calc_membership_expiration"() TO "anon";
GRANT ALL ON FUNCTION "public"."calc_membership_expiration"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calc_membership_expiration"() TO "service_role";

GRANT ALL ON FUNCTION "public"."clone_broadcast"("broadcast_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."clone_broadcast"("broadcast_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."clone_broadcast"("broadcast_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."clone_lineup"("lineup_id" "uuid", "new_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."clone_lineup"("lineup_id" "uuid", "new_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."clone_lineup"("lineup_id" "uuid", "new_name" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."conform_subdivision_capacities"() TO "anon";
GRANT ALL ON FUNCTION "public"."conform_subdivision_capacities"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."conform_subdivision_capacities"() TO "service_role";

GRANT ALL ON FUNCTION "public"."create_ensemble_prime_lineup"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_ensemble_prime_lineup"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_ensemble_prime_lineup"() TO "service_role";

GRANT ALL ON FUNCTION "public"."create_new_member"("first_name" "text", "last_name" "text", "tenant_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_member"("first_name" "text", "last_name" "text", "tenant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_member"("first_name" "text", "last_name" "text", "tenant_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."create_new_member_email"("new_member_id" "uuid", "new_member_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_member_email"("new_member_id" "uuid", "new_member_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_member_email"("new_member_id" "uuid", "new_member_email" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."create_new_tenant"("new_tenant_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_tenant"("new_tenant_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_tenant"("new_tenant_name" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."create_new_user_profile"("tenant_id" "uuid", "user_email" "text", "member_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_user_profile"("tenant_id" "uuid", "user_email" "text", "member_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_user_profile"("tenant_id" "uuid", "user_email" "text", "member_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."delete_child_divisions"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_child_divisions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_child_divisions"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_dates_by_occurrence"("start_date" timestamp with time zone, "end_date" "date", "interval_int" smallint, "period" bigint, "occurrence" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_dates_by_occurrence"("start_date" timestamp with time zone, "end_date" "date", "interval_int" smallint, "period" bigint, "occurrence" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dates_by_occurrence"("start_date" timestamp with time zone, "end_date" "date", "interval_int" smallint, "period" bigint, "occurrence" "text"[]) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_divisions_json"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_divisions_json"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_divisions_json"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_ensemble_emails"("ensemble_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_ensemble_emails"("ensemble_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_ensemble_emails"("ensemble_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_ensemble_tenant"("ensemble_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_ensemble_tenant"("ensemble_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_ensemble_tenant"("ensemble_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_member_tenant"("member_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_member_tenant"("member_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_member_tenant"("member_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_tenant"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_tenant"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_tenant"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_model_recurrence_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_model_recurrence_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_model_recurrence_change"() TO "service_role";

GRANT ALL ON FUNCTION "public"."initialize_new_customer"("customer_name" "text", "first_name" "text", "last_name" "text", "user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."initialize_new_customer"("customer_name" "text", "first_name" "text", "last_name" "text", "user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."initialize_new_customer"("customer_name" "text", "first_name" "text", "last_name" "text", "user_email" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."orphan_address_handler"() TO "anon";
GRANT ALL ON FUNCTION "public"."orphan_address_handler"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."orphan_address_handler"() TO "service_role";

GRANT ALL ON FUNCTION "public"."prep_new_member"() TO "anon";
GRANT ALL ON FUNCTION "public"."prep_new_member"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prep_new_member"() TO "service_role";

GRANT ALL ON FUNCTION "public"."setup_new_event_model"() TO "anon";
GRANT ALL ON FUNCTION "public"."setup_new_event_model"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."setup_new_event_model"() TO "service_role";

GRANT ALL ON FUNCTION "public"."tenant_id_from_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."tenant_id_from_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."tenant_id_from_user_profile"() TO "service_role";

GRANT ALL ON TABLE "public"."Address" TO "anon";
GRANT ALL ON TABLE "public"."Address" TO "authenticated";
GRANT ALL ON TABLE "public"."Address" TO "service_role";

GRANT ALL ON TABLE "public"."AddressType" TO "anon";
GRANT ALL ON TABLE "public"."AddressType" TO "authenticated";
GRANT ALL ON TABLE "public"."AddressType" TO "service_role";

GRANT ALL ON SEQUENCE "public"."AddressType_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."AddressType_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."AddressType_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."Attendance" TO "anon";
GRANT ALL ON TABLE "public"."Attendance" TO "authenticated";
GRANT ALL ON TABLE "public"."Attendance" TO "service_role";

GRANT ALL ON TABLE "public"."AttendanceStatus" TO "anon";
GRANT ALL ON TABLE "public"."AttendanceStatus" TO "authenticated";
GRANT ALL ON TABLE "public"."AttendanceStatus" TO "service_role";

GRANT ALL ON SEQUENCE "public"."AttendanceStatus_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."AttendanceStatus_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."AttendanceStatus_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."Broadcast" TO "anon";
GRANT ALL ON TABLE "public"."Broadcast" TO "authenticated";
GRANT ALL ON TABLE "public"."Broadcast" TO "service_role";

GRANT ALL ON TABLE "public"."BroadcastStatus" TO "anon";
GRANT ALL ON TABLE "public"."BroadcastStatus" TO "authenticated";
GRANT ALL ON TABLE "public"."BroadcastStatus" TO "service_role";

GRANT ALL ON SEQUENCE "public"."BroadcastStatus_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."BroadcastStatus_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."BroadcastStatus_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."Division" TO "anon";
GRANT ALL ON TABLE "public"."Division" TO "authenticated";
GRANT ALL ON TABLE "public"."Division" TO "service_role";

GRANT ALL ON TABLE "public"."EmailAddress" TO "anon";
GRANT ALL ON TABLE "public"."EmailAddress" TO "authenticated";
GRANT ALL ON TABLE "public"."EmailAddress" TO "service_role";

GRANT ALL ON TABLE "public"."EmailType" TO "anon";
GRANT ALL ON TABLE "public"."EmailType" TO "authenticated";
GRANT ALL ON TABLE "public"."EmailType" TO "service_role";

GRANT ALL ON SEQUENCE "public"."EmailType_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."EmailType_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."EmailType_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."Ensemble" TO "anon";
GRANT ALL ON TABLE "public"."Ensemble" TO "authenticated";
GRANT ALL ON TABLE "public"."Ensemble" TO "service_role";

GRANT ALL ON TABLE "public"."EnsembleMembership" TO "anon";
GRANT ALL ON TABLE "public"."EnsembleMembership" TO "authenticated";
GRANT ALL ON TABLE "public"."EnsembleMembership" TO "service_role";

GRANT ALL ON TABLE "public"."EnsembleType" TO "anon";
GRANT ALL ON TABLE "public"."EnsembleType" TO "authenticated";
GRANT ALL ON TABLE "public"."EnsembleType" TO "service_role";

GRANT ALL ON SEQUENCE "public"."EnsembleType_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."EnsembleType_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."EnsembleType_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."Event" TO "anon";
GRANT ALL ON TABLE "public"."Event" TO "authenticated";
GRANT ALL ON TABLE "public"."Event" TO "service_role";

GRANT ALL ON TABLE "public"."EventLineup" TO "anon";
GRANT ALL ON TABLE "public"."EventLineup" TO "authenticated";
GRANT ALL ON TABLE "public"."EventLineup" TO "service_role";

GRANT ALL ON TABLE "public"."EventModel" TO "anon";
GRANT ALL ON TABLE "public"."EventModel" TO "authenticated";
GRANT ALL ON TABLE "public"."EventModel" TO "service_role";

GRANT ALL ON TABLE "public"."EventType" TO "anon";
GRANT ALL ON TABLE "public"."EventType" TO "authenticated";
GRANT ALL ON TABLE "public"."EventType" TO "service_role";

GRANT ALL ON SEQUENCE "public"."EventType_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."EventType_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."EventType_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."EyeColor" TO "anon";
GRANT ALL ON TABLE "public"."EyeColor" TO "authenticated";
GRANT ALL ON TABLE "public"."EyeColor" TO "service_role";

GRANT ALL ON SEQUENCE "public"."EyeColor_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."EyeColor_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."EyeColor_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."HairColor" TO "anon";
GRANT ALL ON TABLE "public"."HairColor" TO "authenticated";
GRANT ALL ON TABLE "public"."HairColor" TO "service_role";

GRANT ALL ON SEQUENCE "public"."HairColor_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."HairColor_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."HairColor_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."Lineup" TO "anon";
GRANT ALL ON TABLE "public"."Lineup" TO "authenticated";
GRANT ALL ON TABLE "public"."Lineup" TO "service_role";

GRANT ALL ON TABLE "public"."LineupAssignment" TO "anon";
GRANT ALL ON TABLE "public"."LineupAssignment" TO "authenticated";
GRANT ALL ON TABLE "public"."LineupAssignment" TO "service_role";

GRANT ALL ON TABLE "public"."Member" TO "anon";
GRANT ALL ON TABLE "public"."Member" TO "authenticated";
GRANT ALL ON TABLE "public"."Member" TO "service_role";

GRANT ALL ON TABLE "public"."MembershipCapacity" TO "anon";
GRANT ALL ON TABLE "public"."MembershipCapacity" TO "authenticated";
GRANT ALL ON TABLE "public"."MembershipCapacity" TO "service_role";

GRANT ALL ON TABLE "public"."MembershipStatus" TO "anon";
GRANT ALL ON TABLE "public"."MembershipStatus" TO "authenticated";
GRANT ALL ON TABLE "public"."MembershipStatus" TO "service_role";

GRANT ALL ON SEQUENCE "public"."MembershipStatus_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."MembershipStatus_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."MembershipStatus_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."MembershipType" TO "anon";
GRANT ALL ON TABLE "public"."MembershipType" TO "authenticated";
GRANT ALL ON TABLE "public"."MembershipType" TO "service_role";

GRANT ALL ON SEQUENCE "public"."MembershipType_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."MembershipType_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."MembershipType_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."PerformanceCapacity_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."PerformanceCapacity_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."PerformanceCapacity_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."PhoneNumber" TO "anon";
GRANT ALL ON TABLE "public"."PhoneNumber" TO "authenticated";
GRANT ALL ON TABLE "public"."PhoneNumber" TO "service_role";

GRANT ALL ON TABLE "public"."PhoneType" TO "anon";
GRANT ALL ON TABLE "public"."PhoneType" TO "authenticated";
GRANT ALL ON TABLE "public"."PhoneType" TO "service_role";

GRANT ALL ON SEQUENCE "public"."PhoneType_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."PhoneType_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."PhoneType_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."Profile" TO "anon";
GRANT ALL ON TABLE "public"."Profile" TO "authenticated";
GRANT ALL ON TABLE "public"."Profile" TO "service_role";

GRANT ALL ON TABLE "public"."Race" TO "anon";
GRANT ALL ON TABLE "public"."Race" TO "authenticated";
GRANT ALL ON TABLE "public"."Race" TO "service_role";

GRANT ALL ON SEQUENCE "public"."Race_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Race_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Race_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."RecurrencePeriod" TO "anon";
GRANT ALL ON TABLE "public"."RecurrencePeriod" TO "authenticated";
GRANT ALL ON TABLE "public"."RecurrencePeriod" TO "service_role";

GRANT ALL ON SEQUENCE "public"."RecurrencePeriod_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."RecurrencePeriod_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."RecurrencePeriod_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."SecurityRole" TO "anon";
GRANT ALL ON TABLE "public"."SecurityRole" TO "authenticated";
GRANT ALL ON TABLE "public"."SecurityRole" TO "service_role";

GRANT ALL ON TABLE "public"."Sex" TO "anon";
GRANT ALL ON TABLE "public"."Sex" TO "authenticated";
GRANT ALL ON TABLE "public"."Sex" TO "service_role";

GRANT ALL ON SEQUENCE "public"."Sex_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Sex_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Sex_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."Tenant" TO "anon";
GRANT ALL ON TABLE "public"."Tenant" TO "authenticated";
GRANT ALL ON TABLE "public"."Tenant" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
