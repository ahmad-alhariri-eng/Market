import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Store2.settings')
django.setup()

from accounts.models import EmailVerification
from accounts.utils import decrypt_token

ev = EmailVerification.objects.last()
if ev:
    print('Type::', type(ev.encrypted_code))
    print('Value::', ev.encrypted_code)
    try:
        dec = decrypt_token(ev.encrypted_code)
        print('Decryption successful::', dec)
    except Exception as e:
        print('Decryption failed::', repr(e))
else:
    print('No EmailVerification found')
