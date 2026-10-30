import { API_BASE } from '../config/api';

export interface CreateOrderParams {
  amount: number; // in paise (e.g., 3000 = ₹30)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
  description?: string;
  studentEmail?: string;
  studentId?: string;
  collegeId?: string;
  isAutoPay?: boolean;
  name?: string;
  contact?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order_id: string;
  amount: number;
  currency: string;
  key_id?: string;
  customer_id?: string;
  receipt?: string;
  message?: string;
}

export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  verified: boolean;
  message: string;
  order_id?: string;
  payment_id?: string;
  error?: string;
}

export interface CheckoutOptions {
  amount: number; // amount in paise
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  isAutoPay?: boolean;
  customer_id?: string;
  onSuccess: (response: VerifyPaymentResponse & { payment_id: string; order_id: string }) => void;
  onError: (error: { message: string; code?: string; description?: string }) => void;
  onDismiss?: () => void;
}

/**
 * Dynamically loads the Razorpay checkout.js script if not already present
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Payment Service for Razorpay Integration
 */
export const paymentService = {
  /**
   * STEP 1: Calls backend POST /api/create-order
   */
  async createOrder(params: CreateOrderParams): Promise<CreateOrderResponse> {
    const res = await fetch(`${API_BASE}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to create payment order');
    }

    return data;
  },

  /**
   * STEP 3: Calls backend POST /api/verify-payment
   */
  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResponse> {
    const res = await fetch(`${API_BASE}/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Payment verification failed');
    }

    return data;
  },

  /**
   * Fetches public Razorpay key ID if needed
   */
  async getPaymentConfig(): Promise<{ key_id: string }> {
    try {
      const res = await fetch(`${API_BASE}/payment/config`);
      if (res.ok) {
        const data = await res.json();
        return { key_id: data.key_id || '' };
      }
    } catch (e) {
      console.warn('Could not fetch server payment config, falling back to env');
    }
    return {
      key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
    };
  },

  /**
   * STEP 2: Standard Razorpay Web Checkout Orchestration
   * 1. Loads SDK script
   * 2. Calls backend /api/create-order
   * 3. Launches Razorpay checkout modal
   * 4. On payment success, sends razorpay_order_id, razorpay_payment_id, razorpay_signature to backend /api/verify-payment
   * 5. Handles user dismissal and payment failure events
   */
  async openCheckout(options: CheckoutOptions): Promise<void> {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      const errorMsg = 'Failed to load Razorpay payment SDK. Please check your internet connection.';
      options.onError({ message: errorMsg });
      throw new Error(errorMsg);
    }

    // Step 1: Create Order on backend
    const orderData = await this.createOrder({
       amount: options.amount,
       currency: options.currency || 'INR',
       notes: options.notes,
       description: options.description,
       studentEmail: options.prefill?.email,
       studentId: options.notes?.studentId,
       isAutoPay: options.isAutoPay,
       name: options.prefill?.name,
       contact: options.prefill?.contact,
    });

    // Resolve public Key ID (from order response or frontend env)
    const keyId =
      orderData.key_id ||
      import.meta.env.VITE_RAZORPAY_KEY_ID ||
      '';

    if (!keyId) {
      const err = 'Razorpay Key ID is missing. Please configure VITE_RAZORPAY_KEY_ID.';
      options.onError({ message: err });
      throw new Error(err);
    }

    // Step 2: Configure Razorpay modal options
    const razorpayOptions: RazorpayOptions = {
      key: keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: options.name || 'AI Campus OS',
      description: options.description || 'Placement & Academic Services Payment',
      image: '/aicampusos.png',
      order_id: orderData.order_id,
      customer_id: orderData.customer_id || options.customer_id,
      recurring: options.isAutoPay ? 1 : undefined,
      prefill: options.prefill,
      notes: {
        ...(options.notes || {}),
        ...(options.isAutoPay ? { autopay: 'true', mandate_amount: '30' } : {}),
      },
      theme: {
        color: '#0066FF', // Brand Blue
      },
      modal: {
        ondismiss: () => {
          if (options.onDismiss) {
            options.onDismiss();
          }
        },
      },
      handler: async (response: RazorpaySuccessResponse) => {
        try {
          // Step 3: Verify Signature on backend
          const verifyResult = await paymentService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyResult.success) {
            options.onSuccess({
              ...verifyResult,
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
            });
          } else {
            options.onError({
              message: verifyResult.message || 'Signature mismatch: payment verification rejected by server.',
            });
          }
        } catch (err: any) {
          options.onError({
            message: err.message || 'Error occurred while verifying payment signature on server.',
          });
        }
      },
    };

    const rzp = new window.Razorpay(razorpayOptions);

    // Error Handling: payment.failed event
    rzp.on('payment.failed', (failResponse: any) => {
      console.error('Razorpay Payment Failed:', failResponse);
      const errorDetail = failResponse?.error?.description || failResponse?.error?.reason || 'Payment failed';
      options.onError({
        code: failResponse?.error?.code,
        description: errorDetail,
        message: `Payment failed: ${errorDetail}`,
      });
    });

    // Open Razorpay Checkout Modal
    rzp.open();
  },
};
