import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, AlertCircle, MailCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await signUp(email, password, fullName);
      if (data.session) {
        navigate("/", { replace: true });
      } else {
        // Email confirmation required by the Supabase project settings.
        setNeedsConfirmation(true);
      }
    } catch (err) {
      setError(err.message || "Unable to create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  if (needsConfirmation) {
    return (
      <AuthLayout
        eyebrow="Almost there"
        title="Confirm your email"
        subtitle="We sent a verification link to finish setting up your account."
      >
        <div className="flex items-start gap-3 rounded-md border border-[#d9d7d0] bg-[#f8f7f3] px-4 py-4">
          <MailCheck
            size={18}
            className="mt-0.5 shrink-0 text-[#b65a16]"
          />
          <p className="text-sm leading-relaxed text-ink-soft">
            Check <span className="font-medium text-ink">{email}</span> and click
            the confirmation link, then return here to sign in.
          </p>
        </div>
        <Link
          to="/login"
          className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[#171717] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#303030]"
        >
          Back to sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Set up access to run and revisit McKinsey AI Market Research Engine research engagements."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
            Full name
          </label>

          <input
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="w-full rounded-md border border-[#d9d7d0] bg-white px-3.5 py-2.5 text-sm text-[#171717] outline-none transition placeholder:text-[#999999] focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/5"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
            Email
          </label>

          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-md border border-[#d9d7d0] bg-white px-3.5 py-2.5 text-sm text-[#171717] outline-none transition placeholder:text-[#999999] focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/5"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded-md border border-[#d9d7d0] bg-white px-3.5 py-2.5 text-sm text-[#171717] outline-none transition placeholder:text-[#999999] focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/5"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-bad/25 bg-bad/5 px-3 py-2.5 text-sm text-bad">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="group flex w-full items-center justify-center gap-2 rounded-md bg-[#171717] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {submitting ? "Creating account…" : "Create account"}
          {!submitting && (
            <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-navy underline decoration-gold-soft decoration-2 underline-offset-2">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
