import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Play, Quote, Star } from 'lucide-react';

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

const Home = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
     const handleResize = () => setIsMobile(window.innerWidth < 768);
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <HomeMobile /> : <HomeDesktop />;
};

// --- MOBILE HOME (NEW) ---
const HomeMobile = () => {
  return (
    <div className="bg-[#fcfbf9] min-h-screen font-sans text-zinc-900 pb-20">
      
      {/* 1. Full Screen Mobile Hero */}
      <section className="relative h-[85vh] w-full overflow-hidden rounded-b-[3rem] shadow-2xl">
         <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=3540&auto=format&fit=crop" className="w-full h-full object-cover" alt="Luxury Hotel" />
         </div>
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
         
         <div className="absolute bottom-0 left-0 w-full p-8 pb-12 text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
               <span className="inline-block px-3 py-1 bg-[#d4af37] text-black text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">5 Star Luxury</span>
               <h1 className="text-5xl font-serif font-bold leading-none mb-2">Hotel <br/> Sunrise</h1>
               <p className="text-white/80 text-lg font-light mb-6">The Antigravity of Luxury</p>
               
               <Link to="/booking" className="flex items-center gap-3 bg-white text-black px-6 py-4 rounded-full font-bold w-full justify-center active:scale-95 transition-transform">
                  Book Your Stay <ArrowRight size={18} />
               </Link>
            </motion.div>
         </div>
      </section>

      {/* 2. Quick Access Cards */}
      <section className="py-10 px-6">
         <h2 className="text-2xl font-serif font-bold mb-6">Explore</h2>
         <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden -mx-6 px-6 snap-x">
             {[
               { title: "Rooms", img: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=3540", link: "/rooms" },
               { title: "Dining", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=3540", link: "/dining" },
               { title: "Events", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=3540", link: "/events" },
             ].map((item, i) => (
                <Link key={i} to={item.link} className="snap-center shrink-0 w-64 h-80 rounded-[2rem] overflow-hidden relative shadow-lg group">
                   <img src={item.img} className="w-full h-full object-cover" alt={item.title} />
                   <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                   <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-2xl font-serif font-bold">{item.title}</h3>
                      <div className="w-8 h-1 bg-[#d4af37] mt-2" />
                   </div>
                </Link>
             ))}
         </div>
      </section>

      {/* 3. Featured Experience */}
      <section className="px-6 mb-12">
         <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-zinc-100">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">Must Try</span>
                  <h3 className="text-2xl font-serif font-bold mt-1">Royal Dining</h3>
               </div>
               <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                  <Star size={18} className="text-[#d4af37]" fill="#d4af37" />
               </div>
            </div>
            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">Experience our Michelin-starred chef's tasting menu on the rooftop terrace.</p>
            <Link to="/dining" className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
               View Menu <ArrowRight size={14} />
            </Link>
         </div>
      </section>

      {/* 4. Map / Location */}
      <section className="px-6 pb-12">
         <div className="h-48 rounded-[2rem] overflow-hidden relative shadow-lg">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.0123456789!2d79.4500!3d25.9900!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39987979264426b3%3A0xc3f8e815668b422!2sOrai%2C%20Uttar%20Pradesh" className="w-full h-full border-0 filter grayscale invert opacity-80" loading="lazy"></iframe>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <MapPin size={14} /> <span className="text-xs font-bold">Orai, UP</span>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
};


// --- DESKTOP HOME (EXISTING) ---
const HomeDesktop = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const imageRef = useRef(null);
  const { scrollYProgress: imgProgress } = useScroll({ target: imageRef, offset: ["start end", "center center"] });
  const imgScale = useTransform(imgProgress, [0, 1], [0.85, 1]);
  const imgRadius = useTransform(imgProgress, [0, 1], ["60px", "0px"]);

  const videoRef = useRef(null);
  const { scrollYProgress: videoScroll } = useScroll({ target: videoRef, offset: ["start start", "end end"] });
  const scale = useTransform(videoScroll, [0, 1], [0.7, 1]);
  const borderRadius = useTransform(videoScroll, [0, 1], ["60px", "0px"]);
  const textOpacity = useTransform(videoScroll, [0, 0.4], [1, 0]);

  return (
    <div ref={containerRef} className="w-full bg-white text-zinc-900 font-sans selection:bg-[#d4af37] selection:text-white">
      
      {/* 1. HERO */}
      <section className="h-screen flex flex-col justify-center items-center relative overflow-hidden bg-zinc-50">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
           <span className="text-[20vw] font-serif font-bold">LUXURY</span>
        </div>
        <motion.div style={{ y: yText }} className="text-center z-10 relative px-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
            <h1 className="text-6xl md:text-[9rem] font-serif leading-none tracking-tighter mb-6 text-black">
              <span className="block">HOTEL</span>
              <span className="block text-[#d4af37] drop-shadow-2xl">SUNRISE</span>
            </h1>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-zinc-500 uppercase tracking-[0.4em] text-xs md:text-sm font-bold">The Antigravity of Luxury</motion.p>
        </motion.div>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-12 text-zinc-400 text-[10px] tracking-widest uppercase flex flex-col items-center gap-2">
          Scroll to Explore <div className="w-[1px] h-12 bg-zinc-300"></div>
        </motion.div>
      </section>

      {/* 2. THE ARRIVAL */}
      <section ref={imageRef} className="py-32 relative z-10 bg-white rounded-t-[3rem] -mt-10 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
        <FadeIn>
          <div className="text-center mb-20 px-6 max-w-4xl mx-auto">
            <h2 className="text-5xl font-serif mb-6 text-black">The Arrival</h2>
            <p className="text-zinc-600 text-xl leading-relaxed font-light">Step into a sanctuary where time stands still. We blend classical Indian heritage with weightless modern elegance.</p>
          </div>
        </FadeIn>
        <div className="container mx-auto px-6">
          <motion.div style={{ scale: imgScale, borderRadius: imgRadius }} className="aspect-video w-full overflow-hidden shadow-2xl relative">
            <img src="https://images.unsplash.com/photo-1621293954908-907159247fc8?q=80&w=1470" className="w-full h-full object-cover" alt="Grand Lobby"/>
          </motion.div>
        </div>
      </section>

      {/* 3. VIDEO SCROLL */}
      <section ref={videoRef} className="h-[300vh] relative bg-zinc-50">
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
          <motion.div style={{ scale: scale, borderRadius: borderRadius }} className="w-full h-full relative z-0 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-4 border-white">
             <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                <source src="https://videos.pexels.com/video-files/7578552/7578552-uhd_2560_1440_30fps.mp4" type="video/mp4" />
             </video>
             <div className="absolute inset-0 bg-black/20" />
          </motion.div>
          <motion.div style={{ opacity: textOpacity }} className="absolute z-10 text-center text-white pointer-events-none mix-blend-difference">
             <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-8 border border-white/30"><Play className="ml-1 fill-white w-8 h-8" /></div>
             <h2 className="text-7xl font-serif mb-4 drop-shadow-lg">Cinematic Life</h2>
             <p className="text-lg text-white/90 uppercase tracking-widest font-bold">Experience the unseen</p>
          </motion.div>
        </div>
      </section>

      {/* 4. LEGACY */}
      <section className="py-40 px-6 bg-white relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-24 items-center">
            <div className="flex-1">
              <FadeIn>
                <span className="text-yellow-600 text-xs tracking-[0.2em] uppercase font-bold pl-1">The Legacy</span>
                <h2 className="text-6xl font-serif text-black mt-8 mb-10 leading-[1.1]">Guided by <br/>Visionaries</h2>
                <p className="text-zinc-600 text-xl leading-relaxed mb-10 font-light">Founded on the ancient principles of "Atithi Devo Bhava", we bring world-class luxury to the heart of Orai.</p>
              </FadeIn>
            </div>
            <div className="flex-1 w-full">
              <FadeIn delay={0.2} className="w-full">
                <div className="relative bg-zinc-50 p-12 rounded-[2rem] border border-zinc-100 hover:shadow-2xl transition-all duration-500">
                  <Quote className="text-yellow-500 mb-6 w-8 h-8" />
                  <p className="text-zinc-800 mb-8 text-2xl font-serif italic">"To bring world-class luxury to Orai without losing the warmth of Indian hospitality."</p>
                  <div>
                    <h4 className="text-black font-serif text-xl font-bold">Rajesh Verma</h4>
                    <span className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Founder & Director</span>
                  </div>
                </div>
              </FadeIn>
            </div>
        </div>
      </section>

      {/* 5. LOCATION */}
      <section className="h-[600px] relative w-full bg-zinc-100">
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.0123456789!2d79.4500!3d25.9900!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39987979264426b3%3A0xc3f8e815668b422!2sOrai%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" className="w-full h-full absolute inset-0 filter grayscale opacity-60 hover:opacity-100 transition-opacity duration-700" title="Map"></iframe>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-sm px-6">
          <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className="bg-white/95 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl text-center">
            <MapPin className="w-10 h-10 text-black mx-auto mb-4" />
            <h2 className="text-3xl font-serif text-black mb-2">Find Us</h2>
            <p className="text-zinc-500 mb-6">Near Kalpi Stand, Orai</p>
            {/* FIX: Added type="button" */}
            <button type="button" className="w-full bg-black text-white py-3 rounded-full text-xs font-bold hover:bg-[#d4af37] transition-all tracking-widest uppercase flex items-center justify-center gap-2">
              Get Directions <ArrowRight size={12} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
       <footer className="bg-white text-zinc-900 py-20 px-6 text-center border-t border-zinc-100 relative z-10">
       <h2 className="text-4xl font-serif mb-8 text-[#d4af37]">SUNRISE</h2>
       <div className="flex flex-wrap justify-center gap-8 text-xs text-zinc-500 mb-12 uppercase tracking-widest font-bold">
       <Link to="/rooms" className="hover:text-black transition-colors">Rooms</Link>
       <Link to="/dining" className="hover:text-black transition-colors">Dining</Link>
       <Link to="/events" className="hover:text-black transition-colors">Events</Link>
       <Link to="/contact" className="hover:text-black transition-colors">Contact</Link>
       <Link to="/terms" className="hover:text-[#d4af37] transition-colors">Terms & Conditions</Link>
       </div>
       <p className="text-zinc-300 text-[10px] font-medium">© 2026 Hotel Sunrise. All rights reserved.</p>
       </footer>
    </div>
  );
};

export default Home;