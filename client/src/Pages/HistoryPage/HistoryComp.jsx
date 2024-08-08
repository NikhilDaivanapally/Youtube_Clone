import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../../Components/Loader/Loading";

const HistoryComp = () => {
  const [historySearch, sethistorySearch] = useState("");
  const [history, sethistory] = useState(null);
  const Navigate = useNavigate();

  const getWatchHistory = () => {
    fetch("http://localhost:8000/user/GetWatchHistory", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        let history = {};

        data.data.forEach((item) => {
          const date = item.date.split(", ")[0];
          if (!history[date]) {
            history[date] = [];
          }
          history[date].push(item);
        });

        const sortedDates = Object.keys(history).sort(
          (a, b) => Date.parse(new Date(b)) - Date.parse(new Date(a))
        );

        const datewisehistorydesc = sortedDates.map((date) => {
          return {
            date: date,
            data: history[date],
          };
        });
        const timewisehistorydesc = datewisehistorydesc.filter((video) => {
          //  console.log(video)
          return video.data.sort(
            (a, b) =>
              Date.parse(new Date(b.date)) - Date.parse(new Date(a.date))
          );
        });
        console.log(timewisehistorydesc);
        sethistory(timewisehistorydesc);

        // console.log(datewisehistorydesc)
      });
  };
  useEffect(() => {
    getWatchHistory();
  }, []);
  const handleNavigatefullVideeo = (id) => {
    Navigate(`/watch/${id}`);
  };
  const handledelteHistory = (e, id) => {
    e.stopPropagation();
    console.log(id);
    fetch("http://localhost:8000/user/deleteWatchHistory", {
      credentials: "include",
      method: "post",
      body: JSON.stringify({ id: id }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        getWatchHistory();
      });
  };

  const handledelteAllHistory = () => {
    fetch("http://localhost:8000/user/deleteAllWatchHistory", {
      credentials: "include",
      method: "post",
    })
      .then((res) => res.json())
      .then((data) => {
      console.log(data);
      getWatchHistory();
      }
    );
  };

  console.log(history)
  return (
    <div className="HistoryComp">
     { !history ? <Loading/> :
      <div className="History_videos">
        {history.length > 0  && <h1>Watch History</h1>}
        {history.length == 0 && <div className="No_history">No watchHistory</div>}
        {history.length > 0 && (
          <div className="Main_vdx">
            {history.map((elem) => (
              <div className="Child_vdx">
                <div className="History_dates">{elem.date}</div>

                <div className="vdx_Container">
                  {elem.data.map((item) => {
                    const { video } = item;
                    return (
                      <div
                        onClick={() => handleNavigatefullVideeo(video._id)}
                        className="vdx"
                      >
                        <div className="vdx_thumbnail">
                          <img src={video.thumbnail} alt="" />
                        </div>
                        <div className="vdx_info">
                          <div className="video_title">
                            <p>{video.title}</p>
                            <div className="del_dots">
                              <svg
                                onClick={(e) => handledelteHistory(e, item._id)}
                                xmlns="http://www.w3.org/2000/svg"
                                enable-background="new 0 0 24 24"
                                height="27"
                                viewBox="0 0 24 24"
                                width="27"
                                focusable="false"
                              >
                                <path d="m12.71 12 8.15 8.15-.71.71L12 12.71l-8.15 8.15-.71-.71L11.29 12 3.15 3.85l.71-.71L12 11.29l8.15-8.15.71.71L12.71 12z"></path>
                              </svg>
                              <div className="tooltip">
                                Remove from watchHistory
                              </div>
                            </div>
                          </div>
                          <div className="owner_view">
                            <span>{video.owner.username}</span>
                            <span>{video.view} view</span>
                          </div>
                          <p className="views">{video.description}</p>
                          {/* <p>{video.}</p> */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
     }

      <div className="History_settings">
        <div className="History_controlls">
          <div className="History_search">
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 -2 24 24"
                width="24"
                focusable="false"
              >
                <path d="m20.87 20.17-5.59-5.59C16.35 13.35 17 11.75 17 10c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.75 0 3.35-.65 4.58-1.71l5.59 5.59.7-.71zM10 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"></path>
              </svg>
            </span>
            <input
              placeholder="Search watch history"
              type="text"
              value={historySearch}
              onChange={(e) => sethistorySearch(e.target.value)}
            />
            <span>
              <svg
                onClick={() => sethistorySearch("")}
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 -2 24 24"
                width="24"
                focusable="false"
              >
                <path d="m12.71 12 8.15 8.15-.71.71L12 12.71l-8.15 8.15-.71-.71L11.29 12 3.15 3.85l.71-.71L12 11.29l8.15-8.15.71.71L12.71 12z"></path>
              </svg>
            </span>
          </div>
          <div className="History_btns History_clear">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 24 24"
              width="24"
              focusable="false"
            >
              <path d="M11 17H9V8h2v9zm4-9h-2v9h2V8zm4-4v1h-1v16H6V5H5V4h4V3h6v1h4zm-2 1H7v15h10V5z"></path>
            </svg>
            <p onClick={handledelteAllHistory}>clear all watch history</p>
          </div>
          <div className=" History_btns History_clear">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 24 24"
              width="24"
              focusable="false"
            >
              <path d="M9 19H7V5h2Zm8-14h-2v14h2Z"></path>
            </svg>
            <p>pause watch history</p>
          </div>
          <div className=" History_btns History_clear">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              enable-background="new 0 0 24 24"
              height="24"
              viewBox="0 0 24 24"
              width="24"
              focusable="false"
            >
              <path d="M12 9.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5m0-1c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zM13.22 3l.55 2.2.13.51.5.18c.61.23 1.19.56 1.72.98l.4.32.5-.14 2.17-.62 1.22 2.11-1.63 1.59-.37.36.08.51c.05.32.08.64.08.98s-.03.66-.08.98l-.08.51.37.36 1.63 1.59-1.22 2.11-2.17-.62-.5-.14-.4.32c-.53.43-1.11.76-1.72.98l-.5.18-.13.51-.55 2.24h-2.44l-.55-2.2-.13-.51-.5-.18c-.6-.23-1.18-.56-1.72-.99l-.4-.32-.5.14-2.17.62-1.21-2.12 1.63-1.59.37-.36-.08-.51c-.05-.32-.08-.65-.08-.98s.03-.66.08-.98l.08-.51-.37-.36L3.6 8.56l1.22-2.11 2.17.62.5.14.4-.32c.53-.44 1.11-.77 1.72-.99l.5-.18.13-.51.54-2.21h2.44M14 2h-4l-.74 2.96c-.73.27-1.4.66-2 1.14l-2.92-.83-2 3.46 2.19 2.13c-.06.37-.09.75-.09 1.14s.03.77.09 1.14l-2.19 2.13 2 3.46 2.92-.83c.6.48 1.27.87 2 1.14L10 22h4l.74-2.96c.73-.27 1.4-.66 2-1.14l2.92.83 2-3.46-2.19-2.13c.06-.37.09-.75.09-1.14s-.03-.77-.09-1.14l2.19-2.13-2-3.46-2.92.83c-.6-.48-1.27-.87-2-1.14L14 2z"></path>
            </svg>
            <p>Manage watch history</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryComp;
