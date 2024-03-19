import React from "react";
import ReactDOM from "react-dom";

import ABC from "./assets/account-add.svg";
import AccountRemove from "./assets/account-remove.svg";
import Account from "./assets/account.svg";
import addProfile from "./assets/add-profile.svg";
import alert from "./assets/alert.svg";


const AppElement = () => {
  console.log("ABC", ABC);
  return (
    <div>
      <img src={ABC} />
      {/* <img src={AccountRemove} />
      <img src={Account} />
      <img src={addProfile} /> */}
    </div>
  );
};
const root = document.querySelector("body");
ReactDOM.render(
  <AppElement />,
  root
);