import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Nav1 from "../../Components/Navbar/TopNavbar/nav1";
import Sidenav from "../../Components/Navbar/SideNavbar/Sidenav";
import "./UserChannel.css";
import Subscribe from "../../Components/subscribeState/Subscribe";
// import Loading from "../../Components/Loader/Loading";

const UserChannel = () => {
  const user = useSelector((state) => state.user);
  const [userChannel, setuserChannel] = useState(null);
  const { username } = useParams();
  const [subs, setsubs] = useState(null);
  const [subloading, setsubloading] = useState(false);
  const barRef = useRef();
  const liRefs = useRef([]);
  const [activeField, setactiveField] = useState("Home");
  // console.log(username);
  useEffect(() => {
    const fetchSearch_Result = () => {
      setsubloading(true);
      fetch(`http://localhost:8000/result?search_query=${username}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setsubloading(false);
          setuserChannel(data.data);
          setsubs(data.data.isSubscribed);
        })
        .catch((error) => {
          console.error("Error:", error);
          setsubloading(false);
        });
    };
    fetchSearch_Result();
  }, [subs,username]);
  console.log(activeField)
   const Handlelianim = (e, index) => {
    // console.log(e.target.innerText)
    setactiveField(e.target.innerText);
    let width = 0;
    for (let i = 0; i < index; i++) {
      let length = liRefs.current[i].getBoundingClientRect().width;
      width += length + 18;
    }
    let lengthbar = e.target.getBoundingClientRect().width;
    barRef.current.style.width = lengthbar + "px";
    barRef.current.style.left = Math.round(width) + "px";
  };

  return (
    <main className="main">
      <>
        {/* topnav */}
        <Nav1 user={user?.data[0]} />
        {/* combining the sidenav with videos container */}
        {userChannel && (
          <div className="Container" style={{ display: "flex" }}>
            <Sidenav />
            <div className="userChannel_box">
              <div className="userChannel_coverImage">
                <div className="coverImage">
                  <img src={userChannel[0]?.coverImage} alt="" />
                </div>
              </div>
              <div className="userChannel_info">
                <div className="userChannel_avatar">
                  <img src={userChannel[0]?.avatar} alt="" />
                </div>
                <div className="userChannel_details">
                  <p className="userChannel_fullname">
                    {userChannel[0]?.fullname}
                  </p>
                  <div className="useChannel_flexdets">
                    <p>{userChannel[0].username}</p>.
                    <p>{userChannel[0].subscribersCount} Subscribers</p>.
                    <p>{userChannel[0].videosCount} videos</p>
                  </div>
                
                    <button
                      className={`userChannel_subStatus ${
                        userChannel[0]?.isSubscribed
                          ? "subscribed"
                          : "subscribe"
                      }`}
                      onClick={() => {
                        setsubs(!subs);
                        Subscribe(userChannel[0]?._id);
                      }}
                    >
                      { subloading ? 
                      <>
                      <div></div>
                      <div></div>
                      <div></div>
                      </>
                      
                      :userChannel[0]?.isSubscribed
                        ? "subscribed"
                        : "subscribe"}
                    </button>
                 
                </div>
              </div>
              <div className="selection_bar">
                <ul>
                  <div ref={barRef} className="bar"></div>
                  {["Home", "Videos", "Community", "Playlist"].map(
                    (elem, index) => {
                      return (
                        <li
                          key={index}
                          ref={(elem) => (liRefs.current[index] = elem)}
                          onClick={(e) => {
                            Handlelianim(e, index);
                          }}
                        >
                          {elem}
                        </li>
                      );
                    }
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </>
    </main>
  );
};

export default UserChannel;
