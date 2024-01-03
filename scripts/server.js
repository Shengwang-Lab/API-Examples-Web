const express = require("express")
const path = require("path")
const port = 3001

const dir = path.join(__dirname, "../src")
const app = express()
app.use(express.static(dir))

app.listen(port, () => {
  let url = `http://localhost:${port}/index.html`
  console.info(`\n---------------------------------------\n`)
  console.info(`please visit: ${url}`)
  console.info(`\n---------------------------------------\n`)
})
