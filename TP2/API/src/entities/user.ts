import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  CreateDateColumn,
  JoinTable
} from "typeorm";
import { IsEmail, IsOptional, Length } from "class-validator";
import { UserVerificationToken } from "./userVerificationToken";
import { UserPasswordRecoveryToken } from "./userPasswordRecoveryToken";
import { Category } from "./category";
import { Product } from "./product";
import { Pantry } from "./pantry";
import { ListItem } from "./listItem";
import { List } from "./list";
import { PantryItem } from "./pantryItem";
import { Purchase } from "./purchase";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false})
  @Length(1, 50)
  name: string;

  @Column({ nullable: false })
  @Length(1, 50)
  surname: string;

  @Column({ nullable: false, unique: true })
  @IsEmail()
  email: string;

  @Column({ type: "simple-json", nullable: true })
  @IsOptional()
  metadata: Record<string, any>;

  getFormattedUser(): any {
    return {
      id: this.id,
      name: this.name,
      surname: this.surname,
      email: this.email,
      metadata: this.metadata ?? {},
      createdAt: this.createdAt.toISOString().substring(0, 19).replace('T', ' '),
      updatedAt: this.updatedAt.toISOString().substring(0, 19).replace('T', ' '),
    };
  }

  @Column({nullable: false, select: false})
  password: string;

  @Column({ nullable: false, default: false })
  isVerified: boolean;

  @DeleteDateColumn({ select: false })
  @IsOptional()
  deletedAt: Date;

  @OneToOne(() => UserVerificationToken, verificationToken => verificationToken.user)
  verificationToken: UserVerificationToken;

  @OneToOne(() => UserPasswordRecoveryToken, passwordRecoveryToken => passwordRecoveryToken.user)
  passwordRecoveryToken: UserPasswordRecoveryToken;

  @OneToMany(() => Category, category => category.owner)
  categories: Category[];

  @OneToMany(() => Pantry, pantry => pantry.owner)
  pantries: Pantry[];

  @OneToMany(() => Product, product => product.owner)
  products: Product[];

  @OneToMany(() => List, list => list.owner)
  lists: List[];

  @OneToMany(() => ListItem, listItem => listItem.owner)
  listItems: ListItem[];

  @OneToMany(() => PantryItem, pantryItem => pantryItem.owner)
  pantryItems: PantryItem[];

  @OneToMany(() => Purchase, purchase => purchase.owner)
  purchases: Purchase[];

  @ManyToMany(() => List, list => list.sharedWith)
  sharedLists: List[];

  @ManyToMany(() => Pantry, pantry => pantry.sharedWith)
  sharedPantries: Pantry[];

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}