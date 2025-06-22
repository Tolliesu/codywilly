require('dotenv').config();
const { spawn } = require('child_process');
const express = require('express');
const app = express();
app.use(express.json());

app.post('/v1/chat/completions', (req, res) => {
  const { messages } = req.body;
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');

  const cody = spawn('cody-agent', ['experimental-cli', 'chat', '-m', prompt], {
    env: {
      ...process.env,
      SRC_ENDPOINT: process.env.SRC_ENDPOINT,
      SRC_ACCESS_TOKEN: process.env.SRC_ACCESS_TOKEN,
    },
  });

  let output = '';
  cody.stdout.on('data', data => { output += data.toString(); });
  cody.stderr.on('data', data => { console.error(`stderr: ${data}`); });

  cody.on('close', code => {
    if (code === 0) {
      res.json({ choices: [{ message: { content: output.trim() } }] });
    } else {
      res.status(500).json({ error: 'Error ejecutando Cody CLI' });
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✨ Proxy de Cody escuchando en el puerto ${port}`);
});
