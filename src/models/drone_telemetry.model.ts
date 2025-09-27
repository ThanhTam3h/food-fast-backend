import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Drone } from './drone.model';

@Table
export class DroneTelemetry extends Model<DroneTelemetry> {
  @ForeignKey(() => Drone)
  @Column({ allowNull: false, type: DataType.INTEGER })
  droneId: number;

  @BelongsTo(() => Drone)
  drone: Drone;

  @Column({ allowNull: false, type: DataType.GEOGRAPHY('POINT', 4326) })
  location: string;

  @Column({ allowNull: false, type: DataType.FLOAT })
  altitude: number;

  @Column({ allowNull: false, type: DataType.FLOAT })
  speed: number;

  @Column({ allowNull: false, type: DataType.FLOAT })
  heading: number;

  @Column({ allowNull: true, type: DataType.FLOAT })
  batteryLevel: number;

  @Column({ allowNull: true, type: DataType.FLOAT })
  payloadKg: number;

  @Column({ allowNull: true, type: DataType.STRING })
  mode: string;

  @Column({ allowNull: true, type: DataType.JSONB })
  extra: any;

  @Column({ allowNull: false, type: DataType.DATE, defaultValue: DataType.NOW })
  ts: Date;
}
