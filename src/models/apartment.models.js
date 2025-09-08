import mongoose from "mongoose";

const { Schema } = mongoose;

const apartmentSchema = new Schema(
  {
    number: { type: String, required: true },
    building: { type: String, required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "User" },
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    rent: { type: Number, required: true },
    status: {
      type: String,
      enum: ["vacant", "occupied"],
      default: "vacant",
    },
    area: { type: Number, required: true }, // in square feet
    amenities: [{ type: String }], // list of available amenities
    lastMaintenanceDate: { type: Date },
    societyName: { type: String, required: true },
  },
  { timestamps: true }
);

export const Apartment = mongoose.model("Apartment", apartmentSchema);
