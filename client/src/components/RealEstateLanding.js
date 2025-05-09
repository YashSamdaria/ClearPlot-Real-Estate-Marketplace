import React from "react";
import { motion } from "framer-motion";
import { Home, Filter, UserCheck, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Feature data
const features = [
  {
    icon: <Home className="w-8 h-8 text-amber-400" />,
    title: "Verified Listings",
    description: "Every property is rigorously vetted for authenticity and quality.",
  },
  {
    icon: <Filter className="w-8 h-8 text-amber-400" />,
    title: "Smart Filters",
    description: "Instantly find properties by price, location, size, and amenities.",
  },
  {
    icon: <UserCheck className="w-8 h-8 text-amber-400" />,
    title: "Trusted Agents",
    description: "Connect with top-rated, vetted real estate professionals.",
  },
];

// Testimonials data
const testimonials = [
  {
    name: "Sarah M.",
    role: "First-Time Buyer",
    quote: "Found my dream home in days! The verified listings gave me peace of mind.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    name: "James R.",
    role: "Property Investor",
    quote: "The smart filters saved me hours. Best platform for serious buyers.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
  },
];

export default function RealEstateLanding() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900 text-white font-sans">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
        }}
      >
        <div className="text-center px-6 max-w-5xl mx-auto">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight"
          >
            Discover Your <span className="text-amber-400">Perfect Home</span>
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 text-lg md:text-xl text-gray-300"
          >
            Explore verified properties, connect with trusted agents, and move faster.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/properties")}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 rounded-full font-semibold text-lg"
            >
              Browse Listings
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/post-property")}
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-full font-semibold text-lg"
            >
              List Your Property
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold text-center text-amber-400"
          >
            Why Choose Us?
          </motion.h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)] transition duration-300"
              >
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-amber-400">{item.title}</h3>
                <p className="mt-2 text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold text-center text-amber-400"
          >
            What Our Users Say
          </motion.h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-white">{item.name}</h4>
                    <p className="text-sm text-gray-400">{item.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{item.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center px-6 py-20 bg-gradient-to-b from-gray-800 to-gray-900"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Ready to Find Your Dream Home?
        </h2>
        <p className="mt-4 text-lg text-gray-300">
          Join thousands of happy homeowners. Start your journey today.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/signup")}
          className="mt-8 px-8 py-4 bg-amber-500 hover:bg-amber-600 rounded-full font-semibold text-lg"
        >
          Get Started Now
        </motion.button>
      </motion.section>
    </div>
  );
}