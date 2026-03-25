import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "resolveX_backend.settings")

app = Celery("resolveX_backend")

app.config_from_object("django.conf:settings", namespace="CELERY")

app.autodiscover_tasks()