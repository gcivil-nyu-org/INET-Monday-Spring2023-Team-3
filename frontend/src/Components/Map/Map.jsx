import { GoogleMap, LoadScript, useJsApiLoader, DirectionsRenderer, DirectionsService } from '@react-google-maps/api';
import { useEffect, useState } from "react";
import React from 'react';

const containerStyle = { width: '400px', height: '400px'};
const center = { lat: 40.723301, lng: -74.002988 };
const from = { lat: 40.723301, lng: -74.002988 }; // Soho, NY
const to = { lat: 40.76749693, lng: -73.97582943 }; // Columbus Circle, NY

function Map() {
  const [isMounted, setIsMounted] = useState(false);
  const [API_KEY, setAPI_KEY] = useState("");
  const [maps, setMap] = React.useState(null)
  const getAPI_KEY = async () => {
    try {
      const data = process.env.REACT_APP_GOOGLE_MAPS_API
      setAPI_KEY(data);
      setIsMounted(true);
    } catch (e) {
      console.log(e.message)
    }
  };

  useEffect(() => {
    getAPI_KEY();
  }, []);
  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
    setMap(maps)
  }, [])
  const [directions, setDirections] = useState(null);
  const directionsCallback = (res) => {
    if (res !== null) {
      setDirections(res);
    }
  };

  if (!isMounted) return <div></div>;
  return (
    <LoadScript
        googleMapsApiKey={API_KEY}
      >
        {/* <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={onLoad}
          // onUnmount={onUnmount}
        > 
        </GoogleMap>
        */}
        
        <GoogleMap mapContainerStyle={containerStyle} center={from} zoom={10}>
          {directions !== null && (
            <DirectionsRenderer
              options={{
                directions: directions,
              }}
            />
          )}
          <DirectionsService
            options={{
              destination: to,
              origin: from,
              travelMode: 'DRIVING',
            }}
            callback={directionsCallback}
          />
        </GoogleMap>
        
      </LoadScript>
  );
}

export default Map;
