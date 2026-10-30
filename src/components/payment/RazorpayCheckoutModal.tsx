import React, { useState } from 'react';
import { 
  X, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, 
  Sparkles, Lock, ArrowRight, RefreshCw, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { paymentService, VerifyPaymentResponse } from '../../services/payment.service';

export interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmountInRupees?: number;
  title?: string;
  subtitle?: string;
  studentName?: string;
  studentEmail?: string;
  studentRoll?: string;
  collegeName?: string;
  onPaymentSuccess?: (receipt: {
    order_id: string;
    payment_id: string;
    amount: number;
    paidAt: string;
  }) => void;
}

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  isOpen,
  onClose,
  defaultAmountInRupees = 30,
  title = 'AI Campus OS — Placement Gateway & AutoPay',
  subtitle = 'Official Razorpay Standard Web Checkout with AutoPay',
  studentName = '',
  studentEmail = '',
  studentRoll = '',
  collegeName = '',
  onPaymentSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<number>(defaultAmountInRupees);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    order_id: string;
    payment_id: string;
    amount: number;
    paidAt: string;
  } | null>(null);

  if (!isOpen) return null;

  const presetPlans = [
    {
      id: 'autopay_30',
      amount: 30,
      label: 'Student Placement Pass (Monthly AutoPay)',
      description: 'Pay ₹30 setup with recurring monthly AutoPay mandate via UPI / Card',
      badge: 'AutoPay • ₹30/mo',
    },
    {
      id: 'test',
      amount: 1,
      label: 'Sandbox Test Transaction',
      description: 'Razorpay test checkout validation (Minimum 100 paise)',
      badge: 'Test Mode',
    },
    {
      id: 'annual',
      amount: 499,
      label: 'Annual Placement Membership',
      description: 'One-time annual access, verified TPO KYC & automated shortlists',
      badge: 'Annual',
    },
    {
      id: 'premium',
      amount: 1499,
      label: 'CampusOS Pro Placement Pass',
      description: 'Unlimited AI Mock Interviews, ATS Resume Optimizations & 100+ Drives',
      badge: 'Best Value',
    },
  ];

  const effectiveAmountInRupees = isCustom
    ? Math.max(1, parseFloat(customAmount) || 1)
    : selectedPlan;

  const effectiveAmountInPaise = Math.round(effectiveAmountInRupees * 100);

  const handleInitiatePayment = async () => {
    if (effectiveAmountInPaise < 100) {
      toast.error('Minimum amount is ₹1.00 (100 paise)');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Connecting to Razorpay Secure Gateway...');

    try {
      await paymentService.openCheckout({
        amount: effectiveAmountInPaise,
        currency: 'INR',
        name: 'AI Campus OS',
        description: `${title} - ₹${effectiveAmountInRupees}`,
        isAutoPay: effectiveAmountInRupees === 30 || selectedPlan === 30,
        prefill: {
          name: studentName || 'Student Candidate',
          email: studentEmail || 'student@aicampusintelligent.com',
          contact: '9999999999',
        },
        notes: {
          studentRoll: studentRoll || 'N/A',
          collegeName: collegeName || 'AI Campus OS Partner',
          planName: isCustom ? 'Custom Amount' : `Plan ₹${selectedPlan}`,
          autopay: effectiveAmountInRupees === 30 ? 'true' : 'false',
        },
        onSuccess: (res: VerifyPaymentResponse & { payment_id: string; order_id: string }) => {
          setIsProcessing(false);
          toast.dismiss(toastId);
          const successObj = {
            order_id: res.order_id,
            payment_id: res.payment_id,
            amount: effectiveAmountInRupees,
            paidAt: new Date().toLocaleString('en-IN'),
          };
          setPaymentSuccessData(successObj);
          toast.success('🎉 Payment Verified!', {
            description: `Payment ID: ${res.payment_id}`,
          });
          if (onPaymentSuccess) {
            onPaymentSuccess(successObj);
          }
        },
        onError: (err) => {
          setIsProcessing(false);
          toast.dismiss(toastId);
          toast.error('Payment Failed or Incomplete', {
            description: err.message || 'Payment could not be completed.',
          });
        },
        onDismiss: () => {
          setIsProcessing(false);
          toast.dismiss(toastId);
          toast.info('Checkout cancelled');
        },
      });
    } catch (err: any) {
      setIsProcessing(false);
      toast.dismiss(toastId);
      toast.error('Could not initialize checkout', {
        description: err.message,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Top Header */}
        <div className="relative p-6 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Sparkles className="w-3 h-3 text-blue-400" /> Razorpay Standard Checkout
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <Lock className="w-3 h-3" /> 256-bit Encrypted
            </span>
          </div>

          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <p className="text-xs text-blue-200/80 mt-1">{subtitle}</p>

          {/* Student metadata preview */}
          {studentName && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-blue-100/90">
              <span>Candidate: <strong className="text-white">{studentName}</strong></span>
              {studentRoll && <span>USN: {studentRoll}</span>}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {paymentSuccessData ? (
            /* SUCCESS STATE */
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-8 ring-emerald-50 dark:ring-emerald-950/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Payment Verified Successfully!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your cryptographic HMAC signature has been validated by AI PlacementOS.
                </p>
              </div>

              {/* Receipt details */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-left border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    ₹{paymentSuccessData.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500">Payment ID</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 select-all">
                    {paymentSuccessData.payment_id}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500">Order ID</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 select-all">
                    {paymentSuccessData.order_id}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Timestamp</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {paymentSuccessData.paidAt}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/20"
              >
                Continue to Dashboard
              </button>
            </div>
          ) : (
            /* PAYMENT SELECTION STATE */
            <>
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Select Package / Fee Tier
                </label>
                <div className="space-y-2">
                  {presetPlans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlan(plan.amount);
                        setIsCustom(false);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        !isCustom && selectedPlan === plan.amount
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {plan.label}
                          </span>
                          {plan.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                          {plan.description}
                        </p>
                      </div>
                      <div className="text-right pl-3 shrink-0">
                        <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                          ₹{plan.amount}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Custom Amount Option */}
                  <div
                    onClick={() => setIsCustom(true)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isCustom
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      Custom Amount (INR)
                    </span>
                    <div className="flex items-center gap-1.5 w-32">
                      <span className="text-sm font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 299"
                        value={customAmount}
                        onChange={(e) => {
                          setIsCustom(true);
                          setCustomAmount(e.target.value);
                        }}
                        className="w-full text-right text-sm font-bold px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Guarantee */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Payments handled directly via Razorpay Standard Checkout modal. HMAC-SHA256 verified on backend.
                </span>
              </div>

              {/* Pay Button */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="w-1/3 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInitiatePayment}
                  disabled={isProcessing}
                  className="w-2/3 py-3 px-5 rounded-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-blue-500/25 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Opening Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pay ₹{effectiveAmountInRupees.toLocaleString('en-IN')} Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
