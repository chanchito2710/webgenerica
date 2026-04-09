-- CreateTable Tenant
CREATE TABLE "Tenant" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "plan" TEXT NOT NULL DEFAULT 'free',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
CREATE UNIQUE INDEX "Tenant_domain_key" ON "Tenant"("domain");
CREATE INDEX "Tenant_domain_idx" ON "Tenant"("domain");
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- CreateTable AuditLog
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "tenantId" INTEGER,
    "details" JSONB NOT NULL DEFAULT '{}',
    "ip" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- Insert default tenant for existing data
INSERT INTO "Tenant" ("slug", "name", "status", "plan", "updatedAt")
VALUES ('default', 'Tienda Default', 'active', 'free', CURRENT_TIMESTAMP);

-- Add tenantId columns (nullable first to allow migration of existing data)
ALTER TABLE "SiteConfig" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "Category" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "Product" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "CartItem" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "Order" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "Coupon" ADD COLUMN "tenantId" INTEGER;

-- Add User activation/management columns
ALTER TABLE "User" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "activationToken" TEXT;
ALTER TABLE "User" ADD COLUMN "activatedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "suspendedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "suspendReason" TEXT;
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

-- Migrate existing data: assign all rows to default tenant (id=1)
UPDATE "SiteConfig" SET "tenantId" = 1 WHERE "tenantId" IS NULL;
UPDATE "Category" SET "tenantId" = 1 WHERE "tenantId" IS NULL;
UPDATE "Product" SET "tenantId" = 1 WHERE "tenantId" IS NULL;
UPDATE "CartItem" SET "tenantId" = 1 WHERE "tenantId" IS NULL;
UPDATE "Order" SET "tenantId" = 1 WHERE "tenantId" IS NULL;
UPDATE "Coupon" SET "tenantId" = 1 WHERE "tenantId" IS NULL;
UPDATE "User" SET "tenantId" = 1 WHERE "tenantId" IS NULL AND "role" != 'super_admin';

-- Make tenantId NOT NULL where required
ALTER TABLE "SiteConfig" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Category" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "CartItem" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Coupon" ALTER COLUMN "tenantId" SET NOT NULL;

-- SiteConfig: unique per tenant
CREATE UNIQUE INDEX "SiteConfig_tenantId_key" ON "SiteConfig"("tenantId");
ALTER TABLE "SiteConfig" ADD CONSTRAINT "SiteConfig_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- User: FK to Tenant (nullable for super_admin)
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");
CREATE INDEX "User_role_idx" ON "User"("role");
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Category: drop old unique on slug, create compound unique
DROP INDEX IF EXISTS "Category_slug_key";
CREATE UNIQUE INDEX "Category_tenantId_slug_key" ON "Category"("tenantId", "slug");
CREATE INDEX "Category_tenantId_idx" ON "Category"("tenantId");
ALTER TABLE "Category" ADD CONSTRAINT "Category_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Product: drop old unique on slug, create compound unique
DROP INDEX IF EXISTS "Product_slug_key";
CREATE UNIQUE INDEX "Product_tenantId_slug_key" ON "Product"("tenantId", "slug");
CREATE INDEX "Product_tenantId_idx" ON "Product"("tenantId");
CREATE INDEX "Product_tenantId_active_idx" ON "Product"("tenantId", "active");
CREATE INDEX "Product_tenantId_featured_idx" ON "Product"("tenantId", "featured");
ALTER TABLE "Product" ADD CONSTRAINT "Product_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CartItem
CREATE INDEX "CartItem_tenantId_idx" ON "CartItem"("tenantId");

-- Order
CREATE INDEX "Order_tenantId_idx" ON "Order"("tenantId");
CREATE INDEX "Order_tenantId_status_idx" ON "Order"("tenantId", "status");
ALTER TABLE "Order" ADD CONSTRAINT "Order_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Coupon: drop old unique on code, create compound unique
DROP INDEX IF EXISTS "Coupon_code_key";
CREATE UNIQUE INDEX "Coupon_tenantId_code_key" ON "Coupon"("tenantId", "code");
CREATE INDEX "Coupon_tenantId_idx" ON "Coupon"("tenantId");
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
