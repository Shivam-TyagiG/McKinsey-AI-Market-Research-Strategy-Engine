import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, FileSearch, AlertCircle } from "lucide-react";
import Shell from "../components/Shell";
import StatusBadge from "../components/StatusBadge";
import { api, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

import { motion } from "framer-motion";

// import { ThemeProvider } from "../context/ThemeContext";
import { useTheme } from "../context/ThemeContext";

const PROMPTS = [
  "The impact of generative AI on student critical thinking skills.",
  "Emerging demand signals in the residential solar storage market",
  "What is the student placement rate at AlmaBetter, and how does it compare to Hogwarts graduates?",
  "Student placement rate and career outcomes at AlmaBetter compared to other edtech platforms in India."
];

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadJobs = async () => {
    try {
      const data = await api.listResearch();
      setJobs(data.jobs || []);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadJobs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    // Progress screen owns the actual API call so we can show a live wait state.
    navigate("/research/new", { state: { query: query.trim() } });
  };

  const firstName = (user?.user_metadata?.full_name || "").split(" ")[0];


  const { theme } = useTheme();

  const cardColors = [
    "border-l-[#9DB7D5]", // muted blue
    "border-l-[#9FC9C4]", // muted teal
    "border-l-[#B5B0C9]", // muted lavender
    "border-l-[#C9B98F]", // muted sand
    "border-l-[#A8B9A5]", // muted sage
  ];



  return (
    <Shell>
      <div className=" px-6 pb-24 pt-14">
        {/* Hero composer */}
        <section className="animate-rise mx-auto max-w-6xl">
          <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-gold">
            {firstName ? `Welcome back, ${firstName}` : "New engagement"}
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-5xl">
            What market question should McKinsey AI Market Research Engine investigate?
          </h2>
          <p className="mt-4 max-w-xl text-[15px] font-medium leading-relaxed text-ink-muted">
            Describe a market, competitor set, or strategic question. McKinsey AI Market Research Engine
            plans the research, gathers evidence from the web, validates it,
            and returns a structured, cited report.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <div
              className={` rounded-xl border border-[#8c8c8c]  p-2 shadow-[0_1px_2px_rgba(16,21,31,0.04)] transition focus-within:border-navy/30 focus-within:ring-1 focus-within:ring-na
              ${theme == "dark" ? "bg-[#4D4D4D]/45" : "bg-[#f3f2f2]/80"} `}
            >
              <textarea
                rows={3}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Assess the competitive dynamics and growth outlook for enterprise observability tooling…"
                className=" w-full resize-none rounded-lg bg-transparent px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-muted outline-none"
              />

              <div className="flex items-center justify-between px-3 pb-2 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <Sparkles size={13} className="text-gold" />
                  Planner &middot; Researcher &middot; Validator &middot; Report
                </div>

                <motion.button
                  type="submit"
                  disabled={!query.trim() || submitting}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className=" group flex cursor-pointer items-center gap-2 rounded-lg bg-navy/70 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="hidden md:block">
                    Run research
                  </span>

                  <span className="md:hidden">
                    Start
                  </span>

                  <motion.div
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                      delay: 0.2,
                    }}
                  >
                    <ArrowRight size={15} />
                  </motion.div>
                </motion.button>
              </div>
            </div>
          </form>

          <motion.div className="mt-8 flex flex-wrap gap-2"

          >
            {PROMPTS.map((p) => (
              <motion.button
                key={p}
                type="button"
                onClick={() => setQuery(p)}
                className={`rounded-full border border-line px-3.5 py-1.5 text-sm  cursor-pointer ${theme == "dark" ? "bg-gray-800/80 text-slate-200" : " bg-white text-ink"}`}

                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.50, delay: 0.3 }}
              >

                {/* bg-white  text-ink-soft transition hover:border-navy/25 hover:text-ink */}
                {p}
              </motion.button>
            ))}
          </motion.div>
        </section>

        {/* History */}
        <section className="mt-18">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display font-semibold text-2xl tracking-tight text-ink">
              Past engagements
            </h2>
            {jobs.length > 0 && (
              <span className="font-mono text-xs text-ink-muted">
                {jobs.length} total
              </span>
            )}
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-bad/25 bg-bad/5 px-4 py-3 text-sm text-bad">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {loadingJobs ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 rounded-lg border border-line bg-white p-4">
                  <div className="shimmer-line h-3.5 w-2/3 rounded" />
                  <div className="shimmer-line mt-3 h-3 w-1/3 rounded" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-white px-6 py-16 text-center">
              <FileSearch size={26} className="text-ink-muted/60" />
              <p className="mt-3 text-sm text-ink-muted">
                No research engagements yet. Ask a question above to get started.
              </p>
            </div>
          ) : (
            <ul className="grid w-full grid-cols-1 items-stretch gap-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3"> {/* divide-y divide-line overflow-hidden*/}
              {jobs.map((job, index) => (
                <li key={job.id}>
                  <button
                    onClick={() => navigate(`/research/${job.id}`)}
                    className={`group relative h-full w-full overflow-hidden rounded-lg border border-line border-l-4 ${cardColors[index % cardColors.length]} ${theme == "dark" ? "bg-[#323232]" : "bg-[#DCDCDC]/20"} p-5 text-left transition duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer`}
                  >
                    {/* Top progress line */}
                    {job.status === "running" && (
                      <div className="absolute left-0 right-0 top-0 h-1 overflow-hidden bg-paper-dim">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "68%" }}
                          transition={{
                            duration: 1,
                            ease: "easeOut",
                          }}
                          className="h-full bg-navy"
                        />
                      </div>
                    )}

                    {/* Top row */}
                    <div className={`flex items-center justify-between gap-3 `} >
                      <StatusBadge status={job.status} />

                      <span className="font-mono text-[11px] text-ink-muted">
                        {timeAgo(job.created_at)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className={`mt-5 line-clamp-2 font-display text-2xl font-bold leading-tight tracking-tight text-ink`}>
                      {job.brief}
                    </h3>

                    {/* Description */}
                    <p className={`mt-4 line-clamp-2 text-[15px] leading-relaxed t ${theme == "dark" ? "text-gray-300" : "text-ink-muted"} `}>
                      {job.description ||
                        "Analyzing market signals, evidence, and strategic insights for this research question."}
                    </p>

                    {/* Divider */}
                    <div className={`my-5 h-px ${theme == "dark" ? "bg-gray-400" : "bg-line"}`} />

                    {/* Bottom row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-[#bcbcbc]">
                        <FileSearch size={14} />

                        <span className={`${theme == "dark" ? "text-white" : "text-ink"}`}>
                          Sources Analyzed
                        </span>
                      </div>

                      <ArrowRight
                        size={17}
                        className="text-ink-muted transition duration-200 group-hover:translate-x-1 group-hover:text-navy"
                      />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Shell >
  );
}