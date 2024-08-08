import React from 'react'
import './ErrorPage.css'
import { useNavigate } from 'react-router-dom'
const ErrorPage = () => {
  const Navigate = useNavigate();
  return (
    <div className='ErrorPage'>
        <h1>4<span className='y2_color'>0</span>4</h1>
        <div className='y2_text'><p>SORRY, THERE'S</p>
        <p className='y2_color'>NOTHING HERE</p></div>
        <button className='y2_goback' onClick={() => Navigate(-1)}>Go Back</button> {/*takes back to previous page*/}

    </div>
  )
}

export default ErrorPage