export type CartPreviewItem = {
  cartItemId: number;
  productId: number;
  productName: string;
  image: string | null;
  quantity: number;
  priceProduct: number;
  toppings: Array<{
    toppingId: number;
    toppingName: string;
    groupId: number;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
};

export type CartPreviewOutput = {
  message: string;
  data: {
    items: Array<CartPreviewItem>;
    totalAmount: number;
  };
};

export type CartCheckoutOutput = {
  message: string;
  data: {
    items: CartPreviewItem[];
    subtotal: number;
    deliveryFee: number;
    finalTotal: number;
  };
};
