import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const AllplaylistComp = ({ pl, setupdatePlaylist, updatePlaylist }) => {
  const threedots_menu = useRef(null);
  const [threedotsactive, setthreedotsactive] = useState(false);
  const handlethreedots = (e) => {
    e.stopPropagation();
    setthreedotsactive(!threedotsactive);
  };
  const handledeletePlaylist = (name) => {
    fetch("http://localhost:8000/user/deletePlayList", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: name }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setupdatePlaylist((prev) => prev + 1);
      });
  };

  useEffect(() => {
   const closeThreedots = (event) =>{
    console.log('click')
    if(threedots_menu.current && !threedots_menu.current.contains(event.target)){
        setthreedotsactive(false)
    }
   }

    document.addEventListener("click", closeThreedots);

    return () => {
      document.removeEventListener("click", closeThreedots);
    };
  }, []);

  return (
    <div className="pl">
      <div
        className="playlist_videos"
        style={{
          backgroundImage: `url(${pl.videos[0]?.thumbnail})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="playlist_videoslength">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="18"
            viewBox="0 0 24 24"
            width="20"
            focusable="false"
          >
            <path d="M22 7H2v1h20V7zm-9 5H2v-1h11v1zm0 4H2v-1h11v1zm2 3v-8l7 4-7 4z"></path>
          </svg>

          <p> {pl.videos.length} </p>
          <p>{pl.videos.length > 1 ? "videos" : "video"}</p>
        </div>
        <Link to={`/Playlist?list=${pl.name}`}>
          <div className="playlist_playall">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              viewBox="0 0 24 24"
              width="20"
              focusable="false"
            >
              <path fill="white" d="m7 4 12 8-12 8V4z"></path>
            </svg>

            <p>Play all</p>
          </div>
        </Link>
      </div>

      <div
        className="playlist1"
        style={{
          backgroundImage: `url(${pl.videos[0]?.thumbnail})`,
          backgroundPosition: " top left",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        ></div>
      </div>

      <div
        className="playlist2"
        style={{
          backgroundImage: `url(${pl.videos[0]?.thumbnail})`,
          backgroundPosition: "top left",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
        ></div>
      </div>
      <div className="playlist_info">
        <p>{pl.name}</p>
        <div onClick={handlethreedots} className="Playlist_threedots">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="100%"
            height="100%"
          >
            <path d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"></path>
          </svg>

          {/* hello */}

          {threedotsactive && (
            <div ref={threedots_menu} className="threedots_menu">
              <ul>
                
                <li onClick={() => handledeletePlaylist(pl.name)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                    focusable="false"
                  >
                    <path d="M11 17H9V8h2v9zm4-9h-2v9h2V8zm4-4v1h-1v16H6V5H5V4h4V3h6v1h4zm-2 1H7v15h10V5z"></path>
                  </svg>
                  Delete
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllplaylistComp;
