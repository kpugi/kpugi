"use client";

import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import Image from "next/image";

export interface BrandItem {
  company_name: string;
  avatar_url?: string | null;
}

const BrandHoverExpand = ({
  brands,
}: {
  brands: BrandItem[];
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(
    Math.min(2, brands.length - 1)
  );

  if (brands.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={{ width: "100%", padding: "0 20px" }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "stretch",
          justifyContent: "center",
          gap: 8,
          height: 420,
        }}
      >
        {brands.map((brand, index) => {
          const isActive = activeIndex === index;
          const initial = brand.company_name.charAt(0).toUpperCase();
          // Generate a unique dark hue per brand for the fallback bg
          const hue = (index * 53 + 210) % 360;

          return (
            <motion.div
              key={index}
              style={{
                position: "relative",
                cursor: "pointer",
                overflow: "hidden",
                borderRadius: 20,
                flexShrink: 0,
                height: "100%",
              }}
              animate={{
                width: isActive ? "clamp(260px, 32%, 460px)" : "clamp(52px, 7%, 80px)",
              }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              onClick={() => setActiveIndex(index)}
              onHoverStart={() => setActiveIndex(index)}
            >
              {/* Background — avatar image or colored initial tile */}
              {brand.avatar_url ? (
                <Image
                  src={brand.avatar_url}
                  alt={brand.company_name}
                  fill
                  sizes="(max-width: 460px) 80px, 460px"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `hsl(${hue}, 40%, 18%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <motion.span
                    animate={{ fontSize: isActive ? "6rem" : "1.5rem" }}
                    transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    style={{
                      fontFamily: "'Clash Display', sans-serif",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.18)",
                      userSelect: "none",
                      lineHeight: 1,
                    }}
                  >
                    {initial}
                  </motion.span>
                </div>
              )}

              {/* Gradient overlay — always present, stronger when active */}
              <motion.div
                animate={{ opacity: isActive ? 1 : 0.3 }}
                transition={{ duration: 0.25 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 45%, transparent 100%)",
                  pointerEvents: "none",
                }}
              />

              {/* Blue accent top edge — visible when active */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ scaleX: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background:
                        "linear-gradient(90deg, #2F49E8, #5B7CFF)",
                      borderRadius: "20px 20px 0 0",
                      transformOrigin: "left",
                    }}
                  />
                )}
              </AnimatePresence>

              {/* INACTIVE — vertical brand name */}
              <AnimatePresence>
                {!isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      paddingBottom: 16,
                    }}
                  >
                    <span
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        transform: "rotate(180deg)",
                        fontFamily: "'Satoshi', sans-serif",
                        fontWeight: 600,
                        fontSize: "0.6875rem",
                        color: "rgba(255,255,255,0.5)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxHeight: 140,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {brand.company_name}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ACTIVE — name + live badge bottom */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.25, delay: 0.08 }}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "20px 22px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Clash Display', sans-serif",
                        fontWeight: 700,
                        fontSize: "1.25rem",
                        color: "#ffffff",
                        lineHeight: 1.2,
                        marginBottom: 8,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {brand.company_name}
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "rgba(23,167,91,0.2)",
                        border: "1px solid rgba(23,167,91,0.4)",
                        borderRadius: 7,
                        padding: "4px 10px",
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#17A75B",
                          flexShrink: 0,
                          display: "block",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'Satoshi', sans-serif",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          color: "#17A75B",
                        }}
                      >
                        Active on Kpugi
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BrandHoverExpand;
