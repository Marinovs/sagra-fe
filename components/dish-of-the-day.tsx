import Image from "next/image";
import { useState } from "react";

export function DishOfTheDay() {
  const [show, setShow] = useState(false);
  const dish = {
    name: "Pizza Fritta 'Ra Jurnat'",
    image: "/images/_special.jpg",
    highlight: "Pizza fritta con mortadella, stracciata di bufala e granella di pistacchio",
  };

  return (
    <section
      className="relative rounded-xl shadow-lg p-6 flex flex-col items-center gap-6 mb-8 border-2 border-yellow-400 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #fffbe6 0%, #ffe5b4 50%, #ffd6d6 100%)",
      }}
    >
      {/* decorazione sfondo */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <ellipse
            cx="200"
            cy="60"
            rx="180"
            ry="40"
            fill="#fff7c0"
            fillOpacity="0.3"
          />
          <ellipse
            cx="320"
            cy="100"
            rx="60"
            ry="15"
            fill="#ffd6d6"
            fillOpacity="0.2"
          />
          <ellipse
            cx="80"
            cy="100"
            rx="60"
            ry="15"
            fill="#ffe5b4"
            fillOpacity="0.2"
          />
        </svg>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-yellow-900 mb-2 drop-shadow z-10">
        {'Pizza Fritta "ra jurnat"'}
      </h2>
      <button
        className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-6 rounded-full shadow mb-4 transition-colors z-10"
        onClick={() => setShow((v) => !v)}
      >
        {show ? "Nascondi" : "Scopri!"}
      </button>
      {show && (
        <div className="flex flex-col md:flex-row items-center gap-6 w-full z-10">
          <div className="flex-shrink-0">
            <Image
              src={dish.image}
              alt={dish.name}
              width={460}
              height={460}
              className="rounded-xl shadow-md object-cover"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-yellow-200 text-red-700 font-semibold px-4 py-2 rounded-full shadow">
              {dish.highlight}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
