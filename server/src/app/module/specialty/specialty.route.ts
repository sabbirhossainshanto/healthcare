import { Router } from "express";
import { specialtyController } from "./specialty.controller";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
  specialtyController.getAllSpecialties,
  specialtyController.createSpecialty,
);
router.get("/");
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  specialtyController.getAllSpecialties,
  specialtyController.deleteSpecialty,
);

export const SpecialtyRoutes = router;
