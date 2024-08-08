import React, { useEffect, useRef, useState } from "react";
import VideoSection from "./VideoSection/VideoSection";
import "./videos.css";
import Loading from "../Loader/Loading";

const Videos = (dets) => {
  const { setvideoAdded } = dets;
  //  console.log(setvideoAdded)
  const [videos, setVideos] = useState([]);
  const [SavetoPLActive, setSavetoPLActive] = useState({
    state: false,
    videoId: null,
  });
  const [playlists, setplaylists] = useState([]);
  const [addtoPL, setaddtoPL] = useState(null);
  const [createPlActive, setcreatePlActive] = useState(false);
  const [playlistname, setplaylistname] = useState("");
  const [page, setpage] = useState(1);
  const [pages, setpages] = useState(null);
  const [loading, setloading] = useState(true);
  const dropdownRef = useRef(null);
  console.log(SavetoPLActive, "pl");
  // useEffect(() => {
  //   fetch(`http://localhost:8000/user/videos?page=${page}`, { credentials: "include" })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       console.log(data);
  //       setVideos((prev)  => [...prev,...data?.data?.videos]);
  //       setloading(false)

  //     }).catch((err) =>{
  //       setloading(false)
  //       console.log(err)
  //     })

  // }, [page]);
  console.log(loading);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Click occurred outside the dropdown menu, close the menu
        setSavetoPLActive({
          state: false,
          videoId: null,
        });
      }
    };

    // Add event listener to detect clicks outside of the dropdown menu
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Cleanup: Remove event listener when the component unmounts
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Empty dependency array ensures that this effect runs only once, similar to componentDidMount

  useEffect(() => {
    fetch("http://localhost:8000/user/playlist", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setplaylists(data.data);
      });
  }, []);
  useEffect(() => {
    if (addtoPL) {
      fetch(`http://localhost:8000/user/addTo?AddIn=${addtoPL}`, {
        credentials: "include",
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId: SavetoPLActive.videoId }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setvideoAdded({
            state: true,
            name: addtoPL,
          });
          setSavetoPLActive({
            state: false,
            videoId: null,
          });
        });
    }
  }, [addtoPL]);

  useEffect(() => {
    fetch(`http://localhost:8000/user/videos?page=${page}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          console.log("network error");
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setpages(data?.data?.totalPages);
        // Ensure data is iterable before spreading
        if (data?.data?.videos && Array.isArray(data.data.videos)) {
          setVideos((prev) => [...prev, ...data.data.videos]);
        }
        setloading(false);
      })
      .catch((error) => {
        setloading(false);

        console.error("Error fetching data:", error);
        // Handle error state or notify user
      });
  }, [page]);

  const handleInfinteScroll = async (e) => {
    // console.log(e.target.scrollHeight)
    // console.log(window.innerHeight - 55,e.target.scrollTop)

    // console.log("scrollHeight",document.documentElement.scrollHeight)
    try {
      if (
        window.innerHeight - 55 + e.target.scrollTop + 20 >=
        e.target.scrollHeight
      ) {
        if (page <= pages) {
          setpage((prev) => prev + 1);
          setloading(true);
        } else {
          setloading(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Add videos to dependency array to ensure useEffect runs when videos update
  console.log(videos);
  if (videos.length <= 0) {
    return <Loading />;
  }
  const handlecheck = (e) => {
    // in css i have removed the pointer events for input and lable so only li is pointed
    console.log(e.target);
    e.target.children[0].checked = !e.target.children[0].checked;
    // console.log(e.target.children[1])
    setaddtoPL(e.target.children[1].innerText);
  };

  const createPlaylist = (e) => {
    e.preventDefault();
    // setcreatePlActive(false);
    if (playlistname.trim()) {
      fetch(`http://localhost:8000/user/createplaylist`, {
        credentials: "include",
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: playlistname }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("playlistcreated", data);
          return fetch(
            `http://localhost:8000/user/addTo?AddIn=${playlistname}`,
            {
              credentials: "include",
              method: "post",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ videoId: SavetoPLActive.videoId }),
            }
          );
        })
        .then((response) => response.json())
        .then((data) => {
          setvideoAdded({
            state: true,
            name: playlistname,
          });
          setSavetoPLActive({
            state: false,
            videoId: null,
          });
          console.log("videoaddedtoplaylistcreated", data);
        });
    }
  };

  return (
    <div className="videos_container" onScroll={handleInfinteScroll}>
      {SavetoPLActive.state && (
        <div className="savetoplaylist_config">
          <div ref={dropdownRef} className="saveContainer">
            <div>
              Save video to...{" "}
              <span>
                <svg
                  onClick={() => {
                    setSavetoPLActive({ state: false, videoId: null });
                    setcreatePlActive(false);
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                  focusable="false"
                >
                  <path d="m12.71 12 8.15 8.15-.71.71L12 12.71l-8.15 8.15-.71-.71L11.29 12 3.15 3.85l.71-.71L12 11.29l8.15-8.15.71.71L12.71 12z"></path>
                </svg>
              </span>
            </div>

            <div>
              <ul>
                {playlists?.map(({ name }, i) => {
                  return (
                    <li onClick={handlecheck} key={i}>
                      <input type="checkbox" name="" id={`check_${i}`} />
                      <label htmlFor={`check_${i}`}>{name}</label>
                    </li>
                  );
                })}
              </ul>
            </div>

            {createPlActive ? (
              <div className="createplform">
                <form onSubmit={createPlaylist}>
                  <label htmlFor="">Name</label>
                  <input
                    autoFocus
                    type="text"
                    value={playlistname}
                    onChange={(e) => setplaylistname(e.target.value)}
                    placeholder="Enter playlist title..."
                  />
                  <button type="submit">Create</button>
                </form>
              </div>
            ) : (
              <div className="createpl" onClick={() => setcreatePlActive(true)}>
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                    focusable="false"
                  >
                    <path d="M20 12h-8v8h-1v-8H3v-1h8V3h1v8h8v1z"></path>
                  </svg>
                </span>{" "}
                Create new playlist
              </div>
            )}
          </div>
        </div>
      )}

      {videos?.map((video, i) => {
        console.log(video);
        const { videoFile, title, thumbnail, _id, owner, createdAt, view } =
          video;
        return (
          <VideoSection
            setSavetoPLActive={setSavetoPLActive}
            key={i}
            videoFile={videoFile}
            title={title}
            thumbnail={thumbnail}
            id={_id}
            owner={owner}
            createdAt={createdAt}
            view={view}
          />
        );
      })}
      {loading && <div className="video_loader"></div>}
    </div>
  );
};

export default Videos;
