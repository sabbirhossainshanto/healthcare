"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IDoctor } from "@/types/doctor.types";

export const getDoctors = async () => {
  const doctors = await httpClient.get<IDoctor[]>("/doctors");
  console.log(doctors, "server");
  return doctors;
};
