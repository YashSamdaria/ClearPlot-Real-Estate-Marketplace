import React from "react";
import { motion } from "framer-motion";
import { Home, Filter, UserCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const features = [
  {
    icon: <Home className="w-8 h-8 text-yellow-500" />,
    title: "Verified Listings",
    description: "All properties are manually verified to ensure trust and authenticity.",
  },
  {
    icon: <Filter className="w-8 h-8 text-yellow-500" />,
    title: "Advanced Filters",
    description: "Use smart filters to find homes by location, price, amenities, and more.",
  },
  {
    icon: <UserCheck className="w-8 h-8 text-yellow-500" />,
    title: "Trusted Agents",
    description: "Work with our handpicked professional agents to close faster.",
  },
];

export default function RealEstateLanding() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0b0c10] text-white min-h-screen font-sans overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative group flex items-center justify-center px-4 py-16 text-center overflow-hidden"
      >
        {/* Background Glow Effect */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.4)_0%,transparent_60%)] blur-2xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto transition duration-300 rounded-xl">
        
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">
            Find Your Dream Home
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Explore thousands of listings in top cities. Smart search. Verified agents. Beautiful homes.
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/properties")}
              className="px-6 py-3 rounded-md bg-yellow-600 hover:bg-yellow-700 text-white transition font-medium"
            >
              Browse Listings
            </motion.button>
            <Link
              to="/properties"
              className="px-6 py-3 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition font-medium"
            >
              Post Property
            </Link>
          </div>
        </div>
      </motion.header>


     {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, index) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.3 }}
            className="bg-[#1a1c22] rounded-xl p-6 shadow-lg hover:shadow-[0_0_25px_#ffd700] transition"
          >
            <div className="mb-4">{f.icon}</div>
            <h3 className="text-xl font-semibold text-yellow-400">{f.title}</h3>
            <p className="mt-2 text-sm text-gray-300">{f.description}</p>
          </motion.div>
        ))}
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="px-6 py-20 text-center bg-[#13151c] border-t border-slate-700"
      >
        <h2 className="text-3xl font-bold transition duration-300 hover:shadow-[0_0_30px_#ffd700]">
          Ready to make your move?
        </h2>
        <p className="mt-4 text-gray-300">
          Sign up today and get connected with trusted real estate professionals.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-md text-white transition font-medium"
        >
          Get Started
        </motion.button>
      </motion.section>

    </div>
  );
}