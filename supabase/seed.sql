INSERT INTO "AddressType" ("type")
VALUES 
    ('Home'),
    ('Work'),
    ('Temporary'),
    ('Secondary'),
    ('Old');

INSERT INTO "AttendanceStatus" ("type")
VALUES 
    ('Uncounted'),
    ('Tardy'),
    ('Absent'),
    ('Excused'),
    ('Present');

INSERT INTO "BroadcastStatus" ("type")
VALUES ('DRAFT'),('PUBLISHED');

INSERT INTO "EmailType" ("type")
VALUES 
    ('Primary'),
    ('Personal'),
    ('Work'),
    ('Secondary'),
    ('Other');

INSERT INTO "EnsembleType" ("type", "color")
VALUES 
    ('chorus', '200 100% 50%'),
    ('orchestra', '280 100% 50%'),
    ('band', '340 100% 50%'),
    ('theater', '50 100% 50%');

INSERT INTO "EventType" ("type", "color")
VALUES 
    ('Rehearsal', '50 80% 50%'),
    ('Dress Rehearsal', '100 80% 50%'),
    ('Performance', '190 80% 50%'),
    ('Social', '250 80% 50%'),
    ('Administrative', '300 80% 50%'),
    ('Audition', '340 80% 50%');

INSERT INTO "EyeColor" ("type")
VALUES 
    ('unspecified'),
    ('brown'),
    ('blue'),
    ('green'),
    ('hazel');

INSERT INTO "HairColor" ("type")
VALUES 
    ('unspecified'),
    ('brown'),
    ('blonde'),
    ('black'),
    ('red'),
    ('gray'),
    ('white'),
    ('bald'),
    ('colored');

INSERT INTO "MembershipCapacity" ("type")
VALUES 
    ('Performer'),
    ('Crew'),
    ('Staff'),
    ('Board'),
    ('Guardian');

INSERT INTO "MembershipStatus" ("type")
VALUES 
    ('Active'),
    ('Retired'),
    ('Suspended'),
    ('Inactive'),
    ('Terminated');

INSERT INTO "PhoneType" ("type")
VALUES 
    ('Primary'),
    ('Home'),
    ('Mobile'),
    ('Work'),
    ('Emergency'),
    ('Old');

INSERT INTO "Race" ("type")
VALUES 
    ('unspecified'),
    ('Asian'),
    ('Black'),
    ('Hispanic'),
    ('Native American'),
    ('White');

INSERT INTO "RecurrencePeriod" ("type")
VALUES 
    ('Week'),
    ('Month'),
    ('Year');

INSERT INTO "SecurityRole" ("role_name", "permissions")
VALUES 
    ('Admin', '{"modules":{"members":"all","calendar":"all","messages":"all","settings":"all","dashboard":"all","ensembles":"all"}}');


INSERT INTO "Sex" ("type")
VALUES 
    ('unspecified'),
    ('female'),
    ('male');