import { useEffect, useState } from "react";

type Preference = "light" | "dark" | "system";
const key = "lumen-theme";
function valid(value: string | null | undefined): value is Preference { return value === "light" || value === "dark" || value === "system"; }

// Runs before styles/paint; only System follows the OS. No stored value means light.
export const themeBootstrap = `(()=>{let p="light";try{const s=localStorage.getItem("${key}");if(["light","dark","system"].includes(s))p=s}catch{}const r=document.documentElement;r.dataset.preference=p;r.dataset.theme=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p})()`;

export function ThemeControl() {
  const [preference, setPreference] = useState<Preference>("light");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const saved = document.documentElement.dataset.preference;
    if (valid(saved)) setPreference(saved);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const media = matchMedia("(prefers-color-scheme: dark)");
    function update() {
      document.documentElement.dataset.preference = preference;
      document.documentElement.dataset.theme = preference === "system" ? (media.matches ? "dark" : "light") : preference;
    }
    // The bootstrap owns the first paint; state synchronizes on mount.
    update();
    const listener = () => { if (preference === "system") update(); };
    media.addEventListener("change", listener);
    const storage = (event: StorageEvent) => { if (event.key === key) setPreference(valid(event.newValue) ? event.newValue : "light"); };
    window.addEventListener("storage", storage);
    return () => { media.removeEventListener("change", listener); window.removeEventListener("storage", storage); };
  }, [preference, ready]);
  function change(value: Preference) {
    setPreference(value);
    document.documentElement.dataset.preference = value;
    document.documentElement.dataset.theme = value === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : value;
    try { localStorage.setItem(key, value); } catch { /* Session choice still works when storage is blocked. */ }
  }
  return <label className="theme-control"><span className="sr-only">Theme</span>
    <select value={preference} onChange={event => change(event.target.value as Preference)}>
      <option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option>
    </select></label>;
}
