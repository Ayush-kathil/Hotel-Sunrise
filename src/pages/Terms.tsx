import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto pt-32 pb-20 px-6 font-sans">
      <h1 className="text-4xl font-serif mb-8 text-black">Terms & Conditions</h1>
      
      <div className="space-y-8 text-zinc-600">
        <section>
          <h2 className="text-xl font-bold text-black mb-2">1. Booking Policy</h2>
          <p>All reservations must be guaranteed with a valid credit card. Cancellations made within 48 hours of arrival will be charged one night's room and tax.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black mb-2">2. Check-in / Check-out</h2>
          <p>Check-in time is 2:00 PM. Check-out time is 11:00 AM. Late check-outs are subject to availability and may incur extra charges.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black mb-2">3. Guest Conduct</h2>
          <p>Hotel Sunrise reserves the right to refuse service to anyone for any reason. We maintain a strict no-party policy to ensure the comfort of all guests.</p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-zinc-200">
        <Link to="/" className="text-black font-bold hover:text-[#d4af37]">← Back to Home</Link>
      </div>
    </div>
  );
};

export default Terms;