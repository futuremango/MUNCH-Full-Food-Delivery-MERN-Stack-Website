import React from 'react'

function AreaShops({ name, image }) {
  return (
    <div className="group relative w-[160px] h-[160px] md:w-[220px] md:h-[220px] 
                    rounded-xl overflow-hidden flex-shrink-0 cursor-pointer
                    border-4 border-gray-200 hover:border-[#ec4a09]
                    transition-all duration-300 hover:scale-[1.02]">
      {/* Gradient Overlay Container */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 z-10"></div>
      
      {/* Image */}
      <div className="w-full h-full overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
      </div>
      
      {/* Name with Subtle Animation */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
        <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
          <h6 className="text-white font-semibold text-sm md:text-base text-center leading-tight tracking-wide">
            {name}
          </h6>
          
          {/* Animated Underline */}
          <div className="w-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent mx-auto mt-2 
                         group-hover:w-12 transition-all duration-300 ease-out"></div>
        </div>
      </div>
      
      {/* Subtle Border on Hover */}
      <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 rounded-xl transition-all duration-300 pointer-events-none"></div>
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/0 via-orange-400/0 to-orange-300/0 
                      group-hover:via-orange-400/10 group-hover:to-orange-300/20 transition-all duration-500 rounded-xl"></div>
    </div>
  )
}

export default AreaShops;