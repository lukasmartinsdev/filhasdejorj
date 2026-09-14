create function public.swap_sections(p_first uuid,p_second uuid) returns void language plpgsql security invoker set search_path='' as $$
declare first_order integer; second_order integer;
begin
if not private.is_admin() then raise exception 'Acesso negado'; end if;
perform id from public.sections where id in(p_first,p_second) order by id for update;
select sort_order into strict first_order from public.sections where id=p_first;
select sort_order into strict second_order from public.sections where id=p_second;
update public.sections set sort_order=case when id=p_first then second_order else first_order end where id in(p_first,p_second);
end $$;
revoke all on function public.swap_sections(uuid,uuid) from public,anon;
grant execute on function public.swap_sections(uuid,uuid) to authenticated;
