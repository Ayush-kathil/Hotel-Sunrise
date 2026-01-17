import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Wifi, Maximize, User } from 'lucide-react';

const roomsList = [
  {
    id: 1,
    name: "Deluxe Suite",
    price: 3500,
    img: "https://images.oyoroomscdn.com/uploads/hotel_image/76246/large/89f37ad358dbcbae.jpg",
    desc: "A perfect blend of classical aesthetics and modern comfort with city views.",
    features: ["King Bed", "City View", "400 sq.ft"]
  },
  {
    id: 2,
    name: "Executive Chamber",
    price: 5000,
    img: "https://pix10.agoda.net/hotelImages/63352078/0/7b3c8606fa27f48c23c1272101fa48f5.jpg",
    desc: "Spacious luxury designed for the business traveler with ergonomic workspaces.",
    features: ["Work Desk", "Lounge Access", "550 sq.ft"]
  },
  {
    id: 3,
    name: "Royal Penthouse",
    price: 12000,
    img: "https://pix10.agoda.net/hotelImages/9783986/-1/f55289f71f2516c852dc46d5893e4cd7.jpg",
    desc: "The jewel of Hotel Sunrise. Panoramic terrace, butler service, and jacuzzi.",
    features: ["Private Terrace", "Butler", "1200 sq.ft"]
  },
  {
    id: 4,
    name: "Family Studio",
    price: 7500,
    img: "https://pix6.agoda.net/hotelImages/9783986/-1/518a8ada6d4cfa02df735dbf6d12188d.jpg",
    desc: "Two king beds and a kitchenette, perfect for family vacations.",
    features: ["2 King Beds", "Kitchenette", "800 sq.ft"]
  }
];

const Rooms = () => {
  return (
    <div className="pt-32 px-6 md:px-12 max-w-7xl mx-auto pb-20">
      
      {/* Header with Parallax Fade */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-24"
      >
        <span className="text-yellow-600 font-bold tracking-[0.2em] uppercase text-xs">The Collection</span>
        <h1 className="text-5xl md:text-8xl font-serif mb-6 mt-4 text-black">Accommodations</h1>
        <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-light">
          Curated sanctuaries designed for peace, privacy, and perfection.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-32">
        {roomsList.map((room, index) => (
          <RoomCard key={room.id} room={room} index={index} />
        ))}
      </div>
    </div>
  );
};

// Extracted Card Component for clean animation logic
const RoomCard = ({ room, index }: { room: any, index: number }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });
  
  // Apple Style: Scale from 0.9 to 1, Fade in
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  // Alternate layout (Left/Right)
  const isEven = index % 2 === 0;

  return (
    <motion.div 
      ref={ref}
      style={{ scale, opacity }}
      className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center`}
    >
      {/* Image Side */}
      <div className="flex-1 w-full relative group cursor-pointer overflow-hidden rounded-[2rem] shadow-2xl">
        <Link to="/booking">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-700 z-10" />
          <img 
            src={room.img} 
            className="w-full h-[500px] object-cover transition-transform duration-[1.5s] group-hover:scale-110" 
            alt={room.name}
          />
          <div className="absolute bottom-8 left-8 z-20 bg-white/90 backdrop-blur px-6 py-2 rounded-full flex items-center gap-2">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold tracking-widest">PREMIUM STAY</span>
          </div>
        </Link>
      </div>

      {/* Text Side */}
      <div className="flex-1 space-y-6">
        <h3 className="text-4xl font-serif text-black">{room.name}</h3>
        <p className="text-zinc-500 text-lg leading-relaxed">{room.desc}</p>
        
        {/* Features Icons */}
        <div className="flex gap-6 border-y border-zinc-100 py-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <User size={16} /> {room.features[0]}
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Maximize size={16} /> {room.features[2]}
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Wifi size={16} /> Free Wifi
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div>
            <span className="text-3xl font-bold text-black">₹{room.price}</span>
            <span className="text-xs text-zinc-400 ml-2 font-bold tracking-widest">/ NIGHT</span>
          </div>
          <Link to="/booking" className="bg-black text-white px-8 py-4 rounded-full text-xs font-bold hover:bg-[#d4af37] hover:text-white transition-all tracking-widest flex items-center gap-2">
            BOOK THIS ROOM <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Rooms;