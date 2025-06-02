"use client";

import { useChat } from "@ai-sdk/react";
import {
  Container,
  TextField,
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
  Snackbar,
  Alert,
  AlertTitle,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { MemoizedMarkdown } from "../../components/memoized-markdown";
import SendIcon from "@mui/icons-material/Send";
import { useCallback, useState } from "react";

//TODO: introduzir google gemini
//TODO: executar geração de objeto no onFinish() do usechat?
const Chat = () => {
  const [showError, setShowError] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("mistralProvider");

  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    status,
  } = useChat({
    body: {
      model: selectedModel,
    },
    onError: () => {
      setShowError(true);
      const timer = setTimeout(handleCloseError, 7000);
      return () => clearTimeout(timer);
    },
  });

  const handleCloseError = useCallback(() => {
    setShowError(false);
    setMessages([]);
  }, [setMessages]);

  const handleModelChange = (event: SelectChangeEvent<string>) => {
    const newModel = event.target.value;
    setSelectedModel(newModel);
  };

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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 1,
          borderBottom:
            mode === "dark" ? "1px solid #424242" : "1px solid #e0e0e0",
        }}
      >
        <FormControl sx={{ m: 1, minWidth: 150 }} size="small">
          <InputLabel id="model-select-label">AI Model</InputLabel>
          <Select
            labelId="model-select-label"
            id="model-select"
            value={selectedModel}
            label="AI Model"
            onChange={handleModelChange}
          >
            <MenuItem value="mistralProvider">Mistral</MenuItem>
            <MenuItem value="googleProvider">Google Gemini</MenuItem>
          </Select>
        </FormControl>
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
                    message.role === "user" ? "primary.main" : "secondary.main",
                  color: "primary.contrastText",
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
          <Grid size={12}>
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
    light: {
      palette: {
        primary: {
          main: "#ebdfde",
          contrastText: "#333333",
        },
        secondary: {
          main: "#dbb3be",
          contrastText: "#ffffff",
        },
        background: {
          default: "#f8f6f5",
          paper: "#ffffff",
        },
        text: {
          primary: "#3e3837",
          secondary: "#6c6564",
          disabled: "#a09594",
        },
        error: { main: "#d32f2f" },
        warning: { main: "#f57c00" },
        info: { main: "#1976d2" },
        success: { main: "#2e7d32" },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#3f3f3f",
          contrastText: "#e0e0e0",
        },
        secondary: {
          main: "#2a2a2a",
          contrastText: "#bdbdbd",
        },
        background: {
          default: "#1c1b1a",
          paper: "#2b2928",
        },
        text: {
          primary: "#f5f5f5",
          secondary: "#b0a8a7",
          disabled: "#6e6a69",
        },
        error: { main: "#e57373" },
        warning: { main: "#ffb74d" },
        info: { main: "#64b5f6" },
        success: { main: "#81c784" },
      },
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
