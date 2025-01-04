import { useState } from "react"

import "./style.css"

function IndexNewtab() {
  const [data, setData] = useState("")

const getData = async () => {
  const data = await chrome.storage.local.get(['data', 'session']);
  console.log(data);

  chrome.storage.local.get(null, (items) => {
    console.log("All local storage data:", items);
  });
}

  return (
    <div
      className="new-tab"
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

export default IndexNewtab
