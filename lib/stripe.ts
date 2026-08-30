import { stringify } from "querystring"
import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{
    apiVersion: '2026-07-29.dahlia',
    typescript: true
})

export async function CreateCheckoutSession({
    items,
    userId,
    email,
    orderId,
}:{
    items:Array<{name:string,price:number,quantity:number,productId:number}>,
    userId:string,
    email:string,
    orderId:string
    
}){
    console.log(
  "Stripe key:",
  process.env.STRIPE_SECRET_KEY?.slice(0, 12)
);
    const lineItems = items.map(item=>({
        price_data:{
            currency:"usd",
            unit_amount:Math.round(item.price*100),
            product_data:{
                name:item.name
            }
        },
        quantity:item.quantity
    }))

    const session = await stripe.checkout.sessions.create({
        payment_method_types:["card"],
        mode:"payment",
        success_url:`${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
        cancel_url:`${process.env.NEXTAUTH_URL}/cart`,
        line_items:lineItems,
        customer_email:email,
        shipping_address_collection: {
            allowed_countries: ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'JP'], 
        },
        metadata:{
            userId:userId,
            orderId:orderId,
        }
    })
console.log('user id from stripe lib:',userId)
console.log('order id from stripe lib:',orderId)

    return {
        sessionId:session.id,
        url:session.url,
    }
}