import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import ErrorPage from "./error-page";
import Register from "./Components/Register/Register";
import { Provider } from "react-redux";
import store from "./app/store";
import Login from "./Components/Login/Login";
import decode from "jwt-decode";
import Home from "./Components/Home/Home";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import RecoverVerify from "./Components/RecoverVerify/RecoverVerify";
import OAuth from "./Components/OAuth/OAuth";
import { LoadScript } from "@react-google-maps/api";
import Navbar from "./Components/Navbar/Navbar";
import Create from "./Components/Create/Create";
import Profile from "./Components/Profile/Profile";

axios.interceptors.request.use(function (config) {
  const token = localStorage.getItem("jwt");
  config.headers.Authorization = token;

  return config;
});

const isAuthenticated = () => {
  const jwt = localStorage.getItem("jwt");
  try {
    decode(jwt);
    return true;
  } catch (error) {
    localStorage.removeItem("jwt");
    return false;
  }
};

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated() ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
            }}
          />
        )
      }
    />
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <LoadScript
      libraries={["places"]}
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API}
    >
      <React.StrictMode>
        <ToastContainer />
        <Router>
          <Navbar />
          <Switch>
            <PrivateRoute path="/" exact component={Home} />
            <PrivateRoute path="/create" exact component={Create} />
            <PrivateRoute path="/profile" exact component={Profile} />
            <Route exact path="/register">
              <Register />
            </Route>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact path="/recover/:token">
              <RecoverVerify />
            </Route>
            <Route path="/google-redirect/">
              <OAuth />
            </Route>
            <Route path="/404" component={ErrorPage} />
            <Redirect to="/404" />
          </Switch>
        </Router>
      </React.StrictMode>
    </LoadScript>
  </Provider>
);
