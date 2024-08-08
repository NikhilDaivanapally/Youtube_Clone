import React, { useEffect, useState } from 'react'
import './Playlist.css';
import {useSelector } from 'react-redux'
import Loading from '../Loader/Loading';
import { Link } from 'react-router-dom';
import uploadedAt from '../timeOfUpload';
// import Loading from '../Loader/Loading';
const Playlist = ({search}) => {


  // console.log(search,'1')
  const user = useSelector((state) => state.user);
  console.log(user,'user')
  const userfullname = user.data[0].fullname
  const [videos,setvideos] = useState(null);
  // console.log(videos)
  

    useEffect(() =>{

      try{

        fetch(`http://localhost:8000/user/playlist?Search_query=${search}`,{credentials:'include'}).then((res) => res.json()).then(data => {console.log(data);setvideos(data.data[0].videos)})
        }
        catch(err){
          
          console.log(err)
        }
    },[search])


   
    
    


  return (
    <div className='WatchLater' style={{color:"white"}}>
      
      { !videos && <Loading/>}

       {
        videos?.length > 0 &&
        <>
       <div className='watchlater_info' style={{ color: 'white', position: 'relative', overflow: 'hidden',  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,1)), url(${videos[0]?.thumbnail})`, backgroundPosition: 'center', }}>
  <div className='container_info' style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',backdropFilter:'blur(30px)'}}>
    <div className="watchlater_thumbnail">

      <img src={videos[0]?.thumbnail} alt="" />
      <div className='watchlater_playall'>
      <svg  xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false"><path fill='white' d="m7 4 12 8-12 8V4z"></path></svg>
          PlayAll
      </div>
    </div>
    <p className='watchlater_title'>Watch later
    </p>
    <p className='watchlater_username'>{userfullname}
    <br />
    {videos?.length} videos
    </p>
    <div className='watchlater_btn'>
      <button>
        <div>
        <svg  xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false"><path fill='black' d="m7 4 12 8-12 8V4z"></path></svg>
          </div>play All</button>
      <button>
        <div>
        <svg xmlns="http://www.w3.org/2000/svg"  height="24" viewBox="0 0 24 24" width="24" focusable="false"><path fill='black' d="M18.15 13.65 22 17.5l-3.85 3.85-.71-.71L20.09 18H19c-2.84 0-5.53-1.23-7.39-3.38l.76-.65C14.03 15.89 16.45 17 19 17h1.09l-2.65-2.65.71-.7zM19 7h1.09l-2.65 2.65.71.71L22 6.51l-3.85-3.85-.71.71L20.09 6H19c-3.58 0-6.86 1.95-8.57 5.09l-.73 1.34C8.16 15.25 5.21 17 2 17v1c3.58 0 6.86-1.95 8.57-5.09l.73-1.34C12.84 8.75 15.79 7 19 7zM8.59 9.98l.75-.66C7.49 7.21 4.81 6 2 6v1c2.52 0 4.92 1.09 6.59 2.98z"></path></svg>
        </div>
        shuffle</button>
    </div>
  </div>
       </div>
       <div className='watchlater_list' >
        <div className='watchlater_sort'>
        <svg xmlns="http://www.w3.org/2000/svg"  height="24" viewBox="0 0 24 24" width="24" focusable="false"><path d="M21 6H3V5h18v1zm-6 5H3v1h12v-1zm-6 6H3v1h6v-1z"></path></svg> Sort
        </div>
        <ul>
          {
          videos?.map(({_id,title,thumbnail,videoFile,createdAt,owner,likes},i) => {
            // owner is an array which has a single objecy which is owner
            const {username} = owner[0];
            // console.log(username)
             const time = uploadedAt(createdAt);
          return (
        <Link to={`/watch/${_id}`}>

            <li className='watchlater_listvid' key={i}>
            <div className='drag_icon'>
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false"><path d="M21 10H3V9h18v1Zm0 4H3v1h18v-1Z"></path></svg>
            
            </div>
            <div className='wathlater_video'>
                <img src={thumbnail} alt="" />
            </div>
            <div className='watchlater_details'>
              <p>{title}</p>
              <div className='watchlater_videodets'>
              <p>{username}</p> .
              <p>{likes} likes</p>.
              <p>{time}</p>
              </div>
            </div>
            <div className='watchlater_threedots'>
             <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        >
        <path d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"></path>
            </svg>
            </div>
          </li>
          </Link>
          )
          })
        }
        </ul>
       </div>
        </>  
       }
       {
        videos?.length == 0 && <div className='NoWatchLaterVideos NoLikedVideos'>No {search}</div>
       }
      
    </div>
    )

}

export default Playlist

