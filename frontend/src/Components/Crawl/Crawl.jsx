import axios from "axios";
import { useFilePicker } from 'use-file-picker';
import "./Crawl.css"
import {
  Pane,
  Dialog,
  toaster,
  Text,
  ChevronDownIcon,
  Heading,
  SearchInput,
  TimeIcon,
  SwapHorizontalIcon,
} from "evergreen-ui";
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
import {
  secondsToHms,
  TRANSIT_TYPES,
  convertDateHumanReadable,
} from "../../common";

function Crawl(props) {
  const { crawl_id } = useParams();
  const history = useHistory();
  const [isMounted, setIsMounted] = useState(false);
  const [crawlDetail, setCrawlDetail] = useState({});
  const [profile, setProfile] = useState({});
  const [isCurrUserAuthor, setIsCurrUserAuthor] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [chosenPoints, setChosenPoints] = useState([]);
  const [directions, setDirections] = useState({});
  const searchBox = useRef(null);
  const [otherUserProfile, setOtherUserProfile] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    data: "",
  });
  const [center, setCenter] = useState(null);
  const [locationsError, setLocationsError] = useState("");
  const [isShown, setIsShown] = useState(false);
  const [titleError, setTitleError] = useState("");
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

  const [fileContent, setFileContent] = useState([])

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

  const { TextArea } = Input;

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
        out.geocoded_waypoints.push(...res.geocoded_waypoints);
        out.routes[0].legs.push(...res.routes[0].legs);
        out.routes[0].bounds.extend({
          lng: res.routes[0].bounds.Ha.hi,
          lat: res.routes[0].bounds.Va.hi,
        });
        out.routes[0].bounds.extend({
          lng: res.routes[0].bounds.Ha.lo,
          lat: res.routes[0].bounds.Va.lo,
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
    setDirections(out);
    setChosenPoints(_points);
  };

  const mapContainerStyle = {
    width: "750px",
    height: "500px",
  };

  const get_crawl_by_id = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/get_crawl_by_id/${crawl_id}/`
      );
      let formattedDate = convertDateHumanReadable(data.created_at);
      data.formattedDate = formattedDate;
      await setCrawlDetail(data);
      await setFormData(data);
      await setDirections(data.data.directions);
      await setChosenPoints(data.data.points);

      return data;
    } catch (e) {
      console.log(e);
      history.replace("/");
    }
  };

  const handleClickEditButton = () => {
    setIsEditMode(true);
  };


  const verify = (userinput) => {
    let flag = true;
    if (userinput.title.trim().length === 0) {
      setTitleError("Title is Required");
      flag = false;
    } else if (userinput.title.trim().length > 60) {
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
    if (userinput.description.trim().length === 0){
      setDescriptionError("Crawl Description is required")
      flag = false
    } else if (userinput.description.trim().length > 200){
      setDescriptionError("Crawl Description too long")
      flag = false
    } else {
      setDescriptionError("")
    }
    
    if (imageSelector?.filesContent?.length != 1 && fileContent.length == 0){
      
      setImageError("Please select a cover image")
      flag = false
    } else {
      setImageError("")
    }
  return flag;
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    let userinput = formData;
    if (!verify(userinput)) return;
    try {
      let imageChanged = true;
      if (imageSelector?.filesContent?.length != 1){
        imageChanged = false;
      }
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/update_crawl_by_id/${crawl_id}/`,
        {
          title: userinput.title,
          description: userinput.description,
          data: {
            points: chosenPoints,
            directions,
          },
          picture: imageChanged? imageSelector.filesContent[0].content : fileContent,
        }
      );

      await setIsEditMode(false);
      await setCrawlDetail((prevCrawlDetail) => ({
        ...prevCrawlDetail,
        title: userinput.title,
        description: userinput.description,
      }));
      window.location.reload();
    } catch (e) {
      console.log(e);
    }
  };
  const handleClickDeleteButton = () => {
    setIsShown(true);
  };
  const deleteCrawl = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/crawl_delete_by_id/`,
        {
          id: crawl_id,
        }
      );
      toaster.success("Your crawl successfully has been deleted");
      history.replace("/");
      setIsShown(false);
    } catch (e) {
      toaster.danger("Error! Cannot delete the crawl.");
      console.log(e);
      setIsShown(false);
    }
  };

  const getProfile = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/full_profile/`
      );
      setProfile(data);
      return data;
    } catch (e) {
      console.log(e);
      history.replace("/");
    }
  };

  const getOtherUserProfile = async (username) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/get_other_user_profile/${username}/`
      );
      setOtherUserProfile(data);
      return data;
    } catch (e) {
      history.replace("/");
      console.log(e);
    }
  };

  const viewModeGmap = (
    <Pane style={{ display: "flex" }}>
      <GoogleMap mapContainerStyle={{ width: "100%", height: 400 }} zoom={14}>
        <DirectionsRenderer
          options={{
            directions: directions,
          }}
        />
      </GoogleMap>
      <Pane
        style={{
          width: 500,
          height: 500,
          overflow: "scroll",
          margin: "2rem",
        }}
      >
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
        {chosenPoints.map((p, idx) => (
          <Pane key={idx}>
            <Pane
              style={{
                borderBottom: "1px solid #DDD",
                padding: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Pane>
                <Heading>
                  {String.fromCharCode("A".charCodeAt(0) + idx)}. {p.name}
                </Heading>
                <Text>{TRANSIT_TYPES[p.transit]}</Text>
              </Pane>
              {idx > 0 && (
                <Pane
                  style={{
                    marginTop: 16,
                    paddingLeft: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: "bolder", fontSize: 12 }}>
                    <TimeIcon />{" "}
                    {directions.routes[0].legs[idx - 1].duration.text}
                    <div style={{ height: 4 }} />
                    <SwapHorizontalIcon />
                    Distance:{" "}
                    {(
                      directions.routes[0].legs[idx - 1].distance.value / 1000
                    ).toFixed(1)}
                    km
                  </div>
                </Pane>
              )}
            </Pane>
          </Pane>
        ))}
      </Pane>
    </Pane>
  );

  const editModeGmap = (
    <Pane style={{ display: "flex" }}>
      <Pane style={{ padding: 32, paddingLeft: 0, flex: "0 0 70%" }}>
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
                  chosenPoints &&
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
      <Pane style={{ flex: "0 0 30%", overflow: "scroll", margin: "1rem" }}>
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
        {chosenPoints &&
          chosenPoints.map((point, idx) => (
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
    getProfile().then((currUserProfile) => {
      get_crawl_by_id().then((currCrawl) => {
        setFileContent(currCrawl.picture);
        if (currUserProfile.username == currCrawl.author) {
          setIsCurrUserAuthor(true);
          setIsMounted(true);
        } else {
          // need to import the author's profile to use their profile image.
          getOtherUserProfile(currCrawl.author).then((r) => {
            setIsMounted(true);
          });
        }
      });
    });
  };

  const followRequest = async (target_username) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/request-follow/`,
        {
          target_address: target_username,
        }
      );
      toaster.success("Changes saved!");
      setProfile((profile) => ({
        ...profile,
        is_following: true,
      }));
    } catch (e) {
      console.log(e);
    }
  };

  const unfollowRequest = async (target_username) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/request-unfollow/`,
        {
          target_address: target_username,
        }
      );
      toaster.success("Unfollow request successful.");
      setProfile((profile) => ({
        ...profile,
        is_following: false,
      }));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  if (!isMounted) return <div></div>;
  return (
    <div className="crawl">
      <div>
          {!isEditMode ? (
            <div key={1} style={{ padding: "32px", paddingTop: "1rem" }}>
              
              <Pane>
                <Dialog
                  isShown={isShown}
                  title="Are you sure you want to delete this crawl?"
                  onCloseComplete={() => setIsShown(false)}
                  onConfirm={() => deleteCrawl()}
                  confirmLabel="Yes, delete it"
                >
                  This crawl will be permanently deleted.
                </Dialog>
              </Pane>
              <div className="crawl-info-container">
                <div className="crawl-info-img">
                  <img src = {fileContent}/>
                </div>
                <div>
                <div
                style={{
                  display: "flex",
                  maxWidth: "150px",
                  cursor: "pointer",
                }}
                className=""
              >
                {isCurrUserAuthor && (
                  <Button type="primary" onClick={handleClickEditButton}>Edit
                      <span
                          style={{
                          paddingLeft: "4px",
                          verticalAlign: "text-top",
                          }}
                      >
                          <EditIcon />
                      </span>
                  </Button>)}
              </div>

              <div
                className="title-block"
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  height: 60,
                }}
              >
                  <h1
                    style={{
                      maxWidth: "80%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {crawlDetail.title}
                  </h1>
                  {isCurrUserAuthor && (
                    <Button
                    style={{ marginLeft: 10 }}
                    danger
                    onClick={handleClickDeleteButton}
                  >
                    Delete
                  </Button>
                  )}
                </div>
              <div>
                <p>{crawlDetail.formattedDate}</p>
              </div>
              <div className="author-block">
                <Row style={{ alignItems: "center" }}>
                  <Link to={`/profile/${crawlDetail.author}`}>
                    <div
                      className="profile-circle"
                      style={{ height: 36, width: 36 }}
                    >
                      <img
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        src={crawlDetail.author_profile_pic || PlaceholderProfileImage}
                        alt="Profile Image"
                      />
                    </div>
                  </Link>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Link to={`/profile/${crawlDetail.author}`}>
                      <h3 style={{ marginRight: 12, color: "#333" }}>
                        {crawlDetail.author}
                      </h3>
                    </Link>
                    {!isCurrUserAuthor && (
                    <>
                      {profile.is_following ? (
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => unfollowRequest(profile.username)}
                        >
                          Following
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          onClick={() => followRequest(profile.username)}
                        >
                          Follow
                        </Button>
                      )}
                    </>
                    )}
                  </div>
                </Row>
              </div>
              <div>
                <p style={{ width: "80%", marginBottom: "2rem" }}>
                  {crawlDetail.description}
                </p>
              </div>

                </div>
              
              </div>

              <Pane style={{ marginTop: 4, width: "60%" }}>{viewModeGmap}</Pane>
            </div>
          ) : (
            // Current user is the author and is in Edit mode
            <div
              key={1}
              style={{ padding: "32px", paddingTop: "1rem", width: "100%" }}
            >
              <div
                style={{ maxWidth: "150px", cursor: "pointer" }}
                className=""
              >
                <Button type="primary" onClick={handleSubmitUpdate}>
                  Save changes
                </Button>
              </div>
              <div>
                <Row>
                  <h1 style={{ marginBottom: 0}}>
                    Title
                    <div>
                      <Input
                        placeholder="Edit the title."
                        style={{ width: "800px" }}
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                      />
                      <div><Text size={400} color="red600" style={{ fontWeight: "bold" }}>
                        {titleError}
                      </Text>
                      </div>
                      
                    </div>
                  </h1>
                </Row>
              </div>
              <div>
              <h2 style={{ marginBottom: 0, fontSize:"24px" }}>
                Cover Image
              </h2>
              
              <div style={{marginLeft: 250, marginBottom: 16, maxWidth:"400px", maxHeight:"400px"}}danger={imageError !== ""} onClick={()=>{
                imageSelector.clear();
                openImageSelector();
              }}>
                {imageError !== "" && imageError}
                {imageSelector?.filesContent?.length > 0 ? (
                  <img 
                  className="editPicture" 
                  src={imageSelector.filesContent[0].content} style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}/>
                ) : <img className="editPicture"  src={fileContent}></img>}
              </div>

              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                <div>
                  <h2 style={{ marginBottom: 0 }}>Description</h2>
                  <TextArea
                    placeholder="Edit description."
                    type="text"
                    id="description"
                    name="description"
                    style={{ width: "800px", height: "60px" }}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>
              <Text size={400} color="red600" style={{ fontWeight: "bold" }}>
              {descriptionError}
            </Text>
              <Pane style={{ display: "flex" }}>
                {chosenPoints && directions && editModeGmap}
              </Pane>
            </div>
          )}
        </div>
    </div>
  );
}

export default Crawl;
