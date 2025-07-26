import Review from "../models/review.js";

//01.To write a review
export async function submitReview(req, res) {
  try {
    const { userName, name, rating, reviewText } = req.body;

    if (!userName || !name || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newReview = new Review({
      userName,
      name,
      rating,
      reviewText,
    });

    await newReview.save();
    res.status(201).json({ message: "Review submitted successfully" });
  } catch (error) {
    console.error("Error submitting review:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

//02. To view all review
export async function viewReview(req, res) {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 });

    if (reviews.length === 0) {
      return res.status(200).json([]);
    }

    const response = reviews.map((review) => ({
      name: review.name,
      rating: review.rating,
      reviewText: review.reviewText,
      createdAt: review.createdAt,
    }));

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error loading reviews:", error);
    return res.status(500).json({
      message: "Error loading reviews",
      error: error.message,
    });
  }
}
