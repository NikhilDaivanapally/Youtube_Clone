import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import "./FullvideoView.css";
import Subscribe from "../subscribeState/Subscribe";
import LikeState from "../likeState/LikeState";

const FullvideoView = () => {
  const { id } = useParams();
  const [video, setvideo] = useState(null);
  const [sub, setsub] = useState();
  const [like, setlike] = useState();
  const [isplaying, setisplaying] = useState(true);
  const [ismuted, setismuted] = useState(false);
  const [fullScreen, setfullScreen] = useState(false);
  const [currenttime, setcurrenttime] = useState(0);
  const [playbackRateActive, setplaybackRateActive] = useState("Normal");
  const [playbacksettings, setplaybacksettings] = useState(false);
  const vidRef = useRef(null);

  const videoRef = useRef(null);
  const IndicatorRef = useRef(null);
  // const EnterExitFullscreen = useRef(null);
  axios.defaults.withCredentials = true;
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8000/user/getvideo",
          { id: id }
        );
        console.log(response);
        setsub(response.data.data[0].isSubscribed);
        setlike(response.data.data[0].isliked);
        setvideo(response.data.data[0]); // Assuming the response contains video data
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };

    fetchVideoData();

    console.log(videoRef.current);
  }, [sub,like]);

  if (videoRef.current) {
    const updateTime = () => {
      setcurrenttime(videoRef.current.currentTime);
      //  console.log(videoRef.current.currentTime)
    };
    // progression status width of an bar

    videoRef.current.addEventListener("timeupdate", updateTime);

    var width = (currenttime / video.duration) * 100;
    // console.log(width,'%')
  }

  const handleplaypause = () => {
    // videoRef.current.playbackRate = 0.25
    // console.log(videoRef.current.paused);
    if (!videoRef.current.paused) {
      IndicatorRef.current.style.scale = "2";
      // IndicatorRef.current.style.opacity = '0'

      videoRef.current.pause();
      setisplaying(false);
      // IndicatorRef.current.style.display = 'none'
    } else {
      // IndicatorRef.current.style.display = 'block'
      IndicatorRef.current.style.scale = "2";
      // IndicatorRef.current.style.opacity = '1'

      videoRef.current.play();
      setisplaying(true);
      // IndicatorRef.current.style.display = 'none'
    }
  };
  const handleFullScreen = () => {
    if (!fullScreen) {
      setfullScreen(true);
      vidRef.current.style.width = "100%";
      vidRef.current.style.height = "100vh";
    } else {
      setfullScreen(false);

      vidRef.current.style.width = "100%";
      vidRef.current.style.height = "85vh";
    }
  };
  const duration = (duration) => {
    // duration is in seconds

    const hours = Math.floor(duration / 3600);
    const remainingSecsAfterHours = duration % 3600;
    const minutes = Math.floor(remainingSecsAfterHours / 60);
    const seconds = Math.floor(remainingSecsAfterHours % 60);

    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    let formattedDuration = "";
    if (hours > 0) {
      const formattedHours = hours.toString().padStart(2, "0");
      formattedDuration += `${formattedHours}:`;
    }

    formattedDuration += `${formattedMinutes}:${formattedSeconds}`;

    return formattedDuration;
  };

  const handlekeydown = (e) => {
    if (e.keyCode === 39) {
      videoRef.current.currentTime += 5;
    } else if (e.keyCode === 37) {
      videoRef.current.currentTime -= 5;
    } else if (e.keyCode === 32) {
      e.preventDefault();
      if (!videoRef.current.paused) {
        videoRef.current.pause();
        setisplaying(false);
      } else {
        videoRef.current.play();
        setisplaying(true);
      }
    }

    console.log(e);
  };

  //hanleplaybackspeed on selection
  const handleplaybackspeed = (speed) => {
    if (speed == "Normal") {
      videoRef.current.playbackRate = 1;
    } else {
      videoRef.current.playbackRate = speed;
    }
  };

  // console.log(video);

  return (
    <div className="videoPreview_container">
      <div
        ref={vidRef}
        tabIndex={0}
        className="video_div"
        onKeyDown={handlekeydown}
      >
        <div
          ref={IndicatorRef}
          className="Indicator_circle play_pauseIndicators"
        >
          <svg fill="white" viewBox="0 0 36 36" onClick={handleplaypause}>
            {!isplaying ? (
              <path
                d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"
                id="ytp-id-385"
              ></path>
            ) : (
              <path
                fill="white"
                d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"
              ></path>
            )}
          </svg>
        </div>
        <div className="Indicator_circle forward_Indicator"></div>
        <div className="Indicator_circle backword_Indicators"></div>
        {video && (
          <>
            <video
              autoPlay
              // onKeyDown={(e) => console.log(e)}
              onClick={handleplaypause}
              onEnded={() => setisplaying(false)}
              controls={false}
              muted={ismuted}
              ref={videoRef}
              src={video.videoFile}
            ></video>
            <div className="video_controls">
              <div className="progress_bar">
                <div
                  className="progress_value"
                  style={{ width: `${width}%` }}
                ></div>
              </div>
              <div className="video_core_controls">
                <div className="left_video_core">
                  <div className="play_pause">
                    <svg
                      fill="white"
                      viewBox="0 0 36 36"
                      onClick={handleplaypause}
                    >
                      {isplaying ? (
                        <path
                          d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"
                          id="ytp-id-385"
                        ></path>
                      ) : (
                        <path
                          fill="white"
                          d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"
                        ></path>
                      )}
                    </svg>
                  </div>
                  <div
                    className="forward"
                    onClick={() => (videoRef.current.currentTime += 10)}
                  >
                    <svg fill="white" viewBox="0 0 36 36">
                      <path d="M 12,24 20.5,18 12,12 V 24 z M 22,12 v 12 h 2 V 12 h -2 z"></path>
                    </svg>
                  </div>
                  <div className="volume">
                    <svg
                      onClick={() => setismuted(!ismuted)}
                      fill="white"
                      version="1.1"
                      viewBox="0 0 36 36"
                    >
                      {ismuted ? (
                        <path
                          d="m 21.48,17.98 c 0,-1.77 -1.02,-3.29 -2.5,-4.03 v 2.21 l 2.45,2.45 c .03,-0.2 .05,-0.41 .05,-0.63 z m 2.5,0 c 0,.94 -0.2,1.82 -0.54,2.64 l 1.51,1.51 c .66,-1.24 1.03,-2.65 1.03,-4.15 0,-4.28 -2.99,-7.86 -7,-8.76 v 2.05 c 2.89,.86 5,3.54 5,6.71 z M 9.25,8.98 l -1.27,1.26 4.72,4.73 H 7.98 v 6 H 11.98 l 5,5 v -6.73 l 4.25,4.25 c -0.67,.52 -1.42,.93 -2.25,1.18 v 2.06 c 1.38,-0.31 2.63,-0.95 3.69,-1.81 l 2.04,2.05 1.27,-1.27 -9,-9 -7.72,-7.72 z m 7.72,.99 -2.09,2.08 2.09,2.09 V 9.98 z"
                          id="ytp-id-157"
                        ></path>
                      ) : (
                        <path
                          d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 ZM19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z"
                          fill="#fff"
                        ></path>
                      )}
                    </svg>
                  </div>
                  <div>
                    <span>{duration(currenttime)}</span> /
                    <span>{duration(video.duration)}</span>
                  </div>
                </div>
                <div className="right_video_core">
                  <div className="captions">
                    <svg fill="white" version="1.1" viewBox="0 0 36 36">
                      <path
                        d="M11,11 C9.89,11 9,11.9 9,13 L9,23 C9,24.1 9.89,25 11,25 L25,25 C26.1,25 27,24.1 27,23 L27,13 C27,11.9 26.1,11 25,11 L11,11 Z M17,17 L15.5,17 L15.5,16.5 L13.5,16.5 L13.5,19.5 L15.5,19.5 L15.5,19 L17,19 L17,20 C17,20.55 16.55,21 16,21 L13,21 C12.45,21 12,20.55 12,20 L12,16 C12,15.45 12.45,15 13,15 L16,15 C16.55,15 17,15.45 17,16 L17,17 L17,17 Z M24,17 L22.5,17 L22.5,16.5 L20.5,16.5 L20.5,19.5 L22.5,19.5 L22.5,19 L24,19 L24,20 C24,20.55 23.55,21 23,21 L20,21 C19.45,21 19,20.55 19,20 L19,16 C19,15.45 19.45,15 20,15 L23,15 C23.55,15 24,15.45 24,16 L24,17 L24,17 Z"
                        fill="#fff"
                      ></path>
                    </svg>
                  </div>
                  <div
                    className="captions settings"
                    onClick={() => setplaybacksettings(!playbacksettings)}
                  >
                    <svg fill="white" version="1.1" viewBox="0 0 36 36">
                      <path
                        d="m 23.94,18.78 c .03,-0.25 .05,-0.51 .05,-0.78 0,-0.27 -0.02,-0.52 -0.05,-0.78 l 1.68,-1.32 c .15,-0.12 .19,-0.33 .09,-0.51 l -1.6,-2.76 c -0.09,-0.17 -0.31,-0.24 -0.48,-0.17 l -1.99,.8 c -0.41,-0.32 -0.86,-0.58 -1.35,-0.78 l -0.30,-2.12 c -0.02,-0.19 -0.19,-0.33 -0.39,-0.33 l -3.2,0 c -0.2,0 -0.36,.14 -0.39,.33 l -0.30,2.12 c -0.48,.2 -0.93,.47 -1.35,.78 l -1.99,-0.8 c -0.18,-0.07 -0.39,0 -0.48,.17 l -1.6,2.76 c -0.10,.17 -0.05,.39 .09,.51 l 1.68,1.32 c -0.03,.25 -0.05,.52 -0.05,.78 0,.26 .02,.52 .05,.78 l -1.68,1.32 c -0.15,.12 -0.19,.33 -0.09,.51 l 1.6,2.76 c .09,.17 .31,.24 .48,.17 l 1.99,-0.8 c .41,.32 .86,.58 1.35,.78 l .30,2.12 c .02,.19 .19,.33 .39,.33 l 3.2,0 c .2,0 .36,-0.14 .39,-0.33 l .30,-2.12 c .48,-0.2 .93,-0.47 1.35,-0.78 l 1.99,.8 c .18,.07 .39,0 .48,-0.17 l 1.6,-2.76 c .09,-0.17 .05,-0.39 -0.09,-0.51 l -1.68,-1.32 0,0 z m -5.94,2.01 c -1.54,0 -2.8,-1.25 -2.8,-2.8 0,-1.54 1.25,-2.8 2.8,-2.8 1.54,0 2.8,1.25 2.8,2.8 0,1.54 -1.25,2.8 -2.8,2.8 l 0,0 z"
                        fill="#fff"
                      ></path>
                    </svg>
                    {playbacksettings && (
                      <div className="settings_box">
                        {[0.25, 0.5, 0.75, "Normal", 1.25, 1.5, 1.75, 2].map(
                          (speed, i) => (
                            <div
                              className={`${
                                playbackRateActive === speed ? "activediv" : ""
                              }`}
                              onClick={() => {
                                handleplaybackspeed(speed);
                                setplaybackRateActive(speed);
                              }}
                              key={i}
                            >
                              {
                                <span
                                  className={`dot ${
                                    playbackRateActive == speed && "activedot"
                                  }`}
                                ></span>
                              }
                              {speed}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                  <div className="captions" onClick={handleFullScreen}>
                    {fullScreen ? (
                      <svg
                        fill="white"
                        height="100%"
                        version="1.1"
                        viewBox="0 0 36 36"
                        width="100%"
                      >
                        <g>
                          <path d="m 14,14 -4,0 0,2 6,0 0,-6 -2,0 0,4 0,0 z"></path>
                        </g>
                        <g>
                          <path d="m 22,14 0,-4 -2,0 0,6 6,0 0,-2 -4,0 0,0 z"></path>
                        </g>
                        <g>
                          <path d="m 20,26 2,0 0,-4 4,0 0,-2 -6,0 0,6 0,0 z"></path>
                        </g>
                        <g>
                          <path d="m 10,22 4,0 0,4 2,0 0,-6 -6,0 0,2 0,0 z"></path>
                        </g>
                      </svg>
                    ) : (
                      <svg fill="white" version="1.1" viewBox="0 0 36 36">
                        <g>
                          <path d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z"></path>
                        </g>
                        <g>
                          <path d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z"></path>
                        </g>
                        <g>
                          <path d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z"></path>
                        </g>
                        <g>
                          <path d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z"></path>
                        </g>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="channelinfo_div">
        {video && (
          // <></>
          <>
            <div>
              <p className="video_title">{video.title}</p>
            </div>
            <div className="owner_dets">
              <div className="left_wing">
                {/* video_owner avatar */}
                <Link to={`/${video.owner.username}`}>
                  <div className="profile">
                    <img src={video.owner.avatar} alt="" />
                  </div>
                </Link>
                {/* owner_username */}
                <div>
                  <p>{video.owner.username}</p>
                  <p style={{ fontSize: "14px", color: "grey" }}>
                    {video.subscribers.length} subscribers
                  </p>
                </div>

                <button
                  onClick={() => {
                    Subscribe(video.owner._id);
                    setsub(!video.isSubscribed);
                  }}
                  className={`sub ${
                    video.isSubscribed ? "subscribed" : "subscribe"
                  }`}
                >
                  {video.isSubscribed ? "subscribed" : "subscribe"}
                </button>
              </div>
              <div className="right_wing">
                <div className="style_btn like_dislike">
                  <div className="like">
                    {/* like svg */} 
                  

                    <svg 
                    onClick={() => {LikeState(video._id);
                      setlike(!video.isliked);
                    
                    }}
                      className="likebtn"
                      xmlns="http://www.w3.org/2000/svg"
                      height="24"
                      viewBox="0 0 24 24"
                      width="24"
                      focusable="false"

                    >
                      {
                        video.isliked ? <path
                        fill="green"
                        d="M17,4h-1H6.57C5.5,4,4.59,4.67,4.38,5.61l-1.34,6C2.77,12.85,3.82,14,5.23,14h4.23l-1.52,4.94C7.62,19.97,8.46,21,9.62,21 c0.58,0,1.14-0.24,1.52-0.65L17,14h4V4H17z M10.4,19.67C10.21,19.88,9.92,20,9.62,20c-0.26,0-0.5-0.11-0.63-0.3 c-0.07-0.1-0.15-0.26-0.09-0.47l1.52-4.94l0.4-1.29H9.46H5.23c-0.41,0-0.8-0.17-1.03-0.46c-0.12-0.15-0.25-0.4-0.18-0.72l1.34-6 C5.46,5.35,5.97,5,6.57,5H16v8.61L10.4,19.67z M20,13h-3V5h3V13z"
                      ></path> : <path
                        fill="white"
                      d="M17,4h-1H6.57C5.5,4,4.59,4.67,4.38,5.61l-1.34,6C2.77,12.85,3.82,14,5.23,14h4.23l-1.52,4.94C7.62,19.97,8.46,21,9.62,21 c0.58,0,1.14-0.24,1.52-0.65L17,14h4V4H17z M10.4,19.67C10.21,19.88,9.92,20,9.62,20c-0.26,0-0.5-0.11-0.63-0.3 c-0.07-0.1-0.15-0.26-0.09-0.47l1.52-4.94l0.4-1.29H9.46H5.23c-0.41,0-0.8-0.17-1.03-0.46c-0.12-0.15-0.25-0.4-0.18-0.72l1.34-6 C5.46,5.35,5.97,5,6.57,5H16v8.61L10.4,19.67z M20,13h-3V5h3V13z"
                    ></path>
                      }
                    </svg>
                    <div>{video.likes}</div>
                  </div>
                  <div className="dislike">
                    {/* dislike svg */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24"
                      viewBox="0 0 24 24"
                      width="24"
                      focusable="false"
                    >
                      <path
                        fill="white"
                        d="M17,4h-1H6.57C5.5,4,4.59,4.67,4.38,5.61l-1.34,6C2.77,12.85,3.82,14,5.23,14h4.23l-1.52,4.94C7.62,19.97,8.46,21,9.62,21 c0.58,0,1.14-0.24,1.52-0.65L17,14h4V4H17z M10.4,19.67C10.21,19.88,9.92,20,9.62,20c-0.26,0-0.5-0.11-0.63-0.3 c-0.07-0.1-0.15-0.26-0.09-0.47l1.52-4.94l0.4-1.29H9.46H5.23c-0.41,0-0.8-0.17-1.03-0.46c-0.12-0.15-0.25-0.4-0.18-0.72l1.34-6 C5.46,5.35,5.97,5,6.57,5H16v8.61L10.4,19.67z M20,13h-3V5h3V13z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <div className=" style_btn share">
                  <svg
                    fill="white"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                    focusable="false"
                  >
                    <path d="M15 5.63 20.66 12 15 18.37V14h-1c-3.96 0-7.14 1-9.75 3.09 1.84-4.07 5.11-6.4 9.89-7.1l.86-.13V5.63M14 3v6C6.22 10.13 3.11 15.33 2 21c2.78-3.97 6.44-6 12-6v6l8-9-8-9z"></path>
                  </svg>
                  <div>share</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FullvideoView;
