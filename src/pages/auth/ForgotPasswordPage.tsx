import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, Mail } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { toast } from 'sonner';
export const ForgotPasswordPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-ai-600 rounded-xl flex items-center justify-center"><Zap className="w-4 h-4 text-white"/></div>
          <span className="font-bold text-slate-900 dark:text-white">AI PlacementOS</span>
        </div>
        {!sent ? (
          <>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Reset password</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Enter your email and we'll send you a reset link.</p>
            <div className="space-y-4">
              <Input label="Email address" type="email" placeholder="you@college.edu.in" leftIcon={<Mail className="w-4 h-4"/>}/>
              <Button className="w-full" onClick={() => { toast.success('Reset link sent!'); setSent(true); }}>Send Reset Link</Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-emerald-600"/>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h2>
            <p className="text-slate-500 dark:text-slate-400">We've sent a password reset link to your email address.</p>
          </div>
        )}
        <Link to="/login" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 mt-6 justify-center">
          <ArrowLeft className="w-4 h-4"/> Back to login
        </Link>
      </div>
    </div>
  );
};
