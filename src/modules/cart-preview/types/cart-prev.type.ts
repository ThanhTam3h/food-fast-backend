export type CartPreviewItem = {
  cartItemId: string;
  productName: string;
  productVariantName: string;
  productVariantsize: string;
  productVarianttype: string;
  priceProduct: number;
  quantity: number;
  toppings: Array<{
    toppingId: number;
    toppingName: string;
    price: number;
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
