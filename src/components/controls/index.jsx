import React from "react";
import styles from "./controls.module.css";

const Controls = ({ controls }) => {
  return (
    controls && (
      <div className={styles.container}>
        <div className={styles.dpadContainer}>
          <div className={styles.dpadRow}>
            <button
              className={styles.directionButton}
              onClick={() => controls.rotateRobot("left")}
            >
              <p>&#x2196;</p>
            </button>
            <button
              className={styles.directionButton}
              onClick={() => controls.rotateRobot("up")}
            >
              <p style={{ transform: "rotate(90deg)" }}>&#x2196;</p>
            </button>
          </div>
          <div className={styles.dpadRow}>
            <button
              className={styles.directionButton}
              onClick={() => controls.rotateRobot("down")}
            >
              <p style={{ transform: "rotate(90deg)" }}>&#x2198;</p>
            </button>
            <button
              className={styles.directionButton}
              onClick={() => controls.rotateRobot("right")}
            >
              <p>&#x2198;</p>
            </button>
          </div>
        </div>
        <div className={styles.moveButtonContainer}>
          <button className={styles.moveButton} onClick={controls.moveRobot}>
            <p>Move</p>
          </button>
        </div>
      </div>
    )
  );
};

export default Controls;
