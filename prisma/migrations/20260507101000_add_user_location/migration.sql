ALTER TABLE "User"
ADD COLUMN "uf" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "cityIbgeCode" TEXT;

CREATE INDEX "User_uf_cityIbgeCode_idx" ON "User"("uf", "cityIbgeCode");
