import axios from "axios";

import { Pane, toaster, Text, ChevronDownIcon, Heading } from "evergreen-ui";
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
import {
  GoogleMap,
  useLoadScript,
  StandaloneSearchBox,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import PlaceholderProfileImage from "../../static/sample.jpg";


function Crawl(props) {

  const { crawl_id } = useParams();
  const history = useHistory();
  const [isMounted, setIsMounted] = useState(false);
  const [crawlDetail, setCrawlDetail] = useState({});
  
  const [profile, setProfile] = useState({});
  const [isCurrUserAuthor, setIsCurrUserAuthor] = useState(false);

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
    console.log("H")
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

  const get_crawl_by_id = async () => {
    try {
        
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/get_crawl_by_id/${crawl_id}/`
      );
      await setCrawlDetail(data);
      return data;
      

    //   if (data.username === other_username) {
    //     history.replace("/");
    //   }
    //   setCrawldetail((prevCrawlDetail) => ({
    //   }));
      
    } catch (e) {
      console.log(e);
      //history.replace("/");
    }
  };

  const handleClickEditButton = () => {
    setIsEditMode(true);
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


  const getData = async () => {
    // await getProfile();
    // await get_crawl_by_id();
    getProfile().then((currUserProfile)=>{
        get_crawl_by_id().then((currCrawl)=>{
            if (currUserProfile.username == currCrawl.author){
                console.log("Curr user is the author of this crawl. ");
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
            </div>

        </div>
    </div>
  );
}

export default Crawl;
