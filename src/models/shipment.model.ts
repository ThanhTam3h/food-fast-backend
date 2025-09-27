import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Drone } from './drone.model';
import { Order } from './order.model';

@Table
export class Shipment extends Model<Shipment> {
  @ForeignKey(() => Order)
  @Column({ allowNull: false, type: DataType.INTEGER })
  orderId: number;

  @BelongsTo(() => Order)
  order: Order;

  @ForeignKey(() => Drone)
  @Column({ allowNull: false, type: DataType.INTEGER })
  droneId: number;

  @BelongsTo(() => Drone)
  drone: Drone;

  @Column({ allowNull: false, type: DataType.STRING })
  status: string;

  @Column({ allowNull: true, type: DataType.DATE })
  startTime: Date;

  @Column({ allowNull: true, type: DataType.DATE })
  endTime: Date;

  @Column({ allowNull: true, type: DataType.DATE })
  expectedDelivery: Date;

  @Column({ allowNull: true, type: DataType.GEOGRAPHY('LINESTRING', 4326) })
  currentPath: string;

  @Column({ allowNull: true, type: DataType.STRING })
  flytbaseMissionId: string;

  @Column({ allowNull: true, type: DataType.JSONB })
  metadata: any;
}
