-- Filhas de Jó RJ; ONLY project godvzqqmsrkyvlflmadd.
-- Existing Promoinfo tables and permissions are preserved unchanged.
create schema if not exists private;
revoke all on schema private from public,anon;
grant usage on schema private to authenticated;
create table public.admin_profiles (id uuid primary key references auth.users(id) on delete cascade, role text not null default 'admin' check(role='admin'), active boolean not null default true, sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table public.admin_profiles enable row level security;
revoke all on public.admin_profiles from anon,authenticated;
grant select on public.admin_profiles to authenticated;
create policy admin_profile_self on public.admin_profiles for select to authenticated using(id=(select auth.uid()));
create function private.is_admin() returns boolean language sql stable security invoker set search_path='' as $$ select exists(select 1 from public.admin_profiles where id=(select auth.uid()) and active and role='admin') $$;
revoke all on function private.is_admin() from public,anon;
grant execute on function private.is_admin() to authenticated;
create function private.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
revoke all on function private.touch_updated_at() from public,anon,authenticated;

create table public.site_settings (id uuid primary key default gen_random_uuid(), data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'), active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.site_settings enable row level security;
revoke all on public.site_settings from anon,authenticated;
grant select on public.site_settings to anon;
grant select,insert,update,delete on public.site_settings to authenticated;
create policy public_read on public.site_settings for select to anon,authenticated using(active);
create policy admin_manage on public.site_settings for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create trigger updated_at before update on public.site_settings for each row execute function private.touch_updated_at();
insert into public.site_settings (data,active,sort_order) values ('{"name":"Filhas de Jó RJ","tagline":"Liderança que transforma","logo":"/assets/logo-filhas-de-jo-rj.png","primary_color":"#4B2E83","gold_color":"#D4AF37","dark_color":"#211126"}'::jsonb,true,0);

create table public.hero_content (id uuid primary key default gen_random_uuid(), data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'), active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.hero_content enable row level security;
revoke all on public.hero_content from anon,authenticated;
grant select on public.hero_content to anon;
grant select,insert,update,delete on public.hero_content to authenticated;
create policy public_read on public.hero_content for select to anon,authenticated using(active);
create policy admin_manage on public.hero_content for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create trigger updated_at before update on public.hero_content for each row execute function private.touch_updated_at();
insert into public.hero_content (data,active,sort_order) values ('{"eyebrow":"Irmandade · Liderança · Serviço","title":"Filhas de Jó RJ","subtitle":"Jovens mulheres\nconstruindo um futuro melhor.","description":"Mais que uma organização, uma irmandade que desenvolve liderança, amizade, caráter e serviço, por um mundo mais justo e fraterno.","image":"/assets/hero-rio.webp","primary_text":"Conheça nossa história","primary_url":"#historia","secondary_text":"Assista ao vídeo","video_url":"","show_secondary":true,"quote":"Juntas\npodemos\nir mais longe."}'::jsonb,true,0);

create table public.about_content (id uuid primary key default gen_random_uuid(), data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'), active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.about_content enable row level security;
revoke all on public.about_content from anon,authenticated;
grant select on public.about_content to anon;
grant select,insert,update,delete on public.about_content to authenticated;
create policy public_read on public.about_content for select to anon,authenticated using(active);
create policy admin_manage on public.about_content for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create trigger updated_at before update on public.about_content for each row execute function private.touch_updated_at();
insert into public.about_content (data,active,sort_order) values ('{"title":"Jovens que\nfazem a diferença","text":"As Filhas de Jó são uma organização internacional que reúne jovens mulheres em um ambiente de amizade, respeito e desenvolvimento pessoal. Juntas, cultivamos a confiança, a comunicação, o trabalho em equipe e a liderança.","image":"/assets/jovem-laco.webp","button_text":"Saiba mais"}'::jsonb,true,0);

create table public.history_content (id uuid primary key default gen_random_uuid(), data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'), active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.history_content enable row level security;
revoke all on public.history_content from anon,authenticated;
grant select on public.history_content to anon;
grant select,insert,update,delete on public.history_content to authenticated;
create policy public_read on public.history_content for select to anon,authenticated using(active);
create policy admin_manage on public.history_content for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create trigger updated_at before update on public.history_content for each row execute function private.touch_updated_at();
insert into public.history_content (data,active,sort_order) values ('{"title":"Um legado que\natravessa gerações","text":"Fundada em 1920 por Ethel T. Wead Mick, em Omaha, Nebraska, a organização cresceu e hoje reúne jovens em diferentes países, incluindo o Brasil.","image":"/assets/ethel-mick.jpg","timeline":[{"date":"1920","title":"O início de uma história","text":"Ethel T. Wead Mick funda a organização em Omaha, Nebraska."},{"date":"Nossa inspiração","title":"O Livro de Jó","text":"O nome da organização faz referência às filhas de Jó, citadas no Livro de Jó."},{"date":"Hoje","title":"Uma irmandade internacional","text":"Jovens de diferentes países, com Bethels também no Brasil, compartilham amizade, formação e serviço."}]}'::jsonb,true,0);

create table public.event_info (id uuid primary key default gen_random_uuid(), data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'), active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.event_info enable row level security;
revoke all on public.event_info from anon,authenticated;
grant select on public.event_info to anon;
grant select,insert,update,delete on public.event_info to authenticated;
create policy public_read on public.event_info for select to anon,authenticated using(active);
create policy admin_manage on public.event_info for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create trigger updated_at before update on public.event_info for each row execute function private.touch_updated_at();
insert into public.event_info (data,active,sort_order) values ('{"name":"Encontro Filhas de Jó RJ","slogan":"Em breve, um momento especial para vivermos a nossa história, juntas.","description":"Os detalhes do próximo encontro serão divulgados aqui.","date":"","time":"","venue":"","address":"","city":"","map_url":"","capacity":null,"status":"Em preparação","image":"/assets/rio-panorama.webp","quote":"Grandes\nencontros constroem\nnovas histórias."}'::jsonb,true,0);

create table public.values (id uuid primary key default gen_random_uuid(), data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'), active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.values enable row level security;
revoke all on public.values from anon,authenticated;
grant select on public.values to anon;
grant select,insert,update,delete on public.values to authenticated;
create policy public_read on public.values for select to anon,authenticated using(active);
create policy admin_manage on public.values for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create trigger updated_at before update on public.values for each row execute function private.touch_updated_at();
insert into public.values (data,active,sort_order) values ('{"title":"Liderança","description":"Inspirar pelo exemplo.","icon":"Crown"}'::jsonb,true,0);
insert into public.values (data,active,sort_order) values ('{"title":"Amizade","description":"Caminhar juntas sempre.","icon":"Users"}'::jsonb,true,1);
insert into public.values (data,active,sort_order) values ('{"title":"Confiança","description":"Acreditar em cada uma.","icon":"Heart"}'::jsonb,true,2);
insert into public.values (data,active,sort_order) values ('{"title":"Serviço","description":"Fazer a diferença na comunidade.","icon":"HandHeart"}'::jsonb,true,3);
insert into public.values (data,active,sort_order) values ('{"title":"Tradição","description":"Honrar nosso passado.","icon":"Landmark"}'::jsonb,true,4);
insert into public.values (data,active,sort_order) values ('{"title":"Responsabilidade","description":"Construir um futuro melhor.","icon":"Star"}'::jsonb,true,5);

create table public.gallery (id uuid primary key default gen_random_uuid(), data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'), active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.gallery enable row level security;
revoke all on public.gallery from anon,authenticated;
grant select on public.gallery to anon;
grant select,insert,update,delete on public.gallery to authenticated;
create policy public_read on public.gallery for select to anon,authenticated using(active);
create policy admin_manage on public.gallery for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create trigger updated_at before update on public.gallery for each row execute function private.touch_updated_at();
insert into public.gallery (data,active,sort_order) values ('{"image":"/assets/hero-rio.webp","caption":"Juntas, olhando para o futuro","illustrative":true}'::jsonb,true,0);
insert into public.gallery (data,active,sort_order) values ('{"image":"/assets/jovem-laco.webp","caption":"Laços que nos unem","illustrative":true}'::jsonb,true,1);
insert into public.gallery (data,active,sort_order) values ('{"image":"/assets/rio-panorama.webp","caption":"O Rio de Janeiro nos inspira","illustrative":true}'::jsonb,true,2);
insert into public.gallery (data,active,sort_order) values ('{"image":"/assets/flores.webp","caption":"A delicadeza dos nossos laços","illustrative":true}'::jsonb,true,3);
insert into public.gallery (data,active,sort_order) values ('{"image":"/assets/amizade.webp","caption":"Amizade que vai mais longe","illustrative":true}'::jsonb,true,4);

create table public.sponsors (id uuid primary key default gen_random_uuid(), data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'), active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.sponsors enable row level security;
revoke all on public.sponsors from anon,authenticated;
grant select on public.sponsors to anon;
grant select,insert,update,delete on public.sponsors to authenticated;
create policy public_read on public.sponsors for select to anon,authenticated using(active);
create policy admin_manage on public.sponsors for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create trigger updated_at before update on public.sponsors for each row execute function private.touch_updated_at();
insert into public.sponsors (data,active,sort_order) values ('{"name":"DeMolay Brasil","category":"Apoio Institucional","logo":"","url":"","description":"Apoio institucional"}'::jsonb,true,0);
insert into public.sponsors (data,active,sort_order) values ('{"name":"Filhas de Jó RJ","category":"Realização","logo":"/assets/logo-filhas-de-jo-rj.png","url":"#inicio","description":"Realização"}'::jsonb,true,1);

create table public.contact_info (id uuid primary key default gen_random_uuid(), data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'), active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.contact_info enable row level security;
revoke all on public.contact_info from anon,authenticated;
grant select on public.contact_info to anon;
grant select,insert,update,delete on public.contact_info to authenticated;
create policy public_read on public.contact_info for select to anon,authenticated using(active);
create policy admin_manage on public.contact_info for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create trigger updated_at before update on public.contact_info for each row execute function private.touch_updated_at();
insert into public.contact_info (data,active,sort_order) values ('{"title":"Estamos aqui para ajudar","description":"Entre em contato com a gente.","email":"","whatsapp":"","instagram":"","youtube":"","facebook":"","tiktok":"","address":"","image":"/assets/rio-panorama.webp","quote":"Um futuro\nmais forte,\nnas mãos de meninas\nfazendo a diferença."}'::jsonb,true,0);

create table public.social_links (id uuid primary key default gen_random_uuid(), data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'), active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.social_links enable row level security;
revoke all on public.social_links from anon,authenticated;
grant select on public.social_links to anon;
grant select,insert,update,delete on public.social_links to authenticated;
create policy public_read on public.social_links for select to anon,authenticated using(active);
create policy admin_manage on public.social_links for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create trigger updated_at before update on public.social_links for each row execute function private.touch_updated_at();

create table public.schedule_items (id uuid primary key default gen_random_uuid(), data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'), active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.schedule_items enable row level security;
revoke all on public.schedule_items from anon,authenticated;
grant select on public.schedule_items to anon;
grant select,insert,update,delete on public.schedule_items to authenticated;
create policy public_read on public.schedule_items for select to anon,authenticated using(active);
create policy admin_manage on public.schedule_items for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create trigger updated_at before update on public.schedule_items for each row execute function private.touch_updated_at();

create table public.guests (id uuid primary key default gen_random_uuid(), data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'), active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.guests enable row level security;
revoke all on public.guests from anon,authenticated;
grant select on public.guests to anon;
grant select,insert,update,delete on public.guests to authenticated;
create policy public_read on public.guests for select to anon,authenticated using(active);
create policy admin_manage on public.guests for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create trigger updated_at before update on public.guests for each row execute function private.touch_updated_at();

create table public.registration_lots (id uuid primary key default gen_random_uuid(), data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'), active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.registration_lots enable row level security;
revoke all on public.registration_lots from anon,authenticated;
grant select on public.registration_lots to anon;
grant select,insert,update,delete on public.registration_lots to authenticated;
create policy public_read on public.registration_lots for select to anon,authenticated using(active);
create policy admin_manage on public.registration_lots for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create trigger updated_at before update on public.registration_lots for each row execute function private.touch_updated_at();

create table public.registration_settings (id uuid primary key default gen_random_uuid(), data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'), active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.registration_settings enable row level security;
revoke all on public.registration_settings from anon,authenticated;
grant select on public.registration_settings to anon;
grant select,insert,update,delete on public.registration_settings to authenticated;
create policy public_read on public.registration_settings for select to anon,authenticated using(active);
create policy admin_manage on public.registration_settings for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create trigger updated_at before update on public.registration_settings for each row execute function private.touch_updated_at();
insert into public.registration_settings (data,active,sort_order) values ('{"open":false,"button_text":"Inscrições em breve","external_url":"","price":null,"notes":"As informações sobre inscrições e ingressos serão divulgadas em breve.","payment_methods":""}'::jsonb,true,0);

create table public.faq (id uuid primary key default gen_random_uuid(), data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'), active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.faq enable row level security;
revoke all on public.faq from anon,authenticated;
grant select on public.faq to anon;
grant select,insert,update,delete on public.faq to authenticated;
create policy public_read on public.faq for select to anon,authenticated using(active);
create policy admin_manage on public.faq for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create trigger updated_at before update on public.faq for each row execute function private.touch_updated_at();
insert into public.faq (data,active,sort_order) values ('{"question":"O que são as Filhas de Jó?","answer":"Uma organização internacional dedicada à formação de jovens mulheres, com foco em liderança, confiança, amizade e serviço."}'::jsonb,true,0);
insert into public.faq (data,active,sort_order) values ('{"question":"Quando será o próximo encontro?","answer":"A data, o local, a programação e os valores ainda serão definidos. Acompanhe esta página para saber das novidades."}'::jsonb,true,1);

create table public.sections (id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, settings jsonb not null default '{}'::jsonb, active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.sections enable row level security;
revoke all on public.sections from anon,authenticated;
grant select on public.sections to anon;
grant select,insert,update,delete on public.sections to authenticated;
create policy public_read on public.sections for select to anon,authenticated using(active);
create policy admin_manage on public.sections for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create trigger updated_at before update on public.sections for each row execute function private.touch_updated_at();
insert into public.sections (slug,title,active,sort_order,settings) values ('hero','Início',true,0,'{}');
insert into public.sections (slug,title,active,sort_order,settings) values ('sobre','Quem Somos',true,1,'{}');
insert into public.sections (slug,title,active,sort_order,settings) values ('historia','História',true,2,'{}');
insert into public.sections (slug,title,active,sort_order,settings) values ('evento','Eventos',true,3,'{}');
insert into public.sections (slug,title,active,sort_order,settings) values ('valores','Valores',true,4,'{}');
insert into public.sections (slug,title,active,sort_order,settings) values ('galeria','Galeria',true,5,'{}');
insert into public.sections (slug,title,active,sort_order,settings) values ('patrocinadores','Patrocinadores',true,6,'{}');
insert into public.sections (slug,title,active,sort_order,settings) values ('contato','Contato',true,7,'{}');
insert into public.sections (slug,title,active,sort_order,settings) values ('programacao','Programação',false,8,'{}');
insert into public.sections (slug,title,active,sort_order,settings) values ('convidados','Convidados',false,9,'{}');
insert into public.sections (slug,title,active,sort_order,settings) values ('faq','Perguntas frequentes',false,10,'{}');

create table public.event_interest(id uuid primary key default gen_random_uuid(),email text not null unique check(length(email)<=254),consented_at timestamptz not null default now(),created_at timestamptz not null default now());
create table public.contact_messages(id uuid primary key default gen_random_uuid(),name text not null check(length(name) between 1 and 100),email text not null check(length(email)<=254),message text not null check(length(message) between 10 and 3000),consented_at timestamptz not null default now(),created_at timestamptz not null default now(),read boolean not null default false);
create index contact_messages_email_created on public.contact_messages(email,created_at);
alter table public.event_interest enable row level security;
revoke all on public.event_interest from anon,authenticated;
grant select,update,delete on public.event_interest to authenticated;
create policy admin_manage on public.event_interest for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon,authenticated;
grant select,update,delete on public.contact_messages to authenticated;
create policy admin_manage on public.contact_messages for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
-- These two narrowly scoped functions are intentional write-only public entry points.
-- They validate length/consent, return no personal data, and cannot read arbitrary rows.
create function public.register_event_interest(p_email text,p_consent boolean) returns void language plpgsql security definer set search_path='' as $$
begin
if not coalesce(p_consent,false) or p_email is null or length(p_email)>254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Dados inválidos'; end if;
insert into public.event_interest(email) values(lower(trim(p_email))) on conflict(email) do nothing;
end $$;
create function public.submit_contact_message(p_name text,p_email text,p_message text,p_consent boolean) returns void language plpgsql security definer set search_path='' as $$
begin
if not coalesce(p_consent,false) or p_name is null or length(trim(p_name)) not between 1 and 100 or p_email is null or length(p_email)>254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or p_message is null or length(trim(p_message)) not between 10 and 3000 then raise exception 'Dados inválidos'; end if;
perform pg_advisory_xact_lock(hashtextextended(lower(trim(p_email)),0));
if exists(select 1 from public.contact_messages where email=lower(trim(p_email)) and created_at>now()-interval '5 minutes') then raise exception 'Aguarde alguns minutos antes de enviar novamente'; end if;
insert into public.contact_messages(name,email,message) values(trim(p_name),lower(trim(p_email)),trim(p_message));
end $$;
revoke all on function public.register_event_interest(text,boolean) from public;
revoke all on function public.submit_contact_message(text,text,text,boolean) from public;
grant execute on function public.register_event_interest(text,boolean) to anon,authenticated;
grant execute on function public.submit_contact_message(text,text,text,boolean) to anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('site-assets','site-assets',true,8388608,array['image/jpeg','image/png','image/webp','image/gif']) on conflict(id) do nothing;
create policy site_assets_read on storage.objects for select to anon,authenticated using(bucket_id='site-assets');
create policy site_assets_insert on storage.objects for insert to authenticated with check(bucket_id='site-assets' and (select private.is_admin()));
create policy site_assets_update on storage.objects for update to authenticated using(bucket_id='site-assets' and (select private.is_admin())) with check(bucket_id='site-assets' and (select private.is_admin()));
create policy site_assets_delete on storage.objects for delete to authenticated using(bucket_id='site-assets' and (select private.is_admin()));

