-- CreateTable
CREATE TABLE "collection_banners" (
    "slug" TEXT NOT NULL,
    "eyebrow" TEXT,
    "tagline" TEXT,
    "image" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_banners_pkey" PRIMARY KEY ("slug")
);
