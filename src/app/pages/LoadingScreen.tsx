import { motion } from "motion/react";
import { Bike, MapPin, Package, TrendingUp } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 flex items-center justify-center overflow-hidden relative">
      {/* Animated background orbs */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Main content */}
      <div className="relative z-10 text-center px-8">
        {/* Logo animation */}
        <motion.div
          className="mb-8 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="relative"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Bike className="w-16 h-16 text-white" />
          </motion.div>
        </motion.div>

        {/* App name */}
        <motion.h1
          className="text-6xl font-bold text-white mb-4 tracking-tight"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          PathMatch
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xl text-white/90 mb-12 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Connecting cyclists with customers for sustainable delivery
        </motion.p>

        {/* Animated icons */}
        <div className="flex items-center justify-center gap-8 mb-12">
          {[
            { Icon: MapPin, delay: 0 },
            { Icon: Package, delay: 0.2 },
            { Icon: TrendingUp, delay: 0.4 },
          ].map(({ Icon, delay }, index) => (
            <motion.div
              key={index}
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + delay }}
            >
              <Icon className="w-8 h-8 text-white" />
            </motion.div>
          ))}
        </div>

        {/* Loading bar */}
        <div className="max-w-md mx-auto">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <motion.p
            className="text-white/80 mt-4 text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading your experience...
          </motion.p>
        </div>

        {/* Feature highlights */}
        <motion.div
          className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {[
            { label: "Smart Route Matching", value: "AI-Powered" },
            { label: "30-40% Cheaper", value: "Save More" },
            { label: "Carbon Neutral", value: "Eco-Friendly" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
            >
              <div className="text-2xl font-bold text-white mb-1">
                {feature.value}
              </div>
              <div className="text-sm text-white/70">{feature.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
