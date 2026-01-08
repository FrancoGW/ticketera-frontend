import React from "react";
import {
  Flex,
} from "@chakra-ui/react";
import background from "../../../public/assets/img/flyer/back.jpg";

const Flyer = () => {
  
  return (
    <Flex
      direction="column"
      className="gradient"
      justifyContent="center"
      alignItems="center"
      backgroundImage={`url(${background})`}
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      minHeight="100vh"
      width="100%"
      position="relative"
    >
     



    </Flex>
  );
};

export default Flyer;
