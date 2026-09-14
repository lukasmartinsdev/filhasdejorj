update public.event_info
set data=jsonb_set(data,'{image}','"/assets/encontro-banner.webp"'::jsonb)
where data->>'image'='/assets/rio-panorama.webp';
