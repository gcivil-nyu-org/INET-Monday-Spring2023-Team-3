import axios from "axios";
import {
  Heading,
  Pane,
  SearchInput,
  Text,
  Textarea,
  TextInput,
  toaster,
} from "evergreen-ui";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import Map from "../Map/Map";
import {
  GoogleMap,
  StandaloneSearchBox,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { Button, Dropdown, Space } from "antd";
import {
  DownOutlined,
  ClockCircleOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useFilePicker } from 'use-file-picker';
import { secondsToHms, TRANSIT_TYPES } from "../../common";

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
  const [directions, setDirections] = useState({});
  const [page, setPage] = useState(1);
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [imageError, setImageError] = useState("");
  const [openImageSelector, imageSelector] = useFilePicker({
    readAs: 'DataURL',
    accept: 'image/*',
    multiple: false,
    limitFilesConfig: { max: 1 },
    // minFileSize: 0.1, // in megabytes
    maxFileSize: 2,
  });

  const onLoad = (ref) => (searchBox.current = ref);
  const onPlacesChanged = () => {
    const {
      place_id: placeId,
      name,
      formatted_address,
      geometry: { location },
    } = searchBox.current.getPlaces()[0];
    if (chosenPoints.some((point) => point.placeId === placeId)) {
      toaster.danger("Place already exists in crawl");
      return;
    }
    updateDirections([
      ...chosenPoints,
      { placeId, name, formatted_address, location, transit: "WALKING" },
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

  useEffect(() => {
    getProfile();
  }, []);

  const verify = () => {
    let flag = true;
    if (page === 1){
    if (title.trim().length === 0) {
      setTitleError("Title is Required");
      flag = false;
    } else if (title.trim().length > 60) {
      setTitleError("Title too long");
      flag = false;
    } else {
      setTitleError("");
    }
    if (chosenPoints.length < 2) {
      setLocationsError("Must pick at least 2 locations");
      flag = false;
    } else {
      setLocationsError("");
    }
    if (directions && directions.time > 6 * 60 * 60) {
      toaster.danger("Crawls cannot be longer than 6 hours");
      flag = false;
    }
  } else if (page === 2){
    if (description.trim().length === 0){
      setDescriptionError("Crawl Description is required")
      flag = false
    } else if (description.trim().length > 200){
      setDescriptionError("Crawl Description too long")
      flag = false
    } else {
      setDescriptionError("")
    }
    if (imageSelector?.filesContent?.length != 1){
      setImageError("Please select a cover image")
      flag = false
    } else {
      setImageError("")
    }
  }

  return flag;
  };
  const next = async () => {
    if (!hasSubmittedOnce) setHasSubmittedOnce(true);
    if (!verify()) return;
    setHasSubmittedOnce(false);
    setPage(2);
  };
  const publish = async () => {
    if (!hasSubmittedOnce) setHasSubmittedOnce(true);
    if (!verify()) return;
    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/`,
        {
          title: title.trim(),
          data: {
            points: chosenPoints,
            directions,
          },
          picture: imageSelector.filesContent[0].content,
          description
        }
      );
      toaster.success("Your crawl has been posted");
      history.replace("/");
    } catch (e) {
      if (e?.response?.data?.error) toaster.danger(e.response.data.error);
      else toaster.danger("Something went wrong 🙁");
    }
  };

  useEffect(() => {
    if (hasSubmittedOnce) verify();
  }, [title, chosenPoints, imageSelector?.filesContent, description]);

  const updateDirections = async (_points) => {
    const points = (_points || []).map((point) => {
      if (point.placeId) return { placeId: point.placeId };
      return point.location;
    });
    if (points.length < 2) {
      setChosenPoints(_points);
      setDirections({});
      return;
    }
    const directionsService = new google.maps.DirectionsService();
    const out = {
      geocoded_waypoints: [],
      routes: [
        {
          bounds: new google.maps.LatLngBounds(),
          legs: [],
        },
      ],
      request: {
        destination: { placeId: points[points.length - 1] },
        origin: { placeId: points[0] },
        travelMode: "WALKING",
      },
      time: 0,
      distance: 0,
    };
    for (let i = 1; i < points.length; i++) {
      const request = {
        destination: points[i],
        origin: points[i - 1],
        travelMode: _points[i].transit,
      };
      let res;
      try {
        res = await directionsService.route(request);
      } catch (e) {
        toaster.danger(
          "Point not reachable. Cannot be added to current crawl.",
          {
            duration: 5,
          }
        );
      }
      if (res !== null && res.status === "OK") {
        console.log(res);
        out.geocoded_waypoints.push(...res.geocoded_waypoints);
        out.routes[0].legs.push(...res.routes[0].legs);
        out.routes[0].bounds.extend({
          lng: res.routes[0].bounds.Ga.hi,
          lat: res.routes[0].bounds.Wa.hi,
        });
        out.routes[0].bounds.extend({
          lng: res.routes[0].bounds.Ga.lo,
          lat: res.routes[0].bounds.Wa.lo,
        });
        out.time += res.routes[0].legs
          .map((x) => x.duration.value)
          .reduce((a, b) => a + b);
        out.distance += res.routes[0].legs
          .map((x) => x.distance.value)
          .reduce((a, b) => a + b);
      } else {
        toaster.danger(
          "Point not reachable. Cannot be added to current crawl.",
          {
            duration: 5,
          }
        );
      }
    }
    console.log(out);
    setDirections(out);
    setChosenPoints(_points);
  };

  if (!isMounted) return <div></div>;
  return (
    <Pane style={{ paddingTop: 32 }}>
      <Pane style={{ padding: "0 32px" }}>
        <h1>{page === 1 && "Create a crawl"}{page === 2 && `Publish ${title}`}</h1>
        <Pane style={{ display: "flex" }}>
          <Pane style={{ flex: 2 }}>
            {page === 1 && (
              <>
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
            </Text></>
            )}
            {page === 2 && (
              <>
              <Button style={{marginLeft: 250, width: 500, height: 500, marginBottom: 16}} type="dashed" danger={imageError !== ""} onClick={()=>{
                imageSelector.clear();
                openImageSelector();
              }}>
                {imageSelector?.filesContent?.length > 0 ? (
                  <img src={imageSelector.filesContent[0].content} style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}/>
                ) : "Upload cover image"}
              </Button>
              <Textarea
              style={{
                fontWeight: "bold",
                fontSize: 16,
                height: 64,
                maxWidth: 1000,
                minWidth: 1000
              }}
              placeholder="Enter crawl description..."
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              isInvalid={descriptionError !== ""}
            />
            <Text size={400} color="red600" style={{ fontWeight: "bold" }}>
              {descriptionError}
            </Text></>
            )}
            
          </Pane>
          <Pane
            style={{ width: 500, display: "flex", justifyContent: "flex-end" }}
          >
            {page === 1 && (<Button onClick={next}>Next</Button>)}
            {page === 2 && (<Button onClick={publish}>Publish</Button>)}

          </Pane>
        </Pane>
      </Pane>
      {page === 1 && (
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
              {chosenPoints?.length === 1 ? (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: 600 }}
                  zoom={10}
                  center={chosenPoints[0].location}
                >
                  <Marker position={chosenPoints[0].location} label="A" />
                </GoogleMap>
              ) : (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: 600 }}
                  zoom={10}
                  center={
                    chosenPoints.length === 0 && {
                      lat: 40.723301,
                      lng: -74.002988,
                    }
                  }
                >
                  <DirectionsRenderer
                    options={{
                      directions,
                    }}
                  />
                </GoogleMap>
              )}
            </div>
          </Pane>
        </Pane>
        <Pane
          style={{ width: 500, height: 600, overflow: "scroll", marginTop: 14 }}
        >
          {chosenPoints.length > 1 && (
            <Pane
              style={{
                borderBottom: "1px solid #DDD",
                padding: "16px",
              }}
            >
              <Heading size={700} style={{ marginBottom: 8 }}>
                Crawl Stats
              </Heading>
              <div>Time: {secondsToHms(directions.time)}</div>
              <div>Distance: {(directions.distance / 1000).toFixed(1)}km</div>
            </Pane>
          )}
          {chosenPoints.map((point, idx) => (
            <Pane
              style={{
                borderBottom: "1px solid #DDD",
                padding: "16px",
              }}
            >
              <Pane
                style={{
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
                    updateDirections(newChosenPoints);
                  }}
                >
                  Remove
                </Button>
              </Pane>
              {idx > 0 && (
                <Pane
                  style={{
                    marginTop: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: "bolder", fontSize: 12 }}>
                    <ClockCircleOutlined />{" "}
                    {directions.routes[0].legs[idx - 1].duration.text}
                    <div style={{ height: 4 }} />
                    <SwapOutlined /> Distance:{" "}
                    {(
                      directions.routes[0].legs[idx - 1].distance.value / 1000
                    ).toFixed(1)}
                    km
                  </div>
                  <Dropdown
                    menu={{
                      items: [
                        {
                          label: "Walk",
                          key: "WALKING",
                        },
                        {
                          label: "Drive",
                          key: "DRIVING",
                        },
                        {
                          label: "Bicycle",
                          key: "BICYCLING",
                        },
                        {
                          label: "Transit",
                          key: "TRANSIT",
                        },
                      ],
                      onClick: ({ key }) => {
                        const newChosenPoints = JSON.parse(
                          JSON.stringify(chosenPoints)
                        );
                        newChosenPoints[idx].transit = key;
                        updateDirections(newChosenPoints);
                      },
                    }}
                    onClick={() => {}}
                  >
                    <Button>
                      <Space>
                        {TRANSIT_TYPES[point.transit]}
                        <DownOutlined />
                      </Space>
                    </Button>
                  </Dropdown>
                </Pane>
              )}
            </Pane>
          ))}
          {locationsError && (
            <Text size={400} color="red600" style={{ fontWeight: "bold" }}>
              {locationsError}
            </Text>
          )}
        </Pane>
      </Pane>
      )}
    </Pane>
  );
}

export default Create;
