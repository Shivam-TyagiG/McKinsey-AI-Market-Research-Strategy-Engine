import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ListChecks,
  Globe2,
  ShieldCheck,
  FileText,
  AlertCircle,
  Search,
  Link2,
  BarChart3,
  Check,
  Database,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { api, ApiError } from "../api/client";
import logo from "../assets/MK_Logo.png";

const STAGES = [
  {
    key: "planning",
    icon: ListChecks,
    label: "Planning the brief",
    detail: "Breaking the question into research tasks",
  },
  {
    key: "researching",
    icon: Globe2,
    label: "Gathering evidence",
    detail: "Searching sources and extracting claims",
  },
  {
    key: "validating",
    icon: ShieldCheck,
    label: "Validating evidence",
    detail: "Scoring credibility, recency, and conflicts",
  },
  {
    key: "reporting",
    icon: FileText,
    label: "Drafting the report",
    detail: "Synthesizing findings and recommendations",
  },
];

const STAGE_DURATION_MS = 5200;

const ACTIVITIES = [
  "Searching market reports...",
  "Scanning industry sources...",
  "Extracting relevant claims...",
  "Checking source credibility...",
  "Comparing market signals...",
  "Preparing strategic synthesis...",
];

const PARTICLE_ICONS = [
  Search,
  Globe2,
  Link2,
  BarChart3,
  Database,
];

export default function ResearchProgress() {
  const location = useLocation();
  const navigate = useNavigate();

  const query = location.state?.query;

  const [stageIndex, setStageIndex] = useState(0);
  const [activityIndex, setActivityIndex] = useState(0);

  const [error, setError] = useState("");
  const [failedJobId, setFailedJobId] = useState(null);

  const startedRef = useRef(false);

  /*
  |--------------------------------------------------------------------------
  | Start research
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!query) {
      navigate("/", { replace: true });
      return;
    }

    if (startedRef.current) return;

    startedRef.current = true;

    const timer = setInterval(() => {
      setStageIndex((current) =>
        Math.min(current + 1, STAGES.length - 1)
      );
    }, STAGE_DURATION_MS);

    api
      .createResearch(query)
      .then((result) => {
        clearInterval(timer);

        setStageIndex(STAGES.length - 1);

        setTimeout(() => {
          navigate(`/research/${result.job_id}`, {
            replace: true,
          });
        }, 900);
      })
      .catch((err) => {
        clearInterval(timer);

        if (err instanceof ApiError) {
          setError(err.message);

          if (
            err.detail &&
            typeof err.detail === "object" &&
            err.detail.job_id
          ) {
            setFailedJobId(err.detail.job_id);
          }
        } else {
          setError(
            "Something went wrong starting the research pipeline."
          );
        }
      });

    return () => clearInterval(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  /*
  |--------------------------------------------------------------------------
  | Change activity text
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = setInterval(() => {
      setActivityIndex(
        (current) => (current + 1) % ACTIVITIES.length
      );
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Error screen
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6 text-ink">
        <div className="w-full max-w-md text-center">

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-bad/20 bg-bad/5 text-bad"
          >
            <AlertCircle size={24} />
          </motion.div>

          <h1 className="mt-6 font-display text-2xl font-semibold">
            Research pipeline failed
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {error}
          </p>

          <div className="mt-7 flex justify-center gap-3">

            <button
              onClick={() => navigate("/")}
              className="rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 cursor-pointer"
            >
              Back to dashboard
            </button>

            {failedJobId && (
              <button
                onClick={() =>
                  navigate(`/research/${failedJobId}`)
                }
                className="rounded-md border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-paper-dim cursor-pointer"
              >
                View job
              </button>
            )}

          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Progress percentage
  |--------------------------------------------------------------------------
  */

  const progress =
    ((stageIndex + 1) / STAGES.length) * 100;

  /*
  |--------------------------------------------------------------------------
  | Main UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper text-ink">

      {/* ============================================================
          BACKGROUND
      ============================================================ */}

      <div className="pointer-events-none absolute inset-0">

        {/* Very subtle center glow */}
        <div
          className="
            absolute
            left-1/2
            top-[30%]
            h-[28rem]
            w-[28rem]
            -translate-x-1/2
            rounded-full
            bg-gold/5
            blur-3xl
          "
        />

        {/* Subtle dot grid */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.025]
          "
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* ============================================================
          CONTENT
      ============================================================ */}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-12">

        {/* ========================================================
            LOGO / RESEARCH CORE
        ======================================================== */}

        <div className="relative mb-9 flex h-28 w-28 items-center justify-center">

          {/* Outer pulse */}
          <motion.div
            animate={{
              scale: [1, 1.35, 1],
              opacity: [0.35, 0, 0.35],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="
              absolute
              h-24
              w-24
              rounded-full
              border
              border-gold/30
            "
          />

          {/* Orbit */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
              absolute
              h-24
              w-24
              rounded-full
              border
              border-dashed
              border-gold/25
            "
          >
            {/* Orbit dot */}
            <span
              className="
                absolute
                -right-1
                top-1/2
                h-2
                w-2
                -translate-y-1/2
                rounded-full
                bg-gold
              "
            />
          </motion.div>

          {/* Second orbit */}
          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
              absolute
              h-20
              w-32
              rounded-full
              border
              border-line
              opacity-60
            "
          />

          {/* Logo */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.7,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
            className="
              relative
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-xl
              border
              border-line
              bg-surface
              shadow-sm
            "
          >
            <motion.img
              src={logo}
              alt="McKinsey AI Market Research Engine"
              className="h-9 w-9 object-contain"
              animate={{
                scale: [1, 1.04, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Floating particles */}
          {PARTICLE_ICONS.map((Icon, index) => (
            <FloatingParticle
              key={index}
              Icon={Icon}
              index={index}
            />
          ))}
        </div>

        {/* ========================================================
            HEADING
        ======================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="text-center"
        >

          <p
            className="
              font-mono
              text-[11px]
              uppercase
              tracking-[0.22em]
              text-gold
            "
          >
            McKinsey AI Market Research Engine is working
          </p>

          <h1
            className="
              mt-3
              max-w-2xl
              font-display
              text-2xl
              font-semibold
              leading-tight
              tracking-tight
              sm:text-3xl
            "
          >
            {query}
          </h1>

          {/* Live activity */}
          <div className="mt-5 flex items-center justify-center gap-2">

            <motion.span
              animate={{
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
              }}
              className="h-1.5 w-1.5 rounded-full bg-gold"
            />

            <AnimatePresence mode="wait">
              <motion.span
                key={ACTIVITIES[activityIndex]}
                initial={{
                  opacity: 0,
                  y: 5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -5,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="text-xs text-ink-muted"
              >
                {ACTIVITIES[activityIndex]}
              </motion.span>
            </AnimatePresence>

          </div>
        </motion.div>

        {/* ========================================================
            PROGRESS BAR
        ======================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
            delay: 0.15,
          }}
          className="mt-9 w-full max-w-xl"
        >

          <div className="mb-2 flex items-center justify-between">

            <span
              className="
                font-mono
                text-[10px]
                uppercase
                tracking-wider
                text-ink-muted
              "
            >
              Research progress
            </span>

            <span className="font-mono text-[10px] text-ink-soft">
              {Math.round(progress)}%
            </span>

          </div>

          <div className="h-1 overflow-hidden rounded-full bg-line">

            <motion.div
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
              className="
                h-full
                rounded-full
                bg-gold
              "
            />

          </div>
        </motion.div>

        {/* ========================================================
            STAGES
        ======================================================== */}

        <div className="mt-8 w-full max-w-xl space-y-2">

          {STAGES.map((stage, index) => {

            const Icon = stage.icon;

            const state =
              index < stageIndex
                ? "done"
                : index === stageIndex
                  ? "active"
                  : "pending";

            return (
              <StageCard
                key={stage.key}
                stage={stage}
                Icon={Icon}
                state={state}
                index={index}
              />
            );
          })}

        </div>

        {/* ========================================================
            STATUS METRICS
        ======================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
            delay: 0.5,
          }}
          className="
            mt-6
            grid
            w-full
            max-w-xl
            grid-cols-3
            gap-2
          "
        >

          <Metric
            icon={Globe2}
            label="Sources"
            value={
              stageIndex >= 1
                ? "Scanning"
                : "Queued"
            }
          />

          <Metric
            icon={ShieldCheck}
            label="Evidence"
            value={
              stageIndex >= 2
                ? "Checking"
                : "Waiting"
            }
          />

          <Metric
            icon={FileText}
            label="Report"
            value={
              stageIndex >= 3
                ? "Writing"
                : "Pending"
            }
          />

        </motion.div>

        {/* ========================================================
            FOOTER MESSAGE
        ======================================================== */}

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.5,
            delay: 0.7,
          }}
          className="
            mt-7
            max-w-md
            text-center
            text-xs
            leading-relaxed
            text-ink-muted
          "
        >
          McKinsey AI Market Research Engine is coordinating multiple research stages.
          You can leave this page open while the analysis runs.
        </motion.p>

      </div>
    </div>
  );
}


/* ==================================================================
   STAGE CARD
================================================================== */

function StageCard({
  stage,
  Icon,
  state,
  index,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
      }}
      className={`
        relative
        overflow-hidden
        rounded-xl
        border
        p-4
        transition-all
        duration-500

        ${state === "active"
          ? "border-gold/35 bg-surface shadow-sm"
          : state === "done"
            ? "border-line bg-surface/80"
            : "border-line/70 bg-surface/40"
        }
      `}
    >

      {/* Active shimmer */}

      {state === "active" && (
        <motion.div
          initial={{
            x: "-100%",
          }}
          animate={{
            x: "100%",
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="
            pointer-events-none
            absolute
            inset-y-0
            w-1/3
            bg-gradient-to-r
            from-transparent
            via-gold/5
            to-transparent
          "
        />
      )}

      <div className="relative flex items-center gap-4">

        {/* Icon */}

        <motion.div
          animate={
            state === "active"
              ? {
                scale: [1, 1.07, 1],
              }
              : {
                scale: 1,
              }
          }
          transition={{
            duration: 1.8,
            repeat:
              state === "active"
                ? Infinity
                : 0,
          }}
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            border

            ${state === "done"
              ? "border-good/30 bg-good/5 text-good"
              : state === "active"
                ? "border-gold/40 bg-gold/5 text-gold"
                : "border-line text-ink-muted/40"
            }
          `}
        >

          <AnimatePresence mode="wait">

            {state === "done" ? (
              <motion.div
                key="check"
                initial={{
                  scale: 0,
                  rotate: -45,
                }}
                animate={{
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }}
              >
                <Check size={15} />
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
              >
                <Icon
                  size={15}
                  className={
                    state === "active"
                      ? "animate-pulse"
                      : ""
                  }
                />
              </motion.div>
            )}

          </AnimatePresence>

        </motion.div>

        {/* Text */}

        <div className="min-w-0">

          <p
            className={`
              text-sm
              font-medium

              ${state === "pending"
                ? "text-ink-muted"
                : "text-ink"
              }
            `}
          >
            {stage.label}
          </p>

          <p className="mt-0.5 text-xs text-ink-muted">
            {stage.detail}
          </p>

        </div>

        {/* Active indicator */}

        {state === "active" && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="ml-auto flex items-center gap-1.5"
          >

            <motion.span
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
              }}
              className="h-1.5 w-1.5 rounded-full bg-gold"
            />

            <span
              className="
                hidden
                font-mono
                text-[9px]
                uppercase
                tracking-wider
                text-gold
                sm:block
              "
            >
              Active
            </span>

          </motion.div>
        )}

        {/* Done label */}

        {state === "done" && (
          <span
            className="
              ml-auto
              hidden
              font-mono
              text-[9px]
              uppercase
              tracking-wider
              text-good
              sm:block
            "
          >
            Complete
          </span>
        )}

      </div>
    </motion.div>
  );
}


/* ==================================================================
   FLOATING PARTICLE
================================================================== */

function FloatingParticle({
  Icon,
  index,
}) {

  const positions = [
    "-left-10 top-0",
    "-right-10 top-1",
    "-left-8 bottom-0",
    "-right-9 bottom-2",
    "left-1/2 -top-8",
  ];

  return (
    <motion.div
      className={`
        absolute
        ${positions[index]}
      `}
      initial={{
        opacity: 0,
        scale: 0.4,
      }}
      animate={{
        opacity: [0, 0.7, 0],
        scale: [0.5, 1, 0.7],
        y: [8, -4, -16],
      }}
      transition={{
        duration: 3.2,
        delay: index * 0.8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >

      <div
        className="
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-lg
          border
          border-line
          bg-surface
          text-gold
          shadow-sm
        "
      >
        <Icon size={12} />
      </div>

    </motion.div>
  );
}


/* ==================================================================
   METRIC
================================================================== */

function Metric({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-lg
        border
        border-line
        bg-surface/60
        px-3
        py-3
        text-center
      "
    >

      <div className="flex items-center justify-center gap-1.5">

        <Icon
          size={11}
          className="text-ink-muted"
        />

        <span
          className="
            font-mono
            text-[9px]
            uppercase
            tracking-wider
            text-ink-muted
          "
        >
          {label}
        </span>

      </div>

      <p className="mt-1 text-xs font-medium text-ink">
        {value}
      </p>

    </div>
  );
}