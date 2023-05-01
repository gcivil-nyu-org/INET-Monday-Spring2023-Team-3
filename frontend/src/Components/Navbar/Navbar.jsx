import { Button, Pane, Text } from "evergreen-ui";
import { useEffect, useState } from "react";
import { Link, matchPath, useHistory, useLocation } from "react-router-dom";
import NLogo from "../../static/n-logo.svg";

function Navbar() {
  const history = useHistory();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  const uniqueParam = new Date().getTime();

  const logout = () => {
    localStorage.removeItem("jwt");
    document.cookie = 'jwt=; Max-Age=-99999999;';  
    history.replace("/login");
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hiddenRoutes = [
    "/login",
    "/register",
    "/recover",
    "/google-redirect",
    "/404",
  ];

  const activeStyle = {fontWeight: "bold", color: "#2474AB"}

  if (!isMounted || hiddenRoutes.some((x) => location.pathname.startsWith(x)))
    return <div></div>;
  return (
    <Pane
      style={{
        padding: "12px 32px",
        borderBottom: "1px solid #DDD",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Pane style={{ padding: 0, margin: 0, height: 32 }}>
        <Link to="/">
          <img src={NLogo} style={{ height: "100%", margin: "0" }} />
        </Link>
      </Pane>
      <Pane style={{ flex: 2, marginLeft: 64 }}>
        <Link style={{ textDecoration: "none" }} to="/">
          <Text style={location.pathname === "/" ? activeStyle : {}}>Home</Text>
        </Link>
        <Link style={{ textDecoration: "none", marginLeft: 24 }} to="/create">
          <Text style={location.pathname === "/create" ? activeStyle : {}}>Create</Text>
        </Link>
        <Link
          style={{ textDecoration: "none", marginLeft: 24 }}
          to={`/profile/`}
        >
          <Text style={location.pathname.startsWith("/profile") ? activeStyle : {}}>Profile</Text>
        </Link>
        <Link
          style={{ textDecoration: "none", marginLeft: 24 }}
          to={`/random/`}
        >
          <Text style={location.pathname.startsWith("/random") ? activeStyle : {}}>Get a Random Crawl!</Text>
        </Link>
      </Pane>
      <Pane>
        <Button onClick={logout} appearance="minimal">
          Log out
        </Button>
      </Pane>
    </Pane>
  );
}

export default Navbar;
