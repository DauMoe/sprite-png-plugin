import React from "react";
import ReactDOM from "react-dom";

import ABC from "./media/test_1.png";
import AccountRemove from "./media/test_2.png";
import Account from "./media/test_3.png";
import transparent from "./media/transparent.png";
import * as data from "./test.json";

const AppElement = () => {
  console.log("ABC", data);
  return (
    <div>
      <img src={ABC} />
      <img src={transparent} />
      <img src={Account} />
      <img src={AccountRemove} />
    </div>
  );
};
const root = document.querySelector("body");
ReactDOM.render(
  <AppElement />,
  root
);