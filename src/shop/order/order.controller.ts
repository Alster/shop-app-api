import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Query,
  Redirect,
  Res,
} from '@nestjs/common';
import { OrderService } from '../../../shop_shared_server/service/order/order.service';
import {
  NOVA_POSHTA_DELIVERY_TYPE,
  NovaPoshtaDeliveryType,
} from '../../../shop_shared/constants/checkout';
import { LanguageEnum } from '../../../shop_shared/constants/localization';
import { OrderDto } from '../../../shop_shared/dto/order/order.dto';
import { mapOrderDocumentToOrderDto } from '../../../shop_shared_server/mapper/order/map.orderDocument-to-orderDto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  private logger: Logger = new Logger(OrderController.name);

  @Get('get/:id')
  async getOrder(
    @Param('id') id: string,
    @Query('lang') lang: LanguageEnum,
  ): Promise<OrderDto> {
    const order = await this.orderService.getOrder(id);
    if (!order) {
      throw new Error(`Order not found with id ${id}`);
    }

    return mapOrderDocumentToOrderDto(order);
  }

  @Get('create')
  @Redirect()
  async createOrder(
    @Res() res: any,

    @Query('lang') lang: string,

    @Query('first_name') first_name: string,
    @Query('last_name') last_name: string,
    @Query('phone_number') phone_number: string,

    @Query('items_data') items_data: string,

    @Query('where_to_deliver') where_to_deliver: string,

    @Query('city_name') city_name: string,
    @Query('office_name') office_name: string,
    @Query('street') street: string,
    @Query('building') building: string,
    @Query('room') room: string,
  ): Promise<{ url: string }> {
    const order = await this.orderService.createOrder({
      firstName: first_name,
      lastName: last_name,
      phoneNumber: phone_number,
      itemsData: JSON.parse(items_data),
      delivery: {
        whereToDeliver: where_to_deliver as NovaPoshtaDeliveryType,
        data:
          where_to_deliver === NOVA_POSHTA_DELIVERY_TYPE.OFFICE
            ? {
                cityName: city_name,
                officeName: office_name,
              }
            : {
                cityName: city_name,
                street: street,
                building: building,
                room: room,
              },
      },
    });

    return {
      url: `http://localhost:3000/${lang}/order/${order._id.toString()}`,
    };
  }
}
