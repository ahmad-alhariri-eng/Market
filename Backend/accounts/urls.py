
from django.urls import path
from .views import (
    ListUsersView, ListAdminsView,PublicUserProfileView,
    ConfirmEmailChangeAPIView,RequestEmailChangeAPIView, VerifyAdminCodeAPIView,
    UserProfileView,RequestPasswordResetCodeView,CreateAdminUserView,
 ResetPasswordView,VerifyResetCodeView,SuperAdminLoginAPIView,LoginAPIView,EmailVerificationAPIView,
 VerifyCodeAPIView,ResendVerificationCodeAPIView,CompleteRegistrationAPIView,UpdateMyLocationView,
 UpdateProfileImageView, LogoutAPIView

)

urlpatterns = [
    ## ادخال الايميل و الدور  لارسال رمز التحقق
    path('auth/register/request-code/', EmailVerificationAPIView.as_view(), name='EmailVerificationAPIView'),
    ## التحقق من الايميل  نرسل الايميل  فقط و نبعث التوكن بالهيدر    
    path('auth/register/verify-code/', VerifyCodeAPIView.as_view(), name='VerifyCodeAPIView'),
    ##  طلب اعادة ارسال رمز التحقق فقط نبعث التوكن بالهيدر
    path('auth/register/resend-code/', ResendVerificationCodeAPIView.as_view(), name='ResendVerificationCodeAPIView'),
    ## اكمال ادخال المعلومات   و نبعث التوكن بالهيدر 
    path('auth/register/', CompleteRegistrationAPIView.as_view(), name='CompleteRegistrationAPIView'),
    ## تسجيل الدخول ندخل الايميل و كلمة السر
    path('auth/login/', LoginAPIView.as_view(), name='LoginAPIView'),
    path('auth/superadmin/login/', SuperAdminLoginAPIView.as_view(), name='SuperAdminLoginAPI'),
    path('auth/logout/', LogoutAPIView.as_view(), name='LogoutAPIView'),
    ## طلب اعادة تعيين كلمة السر يدخل الايميل و يتم ارسال رمز تحقق
    path('auth/password/reset/request/', RequestPasswordResetCodeView.as_view(), name='RequestPasswordResetCodeView'),
    ## ادخال رمز التحقق لاعادة تعيين كلمة سر
    path('auth/password/reset/verify/', VerifyResetCodeView.as_view(), name='VerifyResetCodeView'),
    path('auth/password/reset/confirm/', ResetPasswordView.as_view(), name='ResetPasswordView'),# إعادة تعيين كلمة المرور
    ## التحقق من رمز التحقق  للادمن حيث يدخل الايميل وو رمز التحقق 
    path('auth/admin/verify-code/', VerifyAdminCodeAPIView.as_view(), name='VerifyAdminCodeAPI'),
    ## عرض الملف الشخصي
    path('profile/me/', UserProfileView.as_view(), name='profile-me'),
    path('profile/me/image/', UpdateProfileImageView.as_view(), name='update-profile-image'),
    path('profile/me/email/request/', RequestEmailChangeAPIView.as_view(), name='RequestEmailChangeAPI'),# طلب تغيير الايميل و ادخال ايميل جديد
    path('profile/me/email/confirm/', ConfirmEmailChangeAPIView.as_view(), name='ConfirmEmailChangeAPI'),# تغيير الايميل و التحقق من الرمز
    ## رؤية قائمة 
    path('users/', ListUsersView.as_view(), name='list-users'),
    path('admins/', ListAdminsView.as_view(), name='list-admins'),
    ## عرض  بروفايل اي مستخدم
    path('users/<int:user_id>/profile/', PublicUserProfileView.as_view(), name='public-profile'),
    path('profile/me/location/', UpdateMyLocationView.as_view(), name='profile-update-location'),

]



