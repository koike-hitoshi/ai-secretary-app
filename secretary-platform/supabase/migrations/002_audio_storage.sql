-- Supabase Storage bucket for meeting audio files (#09)
-- Run in Supabase SQL Editor if bucket does not exist

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'meeting-audio',
  'meeting-audio',
  false,
  209715200, -- 200MB
  array['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'video/mp4', 'application/octet-stream']
)
on conflict (id) do nothing;

-- RLS: users can only access their own folder ({user_id}/...)
create policy "Users can upload own audio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'meeting-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read own audio"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'meeting-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own audio"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'meeting-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
