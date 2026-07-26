-- Enable vector extension if not enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding vector(768) columns for Google Gemini text-embedding-004
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create index for vector cosine similarity search
CREATE INDEX IF NOT EXISTS campaigns_embedding_idx ON campaigns 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create RPC function to compute percentage match between creator and campaign
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
  RETURN GREATEST(10, LEAST(99, ROUND(v_similarity * 100)));
END;
$$;
