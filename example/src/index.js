import React from "react";
import ReactDOM from "react-dom";

import ABC from "./another/test_1.png";
import AccountRemove from "./another/test_2.png";
import Account from "./another/test_3.png";
import ABC_1 from "./media/test_4.png";
import transparent from "./media/transparent.png";
import * as data from "./manifest.json";

const AppElement = () => {
  console.log("ABC", data?.frames);
  return (
    <div>
      <p>Tes_1</p>
      <img src={ABC} />
      <p>Trans</p>
      <img src={transparent} />
      <p>Test_1_dup</p>
      <img src={ABC_1} />
      <p>ACc remove</p>
      <img src={AccountRemove} />
    </div>
  );
};
const root = document.querySelector("body");
ReactDOM.render(
  <AppElement />,
  root
);