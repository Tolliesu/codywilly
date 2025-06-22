require('dotenv').config()
const { spawn } = require('child_process')
const express = require('express')
const app = express()
app.use(express.json())

app.post('/v1/chat/completions', (req, res) => {
  const { messages } = req.body
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n')
  const p = spawn('cody-agent', ['experimental-cli', 'chat', '-m', prompt])

  let output = ''
  p.stdout.on('data', d => output += d.toString())
  p.on('close', () => {
    res.json({
      choices: [{ message: { content: output.trim() } }]
    })
  })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`✨ Cody proxy listening on port ${port}`))
