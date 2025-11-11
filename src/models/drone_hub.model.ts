import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Drone } from './drone.model';

@Table
export class DroneHub extends Model<DroneHub> {
  @Column({ allowNull: false, type: DataType.STRING })
  declare street: string;

  @Column({ allowNull: true, type: DataType.GEOGRAPHY('POINT', 4326) })
  declare location: string;

  @HasMany(() => Drone)
  declare droneList: Drone[];
}
