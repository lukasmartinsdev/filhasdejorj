-- Hide the withdrawn institutional support while retaining its CMS record.
update public.sponsors
set active = false
where id = 'd41faabc-a8e9-40c3-99b1-fa81a5645026'
  and data->>'name' = 'DeMolay Brasil';
