"use client";
import Lottie from "lottie-react";
import loading from "@/assets/lottie/loading.json";

export default function Loading() {
  return (
    <div className="w-full h-dvh flex items-center justify-center">
      <Lottie
        animationData={loading}
        loop={true}
        style={{
          width: "400px",
          height: "400px",
        }}
      />
    </div>
  );
}
