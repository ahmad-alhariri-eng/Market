"use client";

import { useParams, useRouter } from "next/navigation";
import { useOrderPolling } from "@/hooks/useOrderPolling";
import { CheckCircle, AlertTriangle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderStatusPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = Number(params.id);
    const locale = params.locale as string;

    const { data: order, isLoading, isError } = useOrderPolling(orderId);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="w-12 h-12 text-[#FCD535] animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-slate-700">جاري جلب تفاصيل الطلب...</h2>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-red-100 max-w-sm">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-800">تعذر العثور على الطلب</h2>
                    <p className="text-sm text-slate-500 mt-2">يرجى التأكد من الرابط أو التواصل مع الدعم.</p>
                    <Button onClick={() => router.push(`/${locale}`)} className="mt-6">العودة للرئيسية</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center relative overflow-hidden">

                {/* الحالة الأولى: بانتظار الدفع أو معالجة البلوكتشين */}
                {(order.status === "created" || order.status === "processing") && (
                    <div className="space-y-6 flex flex-col items-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#FCD535] rounded-full blur-xl opacity-20 animate-pulse"></div>
                            <Loader2 className="w-20 h-20 text-[#FCD535] animate-spin relative z-10 mx-auto" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">بانتظار تأكيد الدفع</h2>
                            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                الشاشة تُحدّث نفسها تلقائياً.<br />
                                يرجى إكمال الدفع عبر تطبيق الدفع. قد تستغرق الموافقة على الشبكة بضعة دقائق.
                            </p>
                        </div>

                        {order.checkout_url && (
                            <a
                                href={order.checkout_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold inline-block transition-colors"
                            >
                                افتح صفحة الدفع
                            </a>
                        )}
                    </div>
                )}

                {/* الحالة الثانية: اكتمل الدفع بنجاح! */}
                {order.status === "completed" && (
                    <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800">تم الدفع بنجاح!</h2>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 mt-4 text-center">
                            تم تأكيد الدفع بنجاح.
                            <br /><br />
                            <strong className="text-indigo-600 text-base">يرجى مراجعة بريدك الإلكتروني (صندوق الوارد المباشر أو المهملات Spam)</strong>
                            <br />
                            لقد قمنا بإرسال تفاصيل اشتراكك.
                        </div>
                        <Button onClick={() => router.push(`/${locale}`)} variant="outline" className="mt-4 w-full">الرئيسية</Button>
                    </div>
                )}

                {/* الحالة الثالثة: تم الدفع ولكن المبلغ ناقص (Edge Case) */}
                {order.status === "underpaid" && (
                    <div className="space-y-4">
                        <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-12 h-12 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">الدفع غير مكتمل</h2>
                        <p className="text-slate-500 text-sm">
                            المبلغ الذي قمت إرساله ناقص. يرجى التواصل مع الدعم الفني وتزويدهم برقم الطلب (<strong>#{order.order_number}</strong>) لتسوية وضعك.
                        </p>
                    </div>
                )}

                {/* الحالة الرابعة: ألغي أو انتهت الصلاحية (Expired) */}
                {(order.status === "cancelled" || order.status === "expired") && (
                    <div className="space-y-4">
                        <div className="bg-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-12 h-12 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">الطلب مُلغى أو منتهي</h2>
                        <p className="text-slate-500 text-sm">
                            انتهت صلاحية الجلسة أو تم إلغاء الطلب. يمكنك العودة للمتجر ومحاولة الشراء من جديد.
                        </p>
                        <Button onClick={() => router.push(`/${locale}`)} variant="outline" className="mt-4 w-full">تصفح المنتجات</Button>
                    </div>
                )}

            </div>
        </div>
    );
}
