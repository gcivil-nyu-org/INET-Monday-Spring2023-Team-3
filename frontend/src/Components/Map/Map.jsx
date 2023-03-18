import { GoogleMap, LoadScript, useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useState } from "react";
import React from 'react';

const containerStyle = {
  width: '400px',
  height: '400px'
};

const center = {
  lat: 40.7831,
  lng: -73.9712
};

function Map() {
  const [isMounted, setIsMounted] = useState(false);
  const [API_KEY, setAPI_KEY] = useState("");
  const [map, setMap] = React.useState(null)
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
    setMap(map)
  }, [])

  if (!isMounted) return <div></div>;
  return (
    <LoadScript
        googleMapsApiKey={API_KEY}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={15}
          onLoad={onLoad}
          // onUnmount={onUnmount}
        >
          { /* Child components, such as markers, info windows, etc. */ }
          <></>
        </GoogleMap>
      </LoadScript>
  );
}

export default Map;
