import axios from "axios";
import { Pane } from "evergreen-ui";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

function Home() {
  const history = useHistory();
  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState({});

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
    <Pane style={{ padding: 32 }}>
      <h1>Welcome {profile.username}!</h1>
      <div>
        You used <strong>{profile.email}</strong> to register
      </div>
    </Pane>
  );
}

export default Home;
