import mongoose from "mongoose";

const { Schema } = mongoose;

const DataSchema = new Schema({
  concept: String,
  date: Date,
  value: Number,
  category: {
    type: Schema.Types.ObjectId,
    ref: "Categories",
    required: true,
  },
  bank: String,
  subcategory: {
    type: String,
    default: null,
  },
});

DataSchema.index({ concept: 1, date: 1, value: 1 }, { unique: true });

export default mongoose.model("Data", DataSchema, "data");
