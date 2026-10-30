import React, { useState } from 'react';
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { paymentService, VerifyPaymentResponse } from '../../services/payment.service';

export interface RazorpayCheckoutButtonProps {
  amountInPaise: number; // e.g. 50000 for ₹500
  currency?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  label?: string;
  className?: string;
  variant?: 'primary' | 'emerald' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onSuccess?: (response: VerifyPaymentResponse & { payment_id: string; order_id: string }) => void;
  onError?: (error: { message: string; code?: string; description?: string }) => void;
  onDismiss?: () => void;
}

export const RazorpayCheckoutButton: React.FC<RazorpayCheckoutButtonProps> = ({
  amountInPaise,
  currency = 'INR',
  name = 'AI Campus OS',
  description = 'Placement & Onboarding Fee',
  prefill,
  notes,
  label,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  onSuccess,
  onError,
  onDismiss,
}) => {
  const [loading, setLoading] = useState(false);

  const formatAmount = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    });
  };

  const handlePayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading || disabled) return;

    if (amountInPaise < 100) {
      toast.error('Minimum payment amount is ₹1.00 (100 paise)');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Initializing secure payment...');

    try {
      await paymentService.openCheckout({
        amount: amountInPaise,
        currency,
        name,
        description,
        prefill,
        notes,
        onSuccess: (res) => {
          setLoading(false);
          toast.dismiss(toastId);
          toast.success('🎉 Payment Verified Successfully!', {
            description: `Payment ID: ${res.payment_id}`,
          });
          if (onSuccess) onSuccess(res);
        },
        onError: (err) => {
          setLoading(false);
          toast.dismiss(toastId);
          toast.error('Payment Error', {
            description: err.message || 'An error occurred during payment verification',
          });
          if (onError) onError(err);
        },
        onDismiss: () => {
          setLoading(false);
          toast.dismiss(toastId);
          toast.info('Payment window closed');
          if (onDismiss) onDismiss();
        },
      });
    } catch (err: any) {
      setLoading(false);
      toast.dismiss(toastId);
      toast.error('Failed to launch checkout', {
        description: err.message || 'Please check your configuration or network.',
      });
      if (onError) onError({ message: err.message });
    }
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 border border-blue-500/30',
    emerald:
      'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-500/30',
    outline:
      'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-sm',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
    lg: 'text-base px-6 py-3.5 gap-2.5 rounded-2xl font-semibold',
  };

  return (
    <button
      type="button"
      onClick={handlePayClick}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Connecting Razorpay...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 text-current" />
          <span>{label || `Pay ${formatAmount(amountInPaise)}`}</span>
          <ShieldCheck className="w-3.5 h-3.5 opacity-80 ml-0.5" />
        </>
      )}
    </button>
  );
};
