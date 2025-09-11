

CREATE TABLE IF NOT EXISTS 
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           TIMESTAMP,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        TIMESTAMP,
    "started_at"            TIMESTAMP NOT NULL DEFAULT current_timestamp,
    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
);
INSERT INTO _prisma_migrations VALUES('deee1b6c-d624-4598-94a8-94f3762d1dfe','ab979282b7e1dc6288ba200e4ace9e7290c8cc1245ef540b6ccd440097356a31',1757458330741,'20250909224241_add_links_table',NULL,NULL,1757458330740,1);
CREATE TABLE IF NOT EXISTS 
    "id" TEXT NOT NULL PRIMARY KEY,
    "src" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);
INSERT INTO gallery_images VALUES('cmfd5cthl0000eo03zzac0gq1','https://media.merlinkraemer.com/Cozy-Bed.webp','Cozy-Bed','56x42cm, Acryl, Pastel auf Holz - 50€','finished',2024,1,2,1757458401609,1757585319186);
INSERT INTO gallery_images VALUES('cmfd5cthq0001eo03ir2u6bkt','https://media.merlinkraemer.com/IMG_0409.webp','IMG_0409','40x80cm, Acryl auf Leinwand','wip',2025,0,1,1757458401615,1757585319187);
INSERT INTO gallery_images VALUES('cmfd5cthv0008eo03ixxlgrmq','https://media.merlinkraemer.com/Katze-in-Pflanze.webp','Katze-in-Pflanze','60x60cm, Acryl, Pastel auf Leinwand - 60€ (Verkauft)','finished',2024,1,2,1757458401620,1757585319188);
INSERT INTO gallery_images VALUES('cmfd5cthw0009eo03ydi3h76d','https://media.merlinkraemer.com/Sonnenritter.webp','Sonnenritter','52x82cm, Acryl auf Holz - 75€ (Verkauft)','finished',2024,2,4,1757458401620,1757585319189);
INSERT INTO gallery_images VALUES('cmfd5cthw000aeo03dm6iagbe','https://media.merlinkraemer.com/Studio-Gatos.webp','Studio-Gatos','112x73cm, Acryl auf Holz - 165€ (Verkauft)','finished',2024,6,2,1757458401621,1757585319189);
INSERT INTO gallery_images VALUES('cmfd5cthx000beo033yr032zx','https://media.merlinkraemer.com/Treibhaus.webp','Treibhaus','76x78cm, Öl, Acryl, Latex auf Leinwand - 75€ (Verkauft)','finished',2024,3,1,1757458401621,1757585319190);
INSERT INTO gallery_images VALUES('cmfd5cthx000ceo03wwjo8frw','https://media.merlinkraemer.com/pizzalady.webp','pizzalady','40x40cm, Acryl auf Leinwand - 50€','finished',2024,4,2,1757458401622,1757585319190);
INSERT INTO gallery_images VALUES('cmfd5cthy000deo03pa4lqhe2','https://media.merlinkraemer.com/room1.webp','room1','40x40cm, Acryl auf Leinwand (Reserviert)','finished',2024,5,1,1757458401622,1757585319190);
CREATE TABLE IF NOT EXISTS 
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);
INSERT INTO links VALUES(2,'"Live aus der Werkstatt 1" - Mix','https://soundcloud.com/merlin040/live-aus-der-werkstatt-1',2,1757458401623,1757464186733);
INSERT INTO links VALUES(3,'"Keys Don''t Match" - Stimming, Dominique Fricot - Merlin Remix','https://soundcloud.com/merlin040/keys-dont-match-remix',3,1757458401624,1757464186733);
INSERT INTO links VALUES(4,'@ Studio Boschstraße 20.04.2025 - Mix','https://soundcloud.com/merlin040/set-20042025',4,1757458401625,1757464186733);
INSERT INTO links VALUES(5,'"Der starke Wanja" EP','https://soundcloud.com/merlin040/sets/wanja',5,1757458401626,1757464186733);
INSERT INTO links VALUES(6,'SoundCloud 🎶','https://soundcloud.com/merlin040',6,1757458401627,1757464186733);
INSERT INTO links VALUES(7,'Bandcamp (Sunset Records) 🌞','https://sunsetrecords-040.bandcamp.com/',7,1757458401627,1757464186733);
INSERT INTO links VALUES(8,'Instagram 🎨','https://instagram.com/merlinkraemer',8,1757458401628,1757464186733);
INSERT INTO links VALUES(9,'TikTok','https://www.tiktok.com/@merlinsroom',9,1757458401630,1757464186734);
INSERT INTO links VALUES(10,'YouTube','https://www.youtube.com/@merlins-room',10,1757458401631,1757464186734);
INSERT INTO links VALUES(11,'Twitch','https://www.twitch.tv/merlinsroom',11,1757458401632,1757464186735);
INSERT INTO links VALUES(13,'@ OA 26-07-2025 - liveset',' https://soundcloud.com/merlin040/oa-260725',1,1757459254961,1757464186733);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('links',15);
CREATE UNIQUE INDEX "gallery_images_src_key" ON "gallery_images"("src");

