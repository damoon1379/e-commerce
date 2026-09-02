import {prisma} from "../../../../../lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"


export async function GET(){
    try{
        const session = await getServerSession(authOptions)
        if(!session?.user || session.user.role !== "ADMIN"){
            return NextResponse.json(
                {error: 'Unauthorized'},
                {status: 401}
            )
        }

        const orders = await prisma.order.findMany({
            include:{
                user:{
                    select:{
                        name:true,
                        email:true,
                    }
                },
                items:{
                    include:{
                        product:{
                            select:{
                                name:true,
                                images:true,
                            }
                        }
                    }
                }
            },
            orderBy:{
                createdAt:'desc'
            }
        })

        return NextResponse.json({orders},{status:200})
    }catch(error){
        console.error("Admin GET orders error", error)
        return NextResponse.json(
            {error: "Failed to fetch orders"},
            {status: 500}
        )
    }
}

export async function PATCH(request:Request){
    try{
        const session = await getServerSession(authOptions)
        if(!session?.user || session.user.role !== "ADMIN"){
            return NextResponse.json(
                {error: 'Unauthorized'},
                {status: 401}
            )
        }

        const {orderId, status} = await request.json()

        if (!orderId) {
            return NextResponse.json(
                { error: "Order ID is required" },
                { status: 400 }
            )
        }

        const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                { status: 400 }
            )
        }

        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!existingOrder) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            )
        }

        const updatedOrder = await prisma.order.update({
            where:{id:orderId},
            data:{
                status
            }
        })

        return NextResponse.json(
        {message:"Order status updated successfully",order:updatedOrder},
        {status: 200}
    )
    }catch(error){
        console.error("Admin change order status failed")
        return NextResponse.json(
            {error: "Failed to change order status"},
            {status: 500}
        )
    }
}