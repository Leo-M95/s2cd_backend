
//01. To add an item to the inventory
import Item from "../models/item.js";
import { isAdmin, isSteward } from "./userControllers.js";

export async function addItem(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You don't have authorization to add products",
    });
  }

  // Unique product ID generation
  async function generateUniqueProductId(category) {
    let isUnique = false;
    let newId;

    while (!isUnique) {
      const prefix = category?.toUpperCase() || "IT";
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      newId = `${prefix}${randomNum}`;
      const existing = await Item.findOne({ itemId: newId });
      if (!existing) isUnique = true;
    }

    return newId;
  }

  try {
    const productId = await generateUniqueProductId(req.body.itemCategory);

    const item = new Item({
      itemCategory: req.body.itemCategory,
      itemId: productId,
      quantity: req.body.quantity,
      unitPrice: req.body.price,
      cost: req.body.cost,
    });

    await item.save();

    res.json({
      message: "Item added successfully",
      item,
    });
  } catch (err) {
    console.error("Error saving food:", err.message);
    res.status(500).json({
      message: "Item wasn't added",
      error: err.message,
    });
  }
}

//02. To get all items from the inventory

export async function getAllItems(req, res) {
  try {
    if (!(isAdmin(req) || isSteward(req))) {
      return res.status(403).json({
        message: "Unauthorized: Only admins or stewards can view all items",
      });
    }

    const items = await Item.find({});
    return res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

// 03. To update stock

export async function updateItem(req, res) {
  if (!(isAdmin(req) || isSteward(req))) {
    return res.status(403).json({
      message: "You aren't authorized to update the inventory",
    });
  }

  const itemId = req.params.itemId;
  const { quantity, cost, unitPrice, itemCategory, balance } = req.body;

  try {
    const existingItem = await Item.findOne({ itemId });
    if (!existingItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    const updateFields = {};

    // Fields that Admin would update
    const hasAdminFields =
      quantity !== undefined ||
      cost !== undefined ||
      unitPrice !== undefined ||
      itemCategory !== undefined;

    if (hasAdminFields) {
      if (typeof quantity === "number") {
        updateFields.quantity = existingItem.quantity + quantity;
      }

      if (typeof cost === "number") {
        updateFields.cost = existingItem.cost + cost;
      }

      if (unitPrice !== undefined) {
        updateFields.unitPrice = unitPrice;
      }

      if (itemCategory !== undefined) {
        updateFields.itemCategory = itemCategory;
      }
    }

    if (typeof balance === "number") {
      updateFields.balance = existingItem.balance + balance;
      updateFields.lastBalanceUpdate = new Date();
    }
   
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    await Item.updateOne({ itemId }, { $set: updateFields });

    return res.json({ message: "Item updated successfully" });
  } catch (error) {
    console.error("Error updating item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
