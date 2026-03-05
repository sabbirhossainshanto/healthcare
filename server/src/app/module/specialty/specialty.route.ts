import { Router } from "express";
import { specialtyController } from "./specialty.controller";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middleware/validateRequest";
import { specialtyValidation } from "./specialty.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
  multerUpload.single("file"),
  validateRequest(specialtyValidation.createSpecialtyZodSchema),
  specialtyController.createSpecialty,
);
router.get("/", specialtyController.getAllSpecialties);
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  specialtyController.deleteSpecialty,
);

export const SpecialtyRoutes = router;
