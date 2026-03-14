/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IAdminDashboardData } from "@/types/dashboard.types";

export async function getDashboardStats() {
  try {
    const response = await httpClient.get<IAdminDashboardData>("/stats");
    return response;
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error?.message,
      data: null,
      meta: null,
    };
  }
}
