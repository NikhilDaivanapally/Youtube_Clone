import React from "react";
import Nav1 from "../../Components/Navbar/TopNavbar/nav1";
import Sidenav from "../../Components/Navbar/SideNavbar/Sidenav";
import Videos from "../../Components/VideoComp/videos";
import { useSelector} from "react-redux";

const ShortsPage = () => {
  //accessing user from redux store 
  const user = useSelector((state) => state.user);
 // accessing activeFeed from  redux store
  const ActiveFeed = useSelector((state) => state.ActiveFeed);
  //accessing previousComp from reux store
  // const previousComplist = useSelector((state) => state.PreviousComp);
  // console.log(ActiveFeed, "active", previousComplist[0], "prevcomp");

  return (
    <main className="main">
      <>
          {/* topnav */}
          <Nav1 user={user?.data[0]} />
          {/* combining the sidenav with videos container */}
          <div className="Container" style={{ display: "flex" }}>
            <Sidenav />
            {/* <Videos /> */}
          </div>
      </>
    </main>
  );
};

export default ShortsPage;
