import { DirectionsRenderer, GoogleMap } from "@react-google-maps/api";
import axios from "axios";
import {
  Pane,
  Heading,
  Text,
  TimeIcon,
  SwapHorizontalIcon,
} from "evergreen-ui";
import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { HeartOutlined, CommentOutlined } from "@ant-design/icons";
import Map from "../Map/Map";
import {
  convertDateHumanReadable,
  secondsToHms,
  TRANSIT_TYPES,
} from "../../common";
import { Avatar, Col, List, Row, Card, Input, Pagination, Button } from "antd";
import ReactPaginate from "react-paginate";
import "./Random.css";
const { Search } = Input;

import { UserOutlined } from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import PlaceholderProfileImage from "../../static/sample.jpg";

function Random() {
  const history = useHistory();
  const [isMounted, setIsMounted] = useState(false);
  const [allCrawls, setAllCrawls] = useState(null);

  const [titleSearchRes, setTitleSearchRes] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [isSearch, setIsSearch] = useState(false);

  const getRandomCrawl = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/get_random_crawl/`
      );
      setAllCrawls(data?[data] : []);
      setIsMounted(true);
    } catch (e) {
      localStorage.removeItem("jwt");
      document.cookie = "jwt=; Max-Age=-99999999;";
      history.replace("/login");
    }
  };

  const onSearch = async (value) => {
    if (value === "") {
      setTitleSearchRes(null);
      setIsSearch(false);
      return;
    }
    try {
      if (isSearch === false) return;
      let { data } = await axios.get(
        `${
          process.env.REACT_APP_SERVER_URL_PREFIX
        }/api/crawls/get_random_filtered_crawl/${
          value || searchTerm
        }/`
      );
      if (value && searchTerm !== value) setSearchTerm(value);
      setTitleSearchRes(data? [data] : []);
    } catch (e) {
      setTitleSearchRes([]);
    }
  };

  useEffect(() => {
    getRandomCrawl();
  }, []);

  const renderCrawlCard = (x) => (
    <Col
      style={{
        margin: "1rem",
      }}
    >
      <Link to={`/crawl/${x.id}`}>
        <Card
          className="profile-img-container user-own-profile"
          style={{
            display: "inline-block",
          }}
          cover={
            x.id && (
              <img
                className="profile-img my-profile-img"
                alt="example"
                src={`${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/crawl_picture/${x.id}/`}
                style={{}}
              />
            )
          }
          // actions={[<HeartOutlined />, <CommentOutlined />]}
        >
          <Card.Meta title={x.title} description={x.description} />
          <Link to={`/profile/${x.author}`}>
            <div
              style={{
                fontWeight: "bold",
                color: "#666",
                fontSize: 14,
                marginTop: 16,
              }}
            >
              <Avatar src={x.author_profile_pic || PlaceholderProfileImage} />{" "}
              {x.author}
            </div>
          </Link>
          <div style={{ color: "#aaa", marginTop: 8 }}>
            {convertDateHumanReadable(x.created_at)}
          </div>
        </Card>
      </Link>
    </Col>
  );
  if (!isMounted) return <div></div>;
  return (
    <>
      <Row style={{ justifyContent: "center", alignItems: "center" }}>
        <Search
          placeholder="Get a random crawl based on your interests"
          allowClear
          onSearch={(x) => {
            onSearch(x)        
          }}
          onFocus={() => setIsSearch(true)}
          style={{ width: 500, marginTop: 32, marginBottom: 32 }}
        />
      </Row>
      {isSearch ? (
        <>
          <Row style={{ justifyContent: "center" }}>
            <Row style={{ justifyContent: "center", maxWidth: "1000px" }}>
              <h2 style={{ width: "100%", flex: 2, display: "flex" }}>
                {searchTerm && "Search Results:"}
              </h2>
            </Row>
          </Row>
          <Row style={{ justifyContent: "center", marginBottom: 64 }}>
            <Row style={{ justifyContent: "center", maxWidth: "1000px" }}>
              {!titleSearchRes || titleSearchRes?.length === 0 ? (
                <>
                  {titleSearchRes?.length === 0 && (
                    <div style={{ margin: "1rem" }}>No crawls found</div>
                  )}
                </>
              ) : (
                <>
                  {titleSearchRes?.map(renderCrawlCard)}
                </>
              )}
            </Row>
          </Row>
        </>
      ) : (
        <Row style={{ justifyContent: "center", marginBottom: 64 }}>
          <Row style={{ justifyContent: "center", maxWidth: "1000px" }}>
            {allCrawls?.length === 0 ? (
              <div style={{ margin: "1rem" }}>No crawls posted yet</div>
            ) : (
              <>
                {allCrawls?.map(renderCrawlCard)}
              </>
            )}
          </Row>
        </Row>
      )}
    </>
  );
}

export default Random;
