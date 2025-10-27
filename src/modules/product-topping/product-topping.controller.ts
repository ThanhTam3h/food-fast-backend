import { Controller } from '@nestjs/common';
import { ProductToppingService } from './product-topping.service';

@Controller('product-topping')
export class ProductToppingController {
  constructor(private readonly productToppingService: ProductToppingService) {}
}
