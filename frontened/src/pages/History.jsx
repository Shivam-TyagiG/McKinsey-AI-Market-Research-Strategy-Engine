import { useEffect, useState } from "react";
import { ArrowUpRight, FileClock, RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import StatusBadge from "../components/StatusBadge";
import { ApiError, api } from "../api/client";
// This page is responsible for displaying the research history of the user.
// It fetches the list of research jobs from the API and displays them in a table format. 
// The user can search for specific research briefs using the search input. Each job displays its brief, status, and creation date. 
// The user can click on a job to navigate to its detailed report view.
function formatDate(value) {
  return value ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "-";
}

export default function History() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await api.listResearch();
      setJobs(data.jobs || []);
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load research history.");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadJobs(); }, []);

  const filteredJobs = jobs.filter((job) => job.brief?.toLowerCase().includes(query.toLowerCase()));

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12">
        <div className="flex flex-col justify-between gap-5 border-b border-line pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Workspace archive</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Research history</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">Review every brief, status, and report generated for your account.</p>
          </div>
          <button onClick={loadJobs} className="inline-flex items-center justify-center gap-2 rounded-md border border-line px-3.5 py-2.5 text-sm font-medium text-ink-soft hover:border-ink/30 hover:text-ink"><RefreshCw size={15} /> Refresh</button>
        </div>
        <div className="mt-7 flex max-w-md items-center gap-2 rounded-md border border-line bg-paper px-3 py-2.5"><Search size={16} className="text-ink-muted" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search research briefs" className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted" /></div>
        {error && <p className="mt-6 rounded-md border border-bad/20 bg-bad/5 px-4 py-3 text-sm text-bad">{error}</p>}
        <div className="mt-6 overflow-hidden rounded-lg border border-line bg-paper">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-line bg-surface px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted"><span>Research brief</span><span>Status</span><span>Created</span></div>
          {loading ? <div className="px-5 py-12 text-center text-sm text-ink-muted">Loading your research history...</div> : filteredJobs.length === 0 ? <div className="px-5 py-12 text-center"><FileClock className="mx-auto text-ink-muted" size={26} /><p className="mt-3 text-sm text-ink-muted">No research engagements found.</p></div> : filteredJobs.map((job) => <button key={job.id} onClick={() => navigate(`/research/${job.id}`)} className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-line px-5 py-4 text-left last:border-0 hover:bg-surface"><span className="min-w-0"><span className="block truncate text-sm font-medium text-ink">{job.brief}</span><span className="mt-1 block font-mono text-[10px] text-ink-muted">{job.id}</span></span><StatusBadge status={job.status} /><span className="flex items-center gap-2 whitespace-nowrap text-xs text-ink-muted">{formatDate(job.created_at)}<ArrowUpRight size={14} /></span></button>)}
        </div>
      </div>
    </Shell>
  );
}
