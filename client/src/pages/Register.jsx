import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  User,
  Mail,
  Lock,
  GraduationCap,
  Code,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  Edit2,
  Loader2,
} from 'lucide-react';

export default function Register() {
  const { sendOtp, verifyOtpAndRegister } = useContext(AuthContext);
  const navigate = useNavigate();

  // Step 1 = Form Details, Step 2 = OTP Verification
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    skills: '',
    education: '',
  });

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer countdown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Send OTP to verify Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await sendOtp(formData.email, formData.name);
      setSuccessMsg(res.message || `Verification code sent to ${formData.email}`);
      setStep(2);
      setResendCooldown(60); // 60s cooldown
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Cannot connect to backend server. Make sure backend is awake.');
      } else {
        setError(err.response?.data?.message || 'Failed to send verification code. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await sendOtp(formData.email, formData.name);
      setSuccessMsg(res.message || `New verification code sent to ${formData.email}`);
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP and Register Account
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      return setError('Please enter the full 6-digit verification code.');
    }

    setError('');
    setSubmitting(true);

    try {
      await verifyOtpAndRegister({
        ...formData,
        otp: otp.trim(),
      });
      navigate('/explore');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-lg surface-card rounded-[2rem] p-7 sm:p-10 relative overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-900/90 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-indigo-600/30">
            {step === 1 ? (
              <Sparkles className="w-6 h-6 fill-white" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {step === 1 ? 'Create Student Account' : 'Verify Real Email'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {step === 1
              ? 'Showcase projects, share notes & collaborate'
              : '2-Step Security Verification'}
          </p>
        </div>

        {/* Step Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 1 ? 'w-8 bg-indigo-500' : 'w-4 bg-emerald-500'
            }`}
          ></div>
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 2 ? 'w-8 bg-indigo-500' : 'w-4 bg-slate-700'
            }`}
          ></div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-semibold flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Alex Morgan"
                  className="input-field py-2.5 pl-11 pr-4 bg-slate-950/70 border-slate-800 text-white rounded-xl w-full focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Gmail / Email *
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@gmail.com"
                    className="input-field py-2.5 pl-11 pr-4 bg-slate-950/70 border-slate-800 text-white rounded-xl w-full focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-field py-2.5 pl-11 pr-4 bg-slate-950/70 border-slate-800 text-white rounded-xl w-full focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Education / Degree
              </label>
              <div className="relative">
                <GraduationCap className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="B.Tech Computer Science, Senior Year"
                  className="input-field py-2.5 pl-11 pr-4 bg-slate-950/70 border-slate-800 text-white rounded-xl w-full focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Skills (comma separated)
              </label>
              <div className="relative">
                <Code className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, MongoDB, Python"
                  className="input-field py-2.5 pl-11 pr-4 bg-slate-950/70 border-slate-800 text-white rounded-xl w-full focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Short Bio
              </label>
              <textarea
                name="bio"
                rows={2}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Passionate full-stack developer working on real-time apps..."
                className="input-field px-4 py-2.5 bg-slate-950/70 border-slate-800 text-white rounded-xl w-full focus:border-indigo-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="primary-button w-full px-4 py-3.5 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition duration-200"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Continue to Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification Screen */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="p-4 bg-slate-950/80 border border-indigo-500/30 rounded-2xl text-center">
              <p className="text-xs text-slate-400">Verification code sent to:</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-bold text-white text-sm">{formData.email}</span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  title="Edit Email"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 text-center">
                Enter 6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-indigo-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="• • • • • •"
                  className="input-field py-3 pl-12 pr-4 bg-slate-950 border-2 border-indigo-500/50 text-white font-mono text-xl tracking-[0.6em] text-center rounded-2xl w-full focus:border-indigo-400 shadow-inner"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Check your Gmail inbox (or Spam/Promotions folder). Valid for 10 minutes.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || otp.length < 6}
              className="primary-button w-full px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify &amp; Create Account</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                ← Change Information
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || submitting}
                className={`font-semibold flex items-center gap-1 ${
                  resendCooldown > 0
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'text-indigo-400 hover:text-indigo-300'
                }`}
              >
                <RotateCcw className={`w-3.5 h-3.5 ${submitting ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-xs text-slate-400 mt-6 pt-4 border-t border-slate-800">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
