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
  const [crawlIdList, setCrawlIdList] = useState([]);

  const [titleSearchRes, setTitleSearchRes] = useState(null);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 3;
  const [searchValue, setSearchValue] = useState("");

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
      document.cookie = 'jwt=; Max-Age=-99999999;';  
      history.replace("/login");
    }
  };
  const handleLoad = (map) => {
    console.log("Map loaded:", map);
  };
  useEffect(() => {
    if (titleSearchRes === null){
      setItemOffset(0);
      setItemOffsetSearchResult(0);
    }
  }, [titleSearchRes]);

  const getAllCrawls = async () => {
    try {
      const total_count = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/get_crawl_count/`
      )
      const crawl_id_list = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/crawl_ids/`
      )
      
      console.log(crawl_id_list.data)
      let startId = crawl_id_list.data[itemOffset]
      let endIndex = itemOffset+3 >=total_count ? total_count-1:itemOffset+3
      let endId = crawl_id_list.data[endIndex]
      console.log("startId: ", startId)
      console.log("endIndex: ", endIndex)
      console.log("endId: ", endId)


      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/all/?start_id=${startId}&end_id=${endId}`,
      );
      console.log(data)
      
      setCrawlIdList(crawl_id_list);
      setAllCrawls(data);
      setLengthAllCralws(total_count.data);
      handlePaging(data, total_count.data);
    } catch (e) {
      localStorage.removeItem("jwt");
      document.cookie = 'jwt=; Max-Age=-99999999;';  
      history.replace("/login");
    }
  };
  const handlePaging = async(data, length) => {
    const pageCount = Math.ceil(length / itemsPerPage);
    setCurrentItems(data);
    setPageCount(pageCount);
  }
  const handlePagingWithSearch = async(data, length) => {
    const pageCount = Math.ceil(length / itemsPerPage);
    setCurrentItemsSearchResult(data);
    setPageCountSearchResult(pageCount);
  }

  
  const onSearch = async (value) => {
    if (value === "") {
      setTitleSearchRes(null);
      return;
    }
    try {
      setSearchValue(value);
      // `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/all/?start_id=${newOffset}&end_id=${newOffset+3}`,
      let { data: titleData } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/search_crawls_by_title/${value}/?start_id=${itemOffsetSearchResult}&end_id=${itemOffsetSearchResult+3}`
      );
      let search_count = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/get_crawl_search_res_count/${value}/`
      );
      setTitleSearchRes(titleData);
      handlePagingWithSearch(titleData, search_count.data);
      
      setLengthAllCralwsSearchResult(search_count.data);
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
      </Col>
    </Link>
  );
  
   // Invoke when user click to request another page.
   const handleNextClick = async (event) => {

    console.log("----------------------------------")
    let newOffset = itemOffset;
    if (event.selected * itemsPerPage >= 0 && event.selected * itemsPerPage <= lengthAllCrawls ){
      newOffset = (event.selected * itemsPerPage);
    }
    console.log("newOffset: ", newOffset)
    console.log("lengthAllCrawls: ", lengthAllCrawls)
    let startId = crawlIdList.data[newOffset]
    let endIndex;
    let endId;
    if (newOffset+3 >= lengthAllCrawls){
      endIndex = lengthAllCrawls;
      endId = crawlIdList.data[endIndex-1]
      endId += 1;
    } else {
      endIndex = newOffset+3;
      endId = crawlIdList.data[endIndex]
    }
    console.log("endIndex: ", endIndex)
    console.log("startId: ", startId)
    console.log("endid: ", endId)

    const { data } = await axios.get(
      `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/all/?start_id=${startId}&end_id=${endId}`,
    );
    
    setCurrentItems(data);
    setItemOffset(newOffset);
  };
   const handleNextClickSearchResult = async (event) => {
    let newOffset = itemOffsetSearchResult;
    if (event.selected * itemsPerPage >= 0 && event.selected * itemsPerPage <= lengthAllCrawlsSearchResult ){
      newOffset = (event.selected * itemsPerPage) + 1;
    }
    // const slicedItems = titleSearchRes.slice(newOffset, newOffset+itemsPerPage);
    const { data } = await axios.get(
      `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/search_crawls_by_title/${searchValue}/?start_id=${newOffset}&end_id=${newOffset+3}`
      );
    setCurrentItemsSearchResult(data);
    setItemOffsetSearchResult(newOffset);
  };


  useEffect(() => {
    getProfile();
    getAllCrawls();
  }, []);
  if (!isMounted) return <div></div>;
  return (
    <>
      <Row style={{ justifyContent: "center", alignItems: "center" }}>
        <Search
          placeholder="Search crawls"
          allowClear
          onSearch={onSearch}
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
