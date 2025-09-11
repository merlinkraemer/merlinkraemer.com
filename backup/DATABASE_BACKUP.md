# Database Content Backup

This file contains a backup of all database content in case of data loss.

**Last Updated**: September 11, 2025

## Gallery Images

### Finished Works (2024)

1. **Cozy-Bed**

   - **Description**: 56x42cm, Acryl, Pastel auf Holz - 50€
   - **Category**: finished
   - **Year**: 2024
   - **Order**: 1
   - **URL**: https://media.merlinkraemer.com/Cozy-Bed.webp

2. **Katze-in-Pflanze**

   - **Description**: 60x60cm, Acryl, Pastel auf Leinwand - 60€ (Verkauft)
   - **Category**: finished
   - **Year**: 2024
   - **Order**: 2
   - **URL**: https://media.merlinkraemer.com/Katze-in-Pflanze.webp

3. **Sonnenritter**

   - **Description**: 52x82cm, Acryl auf Holz - 75€ (Verkauft)
   - **Category**: finished
   - **Year**: 2024
   - **Order**: 4
   - **URL**: https://media.merlinkraemer.com/Sonnenritter.webp

4. **Treibhaus**

   - **Description**: 76x78cm, Öl, Acryl, Latex auf Leinwand - 75€ (Verkauft)
   - **Category**: finished
   - **Year**: 2024
   - **Order**: 1
   - **URL**: https://media.merlinkraemer.com/Treibhaus.webp

5. **pizzalady**

   - **Description**: 40x40cm, Acryl auf Leinwand - 50€
   - **Category**: finished
   - **Year**: 2024
   - **Order**: 2
   - **URL**: https://media.merlinkraemer.com/pizzalady.webp

6. **room1**

   - **Description**: 40x40cm, Acryl auf Leinwand (Reserviert)
   - **Category**: finished
   - **Year**: 2024
   - **Order**: 1
   - **URL**: https://media.merlinkraemer.com/room1.webp

7. **Studio-Gatos**
   - **Description**: 112x73cm, Acryl auf Holz - 165€ (Verkauft)
   - **Category**: finished
   - **Year**: 2024
   - **Order**: 2
   - **URL**: https://media.merlinkraemer.com/Studio-Gatos.webp

### Work in Progress (2025)

8. **IMG_0409**
   - **Description**: 40x80cm, Acryl auf Leinwand
   - **Category**: wip
   - **Year**: 2025
   - **Order**: 0
   - **URL**: https://media.merlinkraemer.com/IMG_0409.webp

## Links

### Music & Audio

1. **"Live aus der Werkstatt 1" - Mix**

   - **URL**: https://soundcloud.com/merlin040/live-aus-der-werkstatt-1
   - **Order**: 2

2. **"Keys Don't Match" - Stimming, Dominique Fricot - Merlin Remix**

   - **URL**: https://soundcloud.com/merlin040/keys-dont-match-remix
   - **Order**: 3

3. **@ Studio Boschstraße 20.04.2025 - Mix**

   - **URL**: https://soundcloud.com/merlin040/set-20042025
   - **Order**: 4

4. **"Der starke Wanja" EP**

   - **URL**: https://soundcloud.com/merlin040/sets/wanja
   - **Order**: 5

5. **SoundCloud 🎶**

   - **URL**: https://soundcloud.com/merlin040
   - **Order**: 6

6. **Bandcamp (Sunset Records) 🌞**
   - **URL**: https://sunsetrecords-040.bandcamp.com/
   - **Order**: 7

### Social Media

7. **Instagram 🎨**

   - **URL**: https://instagram.com/merlinkraemer
   - **Order**: 8

8. **TikTok**

   - **URL**: https://www.tiktok.com/@merlinsroom
   - **Order**: 9

9. **YouTube**

   - **URL**: https://www.youtube.com/@merlins-room
   - **Order**: 10

10. **Twitch**

    - **URL**: https://www.twitch.tv/merlinsroom
    - **Order**: 11

11. **@ OA 26-07-2025 - liveset**
    - **URL**: https://soundcloud.com/merlin040/oa-260725
    - **Order**: 1

## Database Schema

### Gallery Images Table

- `id` (Primary Key)
- `src` (Image URL)
- `alt` (Alt text)
- `description` (Artwork description with dimensions, medium, price)
- `category` (finished/wip)
- `year` (Creation year)
- `order` (Display order)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Links Table

- `id` (Primary Key)
- `title` (Link title)
- `url` (Link URL)
- `order` (Display order)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

## Recovery Instructions

If database is lost, use this file to restore content:

1. **Gallery Images**: Import each image with correct metadata
2. **Links**: Add each link with correct order
3. **Verify**: Check that all URLs are accessible
4. **Test**: Ensure frontend displays correctly

---

**Note**: This backup was created automatically from the production database on September 11, 2025.
