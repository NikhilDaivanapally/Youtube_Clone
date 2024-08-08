import React, { useEffect, useState } from "react";
import Nav1 from "../../Components/Navbar/TopNavbar/nav1";
import Sidenav from "../../Components/Navbar/SideNavbar/Sidenav";
import { useSelector } from "react-redux";
import Playlist from "../../Components/playlist/Playlist";
import "./PlaylistPage.css";
import { useLocation } from "react-router-dom";

const PlaylistPage = () => {
  // console.log('rendered')
  // console.log('mounted')
  const location = useLocation();
  const searchParam = new URLSearchParams(location.search).get('list');
  const [search, setSearch] = useState(null);

  useEffect(() => {
    if (searchParam === "Watch later" || searchParam === "Liked videos") {
      const searchQuery = searchParam.split(" ").map(elem => {
        const word = elem.split("");
        word.splice(0, 1, word[0].toUpperCase());
        return word.join("");
      });
      setSearch(searchQuery.join(""));
    } else {
      setSearch(searchParam);
    }
  }, [searchParam]);

  //accessing user from redux store
  const user = useSelector(state => state.user); 

  return (
    <main className="main">
      <>
        {/* topnav */}
        <Nav1 user={user?.data[0]} />
        {/* {console.log('render',search)} */}
        {/* combining the sidenav with videos container */}
        <div className="Container" style={{ display: "flex" }}>
          <Sidenav />
          {search && <Playlist search={search} />}
        </div>
      </>
    </main>
  );
};

export default PlaylistPage;
