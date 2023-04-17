import axios from "axios";

import {
  Pane,
  Text,
  ChevronDownIcon,
  Heading,
  TextInput,
  CrossIcon,
  TrashIcon,
} from "evergreen-ui";
import {toaster} from '../../common';
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
  Tabs,
  Typography,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import "./Profile.css";
import { EditIcon, HeartIcon, CommentIcon } from "evergreen-ui";
import {
  GoogleMap,
  useLoadScript,
  StandaloneSearchBox,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useFilePicker } from 'use-file-picker';
import PlaceholderProfileImage from "../../static/sample.jpg";

function Profile(props) {
  const refreshParam = new URLSearchParams(props.location.search).get("r");
  const { other_username } = useParams();
  const history = useHistory();
  const [isMounted, setIsMounted] = useState(false);
  const [currTab, setCurrTab] = useState("CRAWLS");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [openImageSelector, imageSelector] = useFilePicker({
    readAs: 'DataURL',
    accept: 'image/*',
    multiple: false,
    limitFilesConfig: { max: 1 },
    // minFileSize: 0.1, // in megabytes
    maxFileSize: 1,
  });

  const [profile, setProfile] = useState({});
  const [otherUserProfile, setOtherUserProfile] = useState({});

  const [isEditMode, setIsEditMode] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    dob: "",
    short_bio: "",
  });

  const [center, setCenter] = useState(null);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCurrUserFollowsOtherUser, setCurrUserFollowsOtherUser] =
    useState(false);

  const [allCrawls, setAllCrawls] = useState([]);

  const handleSuccess = (position) => {
    const { latitude, longitude } = position.coords;
    setIsDisabled(false);
    setCenter({ lat: latitude, lng: longitude });
    setLocation({ lat: latitude, lng: longitude });
    setIsLoading(false);
  };
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
    height: "250px",
  };

  const handleGetLocation = () => {
    setIsLoading(true);
    setIsDisabled(true);

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  };

  const dateFormat = "YYYY-MM-DD";
  const updateFields = (date, dateString) => {
    setFormData({ ...formData, dob: dateString.replaceAll("/", "-") });
  };

  const getOtherUserProfile = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/get_other_user_profile/${other_username}/`
      );
      setOtherUserProfile(data);
      let numFollowers = 0;
      let numFollowing = 0;
      let listFollowers = [];
      let listFollowing = [];
      if (data.followed_by.length > 0) {
        listFollowers = data.followed_by.split(" ");
        numFollowers = listFollowers.length;
      }
      if (data.following.length > 0) {
        listFollowing = data.following.split(" ");
        numFollowing = listFollowing.length;
      }

      setOtherUserProfile((prevProfile) => ({
        ...prevProfile,
        numFollowers,
        numFollowing,
        listFollowers,
        listFollowing,
      }));

      setIsMounted(true);
    } catch (e) {
      history.replace("/");
      console.log(e);
    }
  };

  const findUserInfoByUsername = async (username) => {
    let ans = "";
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/get_other_user_profile/${username}/`
      );
      ans = data;
    } catch (e) {
      console.log(e);
    }
    return ans;
  };

  const getProfile = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/full_profile/${
          other_username ? `?username=${other_username}` : ""
        }`
      );
      setProfile(data);

      // if (data.username === other_username) {
      //   // history.replace("/profile/myprofile");
      // }

      // let numFollowers = 0;
      // let numFollowing = 0;
      // let listFollowers = [];
      // let listFollowing = [];
      // if (data.followed_by.length > 0) {
      //   listFollowers = data.followed_by.split(" ");
      //   numFollowers = listFollowers.length;
      // }
      // if (data.following.length > 0) {
      //   listFollowing = data.following.split(" ");
      //   numFollowing = listFollowing.length;
      // }
      // if (
      //   other_username !== "myprofile" &&
      //   listFollowing.includes(other_username)
      // ) {
      //   setCurrUserFollowsOtherUser(true);
      // }

      // setFormData({ short_bio: data.short_bio });
      // // fetch followers and following users profiles
      // let listFollowersData = [];
      // for (let i = 0; i < listFollowers.length; i++) {
      //   let ans;
      //   ans = await findUserInfoByUsername(listFollowers[i]);
      //   listFollowersData.push(ans);
      // }
      // let listFollowingData = [];
      // for (let i = 0; i < listFollowing.length; i++) {
      //   let ans;
      //   ans = await findUserInfoByUsername(listFollowing[i]);
      //   listFollowingData.push(ans);
      // }

      // setProfile((prevProfile) => ({
      //   ...prevProfile,
      //   numFollowers,
      //   numFollowing,
      //   listFollowers,
      //   listFollowing,
      //   listFollowersData,
      //   listFollowingData,
      // }));
      // if (other_username === "myprofile") {
      //   setIsMounted(true);
      // }
    } catch (e) {
      // console.log(e);
      // history.replace("/");
    }
    setIsMounted(true)
  };
  const checkIfUserIsFollowing = () => {
    if (otherUserProfile.listFollowers.includes(profile.username)) {
      return true;
    } else {
      return false;
    }
  };

  const handleClickEditButton = () => {
    setIsEditMode(true);
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    let userinput = formData;
    if (userinput.short_bio === null || userinput.short_bio === "") {
      toaster.danger("Error: Please enter valid information! 🙁");
      return;
    }
    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/update-user-info/`,
        {
          short_bio: userinput.short_bio,
          target_username: profile.username,
        }
      );
      toaster.success("Changes saved!");
      setIsEditMode(false);
      setProfile((prevProfile) => ({
        ...prevProfile,
        short_bio: userinput.short_bio,
      }));
    } catch (e) {
      console.log(e);
    }
  };

  const [postimage, setPostImage] = useState(null);
  const handleChange = (e) => {
    if ([e.target.name] == "image") {
      setPostImage({
        image: e.target.files,
      });
      console.log(e.target.files);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    let formData = new FormData();
    formData.append("file", postimage.image[0]);
    formData.append("target_username", profile.username);
    axios.post(
      `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/profile_pic/`,
      // `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/profile_pic/ismael_nyu/`,
      formData
    );
    window.location.reload(false);
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
      init(true);
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
      init(true);
    } catch (e) {
      console.log(e);
    }
  };

  const editProfile = async (target_username) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/update-user-info/`,
        {
          profile_pic: (imageSelector?.filesContent || [])[0]?.content || null,
          username
        }
      );
      toaster.success("Changes saved!");
      setIsEditMode(false)
      init(true);
    } catch (e) {
      console.log(e)
      if (e?.response?.data?.error) toaster.danger(e.response.data.error);
      else toaster.danger("Something went wrong 🙁");
    }
  };

  const getAllCrawls = async (currUsername) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/all/`
      );
      let arr = [];
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          console.log(data[i]);
          if (other_username === "myprofile") {
            if (data[i].author === currUsername) {
              arr.push(data[i]);
            }
          } else {
            if (data[i].author === other_username) {
              arr.push(data[i]);
            }
          }
        }
      }

      setAllCrawls(arr);
      
    } catch (e) {
      console.log(e);
    }
  };
  const { Meta } = Card;

  const init = (keepTab = false) => {
    if (!keepTab) {
      setIsMounted(false);
      setProfile({});
      setCurrTab("CRAWLS");
      setIsEditMode(false);
      imageSelector.clear();
    }
    getProfile();
  };

  const verifyUsername = () => {
    if (username.trim().length === 0) {
      setUsernameError("Username is required");
    } else if (username.length < 8 || username.length > 20) {
      setUsernameError("Username has to be 8-20 characters long");
    } else if (!/[a-zA-Z0-9._]+/.test(username)) {
      setUsernameError("Username can only contain letters and numbers");
    } else {
      setUsernameError("");
    }
  };

  useEffect(() => {
    verifyUsername();
  }, [username]);

  useEffect(() => {
    init();
  }, [other_username]);

  useEffect(()=>{
    if (imageSelector?.errors.length > 0 && imageSelector.errors[0]?.fileSizeToolarge){
      toaster.danger("File too large")
    } else if (imageSelector?.errors.length > 0){
      toaster.danger("File cannot be read")
    }
  }, [imageSelector?.errors])

  if (!isMounted) return <div></div>;
  if (!profile?.username) {
    return (
      <Row style={{ justifyContent: "center", margin: "1rem" }}>
        <div>User not found</div>
        </Row>
    );
  }
  return (
    <div>
      <div key={1} style={{ padding: "32px" }}>
        <Row style={{ justifyContent: "center" }}>
        <div style={{position: "relative"}}>
          <div className="profile-circle">
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              src={(imageSelector?.filesContent || [])[0]?.content || profile.profile_pic || PlaceholderProfileImage}
              alt="Profile Image"
            />
            
          </div>
          {isEditMode && (
            <>
          {imageSelector?.filesContent?.length > 0 && (
          <Button danger style={{position:"absolute", top: 0, left: 0}} shape="circle" icon={<TrashIcon style={{marginTop: 2}} />} onClick={()=>imageSelector.clear()}/>)}
          <Button style={{position:"absolute", top: 0, right: 0}} shape="circle" icon={<EditIcon style={{marginTop: 2}} />} onClick={()=>openImageSelector()}/>
          </>
          )}
          </div>
        </Row>
        <Row style={{ justifyContent: "center" }}>
          {isEditMode ? (
            <>
              <Row style={{ width: "100%", justifyContent: "center" }}>
                <TextInput
                  style={{
                    fontWeight: "bold",
                    fontSize: 20,
                    height: 36,
                    width: "280px",
                    marginTop: 12,
                    marginBottom: 4,
                    textAlign: "center",
                  }}
                  name="username"
                  placeholder={profile.username}
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                  isInvalid={usernameError !== ""}
                />
              </Row>
              <Row style={{ width: "100%", justifyContent: "center" }}>
                <Text
                  size={300}
                  style={{
                    marginBottom: 12,
                  }}
                >
                  {usernameError}
                </Text>
              </Row>
            </>
          ) : (
            <h2>{profile.username}</h2>
          )}

          {/* <div>
                      <input
                        accept="image/*"
                        id="post-image"
                        name="image"
                        type="file"
                        onChange={handleChange}
                      />
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleUpload}
                      >
                        Upload
                      </Button>
                    </div> */}
        </Row>
        <Row style={{ justifyContent: "center" }}>
          {profile.is_self ? (
            <Button
              style={{ width: 280 }}
              size="small"
              type={isEditMode ? "primary" : undefined}
              onClick={() => {if(isEditMode){
                editProfile()
                // openImageSelector();
              } else{
                setUsername(profile.username);
                setUsernameError("");
                setIsEditMode(!isEditMode);
              }}}
              disabled={isEditMode && usernameError}
            >
              {isEditMode ? "Save changes" : "Edit Profile"}
            </Button>
          ) : (
            <>
              {profile.is_following ? (
                <Button
                  style={{ width: 280 }}
                  type="primary"
                  size="small"
                  onClick={() => unfollowRequest(profile.username)}
                >
                  Following
                </Button>
              ) : (
                <Button
                  style={{ width: 280 }}
                  size="small"
                  onClick={() => followRequest(profile.username)}
                >
                  Follow
                </Button>
              )}
            </>
          )}
        </Row>
        <Row style={{ justifyContent: "center" }}>
          <Tabs
            defaultActiveKey={currTab}
            centered
            items={[
              {
                label: `${profile?.crawls.length} Crawl${
                  profile?.crawls.length === 1 ? "" : "s"
                }`,
                key: "CRAWLS",
                // children: `Content of Tab Pane 1`,
              },
              {
                label: `${profile.followed_by.length} Follower${
                  profile?.followed_by?.length === 1 ? "" : "s"
                }`,
                key: "FOLLOWERS",
                // children: `Content of Tab Pane 2`,
              },
              {
                label: `${profile.following.length} Following`,
                key: "FOLLOWING",
                // children: `Content of Tab Pane 3`,
              },
            ]}
            onChange={setCurrTab}
          />
        </Row>
        <Row style={{ justifyContent: "center" }}>
          {currTab === "CRAWLS" && (
            <Row style={{ justifyContent: "center", maxWidth: "1000px" }}>
              {profile?.crawls?.length > 0 ? (
                profile?.crawls.map((x, index) => (
                  <Col>
                    <Card
                      className="profile-img-container user-own-profile"
                      style={{
                        display: "inline-block",
                        margin: "1rem",
                      }}
                      cover={x.picture && 
                        <img
                          className="profile-img my-profile-img"
                          alt="example"
                          src={x.picture}
                        />
                      }
                      // actions={[<HeartIcon />, <CommentIcon />]}
                    >
                      <Meta
                        title={<Link to={`/crawl/${x.id}`} style={{color: "#333"}}>{x.title}</Link>}
                        description={x.description}
                      />
                    </Card>
                  </Col>
                ))
              ) : (
                <Row style={{ margin: "1rem" }}>No Crawls yet</Row>
              )}
            </Row>
          )}
          {currTab === "FOLLOWERS" && (
            <Row style={{ justifyContent: "center", maxWidth: "1000px" }}>
              {profile?.followed_by?.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={profile.followed_by}
                  renderItem={(item, index) => (
                    <>
                      <Row
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          paddingBottom: 12,
                          paddingTop: 12,
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <Avatar
                          src={item.profile_pic || PlaceholderProfileImage}
                          style={{ marginRight: 16 }}
                        />
                        <div>
                          <Typography.Text
                            style={{ width: 200, marginRight: 16 }}
                            ellipsis
                          >
                            <Link to={`/profile/${item.username}`}>
                              {item.username}
                            </Link>
                          </Typography.Text>
                        </div>
                        {item.is_self ? (
                          <div style={{ width: 77 }} />
                        ) : (
                          <>
                            {item.is_following ? (
                              <Button
                                type="primary"
                                size="small"
                                style={{ width: 80 }}
                                onClick={() => unfollowRequest(item.username)}
                              >
                                Following
                              </Button>
                            ) : (
                              <Button
                                style={{ width: 80 }}
                                size="small"
                                onClick={() => followRequest(item.username)}
                              >
                                Follow
                              </Button>
                            )}
                          </>
                        )}
                      </Row>
                    </>
                  )}
                />
              ) : (
                <Row style={{ margin: "1rem" }}>No followers yet</Row>
              )}
            </Row>
          )}
          {currTab === "FOLLOWING" && (
            <Row style={{ justifyContent: "center", maxWidth: "1000px" }}>
              {profile?.following?.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={profile.following}
                  renderItem={(item, index) => (
                    <>
                      <Row
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          paddingBottom: 12,
                          paddingTop: 12,
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <Avatar
                          src={item.profile_pic || PlaceholderProfileImage}
                          style={{ marginRight: 16 }}
                        />
                        <div>
                          <Typography.Text
                            style={{ width: 200, marginRight: 16 }}
                            ellipsis
                          >
                            <Link to={`/profile/${item.username}`}>
                              {item.username}
                            </Link>
                          </Typography.Text>
                        </div>
                        {item.is_self ? (
                          <div style={{ width: 77 }} />
                        ) : (
                          <>
                            {item.is_following ? (
                              <Button
                                type="primary"
                                size="small"
                                style={{ width: 80 }}
                                onClick={() => unfollowRequest(item.username)}
                              >
                                Following
                              </Button>
                            ) : (
                              <Button
                                style={{ width: 80 }}
                                size="small"
                                onClick={() => followRequest(item.username)}
                              >
                                Follow
                              </Button>
                            )}
                          </>
                        )}
                      </Row>
                    </>
                  )}
                />
              ) : (
                <Row style={{ margin: "1rem" }}>
                  You are not following anyone yet
                </Row>
              )}
            </Row>
          )}
        </Row>
      </div>
    </div>
  );
}

export default Profile;
