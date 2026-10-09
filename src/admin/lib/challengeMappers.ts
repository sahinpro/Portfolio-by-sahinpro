import { supabase } from "@/utils/supabase";

export async function adminAuthHeader(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function htmlDocumentTitle(html: string): string {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Text = h1?.[1]?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (h1Text) return h1Text;
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return "";
  return match[1].replace(/\s+/g, " ").trim();
}

/** Run the sheet as-is, and copy an imported CSV into the project folder. */
export function prepareChallengeHtml(
  html: string,
  slug: string,
  accessToken: string,
): string {
  const safeSlug = slug.replace(/[^a-z0-9-]/g, "");
  const token = accessToken.replace(/[^A-Za-z0-9._~+/-]/g, "");
  const boot = `<script>(function(){var real=window.localStorage;var prefix="challenge:${safeSlug}:";function scopedKeys(){var keys=[];for(var n=0;n<real.length;n++){var k=real.key(n);if(k&&k.indexOf(prefix)===0)keys.push(k.slice(prefix.length));}return keys;}var scoped={getItem:function(k){return real.getItem(prefix+k);},setItem:function(k,v){real.setItem(prefix+k,String(v));},removeItem:function(k){real.removeItem(prefix+k);},clear:function(){scopedKeys().forEach(function(k){real.removeItem(prefix+k);});},key:function(i){return scopedKeys()[i]||null;},get length(){return scopedKeys().length;}};try{Object.defineProperty(window,"localStorage",{configurable:true,value:scoped});}catch(e){}document.addEventListener("change",function(event){var target=event.target;if(!target||target.id!=="csv-file"||!target.files||!target.files[0])return;var body=new FormData();body.append("file",target.files[0]);var niche=document.getElementById("niche-input");body.append("niche",niche&&niche.value?niche.value:"");fetch("/api/admin/challenges/${safeSlug}/uploads",{method:"POST",headers:{Authorization:"Bearer ${token}"},body:body});},true);})();</script>`;

  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (head) => `${head}${boot}`);
  }
  return boot + html;
}
