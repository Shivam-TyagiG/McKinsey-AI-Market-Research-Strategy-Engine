import { motion } from "framer-motion";
import {
  ClipboardList,
  Globe,
  Search,
  ShieldCheck,
  FileText,
  ArrowRight,
} from "lucide-react";

import Shell from "../components/Shell";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Planning",
    description:
      "The research question is analyzed and divided into focused research tasks so the system can investigate the topic systematically.",
  },
  {
    number: "02",
    icon: Globe,
    title: "Research",
    description:
      "Research agents gather relevant information and market signals from available web sources based on the research plan.",
  },
  {
    number: "03",
    icon: Search,
    title: "Evidence Extraction",
    description:
      "Important facts, observations, statistics, and supporting evidence are extracted from the collected sources.",
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Validation",
    description:
      "Collected evidence is reviewed and validated to improve reliability and reduce unsupported or conflicting findings.",
  },
  {
    number: "05",
    icon: FileText,
    title: "Report Generation",
    description:
      "Validated findings are synthesized into a structured research report with key findings, evidence, and strategic implications.",
  },
];

export default function Methodology() {
  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-14">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
            Research methodology
          </p>

          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            How McKinsey AI Market Research Engine conducts research
          </h1>

          <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
            McKinsey AI Market Research Engine follows a structured multi-stage research workflow that
            transforms a strategic question into a validated and cited market
            research report.
          </p>
        </motion.section>

        {/* Pipeline */}
        <section className="mt-14">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.08,
                  }}
                  whileHover={{ y: -3 }}
                  className="rounded-xl border border-line bg-surface p-6 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-soft text-navy">
                      <Icon size={18} />
                    </div>

                    <span className="font-mono text-xs text-ink-muted">
                      {step.number}
                    </span>
                  </div>

                  <h2 className="mt-6 text-lg font-semibold text-ink">
                    {step.title}
                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Pipeline flow */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-12 rounded-xl border border-line bg-surface p-6 sm:p-8"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-navy" />

            <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
              Research pipeline
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {[
              "Research Question",
              "Planning",
              "Web Research",
              "Evidence",
              "Validation",
              "Report",
            ].map((item, index, array) => (
              <div key={item} className="flex items-center gap-3">
                <span className="rounded-md border border-line bg-surface-dim px-3 py-2 text-sm font-medium text-ink">
                  {item}
                </span>

                {index < array.length - 1 && (
                  <ArrowRight
                    size={15}
                    className="hidden text-ink-muted sm:block"
                  />
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Human review */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 border-l-2 border-navy pl-5"
        >
          <h2 className="text-lg font-semibold text-ink">
            Built for human review
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
            McKinsey AI Market Research Engine is designed to accelerate research rather than replace
            strategic judgment. The generated findings, evidence, and
            recommendations are intended to give analysts and consultants a
            structured starting point for further review.
          </p>
        </motion.section>
      </div>
    </Shell>
  );
}