import { motion } from "framer-motion";
import {
  BrainCircuit,
  Layers3,
  Database,
  Code2,
  Target,
} from "lucide-react";

import Shell from "../components/Shell";

const technologies = [
  {
    icon: Code2,
    title: "Frontend",
    value: "React + Tailwind CSS",
  },
  {
    icon: BrainCircuit,
    title: "AI Engine",
    value: "Python + Agentic AI",
  },
  {
    icon: Layers3,
    title: "API Layer",
    value: "FastAPI",
  },
  {
    icon: Database,
    title: "Data Layer",
    value: "PostgreSQL + Supabase",
  },
];

export default function AboutProject() {
  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-14">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
            About the project
          </p>

          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            McKinsey AI Market Research Engine Engine
          </h1>

          <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
            An AI-powered market research and strategy engine designed to
            accelerate the research process by combining intelligent planning,
            web research, evidence extraction, validation, and report
            generation.
          </p>
        </motion.section>

        {/* Objective */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-12 rounded-xl border border-line bg-surface p-6 sm:p-8"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-soft text-navy">
            <Target size={19} />
          </div>

          <h2 className="mt-6 text-xl font-semibold text-ink">
            Project objective
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">
            Traditional market research can require significant time to
            collect information, compare sources, validate evidence, and
            organize findings. McKinsey AI Market Research Engine explores how an agentic AI workflow
            can coordinate these activities and return a structured research
            output for human review.
          </p>
        </motion.section>

        {/* Architecture */}
        <section className="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
              System architecture
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              From question to strategic report
            </h2>
          </motion.div>

          <div className="mt-6 flex flex-col gap-3">
            {[
              ["01", "User Question", "A strategic market question starts the workflow."],
              ["02", "Planner Agent", "The question is converted into focused research tasks."],
              ["03", "Research Agents", "Relevant information is gathered from available sources."],
              ["04", "Validation", "Evidence is reviewed for quality and consistency."],
              ["05", "Report Generator", "Validated findings are synthesized into a structured report."],
            ].map(([number, title, description], index) => (
              <motion.div
                key={number}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.06,
                }}
                className="flex gap-4 rounded-lg border border-line bg-surface p-4 sm:items-center"
              >
                <span className="font-mono text-xs text-navy">
                  {number}
                </span>

                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    {title}
                  </h3>

                  <p className="mt-1 text-sm text-ink-muted">
                    {description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Technology */}
        <section className="mt-12">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
            Technology stack
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {technologies.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.06,
                  }}
                  whileHover={{ y: -3 }}
                  className="rounded-lg border border-line bg-surface p-5"
                >
                  <Icon size={19} className="text-navy" />

                  <p className="mt-5 text-xs font-mono uppercase tracking-wide text-ink-muted">
                    {item.title}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-ink">
                    {item.value}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Project note */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 border-l-2 border-gold pl-5"
        >
          <h2 className="text-lg font-semibold text-ink">
            Built as an AI engineering project
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
            McKinsey AI Market Research Engine is focused on exploring practical applications
            of generative AI, agent orchestration, automated research, and
            full-stack application development.
          </p>
        </motion.section>
      </div>
    </Shell>
  );
}