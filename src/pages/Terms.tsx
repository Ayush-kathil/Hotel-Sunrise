import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileText, CheckCircle } from 'lucide-react';

const Section = ({ title, children, delay }: { title: string, children: React.ReactNode, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="mb-12 border-b border-zinc-100 pb-8"
  >
    <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
      <CheckCircle size={18} className="text-[#d4af37]" /> {title}
    </h2>
    <div className="text-zinc-500 leading-relaxed space-y-4 text-sm">
      {children}
    </div>
  </motion.div>
);

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#fcfbf9] pt-32 pb-20 font-sans">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} 
            className="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <FileText size={32} />
          </motion.div>
          <h1 className="text-5xl font-serif font-bold mb-4">Terms & Conditions</h1>
          <p className="text-zinc-400">Last updated: January 2026</p>
        </div>

        {/* Content Card */}
        <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-xl shadow-zinc-200/50">
          <Section title="Booking & Reservations" delay={0.1}>
            <p>All bookings must be guaranteed by a valid credit card. A deposit of 50% is required for stays longer than 3 nights.</p>
            <p>Check-in time is from 14:00, and check-out time is until 11:00. Early check-in requests are subject to availability.</p>
          </Section>

          <Section title="Cancellation Policy" delay={0.2}>
            <p>Cancellations made 48 hours prior to arrival are free of charge. Cancellations made within 48 hours will incur a fee equivalent to the first night's stay.</p>
          </Section>

          <Section title="Guest Conduct" delay={0.3}>
            <p>Hotel Sunrise maintains a strict no-smoking policy in all rooms. A cleaning fee of ₹5,000 will be charged for violations.</p>
            <p>Quiet hours are observed from 10:00 PM to 7:00 AM to ensure a peaceful environment for all guests.</p>
          </Section>

          <Section title="Privacy & Data" delay={0.4}>
            <p>We respect your privacy. Your personal data is stored securely and is only used for booking and communication purposes. We do not sell data to third parties.</p>
          </Section>

          <div className="bg-zinc-50 p-6 rounded-2xl flex items-start gap-4 mt-8">
            <Shield className="text-green-500 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-sm mb-1">Secure Transaction Guarantee</h4>
              <p className="text-xs text-zinc-400">All payments processed through our website are encrypted with 256-bit SSL technology.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Terms;