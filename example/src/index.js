import React from "react";
import ReactDOM from "react-dom";

import ABC from "./assets/test_1.png";
import AccountRemove from "./assets/test_2.png";
import Account from "./assets/test_3.png";
import transparent from "./assets/transparent.png";


const AppElement = () => {
  console.log("ABC", G);
  return (
    <div>
      <img src={ABC} />
      <img src={transparent} />
      {/* <img src={Account} />
      <img src={addProfile} /> */}
    </div>
  );
};
const root = document.querySelector("body");
ReactDOM.render(
  <AppElement />,
  root
);