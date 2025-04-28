import Food from "../models/food.js"
import Order from "../models/order.js"

export async function createOrder(req,res) {
 if (req.user==null){
    res.json({
        message:"Please login and try again"
    })
 }

 const orderInfo = req.body

 if (orderInfo.name==null) {
    orderInfo.name=req.user.firstName+" "+req.user.lastName
 }
 if (orderInfo.email==null) {
    orderInfo.email=req.user.email
 }

 let orderId="SC2D_000001"

 const lastOrder = await Order.find().sort({date:-1}).limit(1)

 console.log(lastOrder)

 if (lastOrder.length > 0) {
    const lastOrderId=lastOrder[0].orderId
    const lastOrderNumberString=lastOrderId.replace("SC2D_","")
    const lastOrderNumber = parseInt(lastOrderNumberString)
    const newOrderNumber= lastOrderNumber+1
    const newOrderNumberString = String(newOrderNumber).padStart(6,'0')
    orderId="SC2D_"+newOrderNumberString
 }



 try {
   let total =0
   let labeledTotal=0
   const product=[]

   for (let i =0;i<orderInfo.product.length;i++){
      const item = await Food.findOne({productId:orderInfo.product[i].productId})
      if (item==null) {
         res.status(404).json({
            message: "Food with the product id "+orderInfo.product[i].productId+" not found"
         })
         return
      }
      if (item.isAvailable==false) {
         res.status(404).json({
            message: "The food isn't available right now"
         })
      }
      product[i]= {
            productInfo:{
            productId:item.productId,
            productName:item.productName,
            image:item.image,
            prepTime:item.prepTime,
            labeledPrice:item.labeledPrice,
            price:item.price
         },
         quantity:orderInfo.product[i].quantity
      }
      total += (item.price*orderInfo.product[i].quantity)
      labeledTotal+=(item.labeledPrice*orderInfo.product[i].quantity)
   }
   
   const order = new Order({
      orderId:orderId,
      email:orderInfo.email,
      name:orderInfo.name,
      address:orderInfo.address,
      phoneNumber:req.body.phoneNumber,
      total:total,
      labeledTotal:labeledTotal,
      product:product,
   })

    const createdOrder = await order.save()
    res.json({
        message:"Order created successfully",
        order:createdOrder
    })
 } catch (error) {
    res.status(500).json({
        message:"Failed to create order",
        error:error.message

    })
 }
}