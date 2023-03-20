import axios from "axios";
import { Button, Pane, TextInput, Text, InlineAlert } from "evergreen-ui";
import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";

function OTP(props) {
  const history = useHistory();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [tries, setTries] = useState(0);

  const verify = async()=>{
    try {
        setTries(tries + 1)
        const {
          data: { jwt },
        } = await axios.post(
          `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/verify/`,
          {
            email: props.email,
            otp,
          }
        );
        localStorage.setItem("jwt", jwt);
        axios.defaults.headers.common["Authorization"] = jwt;
        history.push("/");
      } catch (e) {
        setError(e.response.data.error);
      }
  }

  const sendOTP = async()=>{
    try {
        setError(false);
        setTries(0);
        await axios.post(
          `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/send-otp/`,
          {
            email: props.email
          }
        );
        toast.success("OTP has been sent!");
      } catch (e) {
        toast.error("An account does not exist with that email");
      }
  }

  return (
    <>
        <h1>Verify your Email!</h1>
        <p>Enter the OTP sent to <strong>{props.email}</strong></p>
        <div style={{ display: "flex", flexDirection: "column" }}>
            <TextInput
            style={{ marginTop: 16 }}
            name="otp"
            placeholder="OTP"
            onChange={(e) => setOtp(e.target.value)}
            value={otp}
            />
        </div>
        <Button
            appearance="primary"
            style={{ marginTop: 16 }}
            onClick={verify}
        >
            Verify
        </Button>
        {error && (
            <InlineAlert intent="danger" style={{ marginTop: 16 }}>
            {error}
            </InlineAlert>
        )}
        {tries > 2 && (
            <p style={{ marginTop: 32 }}>
                <a href="#" onClick={sendOTP}>Re-send OTP</a>
            </p>
        )}
    </>
  );
}

export default OTP;
