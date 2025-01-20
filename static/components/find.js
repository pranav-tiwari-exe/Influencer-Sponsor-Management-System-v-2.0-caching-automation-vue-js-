import navbar from "./navbar.js";
import flashmessage from "./flashmessage.js";

export default {
  template: `
<navbar />
<flashmessage :message="error" />
<!-- Modal -->
<div class="modal fade" id="Modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body text-center">
      <div v-if="modal.email">
        <img :src="modal.profile ? modal.profile : '/static/uploads/default.png'" alt="Profile Photo" class="profile-image" /><br>
        <div v-for="(i,index) in modal">
          <div v-if="index!='profile'">
          <b>{{index.toUpperCase()}}:</b>{{ i }}<br>
          </div>
        </div>
      </div>
      <div v-else>
        <b>Campaign Name:</b> {{ modal.name }}<br>
        <b>Description:</b> {{ modal.description }}<br>
        <b>ID:</b> {{ modal.id }}<br>
        <b>Start Date:</b> {{ modal.startdate }}<br>
        <b>End Date:</b> {{ modal.enddate }}<br>
        <b>Status:</b> {{ modal.status }}<br>
      </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="button" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<div class="body">

  <div class="search_filter"> 
    <select v-if="role == 'admin'" v-model="filterType" class="filter_select">
      <option value="all">All</option>
      <option v-if="role == 'admin' || role != 'influencer'" value="influencer">Influencers</option>
      <option v-if="role == 'admin'" value="sponsor">Sponsors</option>
      <option v-if="role == 'admin' || role == 'influencer'" value="campaign">Campaigns</option>
    </select>
    <input 
      type="text" 
      v-model="searchTerm" 
      placeholder="Search " 
      class="search_input" />
    <button @click="performSearch" class="search_button">Search</button>
  </div>

  <!-- Influencers Section -->
  <div v-if="(filterType === 'all' || filterType === 'influencer') && (role == 'admin' || role != 'influencer')" class="section">
    <h2>Influencers</h2>
    <template v-if="influencer_list.length === 0">
      <p class="no-data">No Influencers found.</p>
    </template>
    <table v-else class="data_table">
      <thead>
        <tr>
          <th></th>
          <th>Username</th>
          <th>Email</th>
          <th>Influencer ID</th>
          <th>Rating</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(influencer, index) in influencer_list" :key="index">
        <td><img :src="influencer.profile ? influencer.profile : '/static/uploads/default.png'" alt="profile photo here" class="profile-image"/></td>
        <td>{{ influencer.username }}</td>
          <td>{{ influencer.email }}</td>
          <td>{{ influencer.id }} </td>
          <td>{{ influencer.rating }}/*</td>
          <td v-if="role == 'admin'" class="table_button">
            <button v-if="influencer.flagged" @click="flag(influencer.id)" class="button">Unflag</button>
            <button v-else @click="flag(influencer.id)" class="button">Flag</button>
            <button @click="user_detail('influencer', influencer.id)" type="button" class="button" data-bs-toggle="modal" data-bs-target="#Modal">View</button>
          </td>
          <td v-else>
            <button @click="user_detail('influencer', influencer.id)" type="button" class="button" data-bs-toggle="modal" data-bs-target="#Modal">View</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Sponsors Section -->
  <div v-if="(filterType === 'all' || filterType === 'sponsor') && role == 'admin'" class="section">
    <h2>Sponsors</h2>
    <template v-if="sponsor_list.length === 0">
      <p class="no-data">No Sponsors found.</p>
    </template>
    <table v-else class="data_table">
      <thead>
        <tr>
          <th></th>
          <th>Username</th>
          <th>Email</th>
          <th>Sponsor ID</th>
          <th>Type</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(sponsor, index) in sponsor_list" :key="index">
          <td><img :src="sponsor.profile ? sponsor.profile : '/static/uploads/default.png'" alt="profile photo here" class="profile-image"/></td>
          <td>{{ sponsor.username }}</td>
          <td>{{ sponsor.email }}</td>
          <td>{{ sponsor.id }}</td>
          <td>{{ sponsor.type }}</td>
          <td v-if="role == 'admin'" class="table_button">
            <button v-if="sponsor.flagged" @click="flag(sponsor.id)" class="button">Unflag</button>
            <button v-else @click="flag(sponsor.id)" class="button">Flag</button>
            <button @click="user_detail('sponsor', sponsor.id)" type="button" class="button" data-bs-toggle="modal" data-bs-target="#Modal">View</button>
          </td>
          <td v-else>
            <button @click="user_detail('sponsor', sponsor.id)" type="button" class="button" data-bs-toggle="modal" data-bs-target="#Modal">View</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Campaigns Section -->
  <div v-if="(filterType === 'all' || filterType === 'campaign') && (role == 'admin' || role == 'influencer')" class="section">
    <h2>Campaigns</h2>
    <template v-if="campaign_list.length === 0">
      <p class="no-data">No Campaigns found.</p>
    </template>
    <table v-else class="data_table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Sponsor ID</th>
          <th >View</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(campaign, index) in campaign_list" :key="index">
          <td>{{ campaign.name }}</td>
          <td>{{ campaign.startdate }}</td>
          <td>{{ campaign.enddate }}</td>
          <td>{{ campaign.sponsor_id }}</td>
          <td class="table_button">
            <button @click="campaign_detail(campaign.id)" type="button" class="button" data-bs-toggle="modal" data-bs-target="#Modal">View</button>
            <button  v-if="role=='influencer'" class="button" data-bs-toggle="modal" :data-bs-target="'#makeRequestModal' +index">Make Request</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-for="(campaign, index) in campaign_list" :key="index">
    <!-- Make Request Modal -->
    <div class="modal fade" :id="'makeRequestModal' + index" tabindex="-1" aria-labelledby="makeRequestModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="makeRequestModalLabel">Make Ad Request</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createAdRequest(campaign.id)">
              <div class="form-group">
                <label for="requirement">Requirement:</label>
                <textarea class="form-control" id="requirement" v-model="newrequest.requirements" rows="3" required></textarea>
              </div>
              <div class="form-group">
                <label for="paymentAmount">Payment Amount:</label>
                <input type="number" class="form-control" id="paymentAmount" v-model="newrequest.paymentAmount" min='0'  required >
              </div>
              <button type="submit" class="button" data-bs-dismiss="modal">Create Ad Request</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    `,
  data() {
    return {
      role: localStorage.getItem("role"),
      id: localStorage.getItem("id"),
      campaign_list:[],
      modal:[],
      influencer_list:[],
      sponsor_list:[],
      searchTerm:"",
      filterType:'all',
      error:null,
      newrequest:{
        requirements:'',
        paymentAmount:0,
      },
    };
  },
  mounted() {
    if (this.role == "sponsor") {
      this.fetchInfluencers();
    } else if (this.role == "influencer") {
      this.fetchCampaigns();
    }
    else{
        this.fetchCampaigns();
        this.fetchInfluencers();
        this.fetchSponsor()
    }
  },
  methods: {
    performSearch(){
      this.fetchCampaigns()
      this.fetchInfluencers()
      this.fetchSponsor()
    },

    async fetchInfluencers() {
      const res = await fetch("/api/get_influencers", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ role: this.role ,search:this.searchTerm}),
      });
      const data = await res.json();
      if (res.ok) {
        this.influencer_list = data;
      } else {
        this.error = data.error;
      }
    },

    async fetchCampaigns() {
      const res = await fetch("/api/get_campaigns", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          sponsor_id: parseInt(this.id),
          role: this.role,
          search:this.searchTerm
        }),
      })
      const data = await res.json();
      if (res.ok) {
        this.campaign_list = data;
      } else {
        this.error = data.error;
      }
    },

    async fetchSponsor(){
        const res = await fetch("/api/get_sponsors", {
            method: "post",
            headers: {
              "Content-Type": "application/json",
              Authorization: localStorage.getItem("token"),
            },
            body:JSON.stringify({ search:this.searchTerm})
          })
          const data = await res.json();
          if (res.ok) {
            this.sponsor_list = data;
          } else {
            this.error = data.error;
          }
    },
     
    async flag(id){
      const res=await fetch("/api/flag",{
        method:"post",
        headers:{
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          id:id,
        })
      })
      const data= await res.json()
      if (res.ok){
        const influencer = this.influencer_list.find(influencer => influencer.id === id);
        const sponsor = this.sponsor_list.find(sponsor => sponsor.id === id);
    
        if (influencer) {
          influencer.flagged = !influencer.flagged;
        } else if (sponsor) {
          sponsor.flagged = !sponsor.flagged;
        }
        this.error=data.message
      }
      else{
        this.error="Some Error Occured!!!"
      }
    },

    async user_detail(type,user_id) {
      const api_profile_path = `/api/${type}detail`;
      const res = await fetch(api_profile_path, {
        method: "post",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem("token"),
        },
        body: JSON.stringify({ id:user_id}),
      });
      const data = await res.json();
      if (res.ok) {
        this.modal = data;
      } else {
        alert("There was an error while fetching user details");
      }
    },

    async campaign_detail(campaign_id) {
      const res = await fetch("/api/get_campaigns", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          role: this.role,
          campaign_id: campaign_id ,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        this.modal = data;
      } else {
        this.error = data.error;
      }
    },

    async createAdRequest(c_id) {
      const res = await fetch("/api/ad_request", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          campaign_id: parseInt(c_id) ,
          influencer_id: localStorage.getItem('id'), 
          requirement: this.newrequest.requirements,
          amount: parseInt(this.newrequest.paymentAmount),
          sender:'influencer',
        }),
      });
      const data = await res.json()
      if (res.ok) {
        this.error=data.message
      } else {
        this.error = data.message
      }
    },

  },
  components:{ 
    navbar,
    flashmessage
  }

};
