import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- COMPONENTS ---

// 1. Reveal Text Animation Wrapper
const RevealText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`overflow-hidden ${className}`}>
    <motion.div
      initial={{ y: "100%" }}
      whileInView={{ y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  </div>
);

// 2. Parallax Image Component
const ParallaxImage = ({ src, alt }: { src: string, alt: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);

  return (
    <div ref={ref} className="w-full h-full overflow-hidden rounded-[2.5rem] relative">
      <motion.img style={{ y, scale }} src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
};

const Rooms = () => {
  const navigate = useNavigate();

  const handleBookNow = (room: any) => {
    // Navigate to /booking and pass the room data in "state"
    navigate('/booking', { state: { room } });
  };

  const rooms = [
    {
      id: 1,
      name: "The Deluxe King",
      price: 4500,
      size: "350 sq.ft",
      desc: "Our signature room featuring a plush king-sized bed, city views, and a dedicated workspace.",
      amenities: ["King Bed", "City View", "Work Desk", "Rain Shower"],
      img: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop",
      video: "https://videos.pexels.com/video-files/7043813/7043813-hd_1080_1920_30fps.mp4"
    },
    {
      id: 2,
      name: "Garden Twin Room",
      price: 5200,
      size: "400 sq.ft",
      desc: "Ideal for friends or family, offering two queen beds and a private balcony overlooking our lush serenity gardens.",
      amenities: ["2 Queen Beds", "Garden Balcony", "Bathtub", "Lounge Area"],
      img: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2074&auto=format&fit=crop",
      video: "https://www.pexels.com/download/video/19403230/"
    },
    {
      id: 3,
      name: "Family Studio",
      price: 7000,
      size: "550 sq.ft",
      desc: "A spacious open-plan studio with a kitchenette and extra living space. Perfect for longer stays.",
      amenities: ["Kitchenette", "Dining Area", "2 Double Beds", "Smart Home Control"],
      img: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop",
      video: "https://videos.pexels.com/video-files/3770033/3770033-uhd_2560_1440_25fps.mp4"
    },
    {
      id: 4,
      name: "The Executive Suite",
      price: 8500,
      size: "650 sq.ft",
      desc: "Elevate your stay with a separate living area, premium mini-bar access, and exclusive entry to the Executive Lounge.",
      amenities: ["Separate Living Room", "Executive Lounge", "Walk-in Closet", "4K Smart TV"],
      img: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2074&auto=format&fit=crop",
      video: "https://videos.pexels.com/video-files/6981411/6981411-uhd_2560_1440_25fps.mp4"
    },
    {
      id: 5,
      name: "Royal Sunrise Suite",
      price: 15000,
      size: "1,200 sq.ft",
      desc: "The pinnacle of luxury. Panoramic corner views, a private dining room, and a marble bathroom with a jacuzzi.",
      amenities: ["Panoramic Views", "Private Dining", "Jacuzzi", "Butler Service"],
      img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop",
      video: "https://videos.pexels.com/video-files/4919537/4919537-uhd_2560_1440_25fps.mp4"
    }
  ];

  return (
    <div className="w-full bg-[#fcfbf9] text-zinc-900 font-sans selection:bg-[#d4af37] selection:text-white pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="h-[80vh] flex flex-col justify-center items-center relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-60">
           <ParallaxImage src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2070&auto=format&fit=crop" alt="Hero" />
        </div>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center px-4">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-[#d4af37] font-bold tracking-[0.2em] uppercase text-xs mb-6 block">Accommodation</motion.span>
          <RevealText>
             <h1 className="text-7xl md:text-9xl font-serif font-bold mb-6 tracking-tight">Sanctuary</h1>
          </RevealText>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="text-zinc-200 text-lg md:text-xl font-light tracking-wide max-w-lg mx-auto">Rest in a space designed for silence, comfort, and absolute peace.</motion.p>
        </div>
      </section>

      {/* 2. ROOM LIST */}
      <section className="py-32 px-6">
        <div className="container mx-auto space-y-40">
          {rooms.map((room, index) => (
            <div key={room.id} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center`}>
              <div className="w-full lg:w-1/2 aspect-[4/3]"><ParallaxImage src={room.img} alt={room.name} /></div>
              <div className="w-full lg:w-1/2 lg:px-10">
                <div className="flex items-baseline justify-between mb-8 border-b border-zinc-200 pb-4">
                  <span className="text-[#d4af37] text-xs font-bold uppercase tracking-[0.2em]">0{index + 1}</span>
                  <span className="text-2xl font-serif text-black">₹{room.price.toLocaleString()}</span>
                </div>
                <h3 className="text-5xl font-serif text-black mb-6 leading-none">{room.name}</h3>
                <p className="text-zinc-500 text-lg leading-relaxed mb-10 font-light">{room.desc}</p>
                
                {/* Amenities Grid */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-12">
                  {room.amenities.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-zinc-800 text-sm font-medium">
                      <Check size={14} className="text-[#d4af37]" />
                      {item}
                    </div>
                  ))}
                </div>

                {/* BOOK BUTTON */}
                <motion.button 
                  onClick={() => handleBookNow(room)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-black text-white rounded-full font-bold hover:bg-[#d4af37] transition-colors shadow-xl flex items-center gap-4 group"
                >
                  Book This Room <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#fcfbf9] text-zinc-900 py-24 px-6 text-center border-t border-zinc-200">
        <h2 className="text-4xl font-serif mb-8 text-[#d4af37]">SUNRISE</h2>
        <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest">© 2026 Hotel Sunrise.</p>
      </footer>
    </div>
  );
};

export default Rooms;