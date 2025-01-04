import { useState } from "react"

function IndexOptions() {
  const [data, setData] = useState("")

  const getData = () => {
    chrome.permissions.request({ permissions: ["identity"] }, (granted) => {
      if (granted) {
        console.log("Permission granted!");
      } else {
        console.error("Permission denied.");
      }
    });
    
    console.log(chrome.storage)
    console.log(chrome)
    const data = chrome.identity.launchWebAuthFlow
    console.log(data);
  }

  return (
    <div
      style={{
        display: "flex",
      }}>
        
      <button
        onClick={getData}
        style={{
          backgroundColor: "#0073b1",
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Test
      </button>
    </div>
  )
}

export default IndexOptions
