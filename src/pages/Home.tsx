import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Play, Quote } from 'lucide-react';

// --- FIXED FADEIN COMPONENT ---
// Now correctly applies the className so your layout works!
const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }} // Adjusted margin for smoother trigger
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

const Home = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // --- ARRIVAL IMAGE LOGIC ---
  const imageRef = useRef(null);
  const { scrollYProgress: imgProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "center center"]
  });
  const imgScale = useTransform(imgProgress, [0, 1], [0.85, 1]);
  const imgRadius = useTransform(imgProgress, [0, 1], ["60px", "0px"]);

  // --- VIDEO LOGIC ---
  const videoContainerRef = useRef(null);
  const { scrollYProgress: vidProgress } = useScroll({
    target: videoContainerRef,
    offset: ["start end", "end end"]
  });
  const vidScale = useTransform(vidProgress, [0.2, 0.8], [0.7, 1]);
  const vidOpacity = useTransform(vidProgress, [0, 0.2], [0, 1]);

  return (
    <div className="w-full bg-white text-zinc-900 font-sans selection:bg-black selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section ref={ref} className="h-screen flex flex-col justify-center items-center relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="text-center z-10 relative px-4"
        >
          <h1 className="text-6xl md:text-[9rem] font-serif leading-none tracking-tighter mb-6 text-black">
            <span className="block">HOTEL</span>
            <span className="block text-[#d4af37] drop-shadow-lg">SUNRISE</span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.8 }}
            className="text-zinc-500 uppercase tracking-[0.4em] text-xs md:text-sm font-bold"
          >
            The Antigravity of Luxury
          </motion.p>
        </motion.div>

        {/* Floating Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 15, 0] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-12 text-zinc-400 text-[10px] tracking-widest uppercase flex flex-col items-center gap-2"
        >
          Scroll to Explore
          <div className="w-[1px] h-8 bg-zinc-300"></div>
        </motion.div>
      </section>

      {/* 2. THE ARRIVAL */}
      <section ref={imageRef} className="py-32 relative">
        <FadeIn>
          <div className="text-center mb-20 px-6 max-w-4xl mx-auto">
            <h2 className="text-5xl font-serif mb-6 text-black">The Arrival</h2>
            <p className="text-zinc-600 text-xl leading-relaxed font-light">
              Step into a sanctuary where time stands still. Hotel Sunrise blends classical Indian 
              heritage with weightless modern elegance.
            </p>
          </div>
        </FadeIn>

        <div className="h-[80vh] w-full flex justify-center items-center px-4 md:px-0">
          <motion.div 
            style={{ scale: imgScale, borderRadius: imgRadius }}
            className="w-full h-full overflow-hidden shadow-2xl relative"
          >
            <img 
              src="https://pix6.agoda.net/hotelImages/9783986/-1/518a8ada6d4cfa02df735dbf6d12188d.jpg" 
              className="w-full h-full object-cover"
              alt="Grand Lobby"
            />
          </motion.div>
        </div>
      </section>

      {/* 3. VIDEO SECTION */}
      <section ref={videoContainerRef} className="h-[200vh] relative bg-zinc-50">
        <div className="sticky top-0 h-screen flex flex-col justify-center items-center overflow-hidden">
          <motion.div 
            style={{ scale: vidScale, opacity: vidOpacity }}
            className="w-full h-full relative shadow-2xl"
          >
            {/* MAKE SURE TO ADD YOUR VIDEO FILE IN src/assets/video-main.mp4 */}
            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
              {/* Fallback to image if video missing */}
              <source src="https://assets.mixkit.co/videos/preview/mixkit-hotel-lobby-with-luxury-furniture-4182-large.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/30">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md mb-8 border border-white/20">
                  <Play size={16} className="text-white fill-white" />
                  <span className="text-xs uppercase tracking-widest text-white font-bold">Cinematic Tour</span>
                </div>
                <h2 className="text-6xl md:text-8xl font-serif text-white mb-4 drop-shadow-xl">A Day in the Life</h2>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. LEGACY & MANAGEMENT */}
      <section className="py-40 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-24 mb-32 items-center">
            
            {/* Left Side: Legacy Text */}
            <div className="flex-1">
              <FadeIn>
                <span className="text-yellow-600 text-xs tracking-[0.2em] uppercase font-bold pl-1">The Legacy</span>
                <h2 className="text-6xl font-serif text-black mt-8 mb-10 leading-[1.1]">Guided by <br/>Visionaries</h2>
                <p className="text-zinc-600 text-xl leading-relaxed mb-10 font-light">
                  Founded on the ancient principles of "Atithi Devo Bhava", we bring world-class luxury to the heart of Orai.
                </p>
                <div className="flex gap-6 items-center">
                  <div className="h-16 w-1 bg-black"></div>
                  <p className="text-zinc-400 italic text-lg">"We don't build hotels.<br/>We curate memories."</p>
                </div>
              </FadeIn>
            </div>
            
            {/* Right Side: Director Card */}
            <div className="flex-1 w-full">
              <FadeIn delay={0.2} className="w-full">
                <div className="relative bg-zinc-50 p-12 rounded-2xl border border-zinc-100 hover:shadow-2xl transition-all duration-500">
                  <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80" className="w-28 h-28 rounded-full border-4 border-white mb-8 object-cover shadow-lg" alt="Director" />
                  <Quote className="text-yellow-500 mb-6 w-8 h-8" />
                  <p className="text-zinc-800 mb-8 text-2xl font-serif italic">"Our mission is simple: To bring world-class luxury to Orai without losing the warmth of Indian hospitality."</p>
                  <div>
                    <h4 className="text-black font-serif text-xl font-bold">Rajesh Verma</h4>
                    <span className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Founder & Director</span>
                  </div>
                </div>
              </FadeIn>
            </div>

          </div>
        </div>
      </section>

      {/* 5. MAP SECTION */}
      <section className="h-[600px] relative w-full bg-zinc-100 border-t border-zinc-200">
        <iframe 
          src="https://maps.google.com/maps?q=Orai%20Uttar%20Pradesh&t=&z=13&ie=UTF8&iwloc=&output=embed"
          className="w-full h-full absolute inset-0 filter grayscale opacity-60 hover:opacity-100 transition-opacity duration-700"
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy"
          title="Map"
        ></iframe>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="bg-white/95 backdrop-blur-xl p-12 rounded-[2rem] shadow-2xl border border-white max-w-md text-center"
          >
            <MapPin className="w-12 h-12 text-black mx-auto mb-6" />
            <h2 className="text-4xl font-serif text-black mb-4">Find Us</h2>
            <p className="text-zinc-500 mb-8 text-lg">Near Kalpi Stand, Orai, Uttar Pradesh</p>
            <a 
              href="https://maps.google.com/maps?q=Orai%20Uttar%20Pradesh" 
              target="_blank" 
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-[#d4af37] hover:text-white transition-all tracking-widest"
            >
              GET DIRECTIONS <ArrowRight size={14} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white text-zinc-900 py-24 px-6 text-center border-t border-zinc-100">
        <h2 className="text-4xl font-serif mb-10 text-[#d4af37]">SUNRISE</h2>
        <div className="flex justify-center gap-10 text-sm text-zinc-500 mb-16 uppercase tracking-widest font-bold">
          <Link to="/rooms" className="hover:text-black transition-colors hover:underline underline-offset-8">Rooms</Link>
          <Link to="/contact" className="hover:text-black transition-colors hover:underline underline-offset-8">Support</Link>
          <Link to="/login" className="hover:text-black transition-colors hover:underline underline-offset-8">Login</Link>
        </div>
        <p className="text-zinc-300 text-xs font-medium">© 2026 Hotel Sunrise. Classical Luxury.</p>
        <Link to="/terms" className="hover:text-black transition-colors text-xs text-zinc-300 mt-2 block">Terms</Link>
      </footer>
    </div>
  );
};

export default Home;