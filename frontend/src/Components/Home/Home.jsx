import { DirectionsRenderer, GoogleMap } from "@react-google-maps/api";
import axios from "axios";
import { Pane, Heading, Text, TimeIcon, SwapHorizontalIcon } from "evergreen-ui";
import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import {
  ClockCircleOutlined,
  SwapOutlined,
  SwapRightOutlined
} from "@ant-design/icons";
import Map from "../Map/Map";
import { secondsToHms, TRANSIT_TYPES } from "../../common";
import { Avatar, List } from "antd";
import { UserOutlined } from '@ant-design/icons';

function Home() {
  const history = useHistory();
  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState({});
  const [allCrawls, setAllCrawls] = useState([]);

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
    console.log('Map loaded:', map);
  };

  const getAllCrawls = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/all/`
      );
      setAllCrawls(data)
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
    <Pane style={{ padding: 32 }}>
     
      <Pane style={{ marginTop: 4, width: "60%" }}>
        {allCrawls.map((x, index) => (
          <Pane key={index}>
            <h2 style={{marginBottom:"0"}} size={800}>{index+1}. {x.title}</h2>
            <div>
              <h3 style={{marginLeft: "1rem", display: "inline-block"}}>
                <span style={{fontWeight:"normal"}}>by</span> 
                  <Link className="profile-author-name" to={`/profile/${x.author}`} style={{textDecoration:"auto"}}>{" "}{x.author}</Link>
              </h3>
            </div>
            <Pane style={{ display: "flex" }}>
              <GoogleMap
                key={index}
                mapContainerStyle={{ width: "100%", height: 400 }}
                zoom={14}
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
                <Pane
                  style={{
                    borderBottom: "1px solid #DDD",
                    padding: "16px",
                  }}
                >
                  <Heading size={700} style={{ marginBottom: 8 }}>
                    Crawl Stats
                  </Heading>
                  <div>Time: {secondsToHms(x.data.directions.time)}</div>
                  <div>
                    Distance: {(x.data.directions.distance / 1000).toFixed(1)}km
                  </div>
                </Pane>
                {x.data.points.map((p, idx) => (
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
                          {String.fromCharCode("A".charCodeAt(0) + idx)}.{" "}
                          {p.name}
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
                          }}>
                          
                          <div style={{ fontWeight: "bolder", fontSize: 12 }}>
                            <TimeIcon />
                            {" "}
                            { x.data.directions.routes[0].legs[idx - 1].duration.text}
                            <div style={{ height: 4 }} />
                            <SwapHorizontalIcon/>
                            Distance:
                            {" "}
                            {( x.data.directions.routes[0].legs[idx - 1].distance.value / 1000).toFixed(1)}km
                            
                          </div>
                        </Pane>
                      )}
                    </Pane>
                  </Pane>
                ))}
              </Pane>
            </Pane>
          </Pane>
        ))}
      </Pane>
    </Pane>
  );
}

export default Home;
