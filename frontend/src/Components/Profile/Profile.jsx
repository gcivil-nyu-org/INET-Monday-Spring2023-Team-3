import axios from "axios";
import {
  Heading,
  Pane,
  SearchInput,
  Text,
  TextInput,
  toaster,
} from "evergreen-ui";
import { Card, Space, Row, Col, Button } from 'antd';
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import Map from "../Map/Map";
import { GoogleMap, StandaloneSearchBox, Marker } from "@react-google-maps/api";
import "./Profile.css"
import { EditIcon } from "evergreen-ui";

function Profile() {
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    current_location: '',
    dob: ''
  });


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



  if (!isMounted) return <div></div>;
  return (
    <div style={{padding:"32px"}}>
     
        <Card size="small" style={{margin:"0.5rem"}}>
            <Row style={{}}>
                <Col span={24}>
                    <Row>
                        <Col span={4}>
                            <div class="circle">
                                Image
                            </div>
                        </Col>
                        <Col span={20} style={{padding:"1rem"}}>
                            <div style={{padding:"0.5rem"}}>
                                {profile.username}
                            </div>
                            <div style={{padding:"0.5rem"}}>
                                Member since 2023
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Card>
        
        <Row style={{paddingTop:"1rem"}}>
            <Col span={24} style={{padding:"0.5rem"}}>
                <Button type="primary">Edit Profile<span style={{paddingLeft:"4px",verticalAlign:"text-top" }}><EditIcon /></span></Button>
            </Col>
            
            <Col span={8} style={{padding:"0.5rem"}}>
                <Space
                    direction="vertical"
                    size="middle"
                    style={{
                        display: 'flex',
                    }}>
                       
                    <Card title="Email" size="small">
                        <p>{profile.email}</p>
                    </Card>
                    <Card title="Current Location" size="small">
                        <p>Lower East Side, New York</p>
                    </Card>
                    <Card title="Personal Info" size="small">
                        <p>Date of Birth</p>
                        <p>January 1, 1996</p>
                    </Card>
                </Space>
            </Col>
            <Col span={16} style={{padding:"0.5rem"}}>
                <Space
                    direction="vertical"
                    size="middle"
                    style={{
                        display: 'flex',
                    }}>
                    <Card title="My Connections" size="small" style={{height:"100%"}}>
                        No connections yet
                    </Card>
                </Space>
            </Col>
        </Row>
        
    </div>
  );
}

export default Profile;
