--------------- FILES ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS files (
    -- ID
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- REQUIRED RELATIONSHIPS
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,

    -- REQUIRED
    description TEXT NOT NULL CHECK (char_length(description) <= 500),
    file_path TEXT NOT NULL CHECK (char_length(file_path) <= 1000),
    name TEXT NOT NULL CHECK (char_length(name) <= 100),
    size INT NOT NULL,
    tokens INT NOT NULL,
    type TEXT NOT NULL CHECK (char_length(type) <= 100)
);

-- INDEXES --

CREATE INDEX files_user_id_idx ON files(user_id);

-- RLS --

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own files"
    ON files
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- FUNCTIONS --

CREATE OR REPLACE FUNCTION delete_old_file()
RETURNS TRIGGER
LANGUAGE 'plpgsql'
SECURITY DEFINER
AS $$
DECLARE
  status INT;
  content TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT
      INTO status, content
      result.status, result.content
      FROM public.delete_storage_object_from_bucket('files', OLD.file_path) AS result;
    IF status <> 200 THEN
      RAISE WARNING 'Could not delete file: % %', status, content;
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- TRIGGERS --

CREATE TRIGGER update_files_updated_at
BEFORE UPDATE ON files
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER delete_old_file
BEFORE DELETE ON files
FOR EACH ROW
EXECUTE PROCEDURE delete_old_file();

-- STORAGE --

INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', false);

CREATE POLICY "Allow authenticated insert access to own file"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow authenticated update access to own file"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow authenticated delete access to own file"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'files' AND (storage.foldername(name))[1] = auth.uid()::text);

--------------- FILE WORKSPACES ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS file_workspaces (
    -- REQUIRED RELATIONSHIPS
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

    PRIMARY KEY(file_id, workspace_id),

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- INDEXES --

CREATE INDEX file_workspaces_user_id_idx ON file_workspaces(user_id);
CREATE INDEX file_workspaces_file_id_idx ON file_workspaces(file_id);
CREATE INDEX file_workspaces_workspace_id_idx ON file_workspaces(workspace_id);

-- RLS --

ALTER TABLE file_workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own file_workspaces"
    ON file_workspaces
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- TRIGGERS --

CREATE TRIGGER update_file_workspaces_updated_at
BEFORE UPDATE ON file_workspaces 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();