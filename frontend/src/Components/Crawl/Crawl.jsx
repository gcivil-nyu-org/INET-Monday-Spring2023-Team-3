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
import PlaceholderProfileImage from "../../static/sample.jpg";
import convertDateHumanReadable from "./utils";
import {
    GoogleMap,
    StandaloneSearchBox,
    Marker,
    DirectionsRenderer,
  } from "@react-google-maps/api";


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
    title: "",
    description: "",
    data: "",
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


  const get_crawl_by_id = async () => {
    try {
        
        const { data } = await axios.get(
            `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/get_crawl_by_id/${crawl_id}/`
        );
        let formattedDate = convertDateHumanReadable(data.created_at)
        data.formattedDate = formattedDate;
        await setCrawlDetail(data);
        await setFormData(data);
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
