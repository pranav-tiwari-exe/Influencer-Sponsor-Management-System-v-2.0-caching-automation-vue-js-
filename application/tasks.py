from celery import shared_task
from flask import send_file
import flask_excel as excel
from .datastore import datastore
import logging
from .mail_service import send_email
from .model import User,Role,Ad_request,Campaign
from jinja2 import Template
import os
from datetime import datetime,timedelta

@shared_task(ignore_result=False)
def create_campaign_csv(sponsor_id):
    sponsor = datastore.find_user(id=sponsor_id)
    
    output = excel.make_response_from_query_sets(
        sponsor.campaigns, 
        ["id", "name", "description", "startdate", "enddate", "budget", "spended", "visibility", "sponsor_id"], 
        "csv"
    )
    name = f"report_{sponsor_id}.csv"
    with open(name, 'wb') as file:
        file.write(output.data)
    
    return name

@shared_task(ignore_results=True)
def status_email(email,active,status):
    if active:
        subject="Account Successfully Deleted"
    else:
        subject="Account Not Approved"
    file_path = os.path.join(os.path.dirname(__file__), 'delete_reject_accept_account.html')
    with open(file_path, 'r') as f:
        template = Template(f.read())
        html_content = template.render(
            email=email,
            active=active,
            status=status
        )
    send_email(email, subject, html_content)
    return "Ok"


@shared_task(ignore_result=True)
def daily_remainder():
    users = User.query.filter(User.roles.any(Role.name == "influencer")).all()
    for user in users:
        accepted = Ad_request.query.filter_by(status="Accepted", influencer_id=user.id).count()
        pending = Ad_request.query.filter_by(status="Pending", influencer_id=user.id).count()

        file_path = os.path.join(os.path.dirname(__file__), 'daily.html')
        with open(file_path, 'r') as f:
            template = Template(f.read())
            html_content = template.render(
                email=user.email,
                accepted=accepted,
                pending= pending
            )

        subject = "Daily Remainder"
        send_email(user.email, subject, html_content)

    return 'Ok'

@shared_task(ignore_result=True)
def monthly_reports():
    users = User.query.filter(User.roles.any(Role.name == "sponsor")).all()
    for user in users:
        campaigns_thismonth = [campaign for campaign in user.campaigns if campaign.startdate >= datetime.now().date() - timedelta(days=30)]

        total_spent = sum(campaign.spended for campaign in campaigns_thismonth)
        total_budget = sum(campaign.budget for campaign in campaigns_thismonth)

        campaign_list = []
        for campaign in campaigns_thismonth:
            num_ad_requests = len(campaign.ad_requests)
            campaign_list.append({
                'campaign_name': campaign.name,
                'num_ad_requests': num_ad_requests
            })

        file_path = os.path.join(os.path.dirname(__file__), 'monthly_report.html')
        with open(file_path, 'r') as f:
            template = Template(f.read())
            html_content = template.render(
                email=user.email,
                total_spent=total_spent,
                total_budget=total_budget,
                campaigns=campaign_list
            )

        subject = "Monthly Report"
        try:
            send_email(user.email, subject, html_content)
        except Exception as e:
            print(f"Error sending email to {user.email}: {str(e)}")

    return 'Ok'