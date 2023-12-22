const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoute');

const app = express();

app.use(bodyParser.json());

app.use('/user', userRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.get('/', (req, res) => {
  res.send('welcome to sejahtera app')
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});