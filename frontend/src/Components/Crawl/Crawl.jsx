import axios from "axios";

import { Pane, toaster, Text, ChevronDownIcon, Heading, SearchInput } from "evergreen-ui";
import {
  Card,
  Space,
  Row,
  Col,
  Button,
  Input,
  Dropdown,
  Avatar,
  List,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { EditIcon, HeartIcon, CommentIcon } from "evergreen-ui";
import PlaceholderProfileImage from "../../static/sample.jpg";
import convertDateHumanReadable from "./utils";
import {
    GoogleMap,
    StandaloneSearchBox,
    Marker,
    DirectionsRenderer,
  } from "@react-google-maps/api";
import {
    DownOutlined,
    ClockCircleOutlined,
    SwapOutlined,
} from "@ant-design/icons";
import { secondsToHms, TRANSIT_TYPES } from "../../common";


function Crawl(props) {
  const { crawl_id } = useParams();
  const history = useHistory();
  const [isMounted, setIsMounted] = useState(false);
  const [crawlDetail, setCrawlDetail] = useState({});
  const [profile, setProfile] = useState({});
  const [isCurrUserAuthor, setIsCurrUserAuthor] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [chosenPoints, setChosenPoints] = useState([]);
  const [directions, setDirections] = useState({});
  const searchBox = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    data: "",
  });

  const [center, setCenter] = useState(null);
  const [error, setError] = useState(null);
  
  const [titleError, setTitleError] = useState("");
  const [locationsError, setLocationsError] = useState("");
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);
  

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
      flag = false;
    } else {
      setLocationsError("");
    }
    if (directions && directions.time > 6 * 60 * 60) {
      toaster.danger("Crawls cannot be longer than 6 hours");
      flag = false;
    }
    return flag;
  };
  

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

  // const publish = async () => {
  //   console.log("publish button -> save button");
  //   if (!hasSubmittedOnce) setHasSubmittedOnce(true);
  //   if (!verify()) return;
  //   try {
  //     await axios.post(
  //       `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/`,
  //       {
  //         title: title.trim(),
  //         data: {
  //           points: chosenPoints,
  //           directions,
  //         },
  //       }
  //     );
  //     toaster.success("Your crawl has been posted");
  //     history.replace("/");
  //   } catch (e) {
  //     if (e?.response?.data?.error) toaster.danger(e.response.data.error);
  //     else toaster.danger("Something went wrong 🙁");
  //   }
  // };


  const handleError = (error) => {
    setError(error.message);
    setIsDisabled(false);
    setIsLoading(false);
  };
  const handleLoad = (map) => {
    console.log("Map loaded:", map);
  };
  const handleMapClick = ({ latLng }) => {
    setCenter({ lat: latLng.lat(), lng: latLng.lng() });
  };
  const mapContainerStyle = {
    width: "100%",
    height: "600px",
  };

  const get_crawl_by_id = async () => {
    try {
        
        const { data } = await axios.get(
            `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/get_crawl_by_id/${crawl_id}/`
        );
        let formattedDate = convertDateHumanReadable(data.created_at)
        data.formattedDate = formattedDate;
        await setCrawlDetail(data);
        console.log(data)
        await setFormData(data);
        console.log(data.data.directions)
        console.log(data.data.points)
        await setDirections(data.data.directions);
        await setChosenPoints(data.data.points);

        return data;
      
    } catch (e) {
      console.log(e);
      //history.replace("/");
    }
  };

  const handleClickEditButton = () => {
    setIsEditMode(true);
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    let userinput = formData;
    if (userinput.description === null || userinput.description === "") {
      toaster.danger("Error: Please enter valid information! 🙁");
      return;
    }
    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/update_crawl_by_id/${crawl_id}/`,
        {
          title: userinput.title,
          description: userinput.description,
          data: {
            points: chosenPoints,
            directions
          }
        }
      );
      toaster.success("Changes saved!");
      setIsEditMode(false);
      setCrawlDetail((prevCrawlDetail) => ({
        ...prevCrawlDetail,
        title: userinput.title,
        description: userinput.description,
      }));
    } catch (e) {
      console.log(e);
    }
  };


  const getProfile = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/full_profile/`
      );
      setProfile(data);
      console.log(data)
      return data;
    } catch (e) {
      console.log(e);
      history.replace("/");
    }
  };

  

  const editModeGmap = (
    
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
                  mapContainerStyle={mapContainerStyle}
                  zoom={10}
                  center={chosenPoints[0].location}
                >
                  <Marker position={chosenPoints[0].location} label="A" />
                </GoogleMap>
              ) : (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  zoom={10}
                  center={
                    chosenPoints && chosenPoints.length === 0 && {
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
          {chosenPoints && directions && chosenPoints.length > 1 && (
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
          {chosenPoints && chosenPoints.map((point, idx) => (
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
    
  );


  const getData = async () => {
    getProfile().then((currUserProfile)=>{
        get_crawl_by_id().then((currCrawl)=>{
            if (currUserProfile.username == currCrawl.author){
                setIsCurrUserAuthor(true)
            }
            setIsMounted(true);
        })
    })
  }

  useEffect(() => {
    getData();
  }, []);

  if (!isMounted) return <div></div>;
  return (
    <div>
        {isCurrUserAuthor ?
        <div>
            <div>
                <div style={{ maxWidth: "150px", cursor: "pointer" }} className="">
                    {!isEditMode ? (
                        <Button type="primary" onClick={handleClickEditButton}>Edit Crawl
                            <span
                                style={{
                                paddingLeft: "4px",
                                verticalAlign: "text-top",
                                }}
                            >
                                <EditIcon />
                            </span>
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            onClick={handleSubmitUpdate}
                        >
                        Save changes
                        </Button>
                    )}
                </div>
            </div>
            {!isEditMode ? 
            <div key={1} style={{ padding: "32px" }}>
                <div>
                    Title: {crawlDetail.title}
                </div>
                <div>
                    <div>Author: {crawlDetail.author}</div>
                    <div>Current User: {profile.username}</div>
                    <div>
                        Mode: {isCurrUserAuthor ? "Current user is the author of this crawl":"Viewing other's crawl mode."}
                    </div>
                    <div>
                        Description: {crawlDetail.description}
                    </div>
                    <div>
                        Publish Date: {crawlDetail.formattedDate}
                    </div>
                </div>
            </div> 
            : 
            // Current user is the author and is in Edit mode 
            <div key={1} style={{ padding: "32px" }}>
                <div>
                    <div>
                    Title: 
                    <Input placeholder="Edit title."
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      } />
                    </div>
                   
                </div>
                <div>
                    <div>Author: {crawlDetail.author}</div>
                    <div>Current User: {profile.username}</div>
                    <div>
                        Mode: {isCurrUserAuthor ? "Current user is the author of this crawl":"Viewing other's crawl mode."}
                    </div>
                    <div>
                        <Input placeholder="Edit description."
                            type="text"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                        } />
                    </div>
                    <div>
                        Publish Date: {crawlDetail.formattedDate}
                    </div>
                </div>
                
                <Pane style={{ display: "flex" }}>
                  {chosenPoints && directions && editModeGmap}
                </Pane>
                
            </div>
            }
        </div>
        :
        <div>
            <div>
                <div style={{ maxWidth: "150px", cursor: "pointer" }} className="">
                </div>
            </div>

            <div key={1} style={{ padding: "32px" }}>
                <div>
                    Title: {crawlDetail.title}
                </div>
                <div>
                    <div>Author: {crawlDetail.author}</div>
                    <div>Current User: {profile.username}</div>
                    <div>
                        Mode: {isCurrUserAuthor ? "Current user is the author of this crawl":"Viewing other's crawl mode."}
                    </div>
                    <div>
                        Description: {crawlDetail.description}
                    </div>
                    <div>
                        Publish Date: {crawlDetail.formattedDate}
                    </div>
                </div>
            </div>
        </div>
        }

    </div>
  );
}

export default Crawl;
