"use client";
import React from "react";
import Link from "next/link";

export default function FineSagraPage() {
  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-black">
      {/* Video full screen */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/video.mp4"
        autoPlay
        loop
        muted
        poster="/images/logo.png"
        title="Sagra Video"
        playsInline
        controls
      />
      {/* Overlay scura per migliorare la leggibilità */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />
      {/* Overlay per testo in basso con animazione fade-in */}
      <div className="relative left-0 w-full z-10 flex flex-col items-center pb-10 px-4">
        <div className="bg-black/50 rounded-xl w-full max-w-2xl text-white text-center p-6 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Grazie di cuore a tutti!
          </h1>
          <p className="text-xl md:text-2xl mb-8 drop-shadow-lg">
            La sagra è finita, grazie per aver partecipato e aver reso questa
            edizione speciale.
          </p>
          <div className="text-lg md:text-xl opacity-80 mb-6">
            Ci vediamo l&apos;anno prossimo!
          </div>

          <Link
            className="underline text-blue-600"
            href="https://www.prolocogioiese.com"
            target="__blank"
          >
            <p>Pro Loco Gioiese</p>
          </Link>
        </div>
      </div>
      {/* Animazione fade-in */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 1.2s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
