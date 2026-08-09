-- Metrics-first category scores for the Product Mentor assessment.
-- Weights: metrics 70%, product problem 20%, scenario 10%.
ALTER TABLE public.product_assessments
  ADD COLUMN IF NOT EXISTS category_scores jsonb;

-- Backfill the column for existing rows using the legacy 50/50 blend is not
-- possible; leave NULL and let the UI fall back to the overall score.
