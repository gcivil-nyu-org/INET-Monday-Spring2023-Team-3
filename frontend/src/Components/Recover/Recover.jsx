import axios from "axios";
import { Button, Pane, TextInput, Text, InlineAlert } from "evergreen-ui";
import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";

function Recover() {
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [sent, setSent] = useState(false);

  const recover = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/recover/`,
        {
          username,
        }
      );
    } catch (e) {}
    setSent(true);
  };

  return (
    <>
      <h1>Forgot your password?</h1>
      {sent ? (
        <p style={{padding: "0 64px", textAlign:"center", fontWeight: "bold"}}>
          If you have an account with us, an email will be sent to you with
          instructions to reset your password.
        </p>
      ) : (
        <>
          <p>Enter your username!</p>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <TextInput
              style={{ marginTop: 16 }}
              name="username"
              placeholder="username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          </div>
          <Button
            appearance="primary"
            style={{ marginTop: 16 }}
            onClick={recover}
          >
            Submit
          </Button>
        </>
      )}
      <p style={{ marginTop: 32 }}>
        Don't have an account? <Link to="/register">Create one!</Link>
      </p>
    </>
  );
}

export default Recover;
