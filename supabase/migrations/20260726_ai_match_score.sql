-- 1. Enable vector extension if not enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding vector(768) columns for Google Gemini embeddings
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Create HNSW indices for fast cosine similarity search
CREATE INDEX IF NOT EXISTS campaigns_embedding_hnsw_idx 
ON campaigns USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS creator_profiles_embedding_hnsw_idx 
ON creator_profiles USING hnsw (embedding vector_cosine_ops);

-- 4. Single-pair match score RPC function
CREATE OR REPLACE FUNCTION get_campaign_match_score(
  p_creator_id UUID,
  p_campaign_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_creator_emb vector(768);
  v_campaign_emb vector(768);
  v_similarity FLOAT;
BEGIN
  SELECT embedding INTO v_creator_emb FROM creator_profiles WHERE profile_id = p_creator_id;
  SELECT embedding INTO v_campaign_emb FROM campaigns WHERE id = p_campaign_id;

  -- Default fallback score of 75% if embeddings are not yet generated
  IF v_creator_emb IS NULL OR v_campaign_emb IS NULL THEN
    RETURN 75;
  END IF;

  v_similarity := 1 - (v_creator_emb <=> v_campaign_emb);
  -- Map cosine similarity (-1 to 1, typically 0.2 to 0.9) to a realistic percentage score (50% to 99%)
  RETURN GREATEST(50, LEAST(99, ROUND((v_similarity + 1) / 2 * 100)));
END;
$$;

-- 5. Bulk match scores RPC function for high-performance campaign listing
CREATE OR REPLACE FUNCTION get_creator_campaign_match_scores(
  p_creator_id UUID
)
RETURNS TABLE (
  campaign_id UUID,
  match_score INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_creator_emb vector(768);
BEGIN
  SELECT embedding INTO v_creator_emb FROM creator_profiles WHERE profile_id = p_creator_id;

  IF v_creator_emb IS NULL THEN
    RETURN QUERY
    SELECT c.id, 75::INTEGER
    FROM campaigns c
    WHERE c.status = 'live' AND (c.deleted IS NULL OR c.deleted = false);
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    c.id AS campaign_id,
    CASE 
      WHEN c.embedding IS NULL THEN 75::INTEGER
      ELSE GREATEST(50, LEAST(99, ROUND(((1 - (v_creator_emb <=> c.embedding)) + 1) / 2 * 100)))::INTEGER
    END AS match_score
  FROM campaigns c
  WHERE c.status = 'live' AND (c.deleted IS NULL OR c.deleted = false);
END;
$$;
