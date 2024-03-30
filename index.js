const express = require("express")
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()
const cors = require('cors')
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send("Twist buzz is running")
})
app.listen(port, () => {
    console.log(`The app is running on port ${port}`)
})
