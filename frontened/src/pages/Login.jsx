import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, ArrowRight, AlertCircle, LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
// This page is responsible for handling user login. 
// It provides a form for users to enter their email and password, and upon submission, 
// it authenticates the user using the signIn function from the AuthContext. 
// If authentication is successful, the user is redirected to their intended destination or the default dashboard. 
// If there is an error during login, an error message is displayed.
export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // If their is a previous location stored in the state, we will redirect the user to that location after successful login.
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    // Prevent the default form submission behavior, which would cause a page reload.
    e.preventDefault(); 
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      dark
      eyebrow="Secure workspace access"
      title="Return to the work that moves decisions forward."
      subtitle="Sign in to continue building evidence-backed market intelligence with your research workspace."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#a8afac]">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-md border border-[#34403b] bg-[#1b211f] px-3.5 py-2.5 text-sm font-medium text-[#f2f4f3] outline-none transition placeholder:text-[#747c78] focus:border-[#d6a15c] focus:ring-2 focus:ring-[#d6a15c]/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#a8afac]">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-md border border-[#34403b] bg-[#1b211f] px-3.5 py-2.5 text-sm text-[#f2f4f3] outline-none transition placeholder:text-[#747c78] focus:border-[#d6a15c] focus:ring-2 focus:ring-[#d6a15c]/20"
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
          className="group flex w-full items-center justify-center gap-2 rounded-md bg-[#d6a15c] px-4 py-3 text-sm font-semibold text-[#111312] transition hover:bg-[#e0b77d] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {submitting ? "Signing in…" : "Sign in"}
          {!submitting && (
            <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
          )}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#747c78]">
        <LockKeyhole size={13} />
        <span>Private workspace · Evidence stays attributable</span>
      </div>
      <p className="mt-5 text-center text-sm text-[#a8afac]">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="font-medium text-[#d6a15c] underline decoration-[#d6a15c] decoration-2 underline-offset-2 transition hover:text-[#e0b77d]">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}

export function BrandMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy text-gold-soft">
      <Compass size={18} strokeWidth={2} />
    </span>
  );
}
