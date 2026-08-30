import { CreateCheckoutSession } from "../../../../lib/stripe";
import {prisma} from "../../../../lib/prisma"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    try{
        const session = await getServerSession(authOptions)

        if(!session?.user){
            return NextResponse.json(
                {error: "Please login to checkout"},
                {status: 401}
            )
        }

        const {items, total} = await request.json()

        if(!items || items.length === 0){
            return NextResponse.json(
                {error: "Cart is empty"},
                {status: 400}
            )
        }
/*
        if(!shippingInfo){
            return NextResponse.json(
                {error:"Shipping information required"},
                {status: 400}
            )
        }
*/
        const order = await prisma.order.create({
            data:{
                userId: session.user.id,
                total: total,
                shippingAddress:'',
                status: 'PENDING',
                items:{
                    create: items.map((item:any)=>({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        })

        const stripeSession = await CreateCheckoutSession({
            items:items.map((item:any)=>({
                name:item.name,
                price:item.price,
                quantity:item.quantity,
                productId:item.productId
            })),
            userId:session.user.id,
            email:session.user.email || "",
            orderId:order.id

        })

        await prisma.order.update({
            where:{id:order.id},
            data:{
                paymentIntentId:stripeSession.sessionId
            }
        })

        return NextResponse.json(
            {
                url:stripeSession.url,
                sessionId:stripeSession.sessionId,
                orderId:order.id

            }
        )

        

    }catch(error){
        console.error("Checkout error: ",error)
        return NextResponse.json(
            {error: "Failed to create checkout session"},
            {status: 500}
        )
    }
}