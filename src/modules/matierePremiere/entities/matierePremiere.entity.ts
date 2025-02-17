import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class MatierePremiere {
    @PrimaryGeneratedColumn()
    id: Number;

    @Column()
    name: string;

}