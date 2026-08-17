import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import "./HeroSection.css";
import { Model } from "../../Model/Model";
import { Link } from "react-router-dom";
import productService from "../../../Services/productService";
import { formatImageUrl } from "../../../Services/apiClient";
import defaultHeroBg from "../../../Assets/Banner/banner_1.jpg";

const HeroSection = () => {
  const [tshirtColor, setTshirtColor] = useState("red");
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    productService
      .getBanners("hero")
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setSlides(res.data);
        }
      })
      .catch((err) => console.error("Error loading hero banners:", err));
  }, []);

  // Auto-play slide transitions every 6 seconds if multiple slides exist
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const changeColor = (color) => {
    setTshirtColor(color);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const currentSlide = slides[currentSlideIndex] || {
    title: "Summer Sale Stylish",
    subtitle: "New Trend",
    button_text: "Discover More",
    link_url: "/shop",
    image: null,
  };

  const slideBgImage = currentSlide?.image
    ? formatImageUrl(currentSlide.image)
    : defaultHeroBg;

  return (
    <>
      <div
        className="heroMain"
        style={{
          backgroundImage: slideBgImage
            ? `linear-gradient(rgba(244, 229, 224, 0.35), rgba(244, 229, 224, 0.35)), url(${slideBgImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="sectionleft">
          <p>{currentSlide.subtitle || "New Trend"}</p>
          <h1>{currentSlide.title || "Summer Sale Stylish"}</h1>
          <span>Limited Time Offer - Up to 60% off & Free Shipping</span>
          <div className="heroLink">
            <Link to={currentSlide.link_url || "/shop"} onClick={scrollToTop}>
              <h5>{currentSlide.button_text || "Discover More"}</h5>
            </Link>
          </div>

          {/* Slide Pagination Indicators */}
          {slides.length > 1 && (
            <div className="heroSliderDots">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`heroDot ${idx === currentSlideIndex ? "active" : ""}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="sectionright">
          <Canvas
            className="canvasModel"
            camera={{ position: [0, 5, 15], fov: 50 }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={2.5}
              color={"white"}
            />

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minAzimuthAngle={-Infinity}
              maxAzimuthAngle={Infinity}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 2}
            />

            <Model color={tshirtColor} />
          </Canvas>
          <div className="heroColorBtn">
            <button
              onClick={() => changeColor("#353933")}
              style={{ backgroundColor: "#353933" }}
              aria-label="Color Dark Gray"
            ></button>
            <button
              onClick={() => changeColor("#EFBD4E")}
              style={{ backgroundColor: "#EFBD4E" }}
              aria-label="Color Yellow"
            ></button>
            <button
              onClick={() => changeColor("#726DE7")}
              style={{ backgroundColor: "#726DE7" }}
              aria-label="Color Purple"
            ></button>
            <button
              onClick={() => changeColor("red")}
              style={{ backgroundColor: "red" }}
              aria-label="Color Red"
            ></button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
