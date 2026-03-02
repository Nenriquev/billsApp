import mongoose from "mongoose";

const { Schema } = mongoose;

const DataSchema = new Schema({
  concept: String,
  date: Date,
  uploadDate: Date,
  value: Number,
  category: {
    type: Schema.Types.ObjectId,
    ref: "Categories",
    required: false,
  },
  bank: String,
  subcategory: {
    type: String,
    default: null,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

DataSchema.index({ concept: 1, date: 1, value: 1, user: 1 }, { unique: true });

export default mongoose.model("Data", DataSchema, "data");
