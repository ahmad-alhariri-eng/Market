from rest_framework import serializers
from .models import Notification
from orders.models import Order

class NotificationSerializer(serializers.ModelSerializer):
    related_object = serializers.SerializerMethodField()
    extra_data = serializers.SerializerMethodField()  # expose safely

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'message_ar', 'message_en',
            'is_read', 'created_at', 'related_object', 'extra_data'
        ]
        read_only_fields = fields

    def get_related_object(self, obj):
        if not obj.content_object:
            return None
        if isinstance(obj.content_object, Order):
            return {
                'type': 'order',
                'id': obj.object_id,
                'order_number': obj.content_object.order_number,
                'status': obj.content_object.status,
            }
        return {'type': obj.content_type.model, 'id': obj.object_id}

    def get_extra_data(self, obj):
        """
        Return extra_data as-is (already JSON), but you could also
        filter keys by notification_type if you ever need to.
        """
        return obj.extra_data or None