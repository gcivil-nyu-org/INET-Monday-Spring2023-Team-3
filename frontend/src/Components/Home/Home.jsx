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
  const itemsPerPage = 3;

  // WITHOUT Search Term. ALL crawls!
  const [itemOffset, setItemOffset] = useState(0);
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [lengthAllCrawls, setLengthAllCralws] = useState(0);
  const [crawlIdList, setCrawlIdList] = useState([]);

  // WITH Search Term. Filtered crawls!
  const [searchValue, setSearchValue] = useState("");
  const [titleSearchRes, setTitleSearchRes] = useState(null);
  const [itemOffsetSearchResult, setItemOffsetSearchResult] = useState(0);
  const [pageCountSearchResult, setPageCountSearchResult] = useState(0);
  const [lengthAllCrawlsSearchResult, setLengthAllCralwsSearchResult] = useState(0);
  const [crawlIdListSearchResult, setCrawlIdListSearchResult] = useState([]);
  /* 
  NOTE:
    titleSearchRes = NULL means the search filter hasn't been used yet.
    titleSearchRes = [] means search w/ filter returned data length 0. (No crawls found.)
  */
  const calculateStartAndEndId = (crawl_id_list, item_offset, total_count) => {
    let startId = crawl_id_list[item_offset];
    let endIndex;
    let endId;
    if (item_offset + itemsPerPage >= total_count){
      endIndex = total_count;
      endId = crawl_id_list[endIndex-1]
      endId += 1;
    } else {
      endIndex = item_offset + itemsPerPage;
      endId = crawl_id_list[endIndex]
    }
    return [startId, endId]
  }
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
    
    if (titleSearchRes === null || titleSearchRes.length === 0){
      setItemOffset(0);
      setItemOffsetSearchResult(0);
      setCrawlIdListSearchResult([]);
      setLengthAllCralwsSearchResult(0);
    }
  }, [titleSearchRes]);
  

  const getAllCrawls = async (offset) => {
    try {
      const total_count = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/get_crawl_count/`
      )
      const crawl_id_list = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/crawl_ids/`
      )
      let calculatedIndex = calculateStartAndEndId(crawl_id_list.data, offset, total_count);
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/all/?start_id=${calculatedIndex[0]}&end_id=${calculatedIndex[1]}`,
      );
      
      setCrawlIdList(crawl_id_list.data);
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
    setPageCountSearchResult(pageCount);
  }

  
  const onSearch = async (value) => {
    if (value === "") {
      setItemOffset(0);
      setTitleSearchRes(null);
      setCrawlIdListSearchResult([]);
      setLengthAllCralwsSearchResult(0);
      setItemOffsetSearchResult(0);
      await getAllCrawls(0);
      return;
    }
    try {
      setSearchValue(value);
      let search_res = await axios.get(
        `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/get_crawl_search_res_count/${value}/`
      );
      
      if (search_res.data && search_res.data.search_count > 0){
        let crawl_id_list = search_res.data.crawl_ids;
        let total_count = search_res.data.search_count;
        let calculatedIndex = calculateStartAndEndId(crawl_id_list, itemOffsetSearchResult, total_count);
        
        let { data: titleData } = await axios.get(
          `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/search_crawls_by_title/${value}/?start_id=${calculatedIndex[0]}&end_id=${calculatedIndex[1]}`
        );
        setCrawlIdListSearchResult(search_res.data.crawl_ids);
        setTitleSearchRes(titleData);
        handlePagingWithSearch(titleData, search_res.data.search_count);
        setLengthAllCralwsSearchResult(search_res.data.search_count);
        
  
      } else {
        setTitleSearchRes([]);
        setCrawlIdListSearchResult([]);
        setLengthAllCralwsSearchResult(0);
        setItemOffsetSearchResult(0);
      }
      
    } catch (e) {
      setTitleSearchRes([]);
      setCrawlIdListSearchResult([]);
      setLengthAllCralwsSearchResult(0);
      setItemOffsetSearchResult(0);
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
  
   // invoked on click Next on Pagination bar on WITHOUT SEARCH TERM
   const handleNextClick = async (event) => {
    let newOffset = itemOffset;
    if (event.selected * itemsPerPage >= 0 && event.selected * itemsPerPage <= lengthAllCrawls ){
      newOffset = (event.selected * itemsPerPage);
    }

    let calculatedIndex = calculateStartAndEndId(crawlIdList, newOffset, lengthAllCrawls);
    const { data } = await axios.get(
      `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/all/?start_id=${calculatedIndex[0]}&end_id=${calculatedIndex[1]}`,
    );
    setCurrentItems(data);
    setItemOffset(newOffset);
  };

  // invoked on click Next on Pagination bar on search results WITH SEARCH TERM
   const handleNextClickSearchResult = async (event) => {
    let newOffset = itemOffsetSearchResult;
    
    if (event.selected * itemsPerPage >= 0 && event.selected * itemsPerPage <= lengthAllCrawlsSearchResult ){
      newOffset = (event.selected * itemsPerPage);
    }

    let calculatedIndex = calculateStartAndEndId(crawlIdListSearchResult, newOffset, lengthAllCrawlsSearchResult);
    const { data } = await axios.get(
      `${process.env.REACT_APP_SERVER_URL_PREFIX}/api/crawls/search_crawls_by_title/${searchValue}/?start_id=${calculatedIndex[0]}&end_id=${calculatedIndex[1]}`
      );
    
    setTitleSearchRes(data)
    setItemOffsetSearchResult(newOffset);
  };


  useEffect(() => {
    getProfile();
    getAllCrawls(0);
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

      {/* WITH SEARCH TERM!!! */}
      <Row style={{ justifyContent: "center" }}>
        <Row style={{ justifyContent: "center", maxWidth: "1000px" }}>
          {titleSearchRes?.length === 0 &&  (
            <div style={{ marginBottom: "1rem" }}>
              No crawls found. Explore crawls below.
            </div>
          )}
          {titleSearchRes !== null && titleSearchRes.length > 0 && 
             titleSearchRes?.slice(0).map(renderCrawlCard)
           }
          {titleSearchRes !== null && titleSearchRes.length > 0 && 
            <div style={{width: "100%"}}>
            <div className="pagination-strip" >
              <h1>titleSearchRes</h1>
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
              </div>
            }
        </Row>
      </Row>


      {/* NO SEARCH TERM!!!! */}
      {(titleSearchRes === null || titleSearchRes.length === 0) && (
        <Row style={{ justifyContent: "center" }}>
          <Row style={{ justifyContent: "center", maxWidth: "1000px" }}>
            {lengthAllCrawls === 0 && (
              <div style={{ margin: "1rem" }}>No crawls posted yet</div>
            )}
            {currentItems?.slice(0).map(renderCrawlCard)}
            <div style={{width: "100%"}}>
            <div className="pagination-strip">
              <h1>currItems</h1>
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
