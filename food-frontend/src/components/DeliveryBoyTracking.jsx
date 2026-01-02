import React from 'react'
import scooter from '../assets/scooter.png'
import home from '../assets/home.png'
import L from 'leaflet'
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";


 
 const deliveryboyIcon = new L.Icon({
        iconUrl:scooter,
        iconSize:[40,40],
        iconAnchor:[20,20]
    });
     const customerIcon = new L.Icon({
        iconUrl:home,
        iconSize:[40,40],
        iconAnchor:[20,20]
    });

function DeliveryBoyTracking({data}) {

   const deliveryBoyLat = data.deliveryBoyLocation.lat
   const deliveryBoyLng = data.deliveryBoyLocation.lng

   const customerLat = data.customerLocation.lat
   const customerLng = data.customerLocation.lng

   const path = [
    [deliveryBoyLat, deliveryBoyLng],
    [customerLat, customerLng]
   ]
   const center = [deliveryBoyLat, deliveryBoyLng]

  return (
    <div className='w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md'>
      <MapContainer
        className="w-full h-full"
        center={center}
        zoom={15}
        scrollWheelZoom={false}
    >
        <TileLayer
        attribution=''
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
        position={[deliveryBoyLat , deliveryBoyLng]}
        draggable={true} 
        icon={deliveryboyIcon}>
        <Popup>
        <div className="text-center">
            <p className="font-bold text-orange-800">Delivery Boy</p>
            <p className="text-sm text-orange-600 mt-1">Order is on your way</p>
        </div>
        </Popup>
     </Marker>

     <Marker
        position={[customerLat , customerLng]}
        draggable={true} 
        icon={customerIcon}
    >
        <Popup>
        <div className="text-center">
            <p className="font-bold text-orange-800">Home</p>
            <p className="text-sm text-orange-600 mt-1">Order Destination</p>
        </div>
        </Popup>
         </Marker>
         <Polyline positions={path} color='black' weight={4} />
      </MapContainer>
    </div>
  )
}

export default DeliveryBoyTracking
