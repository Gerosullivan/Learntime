-- Create the storage bucket for temporary PDF files
insert into storage.buckets (id, name, public)
values ('temp-pdfs', 'temp-pdfs', false);

-- Policy to allow authenticated users to upload PDFs
create policy "Allow authenticated users to upload PDFs"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'temp-pdfs' and
  (storage.foldername(name))[1] = 'pdf-uploads' and
  lower(storage.extension(name)) = 'pdf'
);

-- Policy to allow authenticated users to read their uploaded PDFs
create policy "Allow authenticated users to read PDFs"
on storage.objects for select
to authenticated
using (bucket_id = 'temp-pdfs');

-- Policy to allow authenticated users to delete their PDFs
create policy "Allow authenticated users to delete PDFs"
on storage.objects for delete
to authenticated
using (bucket_id = 'temp-pdfs');

-- Set up RLS
alter table storage.objects enable row level security;
