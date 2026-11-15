begin;

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique references auth.users(id) on delete cascade,
  legacy_id bigint unique,
  full_name text not null,
  email text,
  phone text,
  location text,
  profile_picture text
);

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique references auth.users(id) on delete cascade,
  legacy_id bigint unique,
  full_name text not null,
  email text,
  phone text,
  location text,
  profile_picture text,
  primary_service text,
  experience_years text,
  bio text,
  hourly_rate numeric,
  rating numeric,
  total_reviews integer not null default 0,
  plan text not null default 'free',
  verified boolean not null default false
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  job_id bigint,
  last_message text,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (client_id, professional_id)
);
create index conversations_professional_id_idx on public.conversations(professional_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null,
  sender_type text not null check (sender_type in ('client', 'professional')),
  content text not null default '',
  attachment_url text,
  attachment_type text,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  check (length(btrim(content)) > 0 or attachment_url is not null),
  check (attachment_url is null or (
    split_part(attachment_url, '/', 1) = conversation_id::text
    and attachment_url ~ '^[0-9a-f-]+/[a-zA-Z0-9._-]+$'
  ))
);
create index messages_conversation_created_idx on public.messages(conversation_id, created_at);

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create function private.create_mobile_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.raw_user_meta_data ->> 'type' = 'professional' then
    insert into public.professionals
      (auth_id, full_name, email, phone, location, primary_service, experience_years, bio)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email,
      new.raw_user_meta_data ->> 'phone', new.raw_user_meta_data ->> 'location',
      new.raw_user_meta_data ->> 'primary_service', new.raw_user_meta_data ->> 'experience_years',
      new.raw_user_meta_data ->> 'bio');
  elsif new.raw_user_meta_data ->> 'type' = 'client' then
    insert into public.clients (auth_id, full_name, email, phone, location)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email,
      new.raw_user_meta_data ->> 'phone', new.raw_user_meta_data ->> 'location');
  end if;
  return new;
end;
$$;
revoke all on function private.create_mobile_profile() from public;
create trigger ikhono_auth_profile after insert on auth.users
for each row execute function private.create_mobile_profile();

create function private.conversation_side(target uuid)
returns text language sql stable security definer set search_path = '' as $$
  select case when c.auth_id = (select auth.uid()) then 'client'
    when p.auth_id = (select auth.uid()) then 'professional' end
  from public.conversations t
  join public.clients c on c.id = t.client_id
  join public.professionals p on p.id = t.professional_id
  where t.id = target;
$$;
create function private.owns_message_sender(target uuid, claimed_id uuid, claimed_type text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.conversations t
    join public.clients c on c.id = t.client_id
    join public.professionals p on p.id = t.professional_id
    where t.id = target and (
      (claimed_type = 'client' and claimed_id = c.id and c.auth_id = (select auth.uid()))
      or (claimed_type = 'professional' and claimed_id = p.id and p.auth_id = (select auth.uid()))
    )
  );
$$;
revoke all on function private.conversation_side(uuid), private.owns_message_sender(uuid, uuid, text) from public;
grant execute on function private.conversation_side(uuid), private.owns_message_sender(uuid, uuid, text) to authenticated;

alter table public.clients enable row level security;
alter table public.professionals enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
revoke all on public.clients, public.professionals, public.conversations, public.messages from anon, authenticated;
grant select on public.clients, public.professionals to authenticated;
grant select, insert (client_id, professional_id, job_id), update (last_message, last_message_at)
  on public.conversations to authenticated;
grant select, insert (conversation_id, sender_id, sender_type, content, attachment_url, attachment_type), update (read)
  on public.messages to authenticated;

create policy own_client_profile on public.clients for select to authenticated using (auth_id = (select auth.uid()));
create policy own_professional_profile on public.professionals for select to authenticated using (auth_id = (select auth.uid()));
create policy read_own_conversation on public.conversations for select to authenticated
using (exists (select 1 from public.clients c where c.id = client_id and c.auth_id = (select auth.uid()))
  or exists (select 1 from public.professionals p where p.id = professional_id and p.auth_id = (select auth.uid())));
create policy start_own_conversation on public.conversations for insert to authenticated
with check (exists (select 1 from public.clients c where c.id = client_id and c.auth_id = (select auth.uid())));
create policy update_own_conversation on public.conversations for update to authenticated
using (private.conversation_side(id) is not null)
with check (private.conversation_side(id) is not null);
create policy read_own_messages on public.messages for select to authenticated
using (private.conversation_side(conversation_id) is not null);
create policy send_as_self on public.messages for insert to authenticated
with check (private.owns_message_sender(conversation_id, sender_id, sender_type));
create policy mark_received_message_read on public.messages for update to authenticated
using (private.conversation_side(conversation_id) <> sender_type)
with check (read and private.conversation_side(conversation_id) <> sender_type);

insert into storage.buckets (id, name, public) values
  ('chat-attachments', 'chat-attachments', false),
  ('verification-docs', 'verification-docs', false);
create policy chat_attachment_read on storage.objects for select to authenticated
using (bucket_id = 'chat-attachments' and exists (
  select 1 from public.conversations t where t.id::text = split_part(name, '/', 1)
));
create policy chat_attachment_upload on storage.objects for insert to authenticated
with check (bucket_id = 'chat-attachments' and exists (
  select 1 from public.conversations t where t.id::text = split_part(name, '/', 1)
));
create policy own_verification_document_read on storage.objects for select to authenticated
using (bucket_id = 'verification-docs' and split_part(name, '/', 1) = (select auth.uid())::text);
create policy own_verification_document_upload on storage.objects for insert to authenticated
with check (bucket_id = 'verification-docs' and split_part(name, '/', 1) = (select auth.uid())::text);

alter publication supabase_realtime add table public.conversations, public.messages;
commit;
