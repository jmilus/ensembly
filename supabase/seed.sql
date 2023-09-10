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
    ('chorus', '#00aaff'),
    ('orchestra', '#aa00ff'),
    ('theater', '#ffd500');

INSERT INTO "EventType" ("type", "color")
VALUES 
    ('Rehearsal', '#e6c419'),
    ('Dress Rehearsal', '#5de619'),
    ('Performance', '#19c3e6'),
    ('Social', '#3b19e6'),
    ('Administrative', '#e619e5'),
    ('Audition', '#e6195d');

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
    ('Staff');

INSERT INTO "MembershipStatus" ("type")
VALUES 
    ('Active'),
    ('Suspended'),
    ('Inactive'),
    ('Retired');

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
    ('Month');

INSERT INTO "SecurityRole" ("role", "permissions")
VALUES 
    ('Admin', '{"modules":{"members":"all","calendar":"all","messages":"all","settings":"all","dashboard":"all","ensembles":"all"}}');


INSERT INTO "Sex" ("type")
VALUES 
    ('unspecified'),
    ('female'),
    ('male');