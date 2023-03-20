import axios from "axios";
import { Pane, Heading } from "evergreen-ui";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Map from "../Map/Map";

function Home() {
  const history = useHistory();
  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState({});
  const [allCrawls, setAllCrawls] = useState([])

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

  const getAllCrawls = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/all/`
      );
      setAllCrawls(data)
    } catch (e) {
      // localStorage.removeItem("jwt");
      // history.replace("/login");
    }
  };

  useEffect(() => {
    getProfile();
    getAllCrawls()
  }, []);

  if (!isMounted) return <div></div>;
  return (
    <Pane style={{ padding: 32 }}>
      <h1>Welcome {profile.username}!</h1>
      <div>
        You used <strong>{profile.email}</strong> to register
      </div>
      <h1 style={{ marginTop: 36}}>All crawls</h1>
      <Pane style={{ marginTop: 24, width: "60%" }}>
        {allCrawls.map(x=>(
          <Pane><Heading size={800}>{x.title}</Heading>
          <Pane style={{ display: "flex" }}>
            <Map points={x.data.points} containerStyle={{ width: "100%", height: 400 }} setPoints={()=>{}}/>
            <Pane style={{ width: 500, height: 500, overflow: "scroll", marginTop: 14 }}>
            {x.data.points.map((p,idx)=>(
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
          </Pane>
        ))}
      </Pane>
    </Pane>
  );
}

export default Home;
