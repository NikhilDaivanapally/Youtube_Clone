import React, { useEffect, useState } from "react";
import Nav1 from "../../Components/Navbar/TopNavbar/nav1";
import Sidenav from "../../Components/Navbar/SideNavbar/Sidenav";
import Videos from "../../Components/VideoComp/videos";
import { useSelector, useDispatch } from "react-redux";
import { UpdateUser } from "../../ReduxStore/ActiveFeedSlice";
import { useNavigate } from "react-router-dom";
import "./ResultsPage.css";
const ResultPage = () => {
  // const [videoAdded, setvideoAdded] = useState({
  //   state: false,
  //   name: null,
  // });
  // console.log(videoAdded, "setvideoAdded");
  const Navigate = useNavigate();
  const dispatch = useDispatch();

  //accessing user from redux store
  const user = useSelector((state) => state.user);

  const urlParams = new URLSearchParams(window.location.search);
  const search = urlParams.get("search_query");

  useEffect(() => {
    fetch(`http://localhost:8000/result?search_query=${search}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "data");
      });
  }, [search]);

  // accessing activeFeed from  redux store
  // const ActiveFeed = useSelector((state) => state.ActiveFeed);

  //accessing previousComp from reux store
  // const previousComplist = useSelector((state) => state.PreviousComp);
  // console.log(ActiveFeed, "active", previousComplist[0], "prevcomp");

  useEffect(() => {
    fetch("http://localhost:8000/user/profile", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        dispatch(UpdateUser(data));
      })
      .catch((error) => {
        console.error("Error:", error);
        Navigate("/");
      });
  }, []);

  return (
    <main className="main">
      <>
        {/* topnav */}
        <Nav1 user={user?.data[0]} />
        {/* combining the sidenav with videos container */}
        <div className="Container">
          <Sidenav />
          <div className=""></div>
          {/* <Videos setvideoAdded={setvideoAdded} /> */}
          {/* {videoAdded.state && <div className="videoAdded"><p>video addedTo {videoAdded.name}</p></div>} */}
        </div>
      </>
    </main>
  );
};

export default ResultPage;
