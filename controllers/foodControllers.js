import Food from "../models/food.js";
import { isAdmin, isChef } from "./userControllers.js";

//01. function to add food to the menu
export async function addFood(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You don't have authorization to add products",
    });
  }

  //To generate Unique Product ID 
  async function generateUniqueProductId(category) {
    let isUnique = false;
    let newId;

    while (!isUnique) {
      const prefix = category?.slice(0, 2).toUpperCase() || "PR";
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      newId = `${prefix}${randomNum}`;
      const existing = await Food.findOne({ productId: newId });
      if (!existing) isUnique = true;
    }

    return newId;
  }

  try {
    const productId = await generateUniqueProductId(req.body.productCategory);

    const food = new Food({
      productCategory: req.body.productCategory,
      productId: productId,
      productName: req.body.productName,
      labeledPrice: req.body.labeledPrice,
      price: req.body.price,
      portion: req.body.portion,
      productImage: req.body.productImage,
    });

    await food.save();

    console.log("Food saved:", food);

    res.json({
      message: "Item added successfully",
      food,
    });
  } catch (err) {
    console.error("Error saving food:", err.message);
    res.status(500).json({
      message: "Item wasn't added",
      error: err.message,
    });
  }
}

//function to search food

export async function getFood(req, res) {
  const searchedFood = req.body.productName;
  try {
    const foods = await Food.find({
      name: { $regex: searchedFood, $options: "i" },
    });
    res.json(foods);
  } catch (error) {
    res.status(404).json(error);
  }
}

//02. To Delete food

export async function deleteFood(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({
      message: "You don't have the authorization to delete a product",
    });
    return;
  }
  try {
    await Food.deleteOne({ productId: req.params.productId });
    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error,
    });
  }
}

//03. To update food

export async function updateFood(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({
      message: "You aren't authorized to update products",
    });
  }

  const productId = req.params.productId;
  const updatingData = req.body;

  try {
    await Food.updateOne({ productId: productId }, updatingData);
    res.json({
      message: "Product updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

//04.To get a specific product
export async function getFoodById(req, res) {
  const productId = req.params.productId;

  try {
    const product = await Food.findOne({ productId: productId });

    if (product == null) {
      res.status(404).json({
        message: "Item not found",
      });
      return;
    }

    if (product.isAvailable) {
      res.json(product);
    } else {
      if (!isAdmin(req)) {
        res.status(404).json({
          message: "Item not found",
        });
        return;
      } else {
        res.json(product);
      }
    }
  } catch (error) {
    res.status(500).jason({
      message: "Internal server error",
      error: error.message,
    });
  }
}


//05. To get all the product
export async function getAllFoods(req, res) {
  try {
    const { prefix } = req.query;

    if (isAdmin(req) || isChef(req)) {
      const foods = await Food.find({});
      return res.json(foods);
    }

    if (!prefix) {
      return res
        .status(400)
        .json({ message: "Prefix is required for public access" });
    }

    const publicQuery = {
      productId: new RegExp("^" + prefix, "i"),
      isAvailable: true,
    };

    const foods = await Food.find(publicQuery);
    return res.json(foods);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

// 06. To update food availability
export async function availabilityUpdate(req, res) {
  const { productId } = req.params;
  const { isAvailable } = req.body;

  try {
    const updatedFood = await Food.findOneAndUpdate(
      { productId },
      { isAvailable },
      { new: true }
    );

    if (!updatedFood) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(updatedFood);
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
