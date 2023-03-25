import {
  GoogleMap,
  DirectionsRenderer,
  DirectionsService,
} from "@react-google-maps/api";
import { useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { toaster } from "evergreen-ui";

function Map(props) {
  const containerStyle = {
    width: "400px",
    height: "400px",
    ...props.containerStyle,
  };
  const points = useMemo(() => {
    const _points = props.points || [];
    return _points.map((point) => {
      if (point.placeId) return { placeId: point.placeId };
      return point.location;
    });
  }, [props]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setDirections(null);
  }, [points]);

  const [directions, setDirections] = useState(null);
  const directionsCallback = (res) => {
    if (res !== null && res.status === "OK") {
      setDirections(res);
    } else {
      const _points = JSON.parse(JSON.stringify(props.points || []));
      props.setPoints(_points.splice(0, _points.length - 1));
      toaster.danger("Point not reachable. Cannot be added to current crawl.", {
        duration: 5,
      });
    }
  };

  if (!isMounted) return <div></div>;
  return (
    <GoogleMap mapContainerStyle={containerStyle} zoom={1}>
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
            destination: points[points.length - 1],
            origin: points[0],
            waypoints: points
              .slice(1, points.length - 1)
              .map((x) => ({ location: x })),
            travelMode: "WALKING",
          }}
          callback={directionsCallback}
        />
      )}
    </GoogleMap>
  );
}

export default Map;
