import React from 'react'

function CategoryCard({ name, image }) {
  return (
    <div className="group w-[140px] h-[140px] md:w-[200px] md:h-[200px] rounded-2xl border-2
    border-orange-200 shrink-0 overflow-hidden bg-white shadow-lg shadow-gray-100
    hover:shadow-xl hover:shadow-orange-100 transition-all duration-300 relative
    hover:border-orange-400 cursor-pointer">
      
      {/* Image Container with Gradient Overlay */}
      <div className="relative w-full h-full overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110  
          transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Name Label with Improved Design */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 to-white/85
      backdrop-blur-sm px-3 py-2 rounded-t-xl text-center">
        <span className="text-gray-800 font-semibold text-sm md:text-base line-clamp-1">
          {name}
        </span>
        <div className="w-8 h-1 bg-orange-500 rounded-full mx-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Hover Indicator */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-500/20 rounded-2xl transition-all duration-300 pointer-events-none"></div>
    </div>
  )
}

export default CategoryCard