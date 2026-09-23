from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.portfolio.urls')),
    path('api/', include('apps.projects.urls')),
    path('api/', include('apps.contact.urls')),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/admin/', include('apps.portfolio.admin_urls')),
    path('api/visitors/', include('apps.visitors.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
