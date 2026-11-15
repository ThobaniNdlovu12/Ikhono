create table private.website_artisan_links (
  legacy_id bigint primary key check (legacy_id > 0),
  email_hash bytea not null unique
);
revoke all on private.website_artisan_links from public, anon, authenticated;

create function private.link_confirmed_website_artisan()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.email_confirmed_at is not null and new.email is not null then
    update public.professionals p
      set legacy_id = l.legacy_id
      from private.website_artisan_links l
      where p.auth_id = new.id and p.legacy_id is null
        and l.email_hash = pg_catalog.sha256(pg_catalog.convert_to(lower(btrim(new.email)), 'UTF8'))
        and not exists (select 1 from public.professionals other where other.legacy_id = l.legacy_id);
  end if;
  return new;
end;
$$;
revoke all on function private.link_confirmed_website_artisan() from public, anon, authenticated;
create trigger ikhono_link_website_artisan
after insert or update of email_confirmed_at on auth.users
for each row execute function private.link_confirmed_website_artisan();

create function public.find_linked_website_professional(website_id bigint)
returns uuid language sql stable security definer set search_path = '' as $$
  select p.id from public.professionals p
  where p.legacy_id = website_id and (select auth.uid()) is not null;
$$;
revoke all on function public.find_linked_website_professional(bigint) from public, anon;
grant execute on function public.find_linked_website_professional(bigint) to authenticated;
