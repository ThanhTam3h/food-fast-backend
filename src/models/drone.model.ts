import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { DroneHub } from './drone_hub.model';
import { Order } from './order.model';

export enum DroneStatus {
  AVAILABLE = 'AVAILABLE',
  CHARGING = 'CHARGING',
  IN_MAINTENANCE = 'IN_MAINTENANCE',
  FLYING_TO_PICKUP = 'FLYING_TO_PICKUP',
  AT_PICKUP_POINT = 'AT_PICKUP_POINT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DROPPING_OFF = 'DROPPING_OFF',
  RETURNING_TO_HUB = 'RETURNING_TO_HUB',
  EMERGENCY_LANDING = 'EMERGENCY_LANDING',
}

@Table
export class Drone extends Model<Drone> {
  @Column({ allowNull: false, type: DataType.FLOAT })
  declare battery: number;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(DroneStatus)),
    defaultValue: DroneStatus.AVAILABLE,
  })
  declare status: DroneStatus;

  @Column({ allowNull: true, type: DataType.GEOGRAPHY('POINT', 4326) })
  declare location: string; 

  @ForeignKey(() => DroneHub)
  @Column({ allowNull: true, type: DataType.INTEGER })
  declare hubId: number;

  @BelongsTo(() => DroneHub)
  declare hub: DroneHub;

  @ForeignKey(() => Order)
  @Column({ allowNull: true, type: DataType.INTEGER })
  declare orderId: number;

  @HasOne(() => Order)
  declare order: Order;

  @Column({ allowNull: true, type: DataType.FLOAT })
  declare payloadCapacityKg: number;

  @Column({ allowNull: true, type: DataType.STRING })
  declare serialNumber: string;
}
