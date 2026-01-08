import { extendTheme } from "@chakra-ui/react";

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/500.css'
import '@fontsource/open-sans/400.css'
import '@fontsource/open-sans/600.css'
import '@fontsource/open-sans/800.css'

const theme = extendTheme({
  styles: {
    global: {
      "html, body, #root, App": {
        height: "100%",
        width: "100%",
        position:"relative"    
      },
    },
  },
  colors: {
    primary: "#000",
    secondary: "#fff",
    tertiary: "#000",
    buttonHover: "#000",
  },
  fonts: {
    primary: `'Open Sans', sans-serif`,
    secondary: `Roboto, sans-serif`,
  },
});

export default theme;
