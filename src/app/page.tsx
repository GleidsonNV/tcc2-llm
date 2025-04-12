'use client';

import { useChat } from '@ai-sdk/react';
import { Container, TextField, Button, Paper, IconButton, Box, ThemeProvider, createTheme, CssBaseline, useColorScheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { MemoizedMarkdown } from '../../components/memoized-markdown';

//TODO: introduzir google gemini
//TODO: melhorarar visualização da mensagem do bot/usuário
//TODO: Dar feedback enquanto chat estiver gerando a resposta
//TODO: guardrail
const Chat = () => {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return null;
  }

  return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 1 }}>
          <IconButton onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} color="inherit">
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>

        <Container sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 2, maxWidth: 'lg' }}>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse' }}>
            {messages.map((message, index) => (
              <Paper
                key={index}
                sx={{
                  marginBottom: 1,
                  padding: 2,
                  backgroundColor: message.role === 'user' ? 'palette.background.paper' : '',
                  color: 'text.primary',
                  borderRadius: 2,
                  maxWidth: '75%',
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <MemoizedMarkdown content={message.content} id={message.id} />
              </Paper>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
            <TextField
              fullWidth
              multiline
              label="Descreva seu problema"
              variant="outlined"
              value={input}
              onChange={handleInputChange}
              sx={{ backgroundColor: 'background.paper' }}
            />
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ height: '100%'}}
            >
              Enviar
            </Button>
          </Box>
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
      main: '#4d4443',
      // light: '#4c49a8',
      // dark: '#4d4443',
    },
    secondary: {
      main: '#434c4d',
      // light: '#4975a8',
      // dark: '#434c4d',
    },
  }
});

export default function ToggleColorMode() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <Chat />
    </ThemeProvider>
  );
};

