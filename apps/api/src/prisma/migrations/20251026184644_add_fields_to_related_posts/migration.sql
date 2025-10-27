-- AlterTable
ALTER TABLE "related_posts" ADD COLUMN IF NOT EXISTS "topic" TEXT NOT NULL DEFAULT 'Tech Companies',
ADD COLUMN IF NOT EXISTS "author" TEXT NOT NULL DEFAULT 'Rick Sanchez',
ADD COLUMN IF NOT EXISTS "read_time" INTEGER NOT NULL DEFAULT 5;

-- Update existing rows with random values
UPDATE "related_posts" SET
  topic = (ARRAY['Diversity & Inclusion', 'Tech Companies', 'security', 'Global', 'Leaks', 'Crypto'])[floor(random() * 6) + 1],
  author = (ARRAY['Rick Sanchez', 'Morty Smith', 'Beth Smith', 'Jerry Smith', 'Summer Smith', 'Mr. Meeseeks', 'Birdperson', 'Squanchy', 'Mr. Poopybutthole', 'Tammy', 'Evil Morty', 'Abradolf Lincler'])[floor(random() * 12) + 1],
  read_time = floor(random() * 12) + 4
WHERE topic = 'Tech Companies' AND author = 'Rick Sanchez';


