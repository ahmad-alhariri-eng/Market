import logging
from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from .models import EmailLog

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def send_digital_product_email_task(self, email_log_id, context_data):
    """
    مهمة خلفية (Background Task) لإرسال تفاصيل المنتج الرقمي. 
    تستخدم Exponential Backoff لإعادة المحاولة.
    """
    try:
        # 1. جلب سجل الإيميل
        email_log = EmailLog.objects.get(id=email_log_id)
    except EmailLog.DoesNotExist:
        logger.error(f"EmailLog {email_log_id} not found.")
        return
        
    # Idempotency Check (حماية من تكرار إرسال الإيميل إذا كان مرسلاً بالفعل)
    if email_log.status == EmailLog.EmailStatus.SENT:
        return 
        
    try:
        # 2. تحضير رسالة ה HTML
        html_content = render_to_string('emails/digital_product.html', context_data)
        
        msg = EmailMultiAlternatives(
            subject=email_log.subject,
            body="الرجاء استخدام متصفح يدعم HTML لرؤية المنتج الرقمي.", # Fallback Text
            to=[email_log.recipient_email]
        )
        msg.attach_alternative(html_content, "text/html")
        
        # 3. محاولة الإرسال
        msg.send(fail_silently=False)
        
        # 4. تسجيل وتحديث حالة النجاح
        email_log.status = EmailLog.EmailStatus.SENT
        email_log.sent_at = timezone.now()
        email_log.error_message = ''
        email_log.save(update_fields=['status', 'sent_at', 'error_message'])
        logger.info(f"Successfully sent digital product email to {email_log.recipient_email}")
        
    except Exception as exc:
        # 5. معالجة الفشل وإعادة المحاولة
        email_log.retry_count += 1
        email_log.error_message = str(exc)
        email_log.status = EmailLog.EmailStatus.FAILED
        email_log.save(update_fields=['retry_count', 'error_message', 'status'])
        
        logger.warning(f"Failed to send email to {email_log.recipient_email}. Retry {email_log.retry_count}/3. Error: {str(exc)}")
        
        # Exponential Backoff (60s, 300s, 1500s)
        countdown = 5 ** self.request.retries * 60 
        raise self.retry(exc=exc, countdown=countdown)
