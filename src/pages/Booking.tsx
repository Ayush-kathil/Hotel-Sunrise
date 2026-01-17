import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Users, Check } from 'lucide-react';

const Booking = () => {
  const [guests, setGuests] = useState(2);
  const [nights, setNights] = useState(1);
  const PRICE = 3500;
  const TAX = 500;
  const TOTAL = (PRICE * nights) + (guests * 200) + TAX;

  const handleRazorpay = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate Razorpay opening
    const options = {
      key: "rzp_test_12345678", // Fake key
      amount: TOTAL * 100,
      name: "Hotel Sunrise",
      description: "Room Booking",
      handler: function(response: any) {
        alert("Payment Successful! Booking ID: " + response.razorpay_payment_id);
      }
    };
    alert(`Opening Razorpay Checkout for ₹${TOTAL}...\n(This is a simulation)`);
  };
  const options = {
  key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Securely loads from .env
  amount: TOTAL * 100,
  // ... rest of code
};

  return (
    <div className="pt-32 pb-20 px-6 bg-zinc-50 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* LEFT: FORM */}
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-serif mb-8">Confirm Your Stay</h1>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
            <form onSubmit={handleRazorpay} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Check In</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-zinc-400" size={18} />
                    <input type="date" className="w-full pl-10 p-3 bg-zinc-50 rounded-lg outline-none focus:ring-2 focus:ring-gold" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Check Out</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-zinc-400" size={18} />
                    <input type="date" className="w-full pl-10 p-3 bg-zinc-50 rounded-lg outline-none focus:ring-2 focus:ring-gold" required />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 text-zinc-400" size={18} />
                  <select 
                    value={guests} 
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full pl-10 p-3 bg-zinc-50 rounded-lg outline-none focus:ring-2 focus:ring-gold appearance-none"
                  >
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Guests</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-100">
                <div className="flex justify-between mb-2 text-zinc-600"><span>Room Rate (x{nights})</span> <span>₹{PRICE * nights}</span></div>
                <div className="flex justify-between mb-2 text-zinc-600"><span>Guest Fees</span> <span>₹{guests * 200}</span></div>
                <div className="flex justify-between mb-4 text-zinc-600"><span>Taxes & Fees</span> <span>₹{TAX}</span></div>
                <div className="flex justify-between text-xl font-bold pt-4 border-t border-zinc-100">
                  <span>Total</span>
                  <span>₹{TOTAL}</span>
                </div>
              </div>

              <button className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gold hover:text-black transition-all shadow-xl shadow-gold/10 flex items-center justify-center gap-2">
                <CreditCard size={20} /> PAY NOW
              </button>
            </form>
          </div>
        </motion.div>

        {/* RIGHT: ROOM PREVIEW */}
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="sticky top-32">
            <img 
              src="https://images.oyoroomscdn.com/uploads/hotel_image/76246/large/89f37ad358dbcbae.jpg" 
              className="w-full h-80 object-cover rounded-2xl shadow-2xl mb-8" 
            />
            <h2 className="text-2xl font-serif mb-4">Deluxe Suite</h2>
            <p className="text-zinc-500 mb-6">Experience the pinnacle of luxury with panoramic views, dedicated butler service, and artisan interiors.</p>
            <div className="flex flex-wrap gap-3">
              {['Free Wifi', 'Breakfast Included', 'Free Cancellation'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                  <Check size={12} /> {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Booking;