from django.urls import path, include, re_path
from django.contrib import admin
from .admin import admin_site
from . import views
from rest_framework import routers
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi


schema_view = get_schema_view(
    openapi.Info(
        title="ScoreManagement API",
        default_version='v1',
        description="APIs for ScoreManagementApp",
        contact=openapi.Contact(email="ngotrungtri1234@gmail.com"),
        license=openapi.License(name="NgoTrungTri"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

router = routers.DefaultRouter()
router.register('users', views.UserViewSet)
router.register('lessons', views.LessonViewSet)
router.register('grades', views.GradeViewSet)
router.register('lessongrades', views.LessonGradeViewSet)
router.register('forumposts', views.ForumPostViewSet)

urlpatterns = [
    path('admin/', admin_site.urls),
    path('', include(router.urls)),
    path('o/', include('oauth2_provider.urls',
                       namespace='oauth2_provider')),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$',
            schema_view.without_ui(cache_timeout=0),
            name='schema-json'),
    re_path(r'^swagger/$',
            schema_view.with_ui('swagger', cache_timeout=0),
            name='schema-swagger-ui'),
    re_path(r'^redoc/$',
            schema_view.with_ui('redoc', cache_timeout=0),
            name='schema-redoc'),
    re_path(r'^ckeditor/', include('ckeditor_uploader.urls')),
]
