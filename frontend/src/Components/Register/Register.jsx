import axios from "axios";
import { Button, Pane, TextInput, Text } from "evergreen-ui";
import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import bg from "../../static/bg.jpg";
import Logo from "../../static/logo.svg";
import { toast } from "react-toastify";

function Register() {
  const history = useHistory();

  const [isMounted, setIsMounted] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isFormInvalid, setIsFormInvalid] = useState(true);
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);

  const verify = (force = false) => {
    if (!force && !hasSubmittedOnce) return;
    let flag = true;
    if (username.trim().length === 0) {
      setUsernameError("Username is required");
      flag = false;
    } else if (username.length < 8 || username.length > 20) {
      setUsernameError("Username has to be 8-20 characters long");
      flag = false;
    } else if (!/[a-zA-Z0-9._]+/.test(username)) {
      setUsernameError("Username can only contain letters and numbers");
      flag = false;
    } else {
      setUsernameError("");
    }

    if (email.trim().length === 0) {
      setEmailError("Email is required");
      flag = false;
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError("Invalid email");
      flag = false;
    } else {
      setEmailError("");
    }

    if (password.trim().length === 0) {
      setPasswordError("Password is required");
      flag = false;
    } else if (password.length < 8) {
      setPasswordError("Password too short");
      flag = false;
    } else if (password.length > 40) {
      setPasswordError("Password too long");
      flag = false;
    } else {
      setPasswordError("");
    }

    return flag;
  };

  const register = async () => {
    if (!hasSubmittedOnce) setHasSubmittedOnce(true);
    if (verify(true)) {
      try {
        await axios.post(
          `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/register/`,
          {
            username,
            email,
            password,
          }
        );
        toast.success(
          "Your account has been registered. Please log in to continue."
        );
        history.replace("/login");
      } catch (e) {
        toast.error("Something went wrong 🙁");
      }
    }
  };

  useEffect(() => {
    verify();
  }, [username, email, password, hasSubmittedOnce]);

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
            <h1>Welcome!</h1>
            <p>Sign up below to get started</p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <TextInput
                style={{ marginTop: 16 }}
                name="username"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                isInvalid={usernameError !== ""}
              />
              <Text size={300}>{usernameError}</Text>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <TextInput
                style={{ marginTop: 16 }}
                name="email"
                placeholder="Email"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                isInvalid={emailError !== ""}
              />
              <Text size={300}>{emailError}</Text>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <TextInput
                style={{ marginTop: 16 }}
                name="password"
                placeholder="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                isInvalid={passwordError !== ""}
              />
              <Text size={300}>{passwordError}</Text>
            </div>
            <Button
              appearance="primary"
              style={{ marginTop: 16, marginBottom: 32 }}
              onClick={register}
            >
              Register
            </Button>
            <p>
              Already have an account? <Link to="/login">Login here!</Link>
            </p>
          </div>
        </div>
      </Pane>
    </>
  );
}

export default Register;
