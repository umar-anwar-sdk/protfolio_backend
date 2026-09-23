from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers


class AdminLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if not username or not password:
            raise serializers.ValidationError('Username and password are required.')

        user = authenticate(username=username, password=password)
        if not user or not user.is_active:
            raise serializers.ValidationError('Invalid credentials.')

        if not (user.is_superuser or user.is_staff):
            raise serializers.ValidationError('Only the portfolio administrator can access the dashboard.')

        attrs['user'] = user
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'is_superuser']
        read_only_fields = fields
