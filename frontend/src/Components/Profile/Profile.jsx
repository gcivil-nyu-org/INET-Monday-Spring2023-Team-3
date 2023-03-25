import axios from "axios";
import {
  Pane,
  toaster,
} from "evergreen-ui";
import { Card, Space, Row, Col, Button, Input } from 'antd';
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import "./Profile.css"
import { EditIcon } from "evergreen-ui";

function Profile() {
  const history = useHistory();
  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
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
  const handleClickEditButton = () => {
    
    setIsEditMode(true)
  }

  const handleSubmitUpdate = async e => {
    e.preventDefault();
    
    let userinput = formData
    if (userinput.location.trim() === "" || userinput.dob.trim()===""){
        toaster.danger("Enter valid info 🙁");
        return
    }
    try {
        // await axios.post(
        //     `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/profile/`,
        //     {
        //         location: "New York"
        //     }
        //   );
        //   toaster.success("Changes saved!");
        //   history.replace("/profile");
    } catch(e) {
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
                            <div className="circle">
                                Image
                            </div>
                        </Col>
                        <Col span={20} style={{padding:"1rem"}}>
                            <div style={{padding:"0.5rem", fontSize:"1.4rem"}}>
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
                {/* {!isEditMode?<Button type="primary" onClick={handleClickEditButton}>
                    Edit Profile<span style={{paddingLeft:"4px",verticalAlign:"text-top" }}><EditIcon /></span>
                </Button>:
                <Button type="primary" onClick={handleSubmitUpdate}>
                Save changes
            </Button>} */}
            </Col>
            {!isEditMode?
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
                    {/* <Card title="Current Location" size="small">
                        <p>Lower East Side, New York</p>
                    </Card>
                    <Card title="Personal Info" size="small">
                        <p>Date of Birth</p>
                        <p>January 1, 1996</p>
                    </Card> */}
                </Space>
            </Col>
            :
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
                        <Input placeholder="Enter a new location"
                            type="location"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })} 
                        />
                        
                    </Card>
                    <Card title="Personal Info" size="small">
                        <p>Date of Birth</p>
                        <Input placeholder="Enter a new DOB"
                            type="dob"
                            id="dob"
                            name="dob"
                            value={formData.dob}
                            onChange={e => setFormData({ ...formData, dob: e.target.value })} 
                        />
                    </Card>
                </Space>
            </Col>}
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
                    <Card title="Saved Crawls" size="small" style={{height:"100%"}}>
                        No Saved crawls yet. Explore
                    </Card>
                </Space>
            </Col>
        </Row>
        
    </div>
  );
}

export default Profile;
