-- Rollback-only tests; no production records remain.
begin;
set local role anon;
do $$ begin
if (select count(*) from public.sections)=0 then raise exception 'Public content unavailable'; end if;
begin perform id from public.contact_messages; raise exception 'FAIL: anon can read messages'; exception when insufficient_privilege then null; end;
begin insert into public.hero_content(data) values('{}'); raise exception 'FAIL: anon can write content'; exception when insufficient_privilege then null; end;
end $$;
select public.register_event_interest('qa-filhasdejorj@example.invalid',true);
select public.submit_contact_message('Teste automatizado','qa-filhasdejorj@example.invalid','Mensagem de teste que será revertida.',true);
reset role;
do $$ begin
if not exists(select 1 from public.contact_messages where email='qa-filhasdejorj@example.invalid') then raise exception 'Form write failed'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000099',true);
do $$ declare touched integer; begin
if private.is_admin() then raise exception 'FAIL: arbitrary user became admin'; end if;
update public.hero_content set data=data; get diagnostics touched=row_count;
if touched<>0 then raise exception 'FAIL: nonadmin updated content'; end if;
if exists(select 1 from public.contact_messages) then raise exception 'FAIL: nonadmin read messages'; end if;
begin insert into public.admin_profiles(id) values('00000000-0000-0000-0000-000000000099'); raise exception 'FAIL: privilege escalation'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','da62d0e0-1af9-41cf-bdd7-1bade72d854c',true);
do $$ declare test_id uuid; touched integer; begin
if not private.is_admin() then raise exception 'Admin authorization failed'; end if;
insert into public.values(data,active) values('{"title":"RLS verification"}',false) returning id into test_id;
update public.values set data='{"title":"Updated"}' where id=test_id;
get diagnostics touched=row_count; if touched<>1 then raise exception 'Admin update failed'; end if;
delete from public.values where id=test_id;
get diagnostics touched=row_count; if touched<>1 then raise exception 'Admin delete failed'; end if;
end $$;
reset role;
rollback;
select 'PASS: public read, private messages, form inserts, nonadmin denial, admin CRUD, no escalation' as result;
