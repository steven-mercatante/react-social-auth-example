import React, { useEffect, useReducer, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./App.css";

function getHeaders() {
  const headers = {
    Authorization: `Token ${Cookies.get("auth_token")}`
  };
  return headers;
}

function authReducer(state, event) {
  switch (event.type) {
    case "AUTH":
      return { ...state, status: "authenticating" };
    case "SUCCESS":
      return { ...state, status: "authenticated" };
    case "LOGOUT":
      return { ...state, status: "idle" };
    default:
      return state;
  }
}

const initialState = {
  status: Cookies.get("auth_token") ? "authenticated" : "idle"
};

function Clients() {
  const [clients, setClients] = useState([]);
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/clients/", {
        headers: getHeaders()
      })
      .then(resp => {
        setClients(resp.data);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  return (
    <>
      <h2>Clients</h2>
      <ul>
        {clients.map(client => (
          <li key={client.id}>
            <span>{client.name}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function App() {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const popupRef = useRef(null);

  useEffect(() => {
    // console.log("useEffect state:", state);
    if (state.status === "authenticating") {
      openPopup();
    }
  }, [state, state.status]);

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
      if (message.data === "AUTH_SUCCESS") {
        dispatch({ type: "SUCCESS" });
      }
    });
  }

  function handleLogout() {
    dispatch({ type: "LOGOUT" });
    Cookies.remove("auth_token");

    axios
      .post(
        "http://127.0.0.1:8000/users/logout",
        {},
        {
          headers: getHeaders()
        }
      )
      .then(resp => {
        console.log("log out resp:", resp);
      })
      .catch(err => {
        console.log(err);
      });
  }

  return (
    <div className="App">
      {state.status === "authenticated" ? (
        <>
          <button onClick={handleLogout}>log out</button>
          <Clients />
        </>
      ) : (
        <button onClick={() => dispatch({ type: "AUTH" })}>
          Login via GitHub
        </button>
      )}
    </div>
  );
}

export default App;
