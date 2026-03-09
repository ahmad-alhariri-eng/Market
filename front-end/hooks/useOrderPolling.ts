import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/providers/auth-provider';

export const useOrderPolling = (orderId: number) => {
    const { token } = useAuth();

    return useQuery({
        queryKey: ['order-status', orderId],
        queryFn: async () => {
            if (!token) throw new Error("No token available");
            const data = await orderService.getOrder(token, orderId);
            if (!data) throw new Error("Order not found");
            return data;
        },
        enabled: !!token && !!orderId,
        // التحكم الذكي في الـ Polling
        refetchInterval: (query) => {
            // إذا كان لا يوجد Data، استمر كل 5 ثواني
            if (!query.state.data) return 5000;

            const status = query.state.data.status;
            // توقف عن الاستعلام إذا وصلنا لحالة نهائية
            if (['completed', 'cancelled', 'expired'].includes(status.toLowerCase())) {
                return false;
            }

            return 5000; // استمر بالفحص مثل created او processing
        },
        refetchIntervalInBackground: true,
    });
};
