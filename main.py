from flask import Flask
from flask_security import Security
from application.datastore import datastore
from application.model import db 
from application.config import DevelopementConfig as Config
from application.resources import api
from application.worker import celery_init_app
import flask_excel as excel
from celery.schedules import crontab 
from application.tasks import daily_remainder,monthly_reports
from application.cache import cache


def create_app():
    app=Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    api.init_app(app)
    excel.init_excel(app)
    app.security=Security(app,datastore)
    cache.init_app(app)
    with app.app_context():
        import application.view

    return app

app =create_app()
celery_app = celery_init_app(app)

@celery_app.on_after_configure.connect
def send_daily_remainders(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=16, minute=5),
        daily_remainder.s()
    )
    print("Scheduled daily_remainder task.")
 
@celery_app.on_after_configure.connect
def send_monthly_reports(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=16,minute=5,day_of_month=30),
        monthly_reports.s()
    )
    print("Scheduled daily_remainder task.")

if __name__=="__main__":
    app.run(debug=True)