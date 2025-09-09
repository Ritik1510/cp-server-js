import { asyncHandler } from "../utils/asyncHandler.js";
import { Apartment } from "../models/apartment.models.js";
import { ApiResponses } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

// Only managers can create apartments
// validate the user role from req.user
// get the apartment details from req.body
// validate the required fields
// check for duplicate apartment
// create the apartment in the database
// return the created apartment in the response
export const createApartment = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "manager") {
    throw new ApiError(403, "Only managers are allowed to create apartments.");
  }

  const {
    number,
    building,
    rent,
    area,
    amenities = [],
    societyName,
    ownerId,
    tenantId,
    status = "vacant",
    lastMaintenanceDate,
  } = req.body;

  if (!number?.trim() || !building?.trim() || !rent || !area || !societyName?.trim()) {
    throw new ApiError(400, "All required fields (number, building, rent, area, societyName) must be provided.");
  }

  // Duplicate check
  const existing = await Apartment.findOne({ number: number.trim(), building: building.trim() });
  if (existing) {
    throw new ApiError(409, "Apartment with this number and building already exists.");
  }

  // Create apartment
  const apartment = await Apartment.create({
    number: number.trim(),
    building: building.trim(),
    rent,
    area,
    amenities,
    societyName: societyName.trim(),
    ownerId,
    tenantId,
    status,
    lastMaintenanceDate,
  });

  const response = {
    _id: apartment._id,
    number: apartment.number,
    building: apartment.building,
    rent: apartment.rent,
    area: apartment.area,
    status: apartment.status,
    amenities: apartment.amenities,
    societyName: apartment.societyName,
    ownerId: apartment.ownerId,
    tenantId: apartment.tenantId,
    lastMaintenanceDate: apartment.lastMaintenanceDate,
    createdAt: apartment.createdAt,
  };

  res.status(201).json(
    new ApiResponses(201, response, "Apartment created successfully")
  );
});