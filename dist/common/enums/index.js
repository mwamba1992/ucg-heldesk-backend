"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketStatus = exports.Priority = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["REQUESTER"] = "REQUESTER";
    UserRole["AGENT"] = "AGENT";
    UserRole["SUPERVISOR"] = "SUPERVISOR";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var Priority;
(function (Priority) {
    Priority["CRITICAL"] = "CRITICAL";
    Priority["HIGH"] = "HIGH";
    Priority["MEDIUM"] = "MEDIUM";
    Priority["LOW"] = "LOW";
})(Priority || (exports.Priority = Priority = {}));
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["NEW"] = "NEW";
    TicketStatus["ASSIGNED"] = "ASSIGNED";
    TicketStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TicketStatus["PENDING"] = "PENDING";
    TicketStatus["RESOLVED"] = "RESOLVED";
    TicketStatus["CLOSED"] = "CLOSED";
    TicketStatus["CANCELLED"] = "CANCELLED";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
//# sourceMappingURL=index.js.map