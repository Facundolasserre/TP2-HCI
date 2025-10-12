import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique
} from "typeorm";
import {IsOptional, Length} from "class-validator";
import {User} from "./user";
import {PantryItem} from "./pantryItem";
import {Product} from "./product";
import {removeUserForListShared} from "../utils/users";

@Entity()
@Unique(["name", "owner"])
export class Pantry extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false})
  @Length(1, 50)
  name: string;

  @Column({ type: "simple-json", nullable: true })
  @IsOptional()
  metadata: Record<string, any>;

  @ManyToOne(() => User, user => user.pantries)
  owner: User;

  @OneToMany(() => PantryItem, pantryItems => pantryItems.pantry)
  items: PantryItem[];

  @OneToMany(() => Product, product => product.pantry)
  products: Product[];

  @ManyToMany(() => User, user => user.sharedPantries)
  @JoinTable()
  sharedWith: User[];

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  @IsOptional()
  deletedAt: Date;

  getFormattedPantry(): any {
    return {
      id: this.id,
      name: this.name,
      metadata: this.metadata ?? null,
      createdAt: this.createdAt?.toISOString().substring(0, 19).replace('T', ' '),
      updatedAt: this.updatedAt?.toISOString().substring(0, 19).replace('T', ' '),
      owner: this.owner?.getFormattedUser() ?? null,
      sharedWith: this.sharedWith?.map((user) => user.getFormattedUser()) ?? [],
    };
  }

}