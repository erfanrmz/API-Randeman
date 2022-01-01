const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://ResourceManager:0F7i0QjXzcL6yaoJ@resourcemanager.yosak.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const resourceSchema = new mongoose.Schema({
  unique_id: Number,
  company_id: Number,
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  tasks: [
    {
      unique_id: Number,
      name: String,
      duration: Number,
      priority: { type: Number, default: 0 },
      resource: String,
      createdDate: Date,
      deadline: Date,
      startedAt: Date,
      endedAt: Date,
    },
  ],
});

module.exports = mongoose.model("resource", resourceSchema);
