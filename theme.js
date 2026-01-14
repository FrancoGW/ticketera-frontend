import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      "html, body, #root, App": {
        height: "100%",
        width: "100%",
        position:"relative",
        fontFamily: "'Inter', sans-serif"
      },
    },
  },
  colors: {
    primary: "#000",
    secondary: "#fff",
    tertiary: "#000",
    buttonHover: "#1a1a1a",
  },
  fonts: {
    primary: `'Inter', sans-serif`,
    secondary: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
    heading: `'Inter', sans-serif`,
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
  },
});

export default theme;
