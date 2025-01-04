import React, { useEffect, useState } from "react";
import { getSession, signInWithLinkedIn } from "./services/auth";

const Popup = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      setIsLoggedIn(!!session);
    };

    checkSession();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithLinkedIn();
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Sign in failed:", err);
    }
  };

  return (
    <div style={{ padding: "16px", fontFamily: "Arial, sans-serif", display: "flex", }}>
      {isLoggedIn ? (
        <h3>Welcome! You are signed in.</h3>
      ) : (
        <>
          <h3>Please sign in with LinkedIn</h3>
          <button
            onClick={handleSignIn}
            style={{
              padding: "8px 16px",
              fontSize: "16px",
              backgroundColor: "#0073b1",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Sign in with LinkedIn
          </button>
        </>
      )}
    </div>
  );
};

export default Popup;
