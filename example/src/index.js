import React from "react";
import ReactDOM from "react-dom";
import { getIcon } from "./sprite/getIcon";

// import ABC from "./another/test_1.png";
// import AccountRemove from "./another/test_2.png";
// import Account from "./another/test_3.png";
// import ABC_1 from "./media/test_4.png";
// import transparent from "./media/transparent.png";

const AppElement = () => {
  const icon1 = getIcon(".png");
  return (
    <div>
      <p>Tes_1</p>
      <img src={icon1.url} width={icon1.width} height={icon1.height} />
    </div>
  );
};
const root = document.querySelector("body");
ReactDOM.render(
  <AppElement />,
  root
);