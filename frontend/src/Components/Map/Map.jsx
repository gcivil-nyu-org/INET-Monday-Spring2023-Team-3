import {
  GoogleMap,
  DirectionsRenderer,
  DirectionsService,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import React from "react";

const containerStyle = { width: "400px", height: "400px" };
const from = { lat: 40.723301, lng: -74.002988 }; // Soho, NY
const via = [
  {location: { lat: 40.73100573111601, lng: -73.99734273055797 }} // WSQ, NY
]; 
const to = { lat: 40.76749693, lng: -73.97582943 }; // Central Park, NY

function Map() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true)
  }, []);

  const [directions, setDirections] = useState(null);
  const directionsCallback = (res) => {
    if (res !== null) {
      setDirections(res);
    }
  };

  if (!isMounted) return <div></div>;
  return (
    <GoogleMap mapContainerStyle={containerStyle} center={from} zoom={10}>
      {directions !== null && (
        <DirectionsRenderer
          options={{
            directions: directions,
          }}
        />
      )}
      {directions === null && (
        <DirectionsService
        options={{
          destination: to,
          origin: from,
          waypoints: via,
          travelMode: "WALKING",
        }}
        callback={directionsCallback}
      />
      )}
    </GoogleMap>
  );
}

export default Map;
