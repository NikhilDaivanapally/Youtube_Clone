
const Subscribe = async (channelid) => {
    const data = {channelid}
 const res = await fetch('http://localhost:8000/user/setsubscirbe', {
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

export default Subscribe