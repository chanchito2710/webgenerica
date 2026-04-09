-- AlterTable
ALTER TABLE "SiteConfig" ADD COLUMN     "benefits" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "heroBanner" JSONB NOT NULL DEFAULT '{}';
