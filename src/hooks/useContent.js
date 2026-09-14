import { useEffect,useState } from 'react';
import { defaults } from '../data/defaults';
import { supabase } from '../lib/supabase';
export async function loadContent(admin=false){
  if(!supabase)return defaults;
  const entries=await Promise.all(Object.keys(defaults).map(async table=>{
    let query=supabase.from(table).select('*').order('sort_order');
    if(!admin)query=query.eq('active',true);
    const {data,error}=await query;
    if(error)throw new Error('Não foi possível carregar o conteúdo. Tente novamente.');
    return [table,data];
  }));
  return Object.fromEntries(entries);
}
export function useContent(){
 const [content,setContent]=useState(defaults);
 useEffect(()=>{let alive=true;loadContent().then(data=>{if(alive)setContent(data)}).catch(()=>{});return()=>{alive=false}},[]);
 return content;
}
