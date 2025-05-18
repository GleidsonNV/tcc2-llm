"use client";

import { useChat } from "@ai-sdk/react";
import {
  Container,
  TextField,
  Button,
  Paper,
  IconButton,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  useColorScheme,
  CircularProgress,
  Grid,
  InputAdornment,
  Typography,
  Snackbar,
  Alert,
  AlertTitle,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { MemoizedMarkdown } from "../../components/memoized-markdown";
import SendIcon from "@mui/icons-material/Send";
import { useCallback, useState } from "react";

//TODO: introduzir google gemini
//TODO: executar geração de objeto no onFinish() do usechat?
const Chat = () => {
  const [showError, setShowError] = useState(false);

  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    status,
  } = useChat({
    onError: (error) => {
      setShowError(true);
      const timer = setTimeout(handleCloseError, 7000);
      return () => clearTimeout(timer);
    },
  });

  const handleCloseError = useCallback(() => {
    setShowError(false);
    setMessages([]);
  }, [setMessages]);

  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return null;
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Snackbar
        open={showError}
        autoHideDuration={7000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="error"
          onClose={handleCloseError}
          sx={{ width: "100%" }}
        >
          <AlertTitle>Erro</AlertTitle>
          Ocorreu um erro. O chat será limpo.
        </Alert>
      </Snackbar>
      <Box sx={{ display: "flex", justifyContent: "flex-end", padding: 1 }}>
        <IconButton
          onClick={() => setMode(mode === "dark" ? "light" : "dark")}
          color="inherit"
        >
          {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Box>

      <Container
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          padding: 2,
          maxWidth: "lg",
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            padding: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {status === "submitted" ? (
            <CircularProgress sx={{ margin: "auto" }} />
          ) : (
            messages.map((message, index) => (
              <Paper
                key={index}
                sx={{
                  marginBottom: 1,
                  padding: 2,
                  backgroundColor:
                    message.role === "user" ? "palette.background.paper" : "",
                  color: "text.primary",
                  borderRadius: 2,
                  maxWidth: "75%",
                  alignSelf:
                    message.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <MemoizedMarkdown content={message.content} id={message.id} />
              </Paper>
            ))
          )}
        </Box>

        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid item xs={10}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              label="Descreva seu problema"
              variant="outlined"
              value={input}
              onChange={handleInputChange}
              sx={{ backgroundColor: "background.paper" }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        color="primary"
                        disabled={
                          !input.trim() ||
                          status === "submitted" ||
                          status === "streaming"
                        }
                        onClick={handleSubmit}
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
  palette: {
    primary: {
      main: "#4d4443",
    },
    secondary: {
      main: "#434c4d",
    },
  },
});

export default function ToggleColorMode() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Chat />
    </ThemeProvider>
  );
}
