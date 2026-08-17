import React from "react";
import "./AboutPage.css";

import about1 from "../../Assets/About/about-1.jpg";
import about2 from "../../Assets/About/about-2.jpg";

import Services from "../../Components/Home/Services/Services";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";

import brand1 from "../../Assets/Brands/brand1.png";
import brand2 from "../../Assets/Brands/brand2.png";
import brand3 from "../../Assets/Brands/brand3.png";
import brand4 from "../../Assets/Brands/brand4.png";
import brand5 from "../../Assets/Brands/brand5.png";
import brand6 from "../../Assets/Brands/brand6.png";
import brand7 from "../../Assets/Brands/brand7.png";

const AboutPage = () => {
  return (
    <>
      <div className="aboutSection">
        <h2>About Gentle Style</h2>
        <img src={about1} alt="" />
        <div className="aboutContent">
          <h3>Our Story</h3>
          <h4>
            Welcome to Gentle Style – Where Timeless Elegance Meets Contemporary Fashion. Founded with a passion for quality craftsmanship and modern sophistication, we craft apparel that empowers your individuality every single day.
          </h4>
          <p>
            At Gentle Style, we believe true style is about how your clothes make you feel. Every garment in our signature collection is thoughtfully designed and crafted from premium fabrics to deliver effortless comfort, durable quality, and an elevated aesthetic. From everyday essentials to statement wardrobe pieces, we bring you refined fashion tailored for the modern lifestyle.
          </p>
          <div className="content1">
            <div className="contentBox">
              <h5>Our Mission</h5>
              <p>
                To empower fashion-conscious individuals with high-quality, ethically made apparel that seamlessly combines classic elegance with modern trends at accessible prices.
              </p>
            </div>
            <div className="contentBox">
              <h5>Our Vision</h5>
              <p>
                To become a premier lifestyle destination celebrated for authentic style, sustainable craftsmanship, and an exceptional customer shopping experience.
              </p>
            </div>
          </div>
          <div className="content2">
            <div className="imgContent">
              <img src={about2} alt="Gentle Style Fashion" />
            </div>
            <div className="textContent">
              <h5>The Company</h5>
              <p>
                Headquartered in Bangladesh with a rapidly growing online presence, Gentle Style blends global design trends with seamless e-commerce convenience. Backed by dedicated customer support, secure payment solutions, and nationwide fast shipping, we are committed to delivering excellence at every step of your fashion journey.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Services />
      <div className="companyPartners">
        <h5>Company Partners</h5>
        <Swiper
          slidesPerView={1}
          loop={true}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 5,
            },

            768: {
              slidesPerView: 4,
              spaceBetween: 40,
            },

            1024: {
              slidesPerView: 5,
              spaceBetween: 50,
            },
          }}
          spaceBetween={10}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          modules={[Autoplay]}
        >
          <SwiperSlide>
            <div className="aboutBrands">
              <img src={brand1} alt="" />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="aboutBrands">
              <img src={brand2} alt="" />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="aboutBrands">
              <img src={brand3} alt="" />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="aboutBrands">
              <img src={brand4} alt="" />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="aboutBrands">
              <img src={brand5} alt="" />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="aboutBrands">
              <img src={brand6} alt="" />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="aboutBrands">
              <img src={brand7} alt="" />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </>
  );
};

export default AboutPage;
