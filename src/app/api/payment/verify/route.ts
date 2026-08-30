import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import {prisma} from "../../../../../lib/prisma"

export async function GET(request:Request){
    try{
        const session = await getServerSession(authOptions)
       

        if(!session?.user){
            return NextResponse.json(
                {error:"Please login"},
                {status:401}
            )
        }

        const {searchParams} = new URL(request.url)
        const orderId = searchParams.get("order_id")

        if(!orderId){
            return NextResponse.json(
                {error:"Order id required"},
                {status: 400}
            )
        }

        const order = await prisma.order.findUnique({
            where:{
                id:orderId,
                userId:session.user.id
            }
        })

        if(!order){
            return NextResponse.json(
                {error:"Order not found"},
                {status: 404}
            )
        }

        return NextResponse.json({
            order:{
                id:order.id,
                total:order.total,
                status:order.status,
                createdAt:order.createdAt
            }
        })


    }catch(error){
        console.error("Payment verification failed", error)
        return NextResponse.json(
            {error:"Failed to verify payment"},
            {status: 500}
        )
    }
}
