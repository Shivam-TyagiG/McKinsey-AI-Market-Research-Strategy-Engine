import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Lightbulb,
  Radar,
  Users,
  Compass as CompassIcon,
  Target,
  Link2,
  Database,
  Loader2,
} from "lucide-react";
import Shell from "../components/Shell";
import StatusBadge from "../components/StatusBadge";
import { api, ApiError } from "../api/client";


import { useTheme } from "../context/ThemeContext";


const SECTIONS = [
  { key: "key_findings", title: "Key findings", icon: Lightbulb },
  { key: "market_signals", title: "Market signals", icon: Radar },
  { key: "competitor_observations", title: "Competitor observations", icon: Users },
  { key: "implications", title: "Implications", icon: CompassIcon },
  { key: "recommendations", title: "Recommendations", icon: Target },
];

const TABS = [
  { key: "report", label: "Report" },
  { key: "evidence", label: "Evidence" },
  { key: "sources", label: "Sources" },
];

function ReportSection({ title, icon: Icon, items }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="mt-10 animate-rise">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gold-dim text-gold">
          <Icon size={14} />
        </span>
        <h2 className="font-display text-xl tracking-tight text-ink">{title}</h2>
      </div>
      <ul className="space-y-3.5 border-l border-line pl-6">
        {items.map((item, i) => (
          <li key={i} className="relative text-[15px] leading-relaxed text-ink-soft">
            <span className="absolute -left-[27px] top-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
            {item.text}
            {item.evidence_ids?.length > 0 && (
              <span className="ml-2 font-mono text-[10px] text-ink-muted">
                [{item.evidence_ids.length} source{item.evidence_ids.length > 1 ? "s" : ""}]
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ReportView() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const { theme } = useTheme();


  const [job, setJob] = useState(null);
  const [report, setReport] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("report");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const jobData = await api.getJob(jobId);
        if (cancelled) return;
        setJob(jobData);

        if (jobData.status === "completed") {
          const [reportData, evidenceData, sourcesData] = await Promise.all([
            api.getReport(jobId),
            api.getEvidence(jobId).catch(() => ({ evidence: [] })),
            api.getSources(jobId).catch(() => ({ sources: [] })),
          ]);
          if (cancelled) return;

          let parsed = null;
          try {
            parsed = JSON.parse(reportData.report.content_md);
          } catch {
            parsed = null;
          }
          setReport(parsed);
          setEvidence(evidenceData.evidence || []);
          setSources(sourcesData.sources || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load this research job.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const sourceById = Object.fromEntries(sources.map((s) => [s.id, s]));

  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-10">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-1.5 text-sm text-ink-muted transition hover:text-ink cursor-pointer"
        >
          <ArrowLeft size={15} />
          Dashboard
        </button>

        {loading && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-white py-24">
            <Loader2 size={22} className="animate-spin text-gold" />
            <p className="mt-3 text-sm text-ink-muted">Loading research job…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2 rounded-md border border-bad/25 bg-bad/5 px-4 py-3 text-sm text-bad">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {!loading && !error && job && job.status !== "completed" && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-white py-20 text-center">
            <StatusBadge status={job.status} />
            <p className="mt-4 max-w-sm text-sm text-ink-muted">
              {job.status === "failed"
                ? "This research job failed before producing a report."
                : "This research job is still in progress. Check back shortly."}
            </p>
            <p className="mt-4 max-w-md text-[15px] text-ink">{job.brief}</p>
          </div>
        )}

        {!loading && !error && job && job.status === "completed" && report && (
          <>
            <header className="animate-rise">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                Strategy report
              </p>
              <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink">
                {report.title}
              </h1>
              <div className="mt-4 flex items-center gap-3">
                <StatusBadge status={job.status} />
                <span className="text-xs text-ink-muted">
                  {new Date(job.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="mt-6 rounded-lg border-l-2 border-gold bg-surface px-5 py-4">
                <p className="text-[15px] leading-relaxed text-ink-soft">
                  {report.executive_summary}
                </p>
              </div>
              {report.warnings?.length > 0 && (
                <div
                  role="status"
                  className="mt-4 rounded-md border border-gold/30 bg-gold-dim/30 px-4 py-3 text-sm text-ink-soft"
                >
                  <div className="mb-2 flex items-center gap-2 font-medium text-ink">
                    <AlertCircle size={15} className="text-gold" />
                    Research completed with limitations
                  </div>
                  <ul className="list-disc space-y-1 pl-5">
                    {report.warnings.map((warning, index) => (
                      <li key={`${index}-${warning}`}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </header>

            <div className="mt-8 flex gap-1 border-b border-line">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative px-4 py-2.5 text-sm font-medium transition cursor-pointer ${tab === t.key ? "text-ink" : "text-ink-muted hover:text-ink-soft"
                    }`}
                >
                  {t.label}
                  {tab === t.key && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold" />
                  )}
                </button>
              ))}
            </div>

            {tab === "report" && (
              <>
                {SECTIONS.map((s) => (
                  <ReportSection key={s.key} title={s.title} icon={s.icon} items={report[s.key]} />
                ))}

                {report.citations?.length > 0 && (
                  <section className="mt-12 border-t border-line pt-6">
                    <div className="mb-4 flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-paper-dim text-ink-soft">
                        <Link2 size={14} />
                      </span>
                      <h2 className="font-display text-xl tracking-tight text-ink">Citations</h2>
                    </div>
                    <ol className="space-y-2">
                      {report.citations.map((c, i) => (
                        <li key={c.citation_id || i} className="text-sm text-ink-soft">
                          <span className="font-mono text-xs text-ink-muted">[{i + 1}]</span>{" "}
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-navy underline decoration-line underline-offset-2 hover:decoration-gold"
                          >
                            {c.title}
                          </a>
                          {c.publisher && <span className="text-ink-muted"> — {c.publisher}</span>}
                        </li>
                      ))}
                    </ol>
                  </section>
                )}
              </>
            )}

            {tab === "evidence" && (
              <section className="mt-8 space-y-3">
                {evidence.length === 0 && (
                  <p className="text-sm text-ink-muted">No evidence records available.</p>
                )}
                {evidence.map((e) => (
                  <div key={e.id} className="rounded-lg border border-line bg-surface p-4">
                    <p className="text-[15px] leading-relaxed text-ink">{e.claim}</p>
                    {e.quote && (
                      <p className="mt-2 border-l-2 border-line pl-3 text-sm italic leading-relaxed text-ink-muted">
                        &ldquo;{e.quote}&rdquo;
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-ink-muted">
                      {e.status && <span className="rounded-full bg-paper-dim text-[11px] font-medium px-2 py-0.5">{e.status}</span>}
                      {typeof e.confidence === "number" && (
                        <span className={`rounded-full text-[11px] font-medium bg-paper-dim px-2 py-0.5 ${theme == "dark" ? "text-[#323232]" : "text-ink"} `}>
                          Confidence {(e.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                      {sourceById[e.source_id] && (
                        <a
                          href={sourceById[e.source_id].url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full  bg-surface px-2 py-0.5  text-blue-500 hover:underline"
                        >
                          {sourceById[e.source_id].title || "Source"}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {tab === "sources" && (
              <section className="mt-8 space-y-2">
                {sources.length === 0 && (
                  <p className="text-sm text-ink-muted">No sources recorded.</p>
                )}
                {sources.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-4 rounded-lg border border-line bg-surface px-4 py-3 transition hover:border-navy/25"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Database size={14} className="shrink-0 text-ink-muted" />
                      <div className="min-w-0">
                        <p className="truncate text-sm text-ink">{s.title || s.url}</p>
                        <p className="truncate text-xs text-ink-muted">{s.url}</p>
                      </div>
                    </div>
                    {s.source_type && (
                      <span className="shrink-0 rounded-full bg-paper-dim px-2 py-0.5 font-mono text-[10px] uppercase text-ink-muted">
                        {s.source_type}
                      </span>
                    )}
                  </a>
                ))}
              </section>
            )}
          </>
        )}

        {!loading && !error && job && job.status === "completed" && !report && (
          <div className="rounded-md border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
            The report finished processing but could not be parsed.
          </div>
        )}
      </div>
    </Shell>
  );
}