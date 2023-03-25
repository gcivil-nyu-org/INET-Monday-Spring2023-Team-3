import React from "react";
import axios from "axios";
import { Button, Pane, TextInput, Text } from "evergreen-ui";
import { useEffect, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import bg from "../../static/bg.jpg";
import Logo from "../../static/logo.svg";
import { toast } from "react-toastify";

function RecoverVerify() {
  const history = useHistory();
  const { token } = useParams();

  const [isMounted, setIsMounted] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);

  const verify = (force = false) => {
    if (!force && !hasSubmittedOnce) return;
    let flag = true;

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

  const sendNewPassword = async () => {
    if (!hasSubmittedOnce) setHasSubmittedOnce(true);
    if (verify(true)) {
      try {
        await axios.post(
          `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/update-password/`,
          {
            password,
            token,
          }
        );
        toast.success(
          "Your password has been updated. Please log in to continue."
        );
        history.replace("/login");
      } catch (e) {
        toast.error("Something went wrong 🙁");
      }
    }
  };

  useEffect(() => {
    verify();
  }, [password, hasSubmittedOnce]);

  const verifyToken = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/verify-recovery/`,
        {
          password,
          token,
        }
      );
      setIsMounted(true);
    } catch (e) {
      history.replace("/");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("jwt")) {
      history.replace("/");
    } else {
      verifyToken();
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
            <h1>Reset Password</h1>
            <p>Enter your new password below</p>
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
              onClick={sendNewPassword}
            >
              Update
            </Button>
            <p style={{ marginTop: 32 }}>
              Don&apos;t have an account?{" "}
              <Link to="/register">Create one!</Link>
            </p>
          </div>
        </div>
      </Pane>
    </>
  );
}

export default RecoverVerify;
