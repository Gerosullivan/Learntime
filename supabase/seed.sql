INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user) VALUES
('00000000-0000-0000-0000-000000000000', 'e9fc7e46-a8a5-4fd4-8ba7-af485013e6fa', 'authenticated', 'authenticated', 'test@test.com', crypt('password', gen_salt('bf')), '2023-02-18 23:31:13.017218+00', NULL, '', '2023-02-18 23:31:12.757017+00', '', NULL, '', '', NULL, '2023-02-18 23:31:13.01781+00', '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-02-18 23:31:12.752281+00', '2023-02-18 23:31:13.019418+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, 'f');

-- Start data for workspaces 
INSERT INTO workspaces (user_id, name, description, include_workspace_instructions, instructions, is_home, sharing) VALUES 
('e9fc7e46-a8a5-4fd4-8ba7-af485013e6fa', 'Workspace 1', 'This is for testing.', true, 'These are the instructions.', false, 'private');

-- Get workspace ids
DO $$
DECLARE
  workspace1_id UUID;
BEGIN
  SELECT id INTO workspace1_id FROM workspaces WHERE name='Home';

  -- Start data for chats 
  INSERT INTO chats (user_id, workspace_id, name) VALUES 
  ('e9fc7e46-a8a5-4fd4-8ba7-af485013e6fa', workspace1_id, 'Chat 1');

END $$;