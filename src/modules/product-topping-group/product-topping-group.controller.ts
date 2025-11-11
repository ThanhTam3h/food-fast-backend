import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ProductToppingGroupService } from './product-topping-group.service';
import { RemoveGroupFromProductDto } from './dto/remove-group-from-product.dto';
import { AddGroupToProductDto } from './dto/add-group-to-product.dto';
import { Public } from 'src/common/decorators/global-guard';

@Controller('product-topping-group')
export class ProductToppingGroupController {
  constructor(
    private readonly productToppingGroupService: ProductToppingGroupService,
  ) {}

  @Public()
  @Post('link')
  async linkGroups(@Body() dto: AddGroupToProductDto) {
    return await this.productToppingGroupService.linkToppingGroups(dto);
  }

  @Public()
  @Delete('unlink')
  async unlinkGroup(@Body() dto: RemoveGroupFromProductDto) {
    return await this.productToppingGroupService.unlinkToppingGroup(dto);
  }
}
