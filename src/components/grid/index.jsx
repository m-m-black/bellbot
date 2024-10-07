import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const Grid = ({ onSceneReady }) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const robotRef = useRef(null);
  const gridRef = useRef(null);
  const [isSceneReady, setIsSceneReady] = useState(false);

  const rotateRobot = useCallback((direction) => {
    if (!robotRef.current) return;
    switch (direction) {
      case "left":
        robotRef.current.rotation.y = -Math.PI / 2;
        break;
      case "right":
        robotRef.current.rotation.y = Math.PI / 2;
        break;
      case "up":
        robotRef.current.rotation.y = Math.PI;
        break;
      case "down":
        robotRef.current.rotation.y = 0;
        break;
    }
  }, []);

  const moveRobot = useCallback(() => {
    if (!robotRef.current) return;

    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(robotRef.current.quaternion);

    direction.x = Math.round(direction.x);
    direction.z = Math.round(direction.z);

    const currentPosition = robotRef.current.position.clone();
    const newPosition = currentPosition.add(direction);

    if (Math.abs(newPosition.x) <= 2 && Math.abs(newPosition.z) <= 2) {
      robotRef.current.position.copy(newPosition);
      console.log("Robot moved to:", newPosition);
    }
  }, []);

  useEffect(() => {
    console.log("Setting up scene...");
    sceneRef.current = new THREE.Scene();
    cameraRef.current = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 1000);
    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true, // Enable alpha (transparency)
    });
    rendererRef.current.setClearColor(0x000000, 0); // Set clear color to transparent

    const container = document.getElementById("grid-container");
    const width = container.clientWidth;
    const height = container.clientHeight;
    const size = Math.min(width, height);

    rendererRef.current.setSize(size, size);

    cameraRef.current.position.set(10, 10, 10);
    cameraRef.current.lookAt(0, 0, 0);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    sceneRef.current.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    sceneRef.current.add(directionalLight);

    console.log("Creating shadow-receiving plane...");
    const shadowPlaneGeometry = new THREE.PlaneGeometry(10, 10);
    const shadowPlaneMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const shadowPlane = new THREE.Mesh(
      shadowPlaneGeometry,
      shadowPlaneMaterial
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.5; // Slightly below the grid
    shadowPlane.receiveShadow = true;
    sceneRef.current.add(shadowPlane);

    console.log("Creating grid...");
    gridRef.current = new THREE.Group();
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        const isEven = (x + z) % 2 === 0;
        const color = isEven ? "#23564d" : "#e15a1d";
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshPhongMaterial({
          color: color,
          side: THREE.DoubleSide,
        });
        const square = new THREE.Mesh(geometry, material);
        square.rotation.x = -Math.PI / 2;
        square.position.set(x, 0, z);
        square.receiveShadow = true;
        square.castShadow = true;
        gridRef.current.add(square);
      }
    }
    sceneRef.current.add(gridRef.current);

    console.log("Loading GLTF model...");
    const gltfLoader = new GLTFLoader();
    const url = "../../../assets/models/scene.gltf";
    gltfLoader.load(
      url,
      (gltf) => {
        console.log("GLTF model loaded successfully");
        const root = gltf.scene;
        root.scale.set(0.35, 0.35, 0.35);

        // Remove any existing robot from the scene
        if (robotRef.current) {
          sceneRef.current.remove(robotRef.current);
        }

        robotRef.current = root;
        robotRef.current.position.set(0, 0.65, 0); // Position above the grid

        robotRef.current.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = false;
          }
        });
        sceneRef.current.add(robotRef.current);
        console.log(
          "Robot added to scene. Position:",
          robotRef.current.position
        );
        setIsSceneReady(true);
      },
      (progress) => {
        console.log(
          "Loading progress:",
          (progress.loaded / progress.total) * 100,
          "%"
        );
      },
      (error) => {
        console.error("Error loading GLTF model:", error);
      }
    );

    // Enable shadow rendering
    rendererRef.current.shadowMap.enabled = true;
    rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap;

    const animate = () => {
      requestAnimationFrame(animate);
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    console.log("Scene setup complete");

    if (isSceneReady) {
      onSceneReady({ rotateRobot, moveRobot });
    }

    // Cleanup function
    return () => {
      if (robotRef.current) {
        sceneRef.current.remove(robotRef.current);
      }
      // Dispose of geometries, materials, textures, etc.
      if (gridRef.current) {
        gridRef.current.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) object.material.dispose();
        });
      }
    };
  }, [isSceneReady, onSceneReady, rotateRobot, moveRobot]);

  useEffect(() => {
    if (!isSceneReady) return;

    const handleKeyDown = (event) => {
      switch (event.code) {
        case "ArrowLeft":
          rotateRobot("left");
          break;
        case "ArrowRight":
          rotateRobot("right");
          break;
        case "ArrowUp":
          rotateRobot("up");
          break;
        case "ArrowDown":
          rotateRobot("down");
          break;
        case "Space":
          moveRobot();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSceneReady, rotateRobot, moveRobot]);

  return <canvas ref={canvasRef} />;
};

export default Grid;
