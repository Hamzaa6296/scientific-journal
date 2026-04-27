"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PapersController = void 0;
const common_1 = require("@nestjs/common");
const papers_service_1 = require("./papers.service");
const paper_dto_1 = require("./dto/paper.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorators_1 = require("../common/decorators/roles.decorators");
const role_enum_1 = require("../common/enums/role.enum");
let PapersController = class PapersController {
    constructor(papersService) {
        this.papersService = papersService;
    }
    getPublishedPapers(query) {
        return this.papersService.getPublishedPapers(query);
    }
    createPaper(dto, req) {
        return this.papersService.createPaper(dto, req.user.userId, req.user.email);
    }
    getMySubmissions(req) {
        return this.papersService.getMySubmissions(req.user.userId);
    }
    submitPaper(id, req) {
        return this.papersService.submitPaper(id, req.user.userId);
    }
    submitRevision(id, dto, req) {
        return this.papersService.submitRevision(id, dto, req.user.userId);
    }
    updatePaper(id, dto, req) {
        return this.papersService.updatePaper(id, dto, req.user.userId);
    }
    deletePaper(id, req) {
        return this.papersService.deletePaper(id, req.user.userId, req.user.role);
    }
    getAllPapers(query) {
        return this.papersService.getAllPapers(query);
    }
    updateStatus(id, dto, req) {
        return this.papersService.updateStatus(id, dto, req.user.userId);
    }
    getPaperById(id, req) {
        return this.papersService.getPaperById(id, req.user.userId, req.user.role);
    }
};
exports.PapersController = PapersController;
__decorate([
    (0, common_1.Get)('published'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [paper_dto_1.PaperQueryDto]),
    __metadata("design:returntype", void 0)
], PapersController.prototype, "getPublishedPapers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorators_1.Roles)(role_enum_1.Role.AUTHOR),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [paper_dto_1.CreatePaperDto, Object]),
    __metadata("design:returntype", void 0)
], PapersController.prototype, "createPaper", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('my-submissions'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PapersController.prototype, "getMySubmissions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorators_1.Roles)(role_enum_1.Role.AUTHOR),
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PapersController.prototype, "submitPaper", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorators_1.Roles)(role_enum_1.Role.AUTHOR),
    (0, common_1.Post)(':id/revision'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, paper_dto_1.SubmitRevisionDto, Object]),
    __metadata("design:returntype", void 0)
], PapersController.prototype, "submitRevision", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorators_1.Roles)(role_enum_1.Role.AUTHOR),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, paper_dto_1.UpdatePaperDto, Object]),
    __metadata("design:returntype", void 0)
], PapersController.prototype, "updatePaper", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PapersController.prototype, "deletePaper", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorators_1.Roles)(role_enum_1.Role.EDITOR, role_enum_1.Role.ADMIN),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [paper_dto_1.PaperQueryDto]),
    __metadata("design:returntype", void 0)
], PapersController.prototype, "getAllPapers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorators_1.Roles)(role_enum_1.Role.EDITOR, role_enum_1.Role.ADMIN),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, paper_dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", void 0)
], PapersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PapersController.prototype, "getPaperById", null);
exports.PapersController = PapersController = __decorate([
    (0, common_1.Controller)('papers'),
    __metadata("design:paramtypes", [papers_service_1.PapersService])
], PapersController);
//# sourceMappingURL=papers.controller.js.map