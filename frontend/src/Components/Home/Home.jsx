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
import { Avatar, Col, List, Row, Card, Input } from "antd";
import ReactPaginate from 'react-paginate';
import "./Home.css";
const { Search } = Input;

import { UserOutlined } from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import PlaceholderProfileImage from "../../static/sample.jpg";

function Home() {
  const history = useHistory();
  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState({});
  const [allCrawls, setAllCrawls] = useState(null);

  const [titleSearchRes, setTitleSearchRes] = useState(null);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 3;
  const endOffset = itemOffset + itemsPerPage;
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [lengthAllCrawls, setLengthAllCralws] = useState(0);

  const [itemOffsetSearchResult, setItemOffsetSearchResult] = useState(0);
  
  const [currentItemsSearchResult, setCurrentItemsSearchResult] = useState([]);
  const [pageCountSearchResult, setPageCountSearchResult] = useState(0);
  const [lengthAllCrawlsSearchResult, setLengthAllCralwsSearchResult] = useState(0);


  const getProfile = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/auth/profile/`
      );
      setProfile(data);
      setIsMounted(true);
    } catch (e) {
      localStorage.removeItem("jwt");
      history.replace("/login");
    }
  };
  const handleLoad = (map) => {
    console.log("Map loaded:", map);
  };
  useEffect(() => {
    if (titleSearchRes === null){
      setItemOffset(0);
    }
  }, [titleSearchRes]);

  const getAllCrawls = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/all/`
      );
      setAllCrawls(data);
      setLengthAllCralws(data.length);
      handlePaging(data);
    } catch (e) {
      localStorage.removeItem("jwt");
      history.replace("/login");
    }
  };
  const handlePaging = async(data) => {
    const slicedItems = data.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(data.length / itemsPerPage);
    setCurrentItems(slicedItems);
    setPageCount(pageCount);
  }
  const handlePagingWithSearch = async(data) => {
    // console.log(data)
    let new_itemOffsetSearchResult = 0;
    const search_res_slicedItems = data.slice(new_itemOffsetSearchResult, new_itemOffsetSearchResult + itemsPerPage);
    const search_res_pageCount = Math.ceil(data.length / itemsPerPage);
    setItemOffsetSearchResult(new_itemOffsetSearchResult)
    setCurrentItemsSearchResult(search_res_slicedItems);
    setPageCountSearchResult(search_res_pageCount);
  }

  const onChangeSearchbar = (event) => {
    console.log(event.target)
  }
  const onSearch = async (value) => {
    if (value === "") {
      setTitleSearchRes(null);
      return;
    }
    try {
      let { data: titleData } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/search_crawls_by_title/${value}/`
      );
      setTitleSearchRes(titleData);
      handlePagingWithSearch(titleData);
      setLengthAllCralwsSearchResult(titleData.length)
    } catch (e) {
      setTitleSearchRes([]);
    }
  };

  const renderCrawlCard = (x) => (
    <Link to={`/crawl/${x.id}`}>
      <Col>
        <Card
          className="profile-img-container user-own-profile"
          style={{
            display: "inline-block",
            margin: "1rem",
          }}
          cover={
            x.picture && (
              <img
                className="profile-img my-profile-img"
                alt="example"
                src={x.picture}
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
      </Col>
    </Link>
  );
  
   // Invoke when user click to request another page.
   const handleNextClick = (event) => {
    let newOffset = itemOffset;
    if (event.selected * itemsPerPage >= 0 && event.selected * itemsPerPage <= lengthAllCrawls ){
      newOffset = event.selected * itemsPerPage;
    }
    const slicedItems = allCrawls.slice(itemOffset, endOffset);
    setCurrentItems(slicedItems);
    setItemOffset(newOffset);
  };
   const handleNextClickSearchResult = (event) => {
    let newOffset = itemOffsetSearchResult;
    if (event.selected * itemsPerPage >= 0 && event.selected * itemsPerPage <= lengthAllCrawlsSearchResult ){
      newOffset = event.selected * itemsPerPage;
    }
    const slicedItems = titleSearchRes.slice(newOffset, newOffset+itemsPerPage);
    setCurrentItemsSearchResult(slicedItems);
    setItemOffsetSearchResult(newOffset);
  };


  useEffect(() => {
    getProfile();
    getAllCrawls();
  }, [itemOffset, endOffset]);
  if (!isMounted) return <div></div>;
  return (
    <>
      <Row style={{ justifyContent: "center", alignItems: "center" }}>
        <Search
          placeholder="Search crawls"
          allowClear
          onSearch={onSearch}
          onChange = {onChangeSearchbar}
          style={{ width: 500, marginTop: 32, marginBottom: 32 }}
        />
      </Row>
      <Row style={{ justifyContent: "center" }}>
        <Row style={{ justifyContent: "center", maxWidth: "1000px" }}>
          {titleSearchRes?.length === 0 && (
            <div style={{ marginBottom: "1rem" }}>
              No crawls found. Explore crawls below.
            </div>
          )}
          {/* {titleSearchRes?.map(renderCrawlCard)} */}
          {
          titleSearchRes && currentItemsSearchResult?.slice(0).map(renderCrawlCard)}
          {titleSearchRes &&
          <div style={{width: "100%"}}>
          <div className="pagination-strip" >
              <ReactPaginate
                className="page-bar"
                breakLabel="..."
                nextLabel="next >"
                pageCount={pageCountSearchResult}
                previousLabel="< previous"
                renderOnZeroPageCount={null}
                onPageChange={handleNextClickSearchResult}
                pageRangeDisplayed={5}
                activeClassName="active"
                />
            </div>
            </div>}

        </Row>
      </Row>
      {(titleSearchRes === null || titleSearchRes.length === 0) && (
        <Row style={{ justifyContent: "center" }}>
          <Row style={{ justifyContent: "center", maxWidth: "1000px" }}>
            {allCrawls?.length === 0 && (
              <div style={{ margin: "1rem" }}>No crawls posted yet</div>
            )}
            {/* {titleSearchRes?.map(renderCrawlCard)} */}
            {currentItems?.slice(0).map(renderCrawlCard)}
            <div style={{width: "100%"}}>
            <div className="pagination-strip">
              <ReactPaginate
                className="page-bar"
                breakLabel="..."
                nextLabel="next >"
                pageCount={pageCount}
                previousLabel="< previous"
                renderOnZeroPageCount={null}
                onPageChange={handleNextClick}
                pageRangeDisplayed={5}
                activeClassName="active"
                />
            </div>
            </div>
          </Row>
        </Row>
      )}
    </>
  );
}

export default Home;
