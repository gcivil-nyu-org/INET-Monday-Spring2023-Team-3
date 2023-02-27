import axios from "axios";
import { Button, Pane, TextInput, Text, InlineAlert } from "evergreen-ui";
import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import bg from "../../static/bg.jpg";
import Logo from "../../static/logo.svg";

function Login() {
  const history = useHistory();

  const [isMounted, setIsMounted] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);

  const register = async () => {
    if (!hasSubmittedOnce) setHasSubmittedOnce(true);
    try {
      const {
        data: { jwt },
      } = await axios.post(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/login/`,
        {
          username,
          password,
        }
      );
      localStorage.setItem("jwt", jwt);
      axios.defaults.headers.common["Authorization"] = jwt;
      history.push("/");
    } catch (e) {
      setError(true);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("jwt")) {
      history.replace("/");
    } else {
      setIsMounted(true);
    }
  }, []);

  if (!isMounted) return <div />;

  return (
    <>
      <div
        style={{
          position: "absolute",
          display: "flex",
          overflow: "hidden",
          width: "100vw",
          height: "100vh",
          alignItems: "flex-end",
          justifyContent: "flex-end",
        }}
      >
        <img
          src={bg}
          style={{
            width: "100vw",
            height: "100%",
            objectFit: "cover",
            objectPosition: "bottom",
          }}
        />
      </div>
      <Pane
        style={{
          zIndex: 2,
          position: "relative",
          height: "100vh",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            width: 700,
            height: "100%",
            backgroundColor: "#FFF",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            overflow: "scroll",
          }}
        >
          <img src={Logo} style={{ width: 300, margin: "128px 0" }} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              flexGrow: 2,
              marginTop: 32,
              marginBottom: 128,
            }}
          >
            <h1>Welcome!</h1>
            <p>Log in below to get started</p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <TextInput
                style={{ marginTop: 16 }}
                name="username"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <TextInput
                style={{ marginTop: 16 }}
                name="password"
                placeholder="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </div>
            <Button
              appearance="primary"
              style={{ marginTop: 16 }}
              onClick={register}
            >
              Log in
            </Button>
            {error && (
              <InlineAlert intent="danger" style={{ marginTop: 16 }}>
                Invalid username/password. Please try again.
              </InlineAlert>
            )}
            <p style={{ marginTop: 32 }}>
              Don't have an account? <Link to="/register">Create one!</Link>
            </p>
          </div>
        </div>
      </Pane>
    </>
  );
}

export default Login;
