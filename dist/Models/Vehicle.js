"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const vehicleSchema = new mongoose_1.Schema({
    drivers: [{ type: mongoose_1.Schema.Types.ObjectId, default: null, ref: 'Drive' }],
    capacity: Number,
    state: { type: Boolean, default: false },
    company: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Company' },
    plaque: String,
    description: String,
    createdAt: { type: Date, default: null },
    updatedAt: { type: Date, default: null }
});
exports.Vehicle = mongoose_1.model('Vehicle', vehicleSchema);
const coordSchema = new mongoose_1.Schema({
    vehicleID: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vehicle' },
    position: Object,
    createdAt: Number
});
exports.Coord = mongoose_1.model('Coord', coordSchema);
//# sourceMappingURL=Vehicle.js.map