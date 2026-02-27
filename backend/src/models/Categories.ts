import mongoose from "mongoose";

const { Schema } = mongoose;

const CategoriesSchema = new Schema({
  types: [
    {
      name: String,
      entry: String,
    },
  ],
  category: String,
  subcategories: [
    {
      name: String,
      types: [String],
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default mongoose.model("Categories", CategoriesSchema, "categories");
