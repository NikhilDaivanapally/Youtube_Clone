
const LikeState = async (videoid) => {
    const data = { videoid };
 const res = await fetch('http://localhost:8000/user/setlike', {
    method: "POST",
    credentials:"include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
const value = await res.json();
console.log(value);



}

export default LikeState;