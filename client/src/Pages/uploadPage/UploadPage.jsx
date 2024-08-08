import React, { useRef, useState,useMemo } from 'react'
import './UploadPage.css'
import axios from 'axios'
import {useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const UploadPage = () => { 
  // Navigating to routes based on cond
  const Navigate = useNavigate();
  // loader
  const [loading, setLoading] = useState(false);
  // popup msg after successfull video upload
  const [popup,setPopup] = useState(false)

  const videoRef = useRef(); 
  const thumbnailRef = useRef(); 
  const tail_anim = useRef();
  const tail_anim1 = useRef();
  const user = useSelector((state) => state.user);
  // if(!user){
  //    return Navigate('/')
  // }
     const [uploadForm,setUploadForm] = useState({
        title:'',
        description:'',
        video:null,
        thumbnail:null,
        owner:user?.data[0]._id // getting from redux store 
    })
    
    const handleDragOver = (e) =>{
        e.preventDefault();
        if(tail_anim.current || tail_anim1.current){
        if(e.target.className == 'video' || e.target.className == 'circle'){
          tail_anim.current.style.width='15px'
        tail_anim.current.style.height = '5px' 
        }
              
         else if(e.target.className == 'thumbnail' || e.target.className == 'circle'){tail_anim1.current.style.width='15px'
        tail_anim1.current.style.height = '5px'}

      }
    
      }


      const handleDragLeave = (e) => {
        // console.log(e.relatedTarget)
        e.preventDefault();
        if(tail_anim.current && tail_anim1.current)
       { if (e.relatedTarget !== tail_anim.current && e.relatedTarget !== tail_anim1.current) {
            // If the drag leaves neither tail_anim nor tail_anim1, reset styles for both
            tail_anim.current.style.width = '10px';
            tail_anim.current.style.height = '10px';
            tail_anim1.current.style.width = '10px';
            tail_anim1.current.style.height = '10px';
        } else if (e.relatedTarget === tail_anim.current) {
            // If the drag leaves tail_anim, reset styles only for tail_anim
            tail_anim.current.style.width = '10px';
            tail_anim.current.style.height = '10px';
        } else if (e.relatedTarget === tail_anim1.current) {
            // If the drag leaves tail_anim1, reset styles only for tail_anim1
            tail_anim1.current.style.width = '10px';
            tail_anim1.current.style.height = '10px';
        }}
    }

    // handling the text change
    const handleChange = (event) => {
      // console.log(event.target.name)
        const { name, value } = event.target;
        setUploadForm({ ...uploadForm, [name]: value });
      };

      // handling the file Change by selection
      const handleFileChange = (event) => {
        const { name, files } = event.target;
        setUploadForm({ ...uploadForm, [name]: files[0] });
      };
     
      // handling the file Change by Drag & Drop
    
      const handleDrop =  (e) => {
      e.preventDefault();
      if(e.target.className == 'video' || e.target.className == 'thumbnail'){
      const name = e.target.className;
      const files = e.dataTransfer.files
      setUploadForm({ ...uploadForm, [name]: files[0] });
      }
    }
      
      
 // required for passing the credentials for authentication state
axios.defaults.withCredentials = true;

// upload handler

    const HandleUpload = async  (e) =>{
        e.preventDefault();
        setLoading(true)

        const data = new FormData();
      for (let key in uploadForm) {
        data.append(key, uploadForm[key]);
      }

      try {
        const response = await axios.post('http://localhost:8000/user/upload', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            
          },
          onUploadProgress: (data) =>{
            console.log(Math.round((data.loaded/data.total) * 100),Math.round(data.estimated))
          }
        });
        if(response.data.statusCode){
          setPopup(true)
        }
        
        setLoading(false )
        console.log(response)
        setUploadForm({title:'',
        description:'',
        video:null,
        thumbnail:null,
        owner:user?.data[0]._id})
  
      
      }
    catch(error){
        console.log(error)
        setLoading(false)
    }
}


// generating preview url for video and the thumbnail

const videoUrl = useMemo(() => {
  if (uploadForm?.video) {
    return URL.createObjectURL(uploadForm.video);
  }
  return null;
}, [uploadForm?.video]);

const thumbnailUrl = useMemo(() => {
  if (uploadForm?.thumbnail) {
    return URL.createObjectURL(uploadForm.thumbnail);
  }
  return null;
}, [uploadForm?.thumbnail]);




  return (
    <div className='Upload'>
          <div className={`back_blur ${popup ? 'display' :''}`}>
              <div className='popup_container'>
                  <div className='popup_box'>
                            <img onClick={() => setPopup(!popup)}  src="../../src/assests/delete.png" alt="" />
                  </div>
                  <div className='upload_text' style={{color:'black'}}>
                    <p>
                      video has uploaded
                    </p>
                    <p>successfully</p>
                  </div>
                  <button onClick={() => setPopup(!popup)}>Continue Uploading</button>
                  <button onClick={() => Navigate('/feed')}>Go Home</button>
              </div>
          </div>
        <form onSubmit={HandleUpload}>
       <div className='file_label'>
        <p>video : </p>
        <p>Thumbnail :</p>
        </div>   
      <div className='uploadingfiles_container'>
        <div className='uploadbox'>
          { !uploadForm.video ?
           <div className='video'  onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave}>
           <div className='circle'>
             <div className="arrow"></div>
             <div ref={tail_anim} className="arrow_tail"></div>
             <div className="rect"></div>
 
           </div>
             <p>Drag and Drop video to Upload</p>
             <p>or</p>
             <input type="file" name='video' onChange={handleFileChange} ref={videoRef}  hidden/>
              <span onClick={() => videoRef.current.click()}>Select File</span>
           </div>
          
          : <div className='video_preview' style={{width:'100%',height:'100%'}}>
             <video width='100%' height='100%' controls src={videoUrl ? videoUrl : ""}></video>
          </div> }
         
        </div>
        <div className='uploadbox'>
         {!uploadForm.thumbnail ?  

         <div className='thumbnail' onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave}>
            
            <div className='circle'>
                <div className="arrow"></div>
                <div ref={tail_anim1} className="arrow_tail"></div>
                <div className="rect"></div>
    
              </div>
                <p>Drag and Drop thumbnail to Upload</p>
                <p>or</p>
                <input type="file" name='thumbnail' onChange={handleFileChange} ref={thumbnailRef} hidden/>
                 <span  onClick={() => thumbnailRef.current.click()}>Select File</span>
              </div> :
              
              <div className='thumbnail_preview' style={{width:'100%',height:'100%'}}>
              <img style={{width:"100%",height:'100%',objectFit:"cover",backgroundColor:'white'}} src={thumbnailUrl ? thumbnailUrl : ""}></img>

              </div>
              }
        </div>
      </div>

        <textarea className='field' style={{ resize: 'vertical' }}  placeholder='title' name='title' value={uploadForm.title} onChange={handleChange}/>
        <textarea className='field' style={{ resize: 'vertical' }}  placeholder='description' name='description' value={uploadForm.description} onChange={handleChange} />
         
        <button className='upload_btn' disabled={loading} type='submit'>
          {loading ? 
          <div className='loader'></div>
          :"Upload Video"}
        </button>
        </form>
        
    </div>
  )
}

export default UploadPage
