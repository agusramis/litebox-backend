-- Migration: Add image_key column and migrate data from image_url

-- Step 1: Check and add image_key column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'related_posts' AND column_name = 'image_key') THEN
        ALTER TABLE "related_posts" ADD COLUMN "image_key" VARCHAR(512);
    END IF;
END $$;

-- Step 2: Migrate existing data from image_url to image_key (only if image_url exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'related_posts' AND column_name = 'image_url') THEN
        UPDATE "related_posts" 
        SET "image_key" = SUBSTRING("image_url" FROM '/(lite-box/[^?]+)')
        WHERE "image_url" LIKE '%lite-box/%'
          AND ("image_key" IS NULL OR "image_key" = '');
          
        -- Drop the old image_url column
        ALTER TABLE "related_posts" DROP COLUMN "image_url";
    END IF;
END $$;

-- Step 3: Make image_key NOT NULL if it's not already
DO $$
BEGIN
    ALTER TABLE "related_posts" ALTER COLUMN "image_key" SET NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;





