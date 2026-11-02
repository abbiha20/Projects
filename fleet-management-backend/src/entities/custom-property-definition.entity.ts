// custom-property-definition.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
} from 'typeorm';

export enum PropertyType {
  TEXT = 'Text',
  NUMBER = 'Number',
  DATE = 'Date',
  BOOLEAN = 'Boolean',
  DROPDOWN = 'Dropdown',
}

@Entity()
export class CustomPropertyDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: PropertyType,
    default: PropertyType.TEXT,
  })
  type: PropertyType;

  @Column({ type: 'text', nullable: true })
  options: string;

  @DeleteDateColumn()
  deletedAt: Date;
}
