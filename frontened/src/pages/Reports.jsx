import { useEffect, useState } from "react";
import { Download, FileText, RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import { api } from "../api/client";

function parseReport(data) { try { return JSON.parse(data?.report?.content_md || "{}"); } catch { return {}; } }
function downloadReport(report, job) {
  const body = [`# ${report.title || job.brief}`, "", report.executive_summary || "", "", ...(report.key_findings || []).map((item) => `## ${item.title || "Key finding"}\n${item.detail || item.description || item.content || ""}`)].join("\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/markdown" }));
  const link = document.createElement("a"); link.href = url; link.download = `${(report.title || "research-report").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`; link.click(); URL.revokeObjectURL(url);
}

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadReports = async () => {
  setLoading(true);

  try {
    const { jobs = [] } = await api.listResearch();

    const completed = jobs.filter(
      (job) => job.status === "completed"
    );

    const results = await Promise.all(
      completed.map(async (job) => {
        try {
          const data = await api.getReport(job.id);

          return {
            job,
            report: parseReport(data),
          };
        } catch {
          return null;
        }
      })
    );

    setReports(results.filter(Boolean));
    setError("");
  } catch (err) {
    setError(err.message || "Unable to load reports.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  loadReports();
}, []);

const filtered = reports.filter(({ job, report }) => {
  const searchText = `
    ${job.brief}
    ${report.title}
    ${report.executive_summary}
  `.toLowerCase();

  return searchText.includes(query.toLowerCase());
});

return (
  <Shell>
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-12">

      {/* Header */}
      <div className="flex flex-col justify-between gap-5 border-b border-line pb-8 sm:flex-row sm:items-end">

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
            Deliverables
          </p>

          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
            Reports
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
            Open, review, and download the strategy reports generated from your research.
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={loadReports}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-line px-3.5 py-2.5 text-sm font-medium text-ink-soft hover:border-ink/30 hover:text-ink"
        >
          <RefreshCw size={15} />
          Refresh
        </button>

      </div>

      {/* Search */}
      <div className="mt-7 flex max-w-md items-center gap-2 rounded-md border border-line bg-paper px-3 py-2.5">

        <Search
          size={16}
          className="text-ink-muted"
        />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reports"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted"
        />

      </div>

      {/* Error */}
      {error && (
        <p className="mt-6 rounded-md border border-bad/20 bg-bad/5 px-4 py-3 text-sm text-bad">
          {error}
        </p>
      )}

      {/* Reports */}
      <div className="mt-6 space-y-3">

        {/* Loading */}
        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-ink-muted">
            Loading your reports...
          </div>

        ) : filtered.length === 0 ? (

          /* No reports */
          <div className="rounded-lg border border-dashed border-line px-5 py-12 text-center">

            <FileText
              className="mx-auto text-ink-muted"
              size={26}
            />

            <p className="mt-3 text-sm text-ink-muted">
              Completed reports will appear here.
            </p>

          </div>

        ) : (

          /* Display reports */
          filtered.map(({ job, report }) => (

            <article
              key={job.id}
              className="flex flex-col gap-5 rounded-lg border border-line bg-paper p-5 sm:flex-row sm:items-center sm:justify-between"
            >

              {/* Report information */}
              <div className="flex min-w-0 gap-4">

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy text-white">
                  <FileText size={18} />
                </span>

                <div className="min-w-0">

                  <h2 className="truncate text-base font-semibold text-ink">
                    {report.title || job.brief}
                  </h2>

                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-muted">
                    {report.executive_summary || job.brief}
                  </p>

                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                    {new Date(job.created_at).toLocaleDateString()}
                  </p>

                </div>

              </div>

              {/* Buttons */}
              <div className="flex shrink-0 gap-2">

                {/* Open report */}
                <button
                  onClick={() => navigate(`/research/${job.id}`)}
                  className="rounded-md border border-line px-3 py-2 text-xs font-medium text-ink-soft hover:border-ink/30 hover:text-ink"
                >
                  Open report
                </button>

                {/* Download report */}
                <button
                  onClick={() => downloadReport(report, job)}
                  aria-label="Download report"
                  title="Download report"
                  className="flex h-9 w-9 items-center justify-center rounded-md bg-navy text-white hover:bg-navy/90"
                >
                  <Download size={15} />
                </button>

              </div>

            </article>

          ))
        )}

      </div>

    </div>
  </Shell>
  );
}