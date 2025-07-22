import mongoose from "mongoose";

const foodSchema = mongoose.Schema({
  productCategory: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    unique: true,
  },
  productName: {
    type: String,
    required: true,
  },
  labeledPrice: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  portion: {
    type: String,
    required: true,
  },
  productImage: [{ type: String }],
  isAvailable: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const Food = mongoose.model("food", foodSchema);

export default Food;
