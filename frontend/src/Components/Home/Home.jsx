import axios from "axios";
import { Button, Pane, Text } from "evergreen-ui";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

function Home() {
  const history = useHistory();
  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState({});
  const jwt = localStorage.getItem("jwt");

  const getProfile = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/profile/`
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

  const logout = () => {
    localStorage.removeItem("jwt");
    history.replace("/login");
  };
  if (!isMounted) return <div></div>;
  return (
    <Pane style={{ padding: 32 }}>
      <h1>Welcome {profile.username}!</h1>
      <div>
        You used <strong>{profile.email}</strong> to register
      </div>
      <Button style={{ marginTop: 32 }} onClick={logout}>
        Log out
      </Button>
    </Pane>
  );
}

export default Home;
