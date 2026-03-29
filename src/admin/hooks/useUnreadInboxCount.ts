import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function useUnreadInboxCount(): number {
  const { pathname } = useLocation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { count: n } = await supabase
        .from("contact_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "unread");
      if (!cancelled) setCount(n ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return count;
}
