import { Button, Pane, Text } from "evergreen-ui";
import { useEffect, useState } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import NLogo from "../../static/n-logo.svg";

function Navbar() {
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);

  const logout = () => {
    localStorage.removeItem("jwt");
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
          <Text>Home</Text>
        </Link>
        <Link style={{ textDecoration: "none" }} to="/create">
          <Text style={{ marginLeft: 24 }}>Create</Text>
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
