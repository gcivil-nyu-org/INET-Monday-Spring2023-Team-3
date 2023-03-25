import axios from "axios";
import {
  Button,
  Heading,
  Pane,
  SearchInput,
  Text,
  TextInput,
  toaster,
} from "evergreen-ui";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import Map from "../Map/Map";
import { GoogleMap, StandaloneSearchBox, Marker } from "@react-google-maps/api";

function Create() {
  const history = useHistory();
  const [isMounted, setIsMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [locationsError, setLocationsError] = useState("");
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);
  const [profile, setProfile] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const searchBox = useRef(null);
  const [chosenPoints, setChosenPoints] = useState([]);
  const [showMap, setShowMap] = useState(false);

  const onLoad = (ref) => (searchBox.current = ref);
  const onPlacesChanged = () => {
    const {
      place_id: placeId,
      name,
      formatted_address,
      geometry: { location },
    } = searchBox.current.getPlaces()[0];
    if (chosenPoints.some((point) => point.placeId === placeId)) {
      return;
    }
    setChosenPoints([
      ...chosenPoints,
      { placeId, name, formatted_address, location },
    ]);
  };

  const getProfile = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/profile/`
      );
      setProfile(data);
      setIsMounted(true);
    } catch (e) {
      localStorage.removeItem("jwt");
      history.replace("/login");
    }
  };

  const remountMap = () => {
    setShowMap(false);
    setTimeout(() => {
      setShowMap(true);
    }, 100);
  };

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    if (chosenPoints.length < 2 && showMap) setShowMap(false);
    if (chosenPoints.length >= 2 && !showMap) setShowMap(true);
  }, [chosenPoints, showMap]);

  const verify = () => {
    let flag = true;
    if (title.trim().length === 0) {
      setTitleError("Title is Required");
      flag = false;
    } else {
      setTitleError("");
    }
    if (chosenPoints.length < 2) {
      setLocationsError("Must pick at least 2 locations");
    } else {
      setLocationsError("");
    }
    return flag;
  };
  const publish = async () => {
    if (!hasSubmittedOnce) setHasSubmittedOnce(true);
    if (!verify()) return;
    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/`,
        {
          title,
          points: chosenPoints,
        }
      );
      toaster.success("Your crawl has been posted");
      history.replace("/");
    } catch (e) {
      toaster.danger("Something went wrong 🙁");
    }
  };

  useEffect(() => {
    if (hasSubmittedOnce) verify();
  }, [title, chosenPoints]);

  if (!isMounted) return <div></div>;
  return (
    <Pane style={{ paddingTop: 32 }}>
      <Pane style={{ padding: "0 32px" }}>
        <h1>Create a crawl</h1>
        <Pane style={{ display: "flex" }}>
          <Pane style={{ flex: 2 }}>
            <TextInput
              style={{
                fontWeight: "bold",
                fontSize: 24,
                height: 64,
                width: "100%",
              }}
              placeholder="Enter a Title..."
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              isInvalid={titleError !== ""}
            />
            <Text size={400} color="red600" style={{ fontWeight: "bold" }}>
              {titleError}
            </Text>
          </Pane>
          <Pane
            style={{ width: 500, display: "flex", justifyContent: "flex-end" }}
          >
            <Button onClick={publish}>Publish</Button>
          </Pane>
        </Pane>
      </Pane>
      <Pane style={{ display: "flex" }}>
        <Pane style={{ padding: 32, flex: 2 }}>
          <Pane
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative", zIndex: 2 }}>
              <StandaloneSearchBox
                onLoad={onLoad}
                onPlacesChanged={onPlacesChanged}
              >
                <SearchInput
                  style={{ width: 400 }}
                  placeholder="Search for a place"
                />
              </StandaloneSearchBox>
            </div>
            <div
              style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                marginTop: -50,
              }}
            >
              {showMap ? (
                <Map
                  containerStyle={{ width: "100%", height: 600 }}
                  points={chosenPoints}
                  setPoints={setChosenPoints}
                />
              ) : (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: 600 }}
                  zoom={10}
                  center={{ lat: 40.723301, lng: -74.002988 }}
                >
                  {chosenPoints.length === 1 && (
                    <Marker position={chosenPoints[0].location} />
                  )}
                </GoogleMap>
              )}
            </div>
          </Pane>
        </Pane>
        <Pane
          style={{ width: 500, height: 600, overflow: "scroll", marginTop: 14 }}
        >
          {chosenPoints.map((point, idx) => (
            <Pane
              style={{
                borderBottom: "1px solid #DDD",
                padding: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Heading>
                {String.fromCharCode("A".charCodeAt(0) + idx)}. {point.name}
              </Heading>
              <Button
                intent="danger"
                onClick={() => {
                  const newChosenPoints = JSON.parse(
                    JSON.stringify(chosenPoints)
                  );
                  newChosenPoints.splice(idx, 1);
                  setChosenPoints(newChosenPoints);
                  remountMap();
                }}
              >
                Remove
              </Button>
            </Pane>
          ))}
          {locationsError && (
            <Text size={400} color="red600" style={{ fontWeight: "bold" }}>
              {locationsError}
            </Text>
          )}
        </Pane>
      </Pane>
    </Pane>
  );
}

export default Create;
