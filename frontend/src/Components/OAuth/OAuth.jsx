import axios from "axios";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

function OAuth() {
  const history = useHistory();
  const login = async () => {
    try {
      const hash = window.location.hash.substr(1);
      const result = hash.split("&").reduce(function (res, item) {
        const parts = item.split("=");
        res[parts[0]] = parts[1];
        return res;
      }, {});

      const { data } = await axios.post(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/google-oauth/`,
        result
      );
      if (data.jwt) {
        localStorage.setItem("jwt", data.jwt);
        axios.defaults.headers.common["Authorization"] = data.jwt;
        history.push("/");
      } else {
        history.replace("/login");
      }
    } catch (e) {
      history.replace("/login");
    }
  };
  useEffect(() => {
    login();
  });
  return <div></div>;
}

export default OAuth;
