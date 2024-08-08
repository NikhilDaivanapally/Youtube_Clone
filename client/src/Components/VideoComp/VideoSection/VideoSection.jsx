// import { delay } from '@reduxjs/toolkit/dist/utils';
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPreviewmuted } from "../../../ReduxStore/ActiveFeedSlice";
import axios from "axios";
import { Link } from "react-router-dom";
import uploadedAt from "../../timeOfUpload";

const VideoSection = (details) => {
  // console.log(details)

  const {
    setSavetoPLActive,
    videoFile,
    title,
    thumbnail,
    id,
    owner,
    createdAt,
    view,
  } = details;
  console.log(owner);
  const dispatch = useDispatch();
  const ismuted = useSelector((state) => state.muted);
  const [threedotsactive, setthreedotsactive] = useState(false);
  // const threedotsactiveRef = useRef(null);

  // console.log(details)
  const thumbnailRef = useRef();
  const videoFileRef = useRef();
  const videoRef = useRef();
  const threedotsRef = useRef();

  useEffect(() => {
    const updateTime = () => {
      // console.log(videoFileRef.current.currentTime)
    };

    const handleMouseOver = () => {
      // console.log('mousein',title)
      threedotsRef.current.style.display = "block";
      thumbnailRef.current.style.display = "none";
      videoFileRef.current.play();
      //  console.log(videoFileRef.current.duration)
      videoFileRef.current.addEventListener("timeupdate", updateTime);
    };

    const handleMouseLeave = () => {
      // console.log('mouseout')

      threedotsRef.current.style.display = "none";

      thumbnailRef.current.style.display = "block";
      videoFileRef.current.pause();
      videoFileRef.current.removeEventListener("timeupdate", updateTime);
    };

    // Add event listener when the component mounts
    if (videoRef.current) {
      const video = videoRef.current;
      // console.log(i)
      video.addEventListener("mouseover", handleMouseOver);
      video.addEventListener("mouseleave", handleMouseLeave);

      // Cleanup: Remove event listener when the component unmounts
      return () => {
        video.removeEventListener("mouseover", handleMouseOver);
        video.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [videoRef]);
  // console.log(videoRef)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        threedotsRef.current &&
        !threedotsRef.current.contains(event.target)
      ) {
        console.log("doc mousedown");
        // Click occurred outside the dropdown menu, close the menu
        setthreedotsactive(false);
      }
    };

    // Add event listener to detect clicks outside of the dropdown menu
    document.addEventListener("click", handleClickOutside);

    return () => {
      // Cleanup: Remove event listener when the component unmounts
      document.removeEventListener("click", handleClickOutside);
    };
  }, []); // Empty dependency array ensures that this effect runs only once, similar to componentDidMount

  const handlethreedots = (event) => {
    event.stopPropagation();

    setthreedotsactive(!threedotsactive);
  };

  axios.defaults.withCredentials = true;

  const addvideo = async () => {
    const response = await axios.post(
      "http://localhost:8000/user/addTo?AddIn=WatchLater",
      { videoId: id }
    );
    console.log(response);
  };

  const handlesetWatchHistory = (id) => {
    fetch("http://localhost:8000/user/AddToWatchHistory", {
      credentials: "include",
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videoId: id,date:new Date().toLocaleString()}),
    })
      .then((res) => res.json())
      .then((data) => console.log(data));
      console.log(new Date().toLocaleString())
  };

  return (
    <div ref={videoRef} className="video_box">
      {threedotsactive ? (
        <div className="three_dots_menu">
          <ul>
            <li
              onClick={() => {
                addvideo();
                setthreedotsactive(false);
              }}
            >
              <div className="threedotslist">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  height="100%"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.97 16.95 10 13.87V7h2v5.76l4.03 2.49-1.06 1.7zM12 3c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9m0-1c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"></path>
                </svg>
              </div>
              save to watch later
            </li>
            <li
              onClick={() => {
                setSavetoPLActive({ state: true, videoId: id });
                setthreedotsactive(false);
              }}
            >
              <div className="threedotslist">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  height="100%"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 13h-4v4h-2v-4h-4v-2h4V7h2v4h4v2zm-8-6H2v1h12V7zM2 12h8v-1H2v1zm0 4h8v-1H2v1z"></path>
                </svg>
              </div>
              save to palylist
            </li>
          </ul>
        </div>
      ) : (
        ""
      )}
      <div onClick={() => handlesetWatchHistory(id)} className="video_section">
        <div className="mute_cc">
          <div className="mute_icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="130%"
              height="130%"
              viewBox="0 0 35 35"
              onClick={() => {
                dispatch(setPreviewmuted(!ismuted));
                // setmuted(!muted)
              }}
            >
              {ismuted ? (
                <path
                  d="m 21.48,17.98 c 0,-1.77 -1.02,-3.29 -2.5,-4.03 v 2.21 l 2.45,2.45 c .03,-0.2 .05,-0.41 .05,-0.63 z m 2.5,0 c 0,.94 -0.2,1.82 -0.54,2.64 l 1.51,1.51 c .66,-1.24 1.03,-2.65 1.03,-4.15 0,-4.28 -2.99,-7.86 -7,-8.76 v 2.05 c 2.89,.86 5,3.54 5,6.71 z M 9.25,8.98 l -1.27,1.26 4.72,4.73 H 7.98 v 6 H 11.98 l 5,5 v -6.73 l 4.25,4.25 c -0.67,.52 -1.42,.93 -2.25,1.18 v 2.06 c 1.38,-0.31 2.63,-0.95 3.69,-1.81 l 2.04,2.05 1.27,-1.27 -9,-9 -7.72,-7.72 z m 7.72,.99 -2.09,2.08 2.09,2.09 V 9.98 z"
                  id="ytp-id-50"
                ></path>
              ) : (
                <path
                  d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 ZM19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z"
                  fill="#fff"
                  id="ytp-id-15"
                ></path>
              )}
            </svg>
          </div>

          <div className="captions_cc">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="130%"
              height="130%"
              viewBox="0 0 35 35"
            >
              <path
                d="M11,11 C9.89,11 9,11.9 9,13 L9,23 C9,24.1 9.89,25 11,25 L25,25 C26.1,25 27,24.1 27,23 L27,13 C27,11.9 26.1,11 25,11 L11,11 Z M17,17 L15.5,17 L15.5,16.5 L13.5,16.5 L13.5,19.5 L15.5,19.5 L15.5,19 L17,19 L17,20 C17,20.55 16.55,21 16,21 L13,21 C12.45,21 12,20.55 12,20 L12,16 C12,15.45 12.45,15 13,15 L16,15 C16.55,15 17,15.45 17,16 L17,17 L17,17 Z M24,17 L22.5,17 L22.5,16.5 L20.5,16.5 L20.5,19.5 L22.5,19.5 L22.5,19 L24,19 L24,20 C24,20.55 23.55,21 23,21 L20,21 C19.45,21 19,20.55 19,20 L19,16 C19,15.45 19.45,15 20,15 L23,15 C23.55,15 24,15.45 24,16 L24,17 L24,17 Z"
                fill="#fff"
                id="ytp-id-17"
              ></path>
            </svg>
          </div>
        </div>

        <img ref={thumbnailRef} src={thumbnail} alt="" />

        <Link to={`/watch/${id}`}>
          <video ref={videoFileRef} muted={ismuted} src={videoFile}></video>
        </Link>
      </div>

      <div className="title_profile">
        <Link to={`/${owner.username}`}>
          <div className="profile">
            <img src={owner.avatar} alt="" />
          </div>
        </Link>
        <div className="title"> {title}</div>
        <div
          className="three_dots"
          onClick={handlethreedots}
          ref={threedotsRef}
        >
          {console.log(threedotsactive)}
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <path d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"></path>
          </svg>
        </div>
      </div>

      <div className="channel_view">
        <p className="channel">{owner.fullname}</p>
        <p className="view">
          {view} views .{uploadedAt(createdAt)}
        </p>
      </div>
    </div>
  );
};

export default VideoSection;
