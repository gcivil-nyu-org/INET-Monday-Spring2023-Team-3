import axios from "axios";
import { Button, Pane, TextInput, Text, InlineAlert } from "evergreen-ui";
import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import bg from "../../static/bg.jpg";
import Logo from "../../static/logo.svg";
import GoogleLogo from "../../static/google-logo.svg";
import OTP from "../OTP/OTP";
import Recover from "../Recover/Recover";

function Login() {
  const history = useHistory();

  const [isMounted, setIsMounted] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [showRecover, setShowRecover] = useState(false);

  const register = async () => {
    if (!hasSubmittedOnce) setHasSubmittedOnce(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/login/`,
        {
          username,
          password,
        }
      );
      if (data.jwt) {
        localStorage.setItem("jwt", data.jwt);
        axios.defaults.headers.common["Authorization"] = data.jwt;
        history.push("/");
      } else {
        setEmail(data.email);
        setShowOtp(true);
      }
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
          <img src={Logo} style={{ width: 300, margin: "128px 0 0" }} />
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
            {showRecover ? (
              <Recover />
            ) : (
              <>
                {showOtp ? (
                  <OTP email={email} />
                ) : (
                  <>
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
                    <Button
                      style={{ marginTop: 24 }}
                      onClick={() =>
                        (window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=631366351872-ehs9rde1ql2qdm3733upnsthnmpjj8k6.apps.googleusercontent.com&redirect_uri=${location.protocol}//${location.host}/google-redirect/&response_type=token&scope=https%3A//www.googleapis.com/auth/userinfo.email`)
                      }
                    >
                      <img
                        src={GoogleLogo}
                        style={{ height: 24, marginBottom: 1 }}
                      />
                      <div>Sign in with Google</div>
                    </Button>
                    <p style={{ marginTop: 32 }}>
                      Forgot password?{" "}
                      <a href="#" onClick={() => setShowRecover(true)}>
                        Click here!
                      </a>
                    </p>
                    <p style={{ marginTop: 32 }}>
                      Don't have an account?{" "}
                      <Link to="/register">Create one!</Link>
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </Pane>
    </>
  );
}

export default Login;
