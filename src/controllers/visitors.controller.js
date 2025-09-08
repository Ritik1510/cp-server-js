import { asyncHandler } from "../utils/asyncHandler.js";
import { Visitor } from "../models/visitor.models.js";
import { ApiResponses } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

// Create a new visitor (any authenticated user)
export const createVisitor = asyncHandler(async (req, res) => {
  const {
    name,
    purpose,
    status,
    apartmentId,
    expectedAt,
    contactNumber,
    approvedBy,
    pendingApproval = false,
    actualEntryAt,
    actualExitAt
  } = req.body;

  if (!name?.trim() || !purpose?.trim() || !status || !apartmentId || !expectedAt || !contactNumber?.trim()) {
    throw new ApiError(400, "Required fields: name, purpose, status, apartmentId, expectedAt, contactNumber");
  }

  const visitor = await Visitor.create({
    name: name.trim(),
    purpose: purpose.trim(),
    status,
    apartmentId,
    expectedAt,
    contactNumber: contactNumber.trim(),
    approvedBy,
    pendingApproval,
    actualEntryAt,
    actualExitAt
  });

  res.status(201).json(new ApiResponses(201, visitor, "Visitor created successfully"));
});

// Only manager can delete a visitor
export const deleteVisitor = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "manager") {
    throw new ApiError(403, "Only managers are allowed to delete visitors.");
  }

  const { id } = req.params;
  const visitor = await Visitor.findByIdAndDelete(id);

  if (!visitor) {
    throw new ApiError(404, "Visitor not found");
  }

  res.status(200).json(new ApiResponses(200, null, "Visitor deleted successfully"));
});