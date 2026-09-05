'use client';

import React, { useState } from 'react';
import {
  IoPerson,
  IoMail,
  IoBusiness,
  IoMegaphone,
  IoWallet,
  IoTime,
  IoArrowForward,
  IoCheckmarkCircle,
  IoAlertCircle,
} from 'react-icons/io5';
import { submitContactInquiryAction, ContactInquiryInput } from '@/app/actions/contact';

export default function ContactInquirySection() {
  const [formData, setFormData] = useState<ContactInquiryInput>({
    fullName: '',
    email: '',
    company: '',
    projectType: 'Brand / Advertiser Campaign',
    budget: '₦500,000 – ₦2,000,000',
    timeline: 'Multi-Platform Swarm',
    teamSize: 'Immediate (within 24 hours)',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const updateField = (field: keyof ContactInquiryInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await submitContactInquiryAction(formData);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        setFormData({
          fullName: '',
          email: '',
          company: '',
          projectType: 'Brand / Advertiser Campaign',
          budget: '₦500,000 – ₦2,000,000',
          timeline: 'Multi-Platform Swarm',
          teamSize: 'Immediate (within 24 hours)',
          message: '',
        });
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full py-12 sm:py-16 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide uppercase mb-3">
            <span>Direct Inquiry</span>
          </div>
          <h2 className="text-slate-900 dark:text-white text-3xl font-extrabold font-display tracking-tight sm:text-4xl md:text-5xl">
            Send Us a Message
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-4 text-base sm:text-lg leading-relaxed">
            Whether you are a brand looking to launch a verified CPM campaign or a creator with inquiries, drop us a line below.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          {/* Left Form (3 Columns) */}
          <div className="lg:col-span-3">
            {statusMessage && (
              <div
                className={`mb-8 p-5 rounded-2xl border flex items-start gap-3.5 text-sm ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <IoCheckmarkCircle className="size-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <IoAlertCircle className="size-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                )}
                <div>
                  <strong className="font-bold block mb-0.5">
                    {statusMessage.type === 'success' ? 'Inquiry Dispatched' : 'Submission Note'}
                  </strong>
                  <span>{statusMessage.text}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <IoPerson className="text-slate-400 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                    <input
                      id="fullName"
                      required
                      placeholder="Chioma Adebayo"
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      className="w-full bg-slate-100/90 dark:bg-[#121624] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 py-3.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <IoMail className="text-slate-400 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="chioma@company.com"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full bg-slate-100/90 dark:bg-[#121624] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 py-3.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all"
                    />
                  </div>
                </div>

                {/* Company or Creator Handle */}
                <div className="space-y-1.5">
                  <label htmlFor="company" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Brand Name or Social Handle
                  </label>
                  <div className="relative">
                    <IoBusiness className="text-slate-400 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                    <input
                      id="company"
                      placeholder="Payflex Ltd or @chioma_posts"
                      value={formData.company}
                      onChange={(e) => updateField('company', e.target.value)}
                      className="w-full bg-slate-100/90 dark:bg-[#121624] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 py-3.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all"
                    />
                  </div>
                </div>

                {/* Inquiry Type */}
                <div className="space-y-1.5">
                  <label htmlFor="projectType" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Inquiry Category
                  </label>
                  <div className="relative">
                    <IoMegaphone className="text-slate-400 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="projectType"
                      value={formData.projectType}
                      onChange={(e) => updateField('projectType', e.target.value)}
                      className="w-full bg-slate-100/90 dark:bg-[#121624] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 py-3.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
                    >
                      <option value="Brand / Advertiser Campaign">Brand / Advertiser Campaign</option>
                      <option value="Creator Verification & Payouts">Creator Verification & Payouts</option>
                      <option value="High-Volume / ₦5M+ Custom Drop">High-Volume / ₦5M+ Custom Drop</option>
                      <option value="Partnership & Press">Partnership & Press</option>
                      <option value="General Support">General Support</option>
                    </select>
                  </div>
                </div>

                {/* Budget Range */}
                <div className="space-y-1.5">
                  <label htmlFor="budget" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Campaign Budget (if applicable)
                  </label>
                  <div className="relative">
                    <IoWallet className="text-slate-400 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="budget"
                      value={formData.budget}
                      onChange={(e) => updateField('budget', e.target.value)}
                      className="w-full bg-slate-100/90 dark:bg-[#121624] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 py-3.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
                    >
                      <option value="Under ₦500,000">Under ₦500,000</option>
                      <option value="₦500,000 – ₦2,000,000">₦500,000 – ₦2,000,000</option>
                      <option value="₦2,000,000 – ₦5,000,000">₦2,000,000 – ₦5,000,000</option>
                      <option value="₦5,000,000+ (Institutional)">₦5,000,000+ (Institutional / Enterprise)</option>
                      <option value="N/A (Creator / General)">N/A (Creator / General)</option>
                    </select>
                  </div>
                </div>

                {/* Target Channel Focus */}
                <div className="space-y-1.5">
                  <label htmlFor="timeline" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Platform Channel Focus
                  </label>
                  <select
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => updateField('timeline', e.target.value)}
                    className="w-full bg-slate-100/90 dark:bg-[#121624] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 py-3.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
                  >
                    <option value="Multi-Platform Swarm">Multi-Platform Swarm (All Channels)</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram Reels">Instagram Reels</option>
                    <option value="YouTube Shorts">YouTube Shorts</option>
                    <option value="X (Twitter)">X (Twitter)</option>
                    <option value="Facebook & LinkedIn">Facebook & LinkedIn</option>
                    <option value="N/A (General Inquiry)">N/A (General Inquiry)</option>
                  </select>
                </div>

                {/* Urgency / Timeframe */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="teamSize" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Urgency / Timeframe
                  </label>
                  <div className="relative">
                    <IoTime className="text-slate-400 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="teamSize"
                      value={formData.teamSize}
                      onChange={(e) => updateField('teamSize', e.target.value)}
                      className="w-full bg-slate-100/90 dark:bg-[#121624] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 py-3.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
                    >
                      <option value="Immediate (within 24 hours)">Immediate (within 24 hours)</option>
                      <option value="This week">This week</option>
                      <option value="Planning phase / Next month">Planning phase / Next month</option>
                      <option value="General question">General question</option>
                    </select>
                  </div>
                </div>

                {/* Message Details */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Message Details <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    placeholder="Tell us about your brand goals, campaign requirements, or creator questions..."
                    value={formData.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    className="w-full bg-slate-100/90 dark:bg-[#121624] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 p-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-32 resize-none shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 rounded-xl bg-[#2F49E8] hover:bg-blue-600 disabled:opacity-60 text-white font-bold text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),inset_0_-1px_0_0_rgba(0,0,0,0.2)] transition-all flex items-center gap-2 group"
              >
                <span>{isSubmitting ? 'Sending Message...' : 'Submit Inquiry'}</span>
                <IoArrowForward className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* Right Sticky Sidebar (2 Columns) */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 space-y-6">
              {/* Card 1 */}
              <div className="bg-white dark:bg-[#0B0D14] rounded-3xl border border-slate-200/80 dark:border-white/10 p-7 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)]">
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-4">
                  Why partner with Kpugi?
                </h3>
                <ul className="space-y-4">
                  {[
                    '100% Escrow Protection',
                    'Automated public view verification',
                    'Zero follower gates for creators',
                    'Guaranteed Friday direct bank payouts',
                  ].map((item, index) => (
                    <li key={index} className="text-slate-600 dark:text-slate-400 text-sm flex items-start gap-3">
                      <span className="bg-[#2F49E8] mt-2 h-2 w-2 shrink-0 rounded-full" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card 2 */}
              <div className="bg-[#2F49E8] text-white rounded-3xl p-7 relative overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),inset_0_-1px_0_0_rgba(0,0,0,0.3)] shadow-xl">
                <div className="bg-white/10 absolute -top-8 -right-8 h-32 w-32 rounded-full blur-xl pointer-events-none" />
                <div className="bg-white/10 absolute -bottom-8 -left-8 h-24 w-24 rounded-full blur-xl pointer-events-none" />
                
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                  Response SLA
                </h4>
                <p className="text-3xl font-extrabold font-display">Under 2 hours</p>
                <p className="mt-3 text-xs sm:text-sm text-white/85 leading-relaxed">
                  Our team reviews every inquiry personally. 24/7 automated telemetry actively monitors campaign escrow and view verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
