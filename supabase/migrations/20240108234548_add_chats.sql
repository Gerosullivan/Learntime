--------------- CHATS ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS chats (
    -- ID
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- REQUIRED RELATIONSHIPS
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,

    name TEXT NOT NULL CHECK (char_length(name) <= 200)
);

-- INDEXES --

CREATE INDEX idx_chats_user_id ON chats (user_id);
CREATE INDEX idx_chats_workspace_id ON chats (workspace_id);

-- RLS --

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own chats"
    ON chats
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- TRIGGERS --

CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON chats 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();