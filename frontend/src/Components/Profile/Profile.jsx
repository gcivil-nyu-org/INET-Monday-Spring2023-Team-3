import axios from "axios";

import { Pane, toaster, Text, ChevronDownIcon } from "evergreen-ui";
import { Card, Space, Row, Col, Button, Input, Dropdown, Avatar, List } from "antd";
import { useEffect, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import "./Profile.css";
import { EditIcon } from "evergreen-ui";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  GoogleMap,
  useLoadScript,
  StandaloneSearchBox,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";



function Profile(props) {
  const refreshParam = new URLSearchParams(props.location.search).get('r');

  const { other_username } = useParams();
  const history = useHistory();
  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState({});
  const [otherUserProfile, setOtherUserProfile] = useState({});

  const [isEditMode, setIsEditMode] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [formData, setFormData] = useState({
    location: "", dob: "", short_bio: "",
  });

  const [center, setCenter] = useState(null);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCurrUserFollowsOtherUser, setCurrUserFollowsOtherUser] = useState(false)
  
  const [allCrawls, setAllCrawls] = useState([]);

  const handleSuccess = (position) => {
    const { latitude, longitude } = position.coords;
    setIsDisabled(false)
    setCenter({ lat: latitude, lng: longitude});
    setLocation({lat: latitude, lng: longitude });
    setIsLoading(false);
    
  };
  const handleError = (error) => {
    setError(error.message);
    setIsDisabled(false)
    setIsLoading(false);
  };
  const handleLoad = (map) => {
    console.log('Map loaded:', map);
  };
  const handleMapClick = ({ latLng }) => {
    setCenter({ lat: latLng.lat(), lng: latLng.lng() });
  };
  const mapContainerStyle = {
    width: '100%',
    height: '250px'
  };

  const handleGetLocation = () => {
    setIsLoading(true);
    setIsDisabled(true)
    
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  }


  const dateFormat = 'YYYY-MM-DD'
  const updateFields = (date, dateString) => {
    setFormData({ ...formData, dob: dateString.replaceAll("/","-") })
  }


  const getOtherUserProfile = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/get_other_user_profile/${other_username}/`
      );
      setOtherUserProfile(data);
      let numFollowers = 0;
      let numFollowing = 0;
      let listFollowers = []
      let listFollowing = []
      if (data.followed_by.length > 0) {
        listFollowers = data.followed_by.split(" ")
        numFollowers = listFollowers.length
      }
      if (data.following.length > 0) {
        listFollowing = data.following.split(" ")
        numFollowing = listFollowing.length
      }
      
      setOtherUserProfile(prevProfile => ({ ...prevProfile, numFollowers, numFollowing, listFollowers, listFollowing }));
      
      setIsMounted(true);
    } catch (e) {
      history.replace("/");
      console.log(e)
    }
  };

  const findUserInfoByUsername = async (username) => {
    let ans = ""
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/get_other_user_profile/${username}/`
      );
      ans = data
      
    } catch(e) {
      console.log(e)
    }
    return ans
  }
  

  const getProfile = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/full_profile/`
      );
      setProfile(data);
      
      if (data.username === other_username){
        history.replace("/profile/myprofile");
      }
     
      let numFollowers = 0;
      let numFollowing = 0;
      let listFollowers = []
      let listFollowing = []
      if (data.followed_by.length > 0) {
        listFollowers = data.followed_by.split(" ")
        numFollowers = listFollowers.length
      }
      if (data.following.length > 0) {
        listFollowing = data.following.split(" ")
        numFollowing = listFollowing.length
      }
      if (other_username !== "myprofile" && listFollowing.includes(other_username)){
        setCurrUserFollowsOtherUser(true)
      }

      setFormData({short_bio: data.short_bio})
      // fetch followers and following users profiles
      let listFollowersData = []
      for (let i = 0; i < listFollowers.length; i++){
        let ans;
        ans = await findUserInfoByUsername(listFollowers[i])
        listFollowersData.push(ans)
      }
      let listFollowingData = []
      for (let i = 0; i < listFollowing.length; i++){
        let ans;
        ans = await findUserInfoByUsername(listFollowing[i])
        listFollowingData.push(ans)
      }
      
      setProfile(prevProfile => ({ ...prevProfile, numFollowers, numFollowing, listFollowers, listFollowing, listFollowersData, listFollowingData }));
      if (other_username === "myprofile"){
        setIsMounted(true);
      }
     
    } catch (e) {
      console.log(e)
      history.replace("/");
    }
  };
  const checkIfUserIsFollowing = () => {
    if (otherUserProfile.listFollowers.includes(profile.username)){
      return true
    } else {
      return false
    }
  }
  
  const handleClickEditButton = () => {
    setIsEditMode(true);
  };

  const handleSubmitUpdate = async (e) => {

    e.preventDefault();

    let userinput = formData;
    if ( userinput.short_bio === null || userinput.short_bio === "") {
      toaster.danger("Error: Please enter valid information! 🙁");
      return;
    }
    try {
      
      await axios.post(
          `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/update-user-info/`,
          {
              short_bio: userinput.short_bio,
              target_username: profile.username
          }
        );
        toaster.success("Changes saved!");
        setIsEditMode(false)
        setProfile(prevProfile => ({ ...prevProfile, short_bio: userinput.short_bio }));
        

    } catch (e) {
      console.log(e)
    }
  };

  const followRequest = async (target_username) => {
    try {
      await axios.post(
          `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/request-follow/`,
          {
            target_address: target_username,
            self_address:profile.username
          }
        );
        toaster.success("Changes saved!");

        let oldListFollowing = profile.listFollowing
        oldListFollowing.push(other_username)
        setProfile(prevProfile => ({ ...prevProfile, listFollowing: oldListFollowing, numFollowing: prevProfile.numFollowing+1 }));
        
        let oldListFollowers = otherUserProfile.listFollowers
        oldListFollowers.push(profile.username);
        setOtherUserProfile(prevProfile => ({...prevProfile, listFollowers: oldListFollowers, numFollowers: prevProfile.numFollowers+1 }))
        
        setCurrUserFollowsOtherUser(true)
        
        
    } catch (e) {
      console.log(e)

    }
  }


  const unfollowRequest = async (target_username) => {
    try {
      await axios.post(
          `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/request-unfollow/`,
          {
            target_address: target_username,
            self_address:profile.username
          }
        );
        toaster.success("Unfollow request successful.");
        

        let oldListFollowing = profile.listFollowing
        const index = oldListFollowing.indexOf(other_username);
        const x = oldListFollowing.splice(index, 1);
        setProfile(prevProfile => ({ ...prevProfile, listFollowing: x, numFollowing: prevProfile.numFollowing-1 }));
        
        let oldListFollowers = otherUserProfile.listFollowers
        const index2 = oldListFollowers.indexOf(profile.username);
        const y = oldListFollowers.splice(index2, 1);
        setOtherUserProfile(prevProfile => ({...prevProfile, listFollowers: y, numFollowers: prevProfile.numFollowers-1 }))
        setCurrUserFollowsOtherUser(false)
      } catch (e) {
      console.log(e)
    }
  }
  const items = [
    {
      label: <a onClick={() => unfollowRequest(other_username)}>Unfollow</a>,
      key: '0',
    },
  ]
  // TODO: Filter crawls by author name that matches current profile username
  const getAllCrawls = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/all/`
      );
      
      arr = []
      // if (data.length > 0){
      //   for (let i = 0; i < data.length; i++) {
      //     console.log(data[i]);
      //     if (other_username === "myprofile") {
      //       if (data[i].author === profile.username){
      //         arr.push(data[i])
      //       }
      //     } else {
      //       if (data[i].author === other_username){
      //         arr.push(data[i])
      //       }
      //     }
      //   }
      // }
      setAllCrawls(data);
    } catch (e) {
      // history.replace("/login");
    }
  };

  useEffect(() => {
    getAllCrawls().then(() => {

      getProfile().then(() => {
        if (other_username !== "myprofile"){
          getOtherUserProfile();
        }
        
      });
    })
    
  }, [refreshParam]);

  if (!isMounted) return <div></div>;
  return (
    <div>
    {other_username === "myprofile" ? 

    // current user's profile version

    <div key={1} style={{ padding: "32px" }}>
      <Card size="small" style={{ margin: "0.5rem" }}>
        <Row>
          {/* <Col span={24}>
            <Row>
              <Col span={4}>
                <div className="circle">Image</div>
              </Col>
              <Col span={20} style={{ padding: "1rem" }}>
                <div style={{ padding: "0.5rem", fontSize: "1.4rem" }}>
                  {profile.username}
                </div>
                <div style={{ padding: "0.5rem" }}>Member since 2023</div>
              </Col>
            </Row>
          </Col> */}
          <Col span={24}>
            <Row>
              <Col span={4}>
                <div className="circle">Image</div>
              </Col>
              <Col span={20} style={{ padding: "1rem" }}>
              <Row>
                <Col span={4}>
                  <h2>{profile.username}</h2>
                </Col>
                <Col span={12}>
                  <div>
                    <div style={{maxWidth:"150px", cursor:"pointer"}} className="">
                    {!isEditMode?
                      <Button type="primary" onClick={handleClickEditButton}>
                        Edit Profile<span style={{paddingLeft:"4px",verticalAlign:"text-top" }}><EditIcon /></span>
                      </Button>:
                        <Button type="primary" onClick={handleSubmitUpdate}>
                          Save changes
                      </Button>}
                    </div>
                  </div>
                  <div className="smaller-badges-div">
                    <div className="smaller-badges">
                      Posts <span>0</span>
                    </div>
                    <div className="smaller-badges">
                      Followers <span>{profile.numFollowers}</span>
                    </div>
                    <div className="smaller-badges">
                      Following <span>{profile.numFollowing}</span>
                    </div>
                  </div>
                  <div className="bio">
                    <div>
                      <div>{profile.short_bio ? profile.short_bio : ""}</div>
                    </div>
                  </div>
                </Col>
              </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Row style={{ paddingTop: "1rem" }}>
        <Col span={24} style={{ padding: "0.5rem" }}>
        
          
        </Col>
        
        <Col span={8} style={{ padding: "0.5rem" }}>
            <Space
              direction="vertical"
              size="middle"
              style={{
                display: "flex",
              }}
            >
              <Card title="Email" size="small">
                <p>{profile.email}</p>
              </Card>
              <Card title="Current Location" size="small">
                
                {center && <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  onClick={handleMapClick}
                  zoom={14}
                  onLoad={handleLoad}
                >
                <Marker 
                  position={center} 
                  icon= {{
                    url: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
                    scaledSize: new google.maps.Size(50, 50)
                  }}
                  center={
                    {
                      lat: 40.723301,
                      lng: -74.002988,
                    }
                  }
                  title="your location" 
                  label="A" />
                </GoogleMap>}
                
                {!center && 
                <Button disabled={isDisabled} onClick={handleGetLocation}>
                    {isLoading ? "Loading..." : "Get My Location"}
                </Button>}
              </Card>
             
              {!isEditMode ? (
              <Card title="Short Bio" size="small">
                <div>
                  <p>{profile.short_bio ? profile.short_bio : "No data yet"}</p>
                </div>
              </Card>):(
              <Card title="Short Bio" size="small">
                <textarea
                  placeholder="Enter a short bio about yourself"
                  type="text"
                  id="short_bio"
                  name="Short Bio"
                  value={formData.short_bio}
                  onChange={(e) =>
                    setFormData({ ...formData, short_bio: e.target.value })
                  }
                />
                </Card>)
              }
            </Space>
          </Col>
        
        <Col span={16} style={{ padding: "0.5rem" }}>
          <Space
            direction="vertical"
            size="middle"
            style={{
              display: "flex",
            }}
          >
            <Card
              title="My Followers"
              size="small"
              style={{ height: "100%" }}
            >
            {(profile && profile.listFollowersData && profile.listFollowersData.length > 0 ) ? 
              <List
                itemLayout="vertical"
                dataSource={profile.listFollowersData}
                renderItem={(item, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={`https://www.seekpng.com/png/detail/110-1100707_person-avatar-placeholder.png`} />}
                      title={<a href={`/profile/${item.username}`}>{item.username}</a>}
                      description={item.short_bio}
                    />
                  </List.Item>
                  )}
              />:
              <span>No followers yet</span>}
            </Card>
            <Card
              title="Following"
              size="small"
              style={{ height: "100%" }}
            >
            
            {(profile && profile.listFollowingData && profile.listFollowingData.length > 0 ) ? 
            <List
                itemLayout="vertical"
                dataSource={profile.listFollowingData}
                renderItem={(item, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={`https://www.seekpng.com/png/detail/110-1100707_person-avatar-placeholder.png`} />}
                      title={<a href={`/profile/${item.username}`}>{item.username}</a>}
                      description={item.short_bio}
                    />
                  </List.Item>
                  )}
              />:
              <span>You are not following anyone yet</span>}
            
            </Card>
            <Card title="Saved Crawls" size="small" style={{ height: "100%" }}>
              No Saved crawls yet <a href="/">Explore</a>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
    :
    
  //  Exploring other user's profile version

    <div key={2} style={{ padding: "32px" }}>
      <Card size="small" style={{ margin: "0.5rem", border: "none" }}>
        <Row>
          <Col span={24}>
            <Row>
              <Col span={4}>
                <div className="circle">Image</div>
              </Col>
              <Col span={20} style={{ padding: "1rem" }}>
              <Row>
                <Col span={4}>
                  <h2>{other_username}</h2>
                </Col>
                <Col span={12}>
                  <div>
                    <div style={{maxWidth:"150px", cursor:"pointer"}} className="follow-badge">
                      {isCurrUserFollowsOtherUser ? 
                      <Text className="follow"> 
                      <Dropdown menu={{ items }} trigger={['click']}>
                          <a onClick={(e) => e.preventDefault()}>
                              Following <ChevronDownIcon />
                          </a>
                      </Dropdown>
                      </Text>
                      :
                      <button style={{cursor:"pointer", border:0}} onClick={() => followRequest(other_username)}><Text className="follow">Follow</Text></button>}
                    </div>
                  </div>
                  <div className="smaller-badges-div">
                    <div className="smaller-badges">
                      Posts <span>0</span>
                    </div>
                    <div className="smaller-badges">
                      Followers <span>{otherUserProfile.numFollowers}</span>
                    </div>
                    <div className="smaller-badges">
                      Following <span>{otherUserProfile.numFollowing}</span>
                    </div>
                  </div>
                  <div className="bio">
                    <div>
                      <div>{otherUserProfile.short_bio ? otherUserProfile.short_bio : "No data yet"}</div>
                    </div>
                  </div>
                </Col>
              </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Row style={{ paddingTop: "1rem", padding: "12px" }}>
        <div><h2>Crawls</h2></div>
        
        {allCrawls.map((x) => (
          <Col span={8}>
            <h3>{x.author}</h3>
            <h3 size={800}>{x.title}</h3>
            <Pane style={{ display: "flex" }}>
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: 400 }}
                zoom={10}
              >
                <DirectionsRenderer
                  options={{
                    directions: x.data.directions,
                  }}
                />
              </GoogleMap>
              <Pane
                style={{
                  width: 500,
                  height: 500,
                  overflow: "scroll",
                  marginTop: 14,
                }}
              >
                {x.data.points.map((p, idx) => (
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
                      {String.fromCharCode("A".charCodeAt(0) + idx)}. {p.name}
                    </Heading>
                  </Pane>
                ))}
              </Pane>
            </Pane>
          </Col>
        ))}
        {/* <Col span={8}>
        </Col>
        <Col span={8}>
        </Col> */}
     
      </Row>
    </div>
    }
    </div>
  );
}

export default Profile;
