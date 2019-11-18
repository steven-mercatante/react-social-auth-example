import React, { useEffect, useReducer, useRef } from "react";
import "./App.css";

function authReducer(state, event) {
  switch (event.type) {
    case "AUTH":
      return { ...state, status: "authenticating" };
    case "SUCCESS":
      return { ...state, status: "success" };
    default:
      return state;
  }
}

const initialState = {
  status: "idle"
};

function App() {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const popupRef = useRef(null);

  useEffect(() => {
    if (state.status === "authenticating") {
      openPopup();
    }
  }, [state.status]);

  function openPopup() {
    const width = 600;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    const url = "http://127.0.0.1:8000/accounts/github/login/";

    popupRef.current = window.open(
      url,
      "",
      `toolbar=no, location=no, directories=no, status=no, menubar=no, 
      scrollbars=no, resizable=no, copyhistory=no, width=${width}, 
      height=${height}, top=${top}, left=${left}`
    );

    window.addEventListener("message", message => {
      // TODO: update origin URL once everything is moved to production
      if (message.origin !== "http://127.0.0.1:8000") return;
      console.log("received message from backend", message.data);
    });
  }

  return (
    <div className="App">
      <button onClick={() => dispatch({ type: "AUTH" })}>
        Login via GitHub
      </button>
    </div>
  );
}

export default App;
