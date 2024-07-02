import mongoose from "mongoose";

const { Schema } = mongoose;

const CategoriesSchema = new Schema({
  types: [{
    name: String,
    entry: String
  }],
  category: String
});

export default mongoose.model("Categories", CategoriesSchema, "categories");
