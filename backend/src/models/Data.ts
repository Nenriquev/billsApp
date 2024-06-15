import mongoose from "mongoose";

const { Schema } = mongoose;

const DataSchema = new Schema({
  concept: String,
  date: Date,
  value: Number,
  category: String,
  bank: String
});

export default mongoose.model("Data", DataSchema, "data");
