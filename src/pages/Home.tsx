import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Play, Quote } from 'lucide-react';

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

// --- MOBILE HOME (NEW HUB UI) ---
const HomeMobile = () => {
  return (
    <div className="bg-[#fcfbf9] min-h-screen font-sans text-zinc-900 pb-20 overflow-x-hidden">
      
      {/* 1. Full Screen Video Hero */}
      <section className="relative h-screen w-full overflow-hidden">
         <div className="absolute inset-0">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-90">
                <source src="/mobile_video.mp4" type="video/mp4" />
            </video>
         </div>
         <div className="absolute inset-0 bg-gradient-to-t from-[#fcfbf9] via-transparent to-transparent" />
         
         <div className="absolute bottom-32 left-0 w-full px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
               <span className="inline-block px-3 py-1 bg-[#d4af37] text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 shadow-lg">5 Star Luxury</span>
               <h1 className="text-6xl font-serif font-bold leading-none mb-2 text-white drop-shadow-lg">Hotel <br/> <span className="text-[#d4af37]">Sunrise</span></h1>
               <p className="text-black/90 text-lg font-light mb-8 max-w-xs drop-shadow-md">Experience the antigravity of luxury in the heart of Orai.</p>
               
               <Link to="/booking" className="flex items-center justify-between bg-white text-black px-8 py-5 rounded-[2rem] font-bold w-full active:scale-95 transition-transform group shadow-xl">
                  Book Your Stay <span className="bg-black text-white rounded-full p-2 group-hover:rotate-45 transition-transform"><ArrowRight size={16} /></span>
               </Link>
            </motion.div>
         </div>
      </section>

      {/* 2. The Hub (Navigation) */}
      <section className="px-4 py-12 relative z-10 -mt-10 rounded-t-[2.5rem] bg-[#fcfbf9] border-t border-zinc-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
         <h2 className="text-3xl font-serif font-bold mb-8 pl-2 text-zinc-900">Discover</h2>
         
         <div className="grid grid-cols-1 gap-4">
             {/* Rooms Card */}
             <Link to="/rooms" className="h-64 rounded-[2.5rem] relative overflow-hidden group shadow-lg">
                <img src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=3540" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Rooms" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                <div className="absolute bottom-6 left-6 text-white">
                    <span className="text-xs font-bold text-[#d4af37] uppercase tracking-widest">Accommodations</span>
                    <h3 className="text-3xl font-serif font-bold mt-1">Suites & Rooms</h3>
                </div>
                 <div className="absolute top-6 right-6 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40">
                    <ArrowRight size={18} className="text-white -rotate-45" />
                 </div>
             </Link>

             <div className="grid grid-cols-2 gap-4">
                 {/* Dining Card */}
                 <Link to="/dining" className="h-56 rounded-[2.5rem] relative overflow-hidden group col-span-1 shadow-lg">
                    <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=3540" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Dining" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-5 left-5 text-white">
                       <h3 className="text-xl font-serif font-bold">Dining</h3>
                    </div>
                 </Link>

                 {/* Events Card */}
                 <Link to="/events" className="h-56 rounded-[2.5rem] relative overflow-hidden group col-span-1 border border-zinc-100 bg-white shadow-lg">
                    <img src="https://images.unsplash.com/photo-1647249893022-9287c83b8cc3?q=80&w=803&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Events" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-5 left-5 text-white">
                       <h3 className="text-xl font-serif font-bold">Events</h3>
                    </div>
                 </Link>
             </div>

             {/* Profile / Contact Row */}
             <div className="grid grid-cols-2 gap-4">
                 <Link to="/profile" className="h-40 rounded-[2.5rem] bg-white border border-zinc-200 flex flex-col justify-center items-center gap-3 active:scale-95 transition-transform shadow-sm hover:shadow-md">
                     <div className="w-12 h-12 rounded-full bg-[#d4af37] text-white flex items-center justify-center font-bold text-xl shadow-md">
                        <Quote size={20} className="stroke-[3]" />
                     </div>
                     <span className="font-bold text-sm tracking-wide text-zinc-900">My Profile</span>
                 </Link>
                 <Link to="/contact" className="h-40 rounded-[2.5rem] bg-white border border-zinc-200 flex flex-col justify-center items-center gap-3 active:scale-95 transition-transform shadow-sm hover:shadow-md">
                     <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xl shadow-md">
                        <MapPin size={20} className="stroke-[3]" />
                     </div>
                     <span className="font-bold text-sm tracking-wide text-zinc-900">Contact Us</span>
                 </Link>
             </div>
         </div>
      </section>

      {/* 3. Signature Services (Horizontal Scroll) */}
      <section className="px-4 pb-24">
         <div className="flex items-center justify-between px-2 mb-6">
            <h3 className="text-2xl font-serif font-bold text-zinc-900">Signatures</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">Explore All</span>
         </div>

         <div className="flex gap-4 overflow-x-auto pb-8 -mx-4 px-4 snap-x hide-scrollbar">
            {[
               { title: "Wellness and Leisure", img: "https://images.unsplash.com/photo-1672983665896-e02f28d14173?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", tag: "Wellness" },
               { title: "Private Dining", img: "https://i.pinimg.com/736x/d6/c7/17/d6c7179ec1376c07b5dc143ea3a3965f.jpg", tag: "Culinary" },
               { title: "Chauffeur", img: "https://i.pinimg.com/736x/68/b9/c2/68b9c2fe5a114be8de36d53873d39041.jpg", tag: "Transport" }
            ].map((item, i) => (
               <div key={i} className="min-w-[280px] h-[320px] rounded-[2.5rem] relative overflow-hidden flex-shrink-0 snap-center group shadow-xl border border-zinc-100">
                  <img src={item.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-0 left-0 p-8">
                     <span className="inline-block px-3 py-1 bg-[#d4af37]/20 backdrop-blur-md border border-[#d4af37]/30 text-[#d4af37] rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">{item.tag}</span>
                     <h4 className="text-2xl font-serif font-bold text-white">{item.title}</h4>
                  </div>
               </div>
            ))}
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