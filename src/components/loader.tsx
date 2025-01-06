import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

const Overlay = ({ message, visible, success }) => {
    if (!visible) return null;
  
    return ReactDOM.createPortal(
      <div
        id="overlay-loader"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "5%" }}>
          {success ? (
            <div style={styles.successContainer}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={styles.successCheck}
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          ) : (
            <div style={styles.spinner}></div>
          )}
          <p style={styles.message}>{message}</p>
          <p style={styles.convexAI}>Convex AI on Duty 🫡</p>
        </div>
      </div>,
      document.body
    );
  };  

  const styles = {
    spinner: {
      width: "50px",
      height: "50px",
      border: "5px solid #f3f3f3",
      borderTop: "5px solid #3498db",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "auto",
    },
    message: {
      marginTop: "5px",
      color: "#fff",
      fontSize: "16px",
    },
    convexAI: {
      marginTop: "10px",
      color: "#fff",
      fontSize: "12px",
      fontWeight: "bold",
    },
    successContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      animation: "successAnimation 0.5s ease-in-out forwards",
    },
    successCheck: {
      width: "50px",
      height: "50px",
    },
  };
  
  const injectCSS = () => {
    const style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
  
        @keyframes successAnimation {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `;
    document.head.appendChild(style);
  };  

  const OverlayManager = (() => {
    let overlayRoot = null;
    let setOverlayState = null;
  
    const OverlayComponent = () => {
      const [state, setState] = React.useState({
        message: "",
        visible: false,
        success: false,
      });
      setOverlayState = setState;
      return (
        <Overlay
          message={state.message}
          visible={state.visible}
          success={state.success}
        />
      );
    };
  
    const init = () => {
      if (!overlayRoot) {
        injectCSS();
        overlayRoot = document.createElement("div");
        document.body.appendChild(overlayRoot);

        const root = createRoot(overlayRoot);
        root.render(<OverlayComponent />);
      }
    };
  
    const show = (message = "Loading...") => {
      if (!overlayRoot) init();
      setOverlayState && setOverlayState({ message, visible: true, success: false });
    };
  
    const hide = () => {
      setOverlayState && setOverlayState({ message: "", visible: false, success: false });
    };
  
    const showSuccess = (message = "Successfully analysed... 3.2..1...") => {
      if (setOverlayState) {
        setOverlayState({ message, visible: true, success: true });
      }
    };
  
    return { show, hide, showSuccess };
  })();  

export default OverlayManager;
