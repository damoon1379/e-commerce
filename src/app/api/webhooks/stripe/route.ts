import {prisma} from "../../../../../lib/prisma"
import { NextResponse } from "next/server"
import { stripe } from "../../../../../lib/stripe"
import Stripe from "stripe"

export async function POST(request:Request){
    console.log('stripe webhook got called')
    try{
        const body = await request.text()
        const signature = request.headers.get('stripe-signature') as string

        
//verify webhook signature
let event : Stripe.Event

        try{
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET!
            )


        }catch(err){
            console.error('Webhook signature verification failed',err)
            return NextResponse.json(
                {error: "Invalid signature"},
                {status: 400}
            )
        }

        if(event.type === "checkout.session.completed"){
            const session = event.data.object as Stripe.Checkout.Session

            const metadata = session.metadata
            const userId = metadata?.userId
            const orderId = metadata?.orderId


            if(!userId || !orderId){
                console.error("missing metadata", {userId,orderId})
                return NextResponse.json(
                    {error: "Missing metadata"},
                    {status: 400}
                )
            }

                                                                            
            let shippingAddress : string  =''

            if (session.collected_information?.shipping_details?.address) {
                const address = session.collected_information.shipping_details.address
                shippingAddress = [
                    address.line1,
                    address.city,
                    address.state,
                    address.postal_code,
                    address.country
                ].filter(Boolean).join(', ')
            }
            await prisma.order.update({
                where:{id:orderId},
                data:{
                    status: "PAID",
                    shippingAddress:shippingAddress || ""
                }
            })

            const cart = await prisma.cart.findUnique({
                where:{userId}
            })

            if(cart) { 
                await prisma.cartItem.deleteMany({
                    where:{cartId:cart.id}
                })
            }

            const orderItems = await prisma.orderItem.findMany({
                where:{orderId},
                select:{
                    productId:true,
                    quantity:true
                }
            })

            for(const item of orderItems){
                await prisma.product.update({
                    where:{id:item.productId},
                    data:{
                        stock:{decrement:item.quantity}
                    }
                })
            }

            console.log(`✅ Order ${orderId} paid successfully for user ${userId}`)
            return NextResponse.json({received:true})
            
        }
        return NextResponse.json({ received: true, skipped: true })
        
    }catch(error){
        console.error("Webhook error", error)
        return NextResponse.json(
            {error: "Webhook handle error"},
            {status: 500}
        )
    }
}