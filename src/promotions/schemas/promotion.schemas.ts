import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import exp from 'constants';
import e from 'express';
import mongoose, { HydratedDocument } from 'mongoose';

export type PromotionDocument = HydratedDocument<Promotion>;
@Schema({ timestamps: true})
export class Promotion {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop()
  description: string;

  @Prop()
  logo: string;

  @Prop({type: Object})
    createdBy: {
      _id: mongoose.Schema.Types.ObjectId,
      email: string,
    }

    @Prop({type: Object})
    updatedBy: {
      _id: mongoose.Schema.Types.ObjectId,
      email: string,
    }

    @Prop({type: Object})
    deletedBy: {
      _id: mongoose.Schema.Types.ObjectId,
      email: string,
    }

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    isDeleted: boolean;

    @Prop()
    deleteAt: Date;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);