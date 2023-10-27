alter table "public"."Member" drop constraint "Member_eyes_fkey";

alter table "public"."Member" drop constraint "Member_hair_fkey";

alter table "public"."Member" drop constraint "Member_race_fkey";

alter table "public"."Member" drop constraint "Member_sex_fkey";

alter table "public"."Division" drop constraint "Division_capacity_fkey";

alter table "public"."Member" alter column "eyes" set data type text using "eyes"::text;

alter table "public"."Member" alter column "hair" set data type text using "hair"::text;

alter table "public"."Member" alter column "race" set data type text using "race"::text;

alter table "public"."Member" alter column "sex" set data type text using "sex"::text;

alter table "public"."Division" alter column "capacity" set data type text using "capacity"::text;

alter table "public"."Division" add constraint "Division_capacity_fkey" FOREIGN KEY (capacity) REFERENCES "MembershipCapacity"(type) not valid;

alter table "public"."Division" validate constraint "Division_capacity_fkey";

update "public"."Member" set "eyes" = (select "type" from "EyeColor" e where e."id" = "Member".eyes::smallint);
update "public"."Member" set "hair" = (select "type" from "HairColor" h where h."id" = "Member".hair::smallint);
update "public"."Member" set "race" = (select "type" from "Race" r where r."id" = "Member".race::smallint);
update "public"."Member" set "sex" = (select "type" from "Sex" s where s."id" = "Member".sex::smallint);

alter table "public"."Member" add constraint "Member_eyes_fkey" FOREIGN KEY (eyes) REFERENCES "EyeColor"(type) not valid;

alter table "public"."Member" validate constraint "Member_eyes_fkey";

alter table "public"."Member" add constraint "Member_hair_fkey" FOREIGN KEY (hair) REFERENCES "HairColor"(type) not valid;

alter table "public"."Member" validate constraint "Member_hair_fkey";

alter table "public"."Member" add constraint "Member_race_fkey" FOREIGN KEY (race) REFERENCES "Race"(type) not valid;

alter table "public"."Member" validate constraint "Member_race_fkey";

alter table "public"."Member" add constraint "Member_sex_fkey" FOREIGN KEY (sex) REFERENCES "Sex"(type) not valid;

alter table "public"."Member" validate constraint "Member_sex_fkey";


