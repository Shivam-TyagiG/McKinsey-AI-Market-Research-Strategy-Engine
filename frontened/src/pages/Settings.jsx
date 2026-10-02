import { useState } from "react";
import { Check, Moon, Save, Sun } from "lucide-react";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
// here we define the Settings page component, which allows users to manage their profile and appearance preferences. 
// It uses the useAuth hook to access the current user's information and the useTheme hook to manage the theme settings. 
// The component maintains local state for the user's name and a saved status to provide feedback when changes are saved. 
// The saveProfile function handles form submission, preventing default behavior and updating the saved state. 
// The component renders a form for updating the user's full name and displays the user's email address, along with a section for toggling between light and dark themes.
export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const saveProfile = (event) => { event.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2400); };
  return <Shell><div className="mx-auto max-w-4xl px-6 pb-24 pt-12"><div className="border-b border-line pb-8"><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Workspace preferences</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Settings</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">Manage your profile and how McKinsey AI Market Research Engine looks on your device.</p></div><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]"><form onSubmit={saveProfile} className="rounded-lg border border-line bg-paper p-6"><h2 className="text-sm font-semibold text-ink">Account profile</h2><p className="mt-1 text-sm text-ink-muted">Your profile details are used across the research workspace.</p><label className="mt-6 block text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Full name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/40" /></label><label className="mt-5 block text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Email address<input value={user?.email || ""} disabled className="mt-2 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink-muted outline-none" /></label><button type="submit" className="mt-6 inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-navy/90"><Save size={15} /> Save changes</button>{saved && <span className="ml-3 inline-flex items-center gap-1 text-xs text-emerald-700"><Check size={14} /> Saved locally</span>}</form><div className="rounded-lg border border-line bg-paper p-6"><h2 className="text-sm font-semibold text-ink">Appearance</h2><p className="mt-1 text-sm leading-relaxed text-ink-muted">Choose the display mode for your workspace.</p><button type="button" onClick={toggleTheme} className="mt-6 flex w-full items-center justify-between rounded-md border border-line px-3 py-3 text-sm font-medium text-ink hover:bg-surface"><span className="flex items-center gap-2">{theme === "light" ? <Sun size={16} /> : <Moon size={16} />}{theme === "light" ? "Light mode" : "Dark mode"}</span><span className="text-xs text-ink-muted">Change</span></button></div></div></div></Shell>;
}
