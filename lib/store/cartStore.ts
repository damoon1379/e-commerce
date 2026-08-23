import {create} from "zustand"
import {persist} from "zustand/middleware"

export interface CartItem {
    id:string,
    productId:string,
    name:string,
    price:number,
    quantity:number,
    image:string,
    stock:number,
} 

interface CartStore {
    items: CartItem[],
    addItem:(item:Omit<CartItem, "quantity"> & {quantity?: number})=>void,
    removeItem:(productId:string)=>void,
    updateQuantity:(productId:string,quantity:number)=>void,
    clearCart:()=>void,
    //getTotalItems:()=>number,
    //getTotalPrices:()=>number,
}

export const useCartStore = create<CartStore>()(
    persist(
        (set,get)=>({
            items:[],
        
            addItem: (item)=>{
                const {items} = get()
                const existingItem = items.find(i=>i.productId === item.productId)

                if(existingItem){
                    const newQuantity = (existingItem.quantity || 0) + (item.quantity || 1)
                    set({
                        items:items.map(i=> i.productId === item.productId ?
                            {...i,quantity:Math.min(newQuantity,i.stock)}
                            : i
                         ),
                    })
                }else{
                    set({
                        items:[
                            ...items,{
                                ...item,
                                quantity:item.quantity || 1
                            }
                        ]
                    })
                }
            },

            removeItem: (productId)=>{ 
                set({
                    items:get().items.filter(item=>item.productId !== productId)
                })
            },

            updateQuantity: (productId,quantity)=>{
                set({
                    items: get().items.map(i=>
                        i.productId === productId
                        ? {...i,quantity:Math.max(1,Math.min(quantity,i.stock))}
                        : i,
                    )
                })
            },

            clearCart: ()=>{
                set({items:[]})
            },

           

            
        }),
        {name: 'cart-storage'}
    )
);

export const useTotalItems = () => {
    return useCartStore((state)=>
        state.items.reduce((total,item)=>total + item.quantity,0)
)
}

export const useTotalPrice = ()=>{
    return useCartStore((state)=>
        state.items.reduce((total,item)=>total + item.quantity * item.price,0)
)
}

