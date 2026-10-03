import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  FileClock,
  FileText,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  X,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import Footer from "./Footer";
import logo from "../assets/MK_Logo.png";

const navigation = [
  { label: "Dashboard", to: "/", icon: BarChart3, end: true },
  { label: "New Research", to: "/new", icon: Plus },
  { label: "History", to: "/history", icon: FileClock },
  { label: "Sources & Library", to: "/sources", icon: BookOpen },
  { label: "Reports", to: "/reports", icon: FileText },
];

export default function Shell({ children }) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navigate = useNavigate();

  const initials = (user?.user_metadata?.full_name || user?.email || "?")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`sticky top-0 z-40 border-b border-line/80 bg-paper/95 backdrop-blur
          `}
      >
        <div className="flex items-center justify-between px-5 py-4 md:px-7">
          <button
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            className="mr-3 flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink-soft md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link
              to="/"
              className="flex items-center gap-2.5"
            >
              <motion.span
                whileHover={{
                  scale: 1.08,
                  rotate: 4,
                }}
                transition={{ duration: 0.2 }}
                className="  flex h-10 w-10 items-center justify-center rounded-xs  font-mono text-xs font-medium "
              >
                {/* <Compass size={16} strokeWidth={2} /> */}
                <img src={logo} alt="McKinsey AI Market Research Engine" className="h-full w-full object-cover" />
              </motion.span>

              <div className="flex flex-col">
                <span className="font-display font-semibold text-[16px] tracking-tight text-ink">
                  McKinsey AI Market Research Engine
                </span>

                <span className="hidden font-mono font-medium text-[10px] uppercase tracking-[0.18em] text-ink sm:inline">
                  AI Market Research Engine
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Right side */}
          <div
            className="flex items-center gap-3 sm:gap-4"
          >


            {/* <div
              className="hidden text-right sm:block"
            >
              <p className="text-sm leading-none text-ink">
                {user?.user_metadata?.full_name || "Analyst"}
              </p>

              <p className="mt-1 text-xs leading-none text-ink-muted">
                {user?.email}
              </p>
            </div> */}


            {/* Theme toggle */}
            <motion.button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={
                theme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
              whileHover={{
                scale: 1.08,
              }}
              whileTap={{
                scale: 0.92,
              }}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-line text-ink-soft transition hover:border-ink/30 hover:text-ink"
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.10 }}
              >
                {theme === "light" ? (
                  <Moon size={17} />
                ) : (
                  <Sun size={17} />
                )}
              </motion.div>
            </motion.button>

            {/* User avatar */}
            <motion.div
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.95,
              }}

              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12 }}
              className="flex h-9 w-9 cursor-default items-center justify-center rounded-full bg-gray-700 font-mono text-xs font-medium text-gray-100"

              title={user?.user_metadata?.full_name || "Analyst"}
            >
              {initials}
            </motion.div>

            {/* Sign out */}
            <motion.button
              onClick={handleSignOut}


              whileHover={{
                x: 3,
              }}
              whileTap={{
                x: 0,
                scale: 0.97,
              }}

              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-400/80 px-3 py-2 text-xs font-medium text-ink-soft transition hover:border-ink/70 hover:text-ink"
            >
              <LogOut size={14} />

              <span className="hidden sm:inline">
                Sign out
              </span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        <aside
          className={`${mobileNavOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-[73px] left-0 z-30 w-72 border-r border-line bg-paper px-4 py-6 transition-transform duration-200 md:sticky md:top-[73px] md:block md:h-[calc(100vh-73px)] md:translate-x-0`}
        >
          <div className="flex h-full flex-col">
            <div className="mb-6 px-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">Research workspace</p>
              <p className="mt-2 text-sm font-medium text-ink">Strategy intelligence</p>
            </div>
            <nav className="space-y-1" aria-label="Primary navigation">
              {navigation.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-navy text-white shadow-sm" : "text-ink-soft hover:bg-paper-dim hover:text-ink"}`}
                >
                  <Icon size={17} strokeWidth={1.8} />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto border-t border-line pt-4">
              <NavLink
                to="/settings"
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-navy text-white" : "text-ink-soft hover:bg-paper-dim hover:text-ink"}`}
              >
                <Settings size={17} strokeWidth={1.8} />
                Settings
              </NavLink>
              <div className="mt-5 rounded-lg border border-line bg-surface px-3 py-3">
                <p className="truncate text-xs font-semibold text-ink">{user?.user_metadata?.full_name || "Analyst"}</p>
                <p className="mt-1 truncate text-[11px] text-ink-muted">{user?.email}</p>
              </div>
            </div>
          </div>
        </aside>
        {mobileNavOpen && <button type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 top-[73px] z-20 bg-black/20 md:hidden" />}
        <motion.main
          className="min-w-0 flex-1"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.45,
          delay: 0.15,
          ease: "easeOut",
        }}
      >
          {children}
        </motion.main>
      </div>

      <Footer />
    </div>
  );
}