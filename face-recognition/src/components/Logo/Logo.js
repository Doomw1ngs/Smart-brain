import React from "react";
import Tilt from "react-parallax-tilt";
import brain from "./brain.png";
import "./Logo.css";

const Logo = () => {
  return (
    <div className="ma4 mt0">
      <Tilt
        style={{ width: "150px" }}
        tiltReverse={true}
        glareEnable={true}
        glareColor="#fff"
        glareMaxOpacity={0.7}
        glarePosition="all"
      >
        <div
          className="tilt br2 shadow-2 pa1"
          style={{
            height: "150px",
            width: "150px",
          }}
        >
          <h1>
            <img src={brain} alt="brain-icon" />
          </h1>
        </div>
      </Tilt>
    </div>
  );
};

export default Logo;
