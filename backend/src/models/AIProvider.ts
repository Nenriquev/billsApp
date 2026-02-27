import mongoose from "mongoose";

const { Schema } = mongoose;

const AIProviderSchema = new Schema({
  provider: {
    type: String,
    enum: ["mistral", "openai", "gemini", "anthropic"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  apiKey: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    default: null,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

AIProviderSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Asegurar que solo haya un proveedor por defecto
AIProviderSchema.pre("save", async function (next) {
  if (this.isDefault && this.isModified("isDefault")) {
    try {
      // Usar this.constructor para evitar problemas de referencia circular
      const Model = this.constructor as mongoose.Model<any>;
      await Model.updateMany(
        { _id: { $ne: this._id } },
        { $set: { isDefault: false } }
      );
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

const AIProviderModel = mongoose.model("AIProvider", AIProviderSchema, "ai_providers");

export default AIProviderModel;
