import mongoose from "mongoose";

const itemSchema = mongoose.Schema({
  itemCategory: {
    type: String,
    required: true,
  },
  itemId: {
    type: String,
    unique: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  balance: {
    type: Number,
    required: false,
    default: 0,
  },
  unitPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  cost: {
    type: Number,
    required: false,
    default: 0,
  },
  lastBalanceUpdate: {
    type: Date,
    required: false,
  },
});

const Item = mongoose.model("item", itemSchema);

export default Item;
