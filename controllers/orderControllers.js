import Food from "../models/food.js";
import Order from "../models/order.js";
import { isAdmin, isCashier, isChef, isSteward } from "./userControllers.js";

// 01.To create an order
export async function createOrder(req, res) {
  if (req.user == null) {
    res.json({
      message: "Please login and try again",
    });
    return;
  }
  if (req.user.role != "customer") {
    res.json({
      message:
        "You aren't allowed to use this account to place an order, please use a different account",
    });
    return;
  }

  const orderInfo = req.body;

  if (orderInfo.name == null) {
    orderInfo.name = req.user.firstName + " " + req.user.lastName;
  }
  if (orderInfo.email == null) {
    orderInfo.email = req.user.email;
  }

  const pendingOrder = await Order.find({
    email: orderInfo.email,
    status: "pending",
  });

  if (pendingOrder.length > 0) {
    try {
      // step 1 - Map existing products
      const existingProducts = new Map();
      pendingOrder[0].product.forEach((p) => {
        existingProducts.set(p.productInfo.productId, p);
      });

      // console.log ("existingProducts:", Array.from(existingProducts.entries())) for testing

      // step 2 - Update or add items from incoming order
      for (let i = 0; i < orderInfo.product.length; i++) {
        const incoming = orderInfo.product[i];
        const item = await Food.findOne({ productId: incoming.productId });
        const quantity = incoming.quantity;

        if (!item) continue;

        if (quantity <= 0) {
          existingProducts.delete(incoming.productId);
        } else {
          existingProducts.set(incoming.productId, {
            productInfo: {
              productId: item.productId,
              productName: item.productName,
              image: item.image,
              labeledPrice: item.labeledPrice,
              price: item.price,
            },
            quantity: quantity,
          });
        }
      }
      console.log("existingProducts:", Array.from(existingProducts.entries()));

      // step 3 - Recalculate totals
      const updatedProducts = Array.from(existingProducts.values());
      let total = 0;
      let labeledTotal = 0;

      for (const p of updatedProducts) {
        total += p.productInfo.price * p.quantity;
        labeledTotal += p.productInfo.labeledPrice * p.quantity;
      }
      console.log("updatedgProducts:", Array.from(updatedProducts.entries()));

      // step 4 - Update order and save
      pendingOrder[0].product = updatedProducts;
      pendingOrder[0].total = total;
      pendingOrder[0].labeledTotal = labeledTotal;
      pendingOrder[0].customerBill = Math.round(total * 1.1);

      await pendingOrder[0].save();

      res.json({
        message: "Pending order updated successfully",
        order: pendingOrder[0],
      });
    } catch (error) {
      console.error("Failed to update existing order:", error);
      res
        .status(500)
        .json({ message: "Item wasn't added to the existing order" });
    }

    return;
  } else {
    let orderId = "SC2D_000001";

    const lastOrder = await Order.find().sort({ date: -1 }).limit(1);

    console.log(lastOrder); /** */

    if (lastOrder.length > 0) {
      const lastOrderId = lastOrder[0].orderId;
      const lastOrderNumberString = lastOrderId.replace("SC2D_", "");
      const lastOrderNumber = parseInt(lastOrderNumberString);
      const newOrderNumber = lastOrderNumber + 1;
      const newOrderNumberString = String(newOrderNumber).padStart(6, "0");
      orderId = "SC2D_" + newOrderNumberString;
      console.log(orderId); /** */
    }

    try {
      let total = 0;
      let labeledTotal = 0;
      const product = [];

      for (let i = 0; i < orderInfo.product.length; i++) {
        const item = await Food.findOne({
          productId: orderInfo.product[i].productId,
        });
        if (item == null) {
          res.status(404).json({
            message:
              "Food with the product id " +
              orderInfo.product[i].productId +
              " not found",
          });
          return;
        }
        if (item.isAvailable == false) {
          res.status(404).json({
            message: "The food isn't available right now",
          });
          return;
        }
        // console.log(item) /** */** */
        product[i] = {
          productInfo: {
            productId: item.productId,
            productName: item.productName,
            image: item.image,
            labeledPrice: item.labeledPrice,
            price: item.price,
          },
          quantity: orderInfo.product[i].quantity,
        };
        total += item.price * orderInfo.product[i].quantity;
        labeledTotal += item.labeledPrice * orderInfo.product[i].quantity;
      }

      const order = new Order({
        orderId: orderId,
        email: orderInfo.email,
        name: orderInfo.name,
        tableNumber: orderInfo.tableNumber,
        peopleForDining: orderInfo.peopleForDining,
        total: total,
        labeledTotal: labeledTotal,
        product: product,
        orderRemark: orderInfo.orderRemark,
        customerBill: Math.round(total * 1.1),
      });

      const createdOrder = await order.save();
      res.json({
        message: "New Order created successfully",
        order: createdOrder,
      });
    } catch (error) {
      console.error("Backend error while creating order:", error); 
      res.status(500).json({
        message: "Failed to create order",
        error: error.message,
      });
    }
  }
}

// 02. To view order from the frontend
export async function viewOrder(req, res) {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Please login to check your orders" });
  }

  try {
    // For Chef
    if (isChef(req)) {
      const pendingOrders = await Order.find({
        status: { $in: ["pending", "confirmed"] },
      }).sort({ date: 1 });
      console.log(pendingOrders.length);

      if (pendingOrders.length === 0) {
        return res.json({ message: "There aren't any pending orders" });
      }

      const response = pendingOrders.map((order) => ({
        orderId: order.orderId,
        tableNumber: order.tableNumber,
        people: order.peopleForDining,
        completion: order.preparationProgress,
        tableChecked: order.tableChecked,
        products: order.product.map((p) => ({
          product: p.productInfo.productName,
          quantity: p.quantity,
        })),
      }));

      return res.status(200).json(response);
    }
    //For steward
    if (isSteward(req)) {
      const pendingOrders = await Order.find({
        status: { $in: ["confirmed", "completed"] },
      }).sort({ date: 1 });
      console.log(pendingOrders.length);

      if (pendingOrders.length === 0) {
        return res.json({ message: "There aren't any pending orders" });
      }

      const response = pendingOrders.map((order) => ({
        orderId: order.orderId,
        tableNumber: order.tableNumber,
        people: order.peopleForDining,
        completion: order.preparationProgress,
        products: order.product.map((p) => ({
          product: p.productInfo.productName,
          quantity: p.quantity,
        })),
      }));

      return res.status(200).json(response);
    }

    //For Admin
    if (isAdmin(req)) {
      const allOrders = await Order.find().sort({ date: 1 });

      const allOrderList = allOrders.map((order) => ({
        orderId: order.orderId,
        status: order.status,
        bill: order.customerBill,
        payment: order.paymentStatus,
        date: order.date,
      }));

      return res.status(200).json(allOrderList);
    }

     if (isCashier(req)) {
      const allOrders = await Order.find({paymentStatus:"PAID"}).sort({ date: 1 });

      const allOrderList = allOrders.map((order) => ({
        orderId: order.orderId,
        status: order.status,
        bill: order.customerBill,
        payment: order.paymentStatus,
        date: order.date,
      }));

      return res.status(200).json(allOrderList);
    }
    //For Users
    const customerOrders = await Order.find({
      email: req.user.email,
    }).sort({ date: -1 });

    if (customerOrders.length === 0) {
      return res.json({ message: "You don't have any order at present" });
    }

    const firstOrder = customerOrders[0];

    const orderDetails = {
      orderId: firstOrder.orderId,
      items: firstOrder.product.map((p) => ({
        name: p.productInfo.productName,
        quantity: p.quantity,
        unitPrice: p.productInfo.labeledPrice,
        cost: p.quantity * p.productInfo.labeledPrice,
      })),
      labeledTotal: firstOrder.labeledTotal,
      discountedAmount: firstOrder.labeledTotal - firstOrder.total,
      billTotal: firstOrder.total,
      status: firstOrder.status,
      payment: firstOrder.paymentStatus,
      date: firstOrder.date,
    };

    return res.status(200).json(orderDetails);
  } catch (error) {
    console.error("Error loading orders:", error);
    return res.status(500).json({
      message: "Error in loading orders",
      error: error.message,
    });
  }
}

//03. To update order status when order is confirmed
export async function updateOrder(req, res) {
  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ message: "Missing orderId or status" });
  }

  try {
    const result = await Order.updateOne({ orderId }, { status });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order updated successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

//04. To get an order by id

export async function getOrderById(req, res) {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch order", error: err.message });
  }
}

//05.To update the order progress when order is confirmed
export async function updateProgress(req, res) {
  const { orderId, productIndex, prepared, preparationProgress } = req.body;

  try {
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.product[productIndex]) {
      order.product[productIndex].prepared = prepared;
    }

    if (preparationProgress !== undefined) {
      order.preparationProgress = preparationProgress;
    }

    await order.save();

    return res.json({ message: "Order updated successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

//06. To get users current confirmed order
export async function getUserCurrentOrder(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const orders = await Order.find({
      email: req.user.email,
      status: "confirmed",
    });

    if (!orders.length) {
      return res.json({ message: "No current confirmed orders" });
    }

    const formattedOrders = orders.map((order) => ({
      orderId: order.orderId,
      preparationProgress: order.preparationProgress || 0,
      date: order.date,
    }));

    res.status(200).json(formattedOrders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: err.message });
  }
}

//07. To cancelling an order
export async function cancelOrder(req, res) {
  const { orderId, status, reason } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required." });
  }

  if (status !== "cancelled") {
    return res
      .status(400)
      .json({
        message: "Invalid status. Only 'cancelled' is allowed for this route.",
      });
  }

  if (!reason) {
    return res
      .status(400)
      .json({ message: "Cancellation reason is required." });
  }

  try {
    const result = await Order.updateOne(
      { orderId: orderId, status: { $ne: "cancelled" } },
      {
        $set: {
          status: "cancelled",
          cancellationReason: reason,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({
          message: "No matching active order found or already cancelled.",
        });
    }

    res.json({ message: "Order cancelled successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

// 08. To served status tracking
export async function updateServedStatus(req, res) {
  const { orderId, productIndex, served } = req.body;

  try {
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.product[productIndex].served = served;

    await order.save();

    res.json({ message: "Served status updated" });
  } catch (err) {
    console.error("Error updating served status:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

// 09. To table-checked function
export async function markTableChecked(req, res) {
  const { orderId, tableChecked } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: "Please login and try again" });
  }

  if (!orderId) {
    return res.status(400).json({ message: "Missing orderId" });
  }

  try {
    const result = await Order.updateOne(
      { orderId },
      { tableChecked: tableChecked === true }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ message: "Table checked status updated successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

//10. To get payment details

export async function viewPaymentStatus(req, res) {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Please login to check your orders" });
  }

  try {
    
    if (isCashier(req)) {
      const pendingPayments = await Order.find({
        paymentStatus: "pending",
        status: { $in: ["completed", "served"] },
      }).sort({ date: 1 });

      if (pendingPayments.length === 0) {
        return res.status(200).json({ message: "No payments pending" });
      }

      const response = pendingPayments.map((order) => ({
        orderId: order.orderId,
        tableNumber: order.tableNumber,
        completion: order.preparationProgress,
        status: order.status,
        bill: order.customerBill,
        paymentStatus: order.paymentStatus,
      }));

      return res.status(200).json(response);
    }

    return res.status(403).json({ message: "Unauthorized access" });
  } catch (error) {
    console.error("Error loading payment details:", error);
    return res.status(500).json({
      message: "Error in loading payment",
      error: error.message,
    });
  }
}

//11. To update payment status
export async function paymentStatusUpdate(req, res) {
  const { orderId } = req.params;
  const { paymentStatus } = req.body;

  try {
    const updatedStatus = await Order.findOneAndUpdate(
      { orderId },
      { paymentStatus },
      { new: true }
    );

    if (!updatedStatus) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(updatedStatus);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

//12. To get daily summary

export async function getDailyOrderSummary(req, res) {
  const { date } = req.query;
  console.log("Query date:", date);

  try {
    let matchCriteria = {};

    // Filter by date
    if (date) {
      if (isNaN(Date.parse(date))) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const parsedDate = new Date(date);
      const startOfDay = new Date(
        Date.UTC(
          parsedDate.getUTCFullYear(),
          parsedDate.getUTCMonth(),
          parsedDate.getUTCDate(),
          0,
          0,
          0,
          0
        )
      );
      const endOfDay = new Date(
        Date.UTC(
          parsedDate.getUTCFullYear(),
          parsedDate.getUTCMonth(),
          parsedDate.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );

      matchCriteria.date = { $gte: startOfDay, $lt: endOfDay };
    }

    // Fetch orders
    const orders = await Order.find(matchCriteria);

    // Categorize
    const servedOrders = orders.filter((o) => o.status === "served");
    const cancelledOrders = orders.filter(
      (o) => o.status === "cancelled" || o.status === "canceled"
    );

    // Total sales
    const dailySalesTotal = servedOrders.reduce(
      (sum, order) => sum + (order.customerBill || 0),
      0
    );

    // Respond
    return res.status(200).json({
      date: date || "all",
      servedCount: servedOrders.length,
      cancelledCount: cancelledOrders.length,
      dailySalesTotal,
    });
  } catch (error) {
    console.error("Error getting daily summary:", error);
    return res.status(500).json({
      message: "Error fetching order summary",
      error: error.message,
    });
  }
}

//13. To get order history

export async function orderHistory(req, res) {
  try {
    const customerOrders = await Order.find({
      email: req.user.email,
      status: { $in: ["confirmed", "completed", "served"] },
    }).sort({ date: -1 });

    if (customerOrders.length === 0) {
      return res.json({ message: "You don't have any order at present" });
    }

    const orderDetails = customerOrders.map((order) => ({
      orderId: order.orderId,
      items: order.product.map((p) => ({
        name: p.productInfo.productName,
        quantity: p.quantity,
        unitPrice: p.productInfo.labeledPrice,
        cost: p.quantity * p.productInfo.labeledPrice,
      })),
      labeledTotal: order.labeledTotal,
      discountedAmount: order.labeledTotal - order.total,
      billTotal: order.total,
      status: order.status,
      payment: order.paymentStatus,
      customerBill: order.customerBill,
      date: order.date,
    }));

    return res.status(200).json(orderDetails);
  } catch (error) {
    console.error("Error loading orders:", error);
    return res.status(500).json({
      message: "Error in loading orders",
      error: error.message,
    });
  }
}
