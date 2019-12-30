"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const companySchema = new mongoose_1.Schema({
    name: { type: String, default: null },
    ruc: String,
    socialReason: { type: String, default: '' },
    direction: { type: String, default: '' },
    users: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    vehicles: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Vehicle', default: null }],
    state: { type: Boolean, default: true },
    createdAt: { type: Date, default: null },
    updatedAt: { type: Date, default: null },
    companyKey: String,
    clients: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Client', default: null }]
});
exports.Company = mongoose_1.model('Company', companySchema);
//# sourceMappingURL=Company.js.map