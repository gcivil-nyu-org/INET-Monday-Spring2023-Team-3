import { GoogleMap, DirectionsRenderer } from "@react-google-maps/api";
import { useEffect, useMemo, useRef, useState } from "react";
import React from "react";

function Map(props) {
  const containerStyle = {
    width: "400px",
    height: "400px",
    ...props.containerStyle,
  };

  const directions = useMemo(() => {
    const _directions = props.directions;
    return _directions;
  }, [props]);

  if (!directions) return null;
  return (
    <GoogleMap mapContainerStyle={containerStyle} zoom={1}>
      <DirectionsRenderer
        options={{
          directions,
        }}
      />
    </GoogleMap>
  );
}

export default Map;
