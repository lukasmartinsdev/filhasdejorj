import { useEffect,useState } from 'react';
import { defaults } from '../data/defaults';
import { apiRequest, adminApi } from '../lib/api';
export async function loadContent(admin=false){
  return admin ? adminApi('/content') : apiRequest('/content');
}
export function useContent(){
 const [content,setContent]=useState(defaults);
 useEffect(()=>{let alive=true;loadContent().then(data=>{if(alive)setContent(data)}).catch(()=>{});return()=>{alive=false}},[]);
 return content;
}
