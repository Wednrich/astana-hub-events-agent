"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import Image from "next/image";

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [showSplash, setShowSplash] = useState(true);
  const [step, setStep] = useState(0);


  useEffect(() => {
    // Check if splash screen has already been shown in this session
    const hasShownSplash = sessionStorage.getItem("splashShown");
    if (hasShownSplash) {
      setShowSplash(false);
    } else {
      // Step timings
      const t1 = setTimeout(() => setStep(1), 1000);
      const t2 = setTimeout(() => setStep(2), 2000);
      
      // Set a timer to hide the splash screen after the animation sequence (e.g., 3.5 seconds)
      const t3 = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem("splashShown", "true");
      }, 3500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            {/* Background Glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.15 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 blur-[100px]"
            />

            {/* Logo Container */}
            <motion.div
  initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
  animate={{
    scale: [0.5, 1.15, 1],
    opacity: 1,
    rotate: 0,
  }}
  transition={{
    duration: 1.5,
    ease: "easeOut",
  }}
  className="relative z-10 mb-8"
>
  <Image
    src={
      isDark
        ? "/astana_hub_dark_logo.jpg"
        : "/astana_hub_light_logo.jpg"
    }
    alt="Astana Hub"
    width={160}
    height={160}
    priority
  />
</motion.div>

            {/* Text Elements */}
            <div className="relative z-10 flex flex-col items-center">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mb-2 text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400"
              >
                ASTANA HUB
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="mb-10 text-lg font-medium tracking-wide opacity-80"
                style={{ color: "var(--text-primary)" }}
              >
                AI Events Agent
              </motion.p>

              {/* Loading Steps */}
              <div className="relative flex h-6 w-full items-center justify-center">
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.span
                      key="step-0"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="absolute text-sm font-semibold text-gray-400"
                    >
                      Initializing AI Agent...
                    </motion.span>
                  )}
                  {step === 1 && (
                    <motion.span
                      key="step-1"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="absolute text-sm font-semibold text-gray-400"
                    >
                      Loading Events...
                    </motion.span>
                  )}
                  {step === 2 && (
                    <motion.span
                      key="step-2"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="absolute text-sm font-semibold text-gray-400"
                    >
                      Connecting Innovation...
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-6 h-1 w-64 overflow-hidden rounded-full bg-gray-200/20"
              >
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "easeInOut", delay: 0.8 }}
                  className="h-full bg-gradient-to-r from-blue-400 to-emerald-400"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Existing App Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.8 }}
        className="contents"
      >
        {children}
      </motion.div>
    </>
  );
}
