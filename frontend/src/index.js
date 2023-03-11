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
    <React.StrictMode>
      <ToastContainer />
      <Router>
        <Switch>
          <PrivateRoute path="/" exact component={Home} />
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
  </Provider>
);
