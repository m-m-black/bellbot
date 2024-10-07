import React, { useState, useCallback } from "react";
import homeStyles from "./home.module.css";
import Grid from "../../components/grid";
import Controls from "../../components/controls";

const Header = () => {
  return (
    <nav className={homeStyles.nav}>
      <h1>bellbot &#129302;</h1>
    </nav>
  );
};

const Info = ({ controls }) => {
  return (
    <article className={homeStyles.instructionsContainer}>
      <h1>How To Play</h1>
      <div className={homeStyles.instructionsText}>
        <p>Rotate Bellbot with the arrow keys.</p>
        <p>Move Bellbot with the spacebar.</p>
        <p>Or use the Bellbot control pad.</p>
      </div>
      <Controls controls={controls} />
      <p>Try me on mobile!</p>
    </article>
  );
};

export default function Home() {
  const [controls, setControls] = useState(null);

  const handleSceneReady = useCallback((sceneControls) => {
    setControls(sceneControls);
  }, []);

  return (
    <>
      <div className={homeStyles.container}>
        <Header />
        <div className={homeStyles.content}>
          <div className={homeStyles.contentMain} id="grid-container">
            <Grid onSceneReady={handleSceneReady} />
          </div>
          <div className={homeStyles.contentAside}>
            <Info controls={controls} />
          </div>
        </div>
      </div>
    </>
  );
}
