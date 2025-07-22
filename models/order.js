import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: true,
    default: "pending",
  },
  tableNumber: {
    type: Number,
    required: true,
  },
  peopleForDining: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  labeledTotal: {
    type: Number,
    required: true,
  },
  product: [
    {
      productInfo: {
        productId: {
          type: String,
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        image: [String],
        labeledPrice: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
      quantity: {
        type: Number,
        required: true,
      },
      prepared: {
        type: Boolean,
        default: false,
      },
      served: {
        type: Boolean,
        default: false,
      },
    },
  ],
  paymentStatus: {
    type: String,
    required: true,
    default: "pending",
  },
  tableChecked: {
    type: Boolean,
    required: true,
    default: false,
  },
  orderRemark: {
    type: String,
    maxlength: 100,
    default: "",
  },
  cancellationReason: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  preparationProgress: {
    type: Number,
    default: 0,
  },
  customerBill: {
    type: Number,
    default: 0,
    required: true,
  },
});

const Order = mongoose.model("order", orderSchema);
export default Order;
