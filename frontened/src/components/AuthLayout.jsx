
import { motion } from "framer-motion";
import {
  Compass,
  GitBranch,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import logo from "../assets/MK_Logo.png";

export default function AuthLayout({ eyebrow, title, subtitle, children, dark = false }) {
  return (
    <div className={`${dark ? "dark" : ""} min-h-screen bg-white lg:grid lg:grid-cols-2`}>

      {/* Left side */}
      <div className={`hidden border-r lg:flex ${dark ? "border-[#28302d] bg-[#111312]" : "border-[#dedbd3] bg-[#f3f2ee]"}`}>
        <div className="flex w-full flex-col justify-between px-10 py-10 xl:px-12">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-md border ${dark ? "border-[#34403b] bg-[#1b211f]" : "border-[#d9d6ce]"}`}>
              <img src={logo} alt="logo" className="w-full h-full object-cover" />
            </div>

            <div>
              <p className={`text-lg font-semibold tracking-tight ${dark ? "text-[#f2f4f3]" : "text-[#171717]"}`}>
                McKinsey AI Market Research Engine
              </p>

              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#d6a15c]">
                AI Market Research Engine
              </p>
            </div>
          </motion.div>


          {/* cain content */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="max-w-xl "
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#d6a15c]">
              AI-Powered Research
            </p>

            <h1 className={`mt-5 max-w-xl font-display text-5xl font-bold leading-[1.05] tracking-tight ${dark ? "text-[#f2f4f3]" : "text-[#171717]"}`}>
              Strategy intelligence, <br /> built by autonomous agents.
            </h1>

            <p className={`mt-6 max-w-md text-[15px] leading-7 ${dark ? "text-[#a8afac]" : "text-[#666666]"}`}>
              Give McKinsey AI Market Research Engine a market question. It plans the research,
              gathers and validates evidence, and returns a structured
              strategy report — fully cited.
            </p>
          </motion.div>


          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="space-y-5"
          >

            <div className="flex items-start gap-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${dark ? "border-[#34403b] bg-[#1b211f]" : "border-[#d9d6ce] bg-white"}`}>
                <GitBranch size={15} className="text-[#d6a15c]" />
              </div>

              <div>
                <p className={`text-sm font-semibold ${dark ? "text-[#f2f4f3]" : "text-[#171717]"}`}>
                  culti-agent pipeline
                </p>

                <p className={`mt-1 text-xs leading-5 ${dark ? "text-[#8f9994]" : "text-[#777777]"}`}>
                  Planner, researcher, validator, and report agents work a
                  brief end to end.
                </p>
              </div>
            </div>


            <div className="flex items-start gap-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${dark ? "border-[#34403b] bg-[#1b211f]" : "border-[#d9d6ce] bg-white"}`}>
                <ShieldCheck size={15} className="text-[#d6a15c]" />
              </div>

              <div>
                <p className={`text-sm font-semibold ${dark ? "text-[#f2f4f3]" : "text-[#171717]"}`}>
                  Evidence you can trace
                </p>

                <p className={`mt-1 text-xs leading-5 ${dark ? "text-[#8f9994]" : "text-[#777777]"}`}>
                  Every claim in the report links back to a scored,
                  citable source.
                </p>
              </div>
            </div>


            <div className="flex items-start gap-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${dark ? "border-[#34403b] bg-[#1b211f]" : "border-[#d9d6ce] bg-white"}`}>
                <TrendingUp size={15} className="text-[#d6a15c]" />
              </div>

              <div>
                <p className={`text-sm font-semibold ${dark ? "text-[#f2f4f3]" : "text-[#171717]"}`}>
                  Strategy-grade output
                </p>

                <p className={`mt-1 text-xs leading-5 ${dark ? "text-[#8f9994]" : "text-[#777777]"}`}>
                  Findings, signals, and recommendations — structured like
                  a real engagement.
                </p>
              </div>
            </div>

          </motion.div>
        </div>
      </div>


      {/* Right side */}
      <div className={`flex min-h-screen items-center justify-center px-6 py-12 sm:px-8 ${dark ? "bg-[#111312]" : "bg-white"}`}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >

          {/* cobile logo */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className={`flex h-9 w-9 items-center justify-center rounded-md border ${dark ? "border-[#34403b] bg-[#1b211f]" : "border-[#d9d6ce] bg-[#f3f2ee]"}`}>
              <Compass
                size={17}
                className="text-[#d6a15c]"
              />
            </div>

            <div>
              <p className={`font-semibold ${dark ? "text-[#f2f4f3]" : "text-[#171717]"}`}>
                McKinsey AI Market Research Engine
              </p>

              <p className={`font-mono text-[9px] uppercase tracking-[0.16em] ${dark ? "text-[#8f9994]" : "text-[#777777]"}`}>
                AI Market Research Engine
              </p>
            </div>
          </div>


          {/* Form heading */}
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#d6a15c]">
              {eyebrow}
            </p>

            <h2 className={`mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl ${dark ? "text-[#f2f4f3]" : "text-[#171717]"}`}>
              {title}
            </h2>

            <p className={`mt-3 text-sm leading-6 ${dark ? "text-[#a8afac]" : "text-[#666666]"}`}>
              {subtitle}
            </p>
          </div>


          {/* Form */}
          <div className="mt-8">
            {children}
          </div>

        </motion.div>
      </div>

    </div>
  );
}