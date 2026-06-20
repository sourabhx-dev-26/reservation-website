"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export default function WelcomeGate() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 4200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-hidden bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute left-0 top-0 z-10 flex h-full w-[calc(50%+8px)] items-center justify-center bg-[#050507]"
            initial={{ x: 0 }}
            animate={{ x: "-100%" }}
            transition={{
              delay: 2.8,
              duration: 1.2,
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            <div className="text-center">
              <motion.p
                className="mb-5 tracking-[0.45em] text-yellow-200/60"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.8 }}
              >
                WELCOME TO
              </motion.p>

              <motion.h1
                className="text-[22vw] font-black leading-none tracking-[-0.08em] text-[#d6b25e]"
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55, duration: 0.9 }}
              >
                DE
              </motion.h1>
            </div>
          </motion.div>

          <motion.div
            className="absolute right-0 top-0 z-10 flex h-full w-[calc(50%+8px)] items-center justify-center bg-[#050507]"
            initial={{ x: 0 }}
            animate={{ x: "100%" }}
            transition={{
              delay: 2.8,
              duration: 1.2,
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            <div className="text-center">
              <motion.p
                className="mb-5 tracking-[0.45em] text-yellow-200/60"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.8 }}
              >
                RESTAURANT
              </motion.p>

              <motion.h1
                className="text-[22vw] font-black leading-none tracking-[-0.08em] text-[#d6b25e]"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65, duration: 0.9 }}
              >
                MO
              </motion.h1>
            </div>
          </motion.div>

          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.08, 1, 0.85],
              rotate: [-8, 0, 0, 8],
            }}
            transition={{
              duration: 2.7,
              times: [0, 0.3, 0.75, 1],
              ease: "easeInOut",
            }}
          >
            <div className="pointer-events-none relative flex h-[430px] w-[430px] items-center justify-center overflow-hidden rounded-full opacity-80">
              <motion.img
                src="/assets/welcome-hands-final.png"
                alt="Welcome Namaste Hands"
                className="h-full w-full object-cover object-center opacity-70 drop-shadow-[0_0_90px_rgba(214,178,94,0.45)]"
                style={{
                  WebkitMaskImage:
                    "radial-gradient(circle, black 42%, rgba(0,0,0,0.85) 56%, transparent 74%)",
                  maskImage:
                    "radial-gradient(circle, black 42%, rgba(0,0,0,0.85) 56%, transparent 74%)",
                }}
                animate={{
                  y: [0, -10, 0],
                  scale: [1.02, 1.06, 1.02],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 text-xs tracking-[0.45em] text-yellow-100/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            LUXURY DINING EXPERIENCE
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}