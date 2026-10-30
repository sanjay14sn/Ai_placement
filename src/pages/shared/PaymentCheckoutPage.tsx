import React, { useState } from 'react';
import { 
  CreditCard, ShieldCheck, CheckCircle2, AlertCircle, 
  Sparkles, Lock, ArrowLeft, ArrowRight, RefreshCw, 
  Building2, GraduationCap, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { paymentService, VerifyPaymentResponse } from '../../services/payment.service';

export const PaymentCheckoutPage: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number>(100); // in paise (₹1 minimum)
  const [customAmountRupees, setCustomAmountRupees] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [name, setName] = useState<string>('Rahul Sharma');
  const [email, setEmail] = useState<string>('student@institution.edu.in');
  const [contact, setContact] = useState<string>('9876543210');
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentResult, setPaymentResult] = useState<{
    order_id: string;
    payment_id: string;
    amount: number;
    currency: string;
    paidAt: string;
  } | null>(null);

  const packages = [
    {
      id: 'student_autopay',
      paise: 3000, // ₹30
      rupees: 30,
      title: 'Student Placement AutoPay (₹30/mo)',
      description: 'Initial ₹30 setup fee with recurring monthly AutoPay for placement drives & verified KYC',
      badge: 'AutoPay Mandate',
      isAutoPay: true,
    },
    {
      id: 'test_min',
      paise: 100, // ₹1
      rupees: 1,
      title: 'Sandbox Validation (₹1)',
      description: 'Razorpay Minimum Checkout Test (100 paise)',
      badge: 'Official Test',
    },
    {
      id: 'student_onboarding',
      paise: 49900, // ₹499
      rupees: 499,
      title: 'Student Placement KYC Pass',
      description: 'Verified TPO KYC, resume shortlisting & company drive access',
      badge: 'Popular',
    },
    {
      id: 'campus_pro',
      paise: 149900, // ₹1499
      rupees: 1499,
      title: 'CampusOS Pro Pass',
      description: 'Unlimited AI Mock Interviews, 100+ Drives & ATS Resume Tuning',
      badge: 'Best Value',
    },
    {
      id: 'institution_license',
      paise: 999900, // ₹9999
      rupees: 9999,
      title: 'Department Placement License',
      description: 'Full institutional batch management, bulk shortlisting & reports',
      badge: 'Institution',
    },
  ];

  const effectiveAmountInPaise = isCustom
    ? Math.max(100, Math.round((parseFloat(customAmountRupees) || 1) * 100))
    : selectedAmount;

  const effectiveRupees = effectiveAmountInPaise / 100;

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();

    if (effectiveAmountInPaise < 100) {
      toast.error('Minimum amount must be at least ₹1.00 (100 paise)');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Connecting to Razorpay Standard Checkout...');

    try {
      await paymentService.openCheckout({
        amount: effectiveAmountInPaise,
        currency: 'INR',
        name: 'AI Campus OS',
        description: `Placement Platform Checkout - ₹${effectiveRupees}`,
        isAutoPay: effectiveRupees === 30,
        prefill: {
          name,
          email,
          contact,
        },
        notes: {
          packageType: isCustom ? 'Custom Amount' : `Package ₹${effectiveRupees}`,
          clientApp: 'AI PlacementOS Standard Web',
          autopay: effectiveRupees === 30 ? 'true' : 'false',
        },
        onSuccess: (res: VerifyPaymentResponse & { payment_id: string; order_id: string }) => {
          setLoading(false);
          toast.dismiss(toastId);
          setPaymentResult({
            order_id: res.order_id,
            payment_id: res.payment_id,
            amount: effectiveRupees,
            currency: 'INR',
            paidAt: new Date().toLocaleString('en-IN'),
          });
          toast.success('🎉 Payment Successful & Verified!', {
            description: `Payment ID: ${res.payment_id}`,
          });
        },
        onError: (err) => {
          setLoading(false);
          toast.dismiss(toastId);
          toast.error('Payment Incomplete or Verification Error', {
            description: err.message || 'Signature mismatch or user cancellation',
          });
        },
        onDismiss: () => {
          setLoading(false);
          toast.dismiss(toastId);
          toast.info('Razorpay checkout modal closed by user');
        },
      });
    } catch (err: any) {
      setLoading(false);
      toast.dismiss(toastId);
      toast.error('Failed to open checkout', {
        description: err.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-start items-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-xl border border-white/10 transition-all text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full font-medium">
            <Lock className="w-3 h-3" /> Razorpay Test Gateway Active
          </span>
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Plan Selection & Summary */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400" /> Razorpay Web Checkout
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Integrated Payment Gateway
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Select a placement package or sandbox test amount to test live order creation, standard checkout modal launch, and HMAC-SHA256 signature verification.
            </p>

            {/* Packages */}
            <div className="mt-6 space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Choose Tier / Amount
              </label>

              {packages.map((pkg) => {
                const isSelected = !isCustom && selectedAmount === pkg.paise;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => {
                      setSelectedAmount(pkg.paise);
                      setIsCustom(false);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                        : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{pkg.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20">
                          {pkg.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{pkg.description}</p>
                    </div>

                    <div className="text-right pl-4">
                      <span className="text-lg font-black text-white">₹{pkg.rupees}</span>
                    </div>
                  </div>
                );
              })}

              {/* Custom amount */}
              <div
                onClick={() => setIsCustom(true)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isCustom
                    ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                    : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                }`}
              >
                <div>
                  <span className="font-bold text-sm text-white">Custom Amount (INR)</span>
                  <p className="text-xs text-slate-400">Specify any amount (min ₹1.00)</p>
                </div>

                <div className="flex items-center gap-2 w-36">
                  <span className="text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={customAmountRupees}
                    onChange={(e) => {
                      setIsCustom(true);
                      setCustomAmountRupees(e.target.value);
                    }}
                    className="w-full text-right text-sm font-bold px-3 py-1.5 rounded-xl border border-slate-600 bg-slate-900 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Verification architecture preview */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>3-Step Security Architecture</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                <li>Server generates order via <code className="text-blue-300">POST /api/create-order</code></li>
                <li>Modal rendered via Razorpay SDK <code className="text-blue-300">checkout.js</code></li>
                <li>Server validates <code className="text-blue-300">HMAC-SHA256</code> at <code className="text-blue-300">/api/verify-payment</code></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Form & Receipt */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
            {paymentResult ? (
              /* Success View */
              <div className="text-center py-4 space-y-5">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-8 ring-emerald-500/10">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">Payment Verified!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Signature matched successfully with HMAC-SHA256.
                  </p>
                </div>

                <div className="bg-slate-900/80 rounded-2xl p-4 text-left border border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Amount Paid</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      ₹{paymentResult.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Payment ID</span>
                    <span className="font-mono text-blue-400 select-all">
                      {paymentResult.payment_id}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Order ID</span>
                    <span className="font-mono text-slate-300 select-all">
                      {paymentResult.order_id}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Verified At</span>
                    <span className="text-slate-300">{paymentResult.paidAt}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentResult(null)}
                    className="w-full py-3 px-4 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all text-xs"
                  >
                    Perform Another Payment
                  </button>
                  <Link
                    to="/register"
                    className="w-full py-3 px-4 rounded-xl font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-all text-xs text-center flex items-center justify-center"
                  >
                    Back to Registration
                  </Link>
                </div>
              </div>
            ) : (
              /* Checkout Form */
              <form onSubmit={handlePayNow} className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-400" /> Payment Credentials
                </h3>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Student / Candidate Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-blue-500"
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Email Address (Receipt recipient)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-blue-500"
                    placeholder="9876543210"
                  />
                </div>

                {/* Amount Summary */}
                <div className="pt-2 border-t border-slate-700 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Base Amount</span>
                    <span className="text-white font-medium">₹{effectiveRupees}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Gateway Fee</span>
                    <span className="text-emerald-400 font-medium">₹0.00 (Waived)</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-700/60">
                    <span>Total Due</span>
                    <span className="text-lg text-blue-400">₹{effectiveRupees}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-blue-500/25 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Opening Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pay ₹{effectiveRupees.toLocaleString('en-IN')} with Razorpay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  Secured by Razorpay. Keys protected by server environment.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
