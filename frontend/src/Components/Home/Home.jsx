import { DirectionsRenderer, GoogleMap } from "@react-google-maps/api";
import axios from "axios";
import {
  Pane,
  Heading,
  Text,
  TimeIcon,
  SwapHorizontalIcon,
} from "evergreen-ui";
import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { HeartOutlined, CommentOutlined } from "@ant-design/icons";
import Map from "../Map/Map";
import { convertDateHumanReadable, secondsToHms, TRANSIT_TYPES } from "../../common";
import { Avatar, Col, List, Row, Card } from "antd";
import { UserOutlined } from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import PlaceholderProfileImage from "../../static/sample.jpg";

function Home() {
  const history = useHistory();
  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState({});
  const [allCrawls, setAllCrawls] = useState(null);

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
  const handleLoad = (map) => {
    console.log("Map loaded:", map);
  };

  const getAllCrawls = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/all/`
      );
      setAllCrawls(data);
    } catch (e) {
      localStorage.removeItem("jwt");
      history.replace("/login");
    }
  };

  useEffect(() => {
    getProfile();
    getAllCrawls();
  }, []);
  if (!isMounted) return <div></div>;
  return (
    <Row style={{ justifyContent: "center" }}>
      <Row style={{ justifyContent: "center", maxWidth: "1000px" }}>
        {(!allCrawls || allCrawls.length === 0) && (
          <div style={{margin: "1rem"}}>No crawls posted yet</div>
        )}
        {allCrawls
          ?.slice(0)
          .reverse()
          .map((x, index) => (
            <Link to={`/crawl/${x.id}`}>
              <Col>
                <Card
                  className="profile-img-container user-own-profile"
                  style={{
                    display: "inline-block",
                    margin: "1rem",
                  }}
                  cover={
                    x.picture && (
                      <img
                        className="profile-img my-profile-img"
                        alt="example"
                        src={x.picture}
                        style={{}}
                      />
                    )
                  }
                  // actions={[<HeartOutlined />, <CommentOutlined />]}
                >
                  <Card.Meta title={x.title} description={x.description}/>
                  <Link to={`/profile/${x.author}`}>
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "#666",
                        fontSize: 14,
                        marginTop: 16,
                      }}
                    >
                      <Avatar
                        src={x.author_profile_pic || PlaceholderProfileImage}
                      />{" "}
                      {x.author}
                    </div>
                  </Link>
                  <div style={{color: "#aaa", marginTop: 8}}>
                    {convertDateHumanReadable(x.created_at)}
                  </div>
                </Card>
              </Col>
            </Link>
          ))}
      </Row>
    </Row>
  );
}

export default Home;
