const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://ResourceManager:0F7i0QjXzcL6yaoJ@resourcemanager.yosak.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const userSchema = new mongoose.Schema({
  unique_id: Number,
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  accountType: {
    type: String,
    enum: ["company", "contributor"],
  },
  contributors: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model("user", userSchema);
