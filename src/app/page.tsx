'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Container, TextField, Button, Paper, Typography, IconButton, Box, ThemeProvider, createTheme, CssBaseline, useColorScheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { Head } from 'next/document';

//TODO: markdown support 
//TODO: introduzir google gemini
//TODO: melhorarar visualização da mensagem do bot/usuário
//TODO: Dar feedback enquanto chat estiver gerando a resposta
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
                  backgroundColor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                  color: 'text.primary',
                  borderRadius: 2,
                  maxWidth: '75%',
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
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
              color="primary"
              onClick={handleSubmit}
              sx={{ height: '100%' }}
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
});

export default function ToggleColorMode() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <Head>
        <title>Titulo da aplicação</title>
        <meta name="description" content="Um chatbot gerador de requisitos funcionais" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
      </Head>
      <Chat />
    </ThemeProvider>
  );
};

