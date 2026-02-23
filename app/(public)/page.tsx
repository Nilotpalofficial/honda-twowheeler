import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-black flex items-center justify-center px-6">
      
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-10 max-w-2xl w-full text-center text-white">
        
        <h1 className="text-5xl font-extrabold mb-6 tracking-wide">
          Welcome to Honda TwoWheeler
        </h1>

        <p className="text-lg text-gray-200 mb-8">
          Experience Power. Performance. Perfection.
          Explore premium bikes and scooters with cutting-edge technology.
        </p>

        <div className="flex justify-center gap-6 flex-wrap">
          <button className="bg-white text-red-600 font-semibold px-6 py-3 rounded-full hover:scale-105 transition duration-300 shadow-lg">
            Explore Bikes
          </button>

          <button className="border border-white px-6 py-3 rounded-full hover:bg-white hover:text-red-600 transition duration-300">
            View EV Models
          </button>
        </div>

      </div>

    </div>
  );
}
