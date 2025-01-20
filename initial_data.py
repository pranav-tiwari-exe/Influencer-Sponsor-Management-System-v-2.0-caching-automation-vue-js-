from main import app 
from application.datastore import datastore
from application.model import db, User, Role, Campaign, Ad_request, Chat
from werkzeug.security import generate_password_hash
from datetime import date, timedelta

with app.app_context():
    # Create all tables
    db.create_all()

    # Create roles if they do not exist
    datastore.find_or_create_role(name="admin", description="User  is an admin")
    datastore.find_or_create_role(name="sponsor", description="User  is a sponsor")
    datastore.find_or_create_role(name="influencer", description="User  is an influencer")
    db.session.commit()

    # Create admin user
    if not datastore.find_user(email="admin@gmail.com"):
        datastore.create_user(
            email="admin@gmail.com", 
            password=generate_password_hash("admin"), 
            roles=["admin"],
            username="admin"
        )

    # Create sponsor user with complete fields
    if not datastore.find_user(email="sponsor@gmail.com"):
        datastore.create_user(
            email="sponsor@gmail.com", 
            password=generate_password_hash("sponsor"), 
            roles=["sponsor"], 
            username="sponsor1",
            type='Brand',
            address='123 Brand St, City, Country'
        )

    # Create influencer user with complete fields
    if not datastore.find_user(email="influencer@gmail.com"):
        datastore.create_user(
            email="influencer@gmail.com", 
            password=generate_password_hash("influencer"), 
            roles=["influencer"], 
            username="influencer1",
            profile='Influencer Profile with dummy location',
            platform="youtube",
            rating=4.5,
            rating_count=1,
            niche='Fashion',
            category='Lifestyle'
        )

    # Commit user creation
    db.session.commit()

    # Retrieve users for campaign creation
    sponsor = datastore.find_user(email="sponsor@gmail.com")
    influencer1 = datastore.find_user(email="influencer@gmail.com")

    # Create multiple campaigns
    campaigns = [
        Campaign(
            name='Spring Fashion Campaign',
            description='Promote our new spring collection.',
            startdate=date.today(),
            enddate=date.today() + timedelta(days=30),
            budget=5000,
            sponsor_id=sponsor.id,
        ),
        Campaign(
            name='Tech Gadgets Launch',
            description='Launch of our new tech gadgets.',
            startdate=date.today(),
            enddate=date.today() + timedelta(days=45),
            budget=8000,
            sponsor_id=sponsor.id,
        ),
        Campaign(
            name='Healthy Living Campaign',
            description='Promote our new health products.',
            startdate=date.today(),
            enddate=date.today() + timedelta(days=60),
            budget=6000,
            sponsor_id=sponsor.id,
        ),
        Campaign(
            name='Winter Fashion Campaign',
            description='Showcase our winter collection.',
            startdate=date.today(),
            enddate=date.today() + timedelta(days=90),
            budget=7000,
            sponsor_id=sponsor.id,
        )
    ]

    db.session.bulk_save_objects(campaigns)
    db.session.commit()

    # Create ad requests for each campaign
    ad_requests = [
        Ad_request(
            requirement='Need influencers for social media posts.',
            amount=2000,
            campaign_id=1,  # Use the ID of the first campaign
            influencer_id=influencer1.id,
        ),
        Ad_request(
            requirement='Looking for reviews on new gadgets.',
            amount=3000,
            campaign_id=2,  # Use the ID of the second campaign
            influencer_id=influencer1.id,
        ),
        Ad_request(
            requirement='Seeking health product endorsements.',
            amount=2500,
            campaign_id=3,  # Use the ID of the third campaign
            influencer_id=influencer1.id,
        ),
        Ad_request(
            requirement='Looking for fashion bloggers for winter collection.',
            amount=3500,
            campaign_id=4,  # Use the ID of the fourth campaign
            influencer_id=influencer1.id,
        )
    ]

    db.session.bulk_save_objects(ad_requests)
    db.session.commit()

    # Create chats for ad requests
    chats = [
        Chat(
            sender='sponsor',
            message='Hello, we would like to discuss the campaign details.',
            ad_request_id=ad_requests[0].id,
        ),
        Chat(
            sender='influencer',
            message='Sure! I am interested in this campaign.',
            ad_request_id=ad_requests[0].id,
        ),
        Chat(
            sender='sponsor',
            message='Can you provide your rates?',
            ad_request_id=ad_requests[1].id,
        ),
        Chat(
            sender='influencer',
            message='My rate is $3000 for this campaign.',
            ad_request_id=ad_requests[1].id,
        ),
        Chat(
            sender='sponsor',
            message='We are interested in your health product endorsement.',
            ad_request_id=ad_requests[2].id,
        ),
        Chat(
            sender='influencer',
            message='I can do that for $2500.',
            ad_request_id=ad_requests[2].id,
        ),
        Chat(
            sender='sponsor',
            message='We need fashion bloggers for our winter collection.',
            ad_request_id=ad_requests[3].id,
        ),
        Chat(
            sender='influencer',
            message='I can do that for $3500.',
            ad_request_id=ad_requests[3].id,
        )
    ]

    db.session.bulk_save_objects(chats)
    db.session.commit()