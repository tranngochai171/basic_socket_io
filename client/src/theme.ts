import { createTheme } from "@mui/material/styles";

export const COLOR_LIST = {
  primary: "#556cd6",
};

const theme = createTheme({
  palette: {
    primary: {
      main: COLOR_LIST.primary,
    },
  },
});

export default theme;
