import React, { useRef,useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// desktop imgage
import i1 from "/assets/img/slide/Flowtime.png";
import i2 from "/assets/img/slide/slide-jungle.png";
import i3 from "/assets/img/slide/slide-reggae.png";
// mobile image
import r1 from "/assets/img/slide/Flowtime.jpg";
import r2 from "/assets/img/slide/JungleParty.jpg";
import r3 from "/assets/img/slide/Reggae.jpg";
// Nueva imagen del evento
import eventImage from "/assets/img/slide/sliderrr.webp";
import { Flex } from "@chakra-ui/react";
import {CheckCircleIcon} from '@chakra-ui/icons'
import {Text} from '@chakra-ui/react'
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import "./style.css";

import { Autoplay, Pagination, Navigation } from "swiper/modules";

export default function App() {
  

  return (
    <>
      <Flex className="swiperContent" display={{ base: "none", md: "block" }}>
        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          allowTouchMove={true}
          loop={true}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          modules={[Autoplay, Pagination, Navigation]}
          navigation={true}
          className="mySwiper"
        >
          <SwiperSlide>
            <img src={i1} alt="" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={i2} alt="" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={i3} alt="" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={eventImage} alt="Evento" className="blur-slide" />
          </SwiperSlide>
        </Swiper>
      </Flex>
      <Flex display={{ base: "block", md: "none" }}>
        <div className="swiperContent res">
          <Swiper
            slidesPerView={1.5}
            centeredSlides={true}
            spaceBetween={24}
            allowTouchMove={true}
            loop={true}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            modules={[Autoplay, Pagination, Navigation]}
            navigation={false}
            className="mySwiper resContent"
          >
            <SwiperSlide className="resSlide">
              <img src={r1} alt="" />
            </SwiperSlide>
            <SwiperSlide className="resSlide">
              <img src={r2} alt="" />
            </SwiperSlide>
            <SwiperSlide className="resSlide">
              <img src={r3} alt="" />
            </SwiperSlide>
            <SwiperSlide className="resSlide">
              <img src={eventImage} alt="Evento" className="blur-slide" />
            </SwiperSlide>
          </Swiper>
         
        </div>
      </Flex>
      {/* De momento esto queda asi hasta que saque el hardcode */}
      <Flex display={{ base: "block", md: "none" }}>
      <div className="slider">
        <div class="slide-track">
            <div class="slide">
            <CheckCircleIcon />
                <Text textTransform='uppercase'>Los mejores aliados para tus eventos</Text>
            </div>
            <div class="slide">
            <CheckCircleIcon />
                <Text textTransform='uppercase'>Los mejores aliados para tus eventos</Text>
            </div>
            <div class="slide">
              <CheckCircleIcon />
                <Text textTransform='uppercase'>Los mejores aliados para tus eventos</Text>
            </div>
            <div class="slide">
              <CheckCircleIcon />
                <Text textTransform='uppercase'>Los mejores aliados para tus eventos</Text>
            </div>
            <div class="slide">
              <CheckCircleIcon />
                <Text textTransform='uppercase'>Los mejores aliados para tus eventos</Text>
            </div>
            <div class="slide">
              <CheckCircleIcon />
                <Text textTransform='uppercase'>Los mejores aliados para tus eventos</Text>
            </div>
            <div class="slide">
              <CheckCircleIcon />
                <Text textTransform='uppercase'>Los mejores aliados para tus eventos</Text>
            </div>

            <div class="slide">
              <CheckCircleIcon />
                <Text textTransform='uppercase'>Los mejores aliados para tus eventos</Text>
            </div>
            <div class="slide">
              <CheckCircleIcon />
                <Text textTransform='uppercase'>Los mejores aliados para tus eventos</Text>
            </div>
            <div class="slide">
              <CheckCircleIcon />
                <Text textTransform='uppercase'>Los mejores aliados para tus eventos</Text>
            </div>
            <div class="slide">
              <CheckCircleIcon />
                <Text textTransform='uppercase'>Los mejores aliados para tus eventos</Text>
            </div>
            <div class="slide">
              <CheckCircleIcon />
                <Text textTransform='uppercase'>Los mejores aliados para tus eventos</Text>
            </div>
            <div class="slide">
              <CheckCircleIcon />
                <Text textTransform='uppercase'>Los mejores aliados para tus eventos</Text>
            </div>
            <div class="slide">
              <CheckCircleIcon />
                <Text textTransform='uppercase'>Los mejores aliados para tus eventos</Text>
            </div>
        </div>
    </div>
      </Flex>
     
    </>
  );
}
