const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

const app = express();
var PORT = process.env.PORT || 3000;
app.use(express.static("public"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(logger("dev"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/peaceful-dusk-63294", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

// routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});