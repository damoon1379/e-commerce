import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {prisma} from "../../../../../../lib/prisma"
import { NextResponse } from "next/server";

export async function PUT(request:Request, {params}:{params: Promise<{id:string}>}){
    try{
        const {id} = await params
        const session = await getServerSession(authOptions)
        if(!session.user || session.user.role !== "ADMIN"){
            return NextResponse.json(
                {error:"Unauthorized"},
                {status: 401}
            )
        }

        const {name,description,price,stock,category,sku,images} = await request.json()
        if(!name || !price || !sku){
            return NextResponse.json(
                {error:"Name,price and sku are required "},
                {status: 400}
            )
        }

        const product = await prisma.product.update({
            where:{id:id},
            data:{
                name,
                price:parseFloat(price),
                stock:parseFloat(stock),
                description:description || '',
                category:category || 'Uncategorized',
                sku,
                images: images || []
            }
        })

        return NextResponse.json({product})
    }catch(error){
        console.error("Admin product update failed")
        return NextResponse.json(
            {error:"Failed to update product"},
            {status: 500}
        )
    }
}


export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){
    try{
        const {id} = await params
        const session = await getServerSession(authOptions)
        if(!session?.user || session.user.role !== "ADMIN"){
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }

        const product = await prisma.product.findUnique({
            where:{id:id}
        })

        if(!product){
            return NextResponse.json(
                {error: "Product not found"},
                {status: 404}
            )
        }

        await prisma.product.delete({
            where:{id:id}
        })

        return NextResponse.json(
            {message:"Product deleted successfully"},
            {status: 200}
        )
    }catch(error){
        return NextResponse.json(
            {error:'Admin product delete failed'},
            {status: 500}
        )
    }
}