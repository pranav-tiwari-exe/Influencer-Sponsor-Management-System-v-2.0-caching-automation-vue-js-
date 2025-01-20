from flask_restful import Resource, Api, reqparse, marshal_with, fields, marshal
from .model import db, Campaign, Ad_request, User, Role, RolesUsers, Chat
from datetime import datetime, timedelta
from flask_security import auth_required, roles_required
from .cache import cache
from collections import defaultdict

api = Api(prefix="/api")


# user_detail
user_parser = reqparse.RequestParser()
user_parser.add_argument("id", type=int, help="Invalid id", required=True)

influencer_field = {
    "id": fields.Integer,
    "email": fields.String,
    "username": fields.String,
    "profile": fields.String,
    "niche": fields.String,
    "category": fields.String,
    "flagged": fields.Boolean,
    "platform":fields.String,
    "rating":fields.Float
}

sponsor_fields = {
    "id": fields.Integer,
    "email": fields.String,
    "username": fields.String,
    "profile": fields.String,
    "type": fields.String,
    "address": fields.String,
    "flagged": fields.Boolean,
}

admin_fields = {
    "id": fields.Integer,
    "email": fields.String,
    "username": fields.String,
}


class Influencerdetail(Resource):
    @auth_required("token")
    @marshal_with(influencer_field)
    def post(self):
        args = user_parser.parse_args()
        user = User.query.get(args["id"])
        if not user:
            return {"message": "An error occured"}
        return marshal(user, influencer_field)


api.add_resource(Influencerdetail, "/influencerdetail")


class Sponsordetail(Resource):
    @auth_required("token")
    @marshal_with(sponsor_fields)
    def post(self):
        args = user_parser.parse_args()
        user = User.query.get(args["id"])
        if not user:
            return {"message": "An error occured"}
        return marshal(user, sponsor_fields)


api.add_resource(Sponsordetail, "/sponsordetail")


class Admindetails(Resource):
    @auth_required("token")
    @roles_required("admin")
    @cache.cached(timeout=50)
    @marshal_with(admin_fields)
    def post(self):
        args = user_parser.parse_args()
        user = User.query.get(args["id"])
        if not user:
            return {"message": "An error occured"}
        return marshal(user, admin_fields)


api.add_resource(Admindetails, "/admindetail")


##########Flag users###########
flag_parse=reqparse.RequestParser()
flag_parse.add_argument("id",type=int,help="Invalid Id")

class Flaguser(Resource):
    @auth_required("token")
    @roles_required("admin")   
    def post(self):
        args=flag_parse.parse_args()
        user=User.query.get(args['id'])
        user.flagged= not user.flagged
        db.session.add(user)
        db.session.commit()
        return {"message":"Done"}
    
api.add_resource(Flaguser,"/flag")

# approve request list
p_s_list_field = {
    "id": fields.Integer,
    "username": fields.String,
    "type":fields.String,
    "campaigns":fields.String,
    "address":fields.String,
    "profile":fields.String,
    "email":fields.String
}

class PendingSponsorList(Resource):
    @auth_required("token")
    @roles_required("admin")
    @marshal_with(p_s_list_field)
    def get(self):
        sponsors = (
            User.query.filter_by(active=False)
            .filter(User.roles.any(Role.name == "sponsor"))
            .all()
        )
        return marshal(sponsors, p_s_list_field)

api.add_resource(PendingSponsorList, "/pendingsponsorlist")


# all sponsors
s_parser = reqparse.RequestParser()
s_parser.add_argument("search", type=str, help="Invalid Search")

sponsors_all = {
    "id": fields.Integer,
    "username": fields.String,
    "email": fields.String,
    "flagged": fields.Boolean,
    "type":fields.String,
    "address":fields.String,
    "profile":fields.String
}


class Get_Sponsors_list(Resource):
    @auth_required("token")
    @roles_required("admin")
    @marshal_with(sponsors_all)
    def post(self):
        sponsors = User.query.filter(User.roles.any(Role.name == "sponsor")).all()
        args = s_parser.parse_args()
        if args["search"]:
                    search_term = args["search"].lower()
                    sponsors = [sponsor for sponsor in sponsors if 
                                search_term in sponsor.username.lower() or 
                                search_term in sponsor.email.lower() or
                                search_term == sponsor.id]

        return marshal(sponsors, sponsors_all)


api.add_resource(Get_Sponsors_list, "/get_sponsors")


# all Influencers
i_parser = reqparse.RequestParser()
i_parser.add_argument("role", type=str, help="Invalid role ", required=True)
i_parser.add_argument("search", type=str, help="Invalid Search")

influencers_all = {
    "id": fields.Integer,
    "username": fields.String,
    "email": fields.String,
    "profile":fields.String,
    "rating":fields.Float,
    "niche":fields.String,
    "rating":fields.Float,
    "category":fields.String,
}


class Get_Influencers_list(Resource):
    @auth_required("token")
    @marshal_with(influencers_all)
    def post(self):
        args = i_parser.parse_args()
        if args["role"] == "sponsor":
            users = (
                User.query.filter_by(active=True)
                .filter(User.roles.any(Role.name == "influencer"))
                .all()
            )
        else:
            users = User.query.filter(User.roles.any(Role.name == "influencer")).all()

        if args["search"]:
            search_term = args["search"].lower()
            users = [user for user in users if 
                     search_term in user.username.lower() or 
                     search_term in user.email.lower()or
                     search_term == user.id]
        return marshal(users, influencers_all)


api.add_resource(Get_Influencers_list, "/get_influencers")


######for fetching Campaigns#################
c_parser = reqparse.RequestParser()
c_parser.add_argument("sponsor_id", type=int, help="Invalid Sponsor Id")
c_parser.add_argument("role", type=str, help="Invalid Role", required=True)
c_parser.add_argument("campaign_id",type=int,help="Invalid Campaign ID")
c_parser.add_argument("search",type=str,help="Invalid Search")

campaign_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "description": fields.String,
    "startdate": fields.String,
    "enddate": fields.String,
    "budget": fields.Integer,
    "visibility": fields.String,
    "status": fields.String,
    "spended":fields.String,
    "sponsor_id":fields.Integer
}

class Get_Campaigns_list(Resource):
    @auth_required("token")
    @marshal_with(campaign_fields)
    def post(self):
        args = c_parser.parse_args()
        if args["role"] == "sponsor" :
            if args['campaign_id']:
                campaigns= Campaign.query.get(args['campaign_id'])
            else:
                campaigns = User.query.get(args["sponsor_id"]).campaigns
        elif args["role"] == "influencer":
            if args['campaign_id']:
                campaigns= Campaign.query.get(args['campaign_id'])
            else:
                 campaigns = Campaign.query.filter_by(active=True,visibility="Public").all()
        else:
            if args['campaign_id']:
                campaigns= Campaign.query.get(args['campaign_id'])
            else:
                campaigns = Campaign.query.all()

        if args["search"]:
            search_term = args["search"]
            campaigns = [campaign for campaign in campaigns if 
                         (search_term.isdigit() and campaign.id == int(search_term)) or 
                         (search_term.lower() in campaign.name.lower())]

        return marshal(campaigns, campaign_fields)


api.add_resource(Get_Campaigns_list, "/get_campaigns")


# For Campaign
campaign_parser = reqparse.RequestParser()
campaign_parser.add_argument("id", type=str, help="Invalid id")
campaign_parser.add_argument("name", type=str, help="Invalid name", required=True)
campaign_parser.add_argument(
    "description", type=str, help="Invalid description", required=True
)
campaign_parser.add_argument(
    "sponsor_id", type=int, help="Invalid sponsor_id", required=True
)
campaign_parser.add_argument(
    "startdate", type=str, help="Invalid startdate", required=True
)
campaign_parser.add_argument("enddate", type=str, help="Invalid enddate", required=True)
campaign_parser.add_argument("budget", type=int, help="Invalid budget", required=True)
campaign_parser.add_argument(
    "visibility",
    type=str,
    choices=["Private", "Public"],
    default="Public",
    help="Invalid visibility",
    required=False,
)



class CampaignResource(Resource):
    @marshal_with(campaign_fields)
    @auth_required("token")
    def post(self):
        args = campaign_parser.parse_args()
        args["startdate"] = datetime.strptime(args["startdate"], "%Y-%m-%d").date()
        args["enddate"] = datetime.strptime(args["enddate"], "%Y-%m-%d").date()

        if Campaign.query.filter_by(name=args["name"]).first():
            return {"message": "The campaign with the Name already exists"}, 400
        campaign = Campaign(**args)
        db.session.add(campaign)
        db.session.commit()
        return {"message": "The entries have been made"}, 201

    @auth_required("token")
    def put(self):
        args = campaign_parser.parse_args()
        print(args)
        args["startdate"] = datetime.strptime(args["startdate"], "%Y-%m-%d").date()
        args["enddate"] = datetime.strptime(args["enddate"], "%Y-%m-%d").date()

        campaign = Campaign.query.get(args["id"])
        if campaign:
            campaign.name = args["name"]
            campaign.startdate = args["startdate"]
            campaign.enddate = args["enddate"]
            campaign.budget = args["budget"]
            campaign.visibility = args["visibility"]
            campaign.description = args["description"]
            db.session.commit()
            return {"message": "The campaign was Successfully Edited"}
        else:
            return {"error": "Campaign not found"}, 404


api.add_resource(CampaignResource, "/campaign")


########## For Ad_requests###############

ad_request_parser = reqparse.RequestParser()
ad_request_parser.add_argument("id", type=int, help="Invalid id")
ad_request_parser.add_argument(
    "requirement", type=str, help="Invalid Requirement", required=True
)
ad_request_parser.add_argument("amount", type=int, help="Invalid Amount", required=True)
ad_request_parser.add_argument(
    "campaign_id", type=int, help="Invalid Campaign ID", required=True
)
ad_request_parser.add_argument("influencer_id", type=int, help="Invalid Influencer ID", required=True)
ad_request_parser.add_argument("sender", type=str, help="Invalid Sender")


class Ad_requestResource(Resource):
    @auth_required("token")
    def post(self):
        args = ad_request_parser.parse_args()
        campaign=Campaign.query.get(args["campaign_id"])
        if args['amount']<0:
            return {"message" : "Payment cannot be negative"}
        ad_request = Ad_request(**args)
        if(args['sender']=='sponsor'):
            if (campaign.budget-campaign.spended)<ad_request.amount:
                return {"message":"Budget Exceeding"}
            campaign.spended+=ad_request.amount    

        exist=Ad_request.query.filter(Ad_request.campaign_id==args['campaign_id'],Ad_request.influencer_id==args['influencer_id'],Ad_request.status.in_(['Pending', 'Accepted'])).first()
        print(exist)
        if exist:
            if args['sender']=="influencer":
                return {"message":"Request already exist for Campaign"}
            else:
                return {"message":"Request already exist for Influencer"}
            
        db.session.add(ad_request)
        db.session.commit()
        return {"message": "Successful"}

    @auth_required("token")
    def put(self):
        args = ad_request_parser.parse_args()
        ad_request = Ad_request.query.get(args["id"])
        ad_request.requirement = args["requirement"]
        ad_request.amount = args["amount"]
        campaign=Campaign.query.get(args["campaign_id"])

        if (campaign.budget-campaign.spended)<ad_request.amount:
            return {"message":"Budget Exceeding"}
        campaign.spended+=ad_request.amount
        db.session.add(ad_request)
        db.session.add(campaign)
        db.session.commit()
        return {"message": "Successfully Edited"}


api.add_resource(Ad_requestResource, "/ad_request")


########Operations  on Requests################
op_req_parser = reqparse.RequestParser()
op_req_parser.add_argument("id", type=int, help="invalid id", required=True)


class Accept(Resource):
    def post(self):
        args = op_req_parser.parse_args()
        ad_request = Ad_request.query.get(args["id"])
        if (ad_request.sender=='influencer'):
            campaign=Campaign.query.get(ad_request.campaign_id)
            if (campaign.budget-campaign.spended)<ad_request.amount:
                return {"message":"Budget Exceeding"}
            campaign.spended+=ad_request.amount
        ad_request.status = "Accepted"
        ad_request.accepted_at=datetime.now()
        db.session.add(ad_request)
        db.session.commit()
        return {"message": "Request Accepted"}

class Reject(Resource):
    @auth_required("token")
    def post(self):
        args = op_req_parser.parse_args()
        ad_request = Ad_request.query.get(args["id"])
        ad_request.status = "Declined"
        db.session.add(ad_request)
        db.session.commit()
        return {"message": "Request Rejected"}

class Delete(Resource):
    @auth_required("token")
    def post(self):
        args = op_req_parser.parse_args()
        ad_request = Ad_request.query.get(args["id"])
        db.session.delete(ad_request)
        db.session.commit()
        return {"message": "Request Deleted"}

api.add_resource(Accept, "/acceptrequest")
api.add_resource(Delete, "/deleterequest")
api.add_resource(Reject, "/rejectrequest")


#######for fetching ad requests################

ad_parser = reqparse.RequestParser()
ad_parser.add_argument("role", type=str, help="Invalid Role", required=True)
ad_parser.add_argument("campaign_id", type=int, help="Invalid campaign id")
ad_parser.add_argument("influencer_id", type=int, help="Invalid influencer id")
ad_parser.add_argument("status", type=str, help="Invalid Status", default="Pending")
ad_parser.add_argument("sponsor_id", type=int, help="Invalid sponsor id")

ad_fields = {
    "id": fields.Integer,
    "requirement": fields.String,
    "status": fields.String,
    "campaign_id": fields.Integer,
    "influencer_id": fields.Integer,
    "progress":fields.Integer,
    "amount":fields.Integer,
    "rated":fields.Boolean,
    "sender":fields.String
}

class Get_ad_request_list(Resource):
    @marshal_with(ad_fields)
    @auth_required("token")
    def post(self):
        args = ad_parser.parse_args()
        if args["role"] == "sponsor":
            if args["sponsor_id"]:
                requests = db.session.query(Ad_request).join(Campaign).filter(Campaign.sponsor_id == args['sponsor_id']).all()
            else:
                requests = Campaign.query.get(args["campaign_id"]).ad_requests
            
        elif args["role"] == "influencer":
            if args["status"]=="a+c":
                requests = Ad_request.query.filter(
                    Ad_request.status.in_(['Completed', 'Accepted']), Ad_request.influencer_id==args["influencer_id"]
                ).all()
            else:
                requests = Ad_request.query.filter_by(status=args["status"],influencer_id=args["influencer_id"]).all()
        else:
            return {
                "message": "You can't view the information due to privacy concerns"
            }, 400

        return marshal(requests, ad_fields)


api.add_resource(Get_ad_request_list, "/getadrequests")

########### For Inplementation of Chat System ###########

chat_parser = reqparse.RequestParser()
chat_parser.add_argument(
    "ad_request_id", type=str, help="Invalid Ad_Request_id", required=True
)
chat_parser.add_argument("sender", type=str, help="Invalid Role")
chat_parser.add_argument("message", type=str, help="Invalid Message")

chat_field = {"message": fields.String, "sender": fields.String}


class Get_chat(Resource):
    @marshal_with(chat_field)
    @auth_required("token")
    def post(self):
        args = chat_parser.parse_args()
        ad_request = Ad_request.query.get(args["ad_request_id"]).chats
        return marshal(ad_request, chat_field)


api.add_resource(Get_chat, "/getchat")


class Send_message(Resource):
    @marshal_with(chat_field)
    @auth_required("token")
    def post(self):
        args = chat_parser.parse_args()
        new_chat = Chat(**args)
        db.session.add(new_chat)
        db.session.commit()
        return {"message": "Successfull"}

api.add_resource(Send_message, "/sendmessage")

###########Fetch Stats#############
def get_first_role_name(user):
    return user.roles[0].name if user.roles else None

flagged_field = {
    "email": fields.String,
    "username": fields.String,
    "id": fields.Integer,
    "role": fields.String(attribute=get_first_role_name), 
    "flagged": fields.Boolean,
    "profile":fields.String
}

class Stats(Resource):
    @auth_required("token")
    @roles_required('admin')
    @cache.cached(timeout=50)
    def get(self):
        flagged=User.query.filter_by(flagged=True).all()
        flagged_list=marshal(flagged,flagged_field)
        total_user_count=User.query.count()
        totaltransaction=0
        monthlytransation=0
        approval_requests=User.query.filter(User.active==0).count()
        monthly_transaction_data=defaultdict()
        ad_request_composition=[
            {"Accepted": Ad_request.query.filter(Ad_request.status=='Accepted').count()},
            {"Pending": Ad_request.query.filter(Ad_request.status=='Pending').count()},
            {"Completed": Ad_request.query.filter(Ad_request.status=='Completed').count()},
            {"Declined": Ad_request.query.filter(Ad_request.status=='Declined').count()}
        ]

        for i in Ad_request.query.filter_by(status="Accepted"):
            totaltransaction+=i.amount
        for i in Ad_request.query.filter(Ad_request.status == "Accepted", Ad_request.accepted_at >= datetime.now()-timedelta(days=30)):
            if i.campaign_id not in monthly_transaction_data:
                monthly_transaction_data[i.campaign_id] = 0 
            monthly_transaction_data[i.campaign_id] += i.amount
            monthlytransation+=i.amount
        
        monthly_transaction_list = [{"campaign_id": campaign_id, "transactions": amount} for campaign_id, amount in monthly_transaction_data.items()]
        return {
            "flagged_users":flagged_list,
            "flagged_number":len(flagged_list),
            "total_user_count":total_user_count,
            "total_transaction":totaltransaction,
            "monthly_transaction":monthlytransation,
            "monthly_transaction_data":monthly_transaction_list,
            "ad_request_composition":ad_request_composition,
            "approval_requests":approval_requests
        }

api.add_resource(Stats,"/stats")

############Update Progress ############
progress_parser=reqparse.RequestParser()
progress_parser.add_argument("id",type=int,help="Invalid Id")
progress_parser.add_argument("progress",type=int,help="Invalid Progress")

class Updateprogress(Resource):
    def post(self):
        args=progress_parser.parse_args()
        if args['progress']>100:
            return {"message":"The progress cannot be more than 100%"}
        adrequest=Ad_request.query.get(args['id'])
        if adrequest:
            adrequest.progress=args["progress"]
            if (args["progress"]==100):
                adrequest.status='Completed'
            else:
                adrequest.status="Accepted"
            db.session.add(adrequest)
            db.session.commit()
            return {"message":"Progress Updated"}
        else:
            return {"message":"Invalid AdRequest ID"}

api.add_resource(Updateprogress,'/updateprogress')


##########Rate##########
rate_parser=reqparse.RequestParser()
rate_parser.add_argument("rating",type=float,help="Invalid rating")
rate_parser.add_argument("id",type=int,help="Invalid rating")
rate_parser.add_argument("ad_id",type=int,help="Invalid rating")

class Rate(Resource):
    def post(self):
        args=rate_parser.parse_args()
        influencer=User.query.get(args["id"])
        influencer.rating=(influencer.rating+args["rating"])/(influencer.rating_count+1)
        influencer.rating_count+=1
        ad=Ad_request.query.get(args["ad_id"])
        ad.rated=True
        db.session.add(influencer)
        db.session.add(ad)
        db.session.commit()
        return {"message":"Review Submitted"}
    
api.add_resource(Rate,'/rate')

        

