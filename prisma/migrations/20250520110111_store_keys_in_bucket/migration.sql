/*
  Warnings:

  - You are about to drop the column `albumArtUrl` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `trackUrl` on the `Track` table. All the data in the column will be lost.
  - Added the required column `albumArtBucketKey` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageBucketKey` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackBucketKey` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Album" DROP COLUMN "albumArtUrl",
ADD COLUMN     "albumArtBucketKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "imageUrl",
ADD COLUMN     "imageBucketKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "trackUrl",
ADD COLUMN     "trackBucketKey" TEXT NOT NULL;
