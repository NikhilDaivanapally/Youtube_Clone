import React, { useEffect, useRef, useState } from "react";
import Nav1 from "../../Components/Navbar/TopNavbar/nav1";
import Sidenav from "../../Components/Navbar/SideNavbar/Sidenav";
import { useSelector } from "react-redux";
import "./AllPlaylists.css";
import { Link } from "react-router-dom";
import AllplaylistComp from "./allplaylistComp";

const AllPlaylists = () => {
  const user = useSelector((state) => state.user);
  const [allplaylists, setallplaylists] = useState([]);
  const [updatePlaylist,setupdatePlaylist] = useState(1)
  // const [threedotsactive, setthreedotsactive] = useState(false);
  useEffect(() => {
    fetch("http://localhost:8000/user/playlist", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "playlists");
        setallplaylists(data.data);
      });
  }, [updatePlaylist]);

  console.log(allplaylists);

  return (
    <main className="main">
      <>
        {/* topnav */}
        <Nav1 user={user?.data[0]} />
        {/* combining the sidenav with videos container */}
        <div className="Container" style={{ display: "flex" }}>
          <Sidenav />
          {/* <Playlist/> */}
          <div className="playlistsContainer">
            <div className="playlist_title">
              <h1>Playlists</h1>
            </div>
            <div className="allplaylists">
              {allplaylists.length > 0 &&
                allplaylists?.map((pl, i) => {
                  // console.log(pl.videos[0])
                  // console.log(pl.videos[0].thumbnail)
                  return (
                    <AllplaylistComp updatePlaylist={updatePlaylist} setupdatePlaylist={setupdatePlaylist} key={i} pl={pl}/>
                    
                  );
                })}
            </div>
          </div>
        </div>
      </>
    </main>
  );
};

export default AllPlaylists;
