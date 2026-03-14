import AdminDashboardContent from "@/components/modules/Dashboard/AdminDashboardContent";
import { getDashboardStats } from "@/services/dashboard.services";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const AdminDashboardPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => getDashboardStats(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 10 minutes
  });

  // const dashboardData = queryClient.getQueryData([
  //   "admin-dashboard-stats",
  // ]) as ApiResponse<IAdminDashboardData>;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboardContent />
    </HydrationBoundary>
  );
};

export default AdminDashboardPage;
