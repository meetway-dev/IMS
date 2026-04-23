-- CreateTable
CREATE TABLE "ProductType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitOfMeasure" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "symbol" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UnitOfMeasure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductType_name_key" ON "ProductType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductType_slug_key" ON "ProductType"("slug");

-- CreateIndex
CREATE INDEX "ProductType_deletedAt_idx" ON "ProductType"("deletedAt");

-- CreateIndex
CREATE INDEX "ProductType_isActive_idx" ON "ProductType"("isActive");

-- CreateIndex
CREATE INDEX "ProductType_slug_idx" ON "ProductType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasure_name_key" ON "UnitOfMeasure"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasure_slug_key" ON "UnitOfMeasure"("slug");

-- CreateIndex
CREATE INDEX "UnitOfMeasure_deletedAt_idx" ON "UnitOfMeasure"("deletedAt");

-- CreateIndex
CREATE INDEX "UnitOfMeasure_isActive_idx" ON "UnitOfMeasure"("isActive");

-- CreateIndex
CREATE INDEX "UnitOfMeasure_slug_idx" ON "UnitOfMeasure"("slug");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ProductType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;