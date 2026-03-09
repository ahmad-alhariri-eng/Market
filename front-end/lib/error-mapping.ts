export const backendErrorMapping: Record<string, string> = {
    "لا يوجد مستخدم مسجل بهذا البريد الإلكتروني.": "errors.userNotFound",
    "تم تجاوز الحد الأقصى لإرسال رمز التحقق اليوم (5 مرات).": "errors.dailyLimitExceeded",
    "يرجى إدخال البريد الإلكتروني والدور.": "errors.emailAndRoleRequired",
    "الدور غير مسموح. المسموح فقط: user أو seller.": "errors.invalidRole",
    "صيغة البريد الإلكتروني غير صحيحة.": "errors.invalidEmailFormat",
    "هذا البريد الإلكتروني مسجل بالفعل ولديه مستخدم.": "errors.emailAlreadyRegistered",
    "هذا البريد الإلكتروني تم التحقق منه مؤخراً.": "errors.emailRecentlyVerified",
    "يرجى الانتظار دقيقة واحدة قبل إعادة الإرسال.": "errors.waitOneMinute",
    "تم إرسال رمز التحقق بنجاح.": "success.verificationSent",
    "البريد الإلكتروني وكلمة المرور مطلوبان": "errors.emailAndPasswordRequired",
    "صلاحيات الدخول غير مسموحة": "errors.accessDenied",
    "بيانات الاعتماد غير صحيحة": "errors.invalidCredentials",
    "الحساب غير مفعل": "errors.accountInactive",
    "التوكن لا يحتوي على البريد الإلكتروني أو الدور.": "errors.invalidTokenPayload",
    "يرجى إدخال رمز التحقق.": "errors.codeRequired",
    "لا يوجد طلب تحقق مرتبط بهذا البريد الإلكتروني.": "errors.noVerificationRequest",
    "التوكن غير صالح أو غير مطابق.": "errors.invalidToken",
    "تم التحقق من البريد مسبقًا.": "errors.alreadyVerified",
    "انتهت صلاحية رمز التحقق. الرجاء إعادة الإرسال.": "errors.codeExpired",
    "فشل فك تشفير رمز التحقق.": "errors.decryptionFailed",
    "رمز التحقق غير صحيح.": "errors.invalidCode",
    "حدث خطأ": "errors.genericError",
    "يرجى إرسال التوكن في الهيدر X-Email-Token.": "errors.missingTokenHeader",
    "التوكن غير صالح أو منتهي": "errors.tokenInvalidOrExpired",
    "التوكن لا يحتوي على البريد أو الدور": "errors.tokenMissingInfo",
    "التوكن لا يطابق سجل التحقق الحالي.": "errors.tokenMismatch",
    "تم التحقق مسبقًا. يرجى تسجيل الدخول.": "errors.alreadyVerifiedUnused",
    "تم تجاوز الحد اليومي لإرسال الرمز (5 مرات).": "errors.dailyLimitExceeded",
    "يرجى الانتظار دقيقة قبل إعادة الإرسال.": "errors.waitMinute",
    "البريد الإلكتروني غير مسجل.": "errors.emailNotRegistered",
    "التوكن لا يحتوي على بريد إلكتروني.": "errors.tokenNoEmail",
    "لا يوجد بريد محقق لم يُستخدم بعد لإنشاء حساب.": "errors.noVerifiedEmail",
    "مرّت أكثر من ساعة على التحقق، الرجاء إعادة التحقق.": "errors.verificationExpired",
    "الحقول التالية مطلوبة": "errors.missingFields",
    "كلمة المرور وتأكيدها غير متطابقين.": "errors.passwordMismatch",
    "كلمة المرور ضعيفة.": "errors.weakPassword",
    "البريد الإلكتروني مستخدم مسبقًا.": "errors.emailTaken",
    "اسم المستخدم مستخدم مسبقًا.": "errors.usernameTaken",
    "حدث خطأ أثناء إنشاء المستخدم. حاول باسم مستخدم مختلف.": "errors.userCreationError",
    "حقل البريد الإلكتروني وكلمة المرور كلاهما مطلوب.": "errors.emailPwdRequired",
    "صيغة البريد الإلكتروني غير صالحة.": "errors.invalidEmail",
    "بيانات الاعتماد غير صحيحة.": "errors.invalidCreds",
    "الحساب معطل، يرجى التواصل مع الدعم.": "errors.contactSupport",
    "يجب إرسال التوكن في الهيدر X-Email-Token.": "errors.tokenHeaderRequired",
    "الرجاء إدخال رمز التحقق.": "errors.enterCode",
    "لا يوجد طلب تحقق نشط لهذا البريد.": "errors.noActiveRequest",
    "التوكن غير متطابق مع السجل الحالي.": "errors.tokenMismatchRecord",
    "لم يتم التحقق من البريد الإلكتروني بعد.": "errors.emailNotVerifiedYet",
    "انتهت صلاحية رمز التحقق. يرجى إعادة الإرسال.": "errors.codeExpiredResend",
    "يرجى إدخال كلمة المرور وتأكيدها.": "errors.enterPwdAndConfirm",
    "كلمتا المرور غير متطابقتين.": "errors.pwdsDoNotMatch",
    "كلمة المرور يجب أن تكون 8 أحرف على الأقل.": "errors.pwdTooShort",
    "المستخدم غير موجود.": "errors.userNotFound",
    "البريد الإلكتروني مطلوب.": "errors.emailRequired",
    "لقد تجاوزت الحد الأقصى لعدد طلبات رمز التحقق اليوم (3 مرات).": "errors.dailyLimit3",
    "يرجى إدخال البريد الإلكتروني .": "errors.enterEmail",
};

export function mapBackendError(message: string): string | null {
    if (!message) return null;
    // Normalize the message (trim whitespace)
    const normalizedKey = message.trim();

    // Direct match
    if (backendErrorMapping[normalizedKey]) {
        return backendErrorMapping[normalizedKey];
    }

    // Partial matches or dynamic messages
    if (normalizedKey.includes("يرجى الانتظار") && normalizedKey.includes("ثانية")) {
        return "errors.waitSeconds"; // We might need a dynamic replacement here later
    }

    return null;
}

/**
 * Convenience function: maps a backend error string and translates it in one call.
 * Use with `useTranslations("Auth")` — the mapped keys are relative to the Auth namespace.
 * Falls back to the original message if no mapping is found.
 */
export function translateBackendError(
    message: string | undefined,
    t: (key: string) => string
): string {
    if (!message) return t("errors.genericError");
    const mappedKey = mapBackendError(typeof message === "string" ? message : "");
    if (mappedKey) {
        return t(mappedKey);
    }
    return typeof message === "string" ? message : t("errors.genericError");
}
