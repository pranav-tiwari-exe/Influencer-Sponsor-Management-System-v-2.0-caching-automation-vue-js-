import navbar from "./navbar.js";
import chat from "./chat.js";
import flashmessage from "./flashmessage.js";

export default {
  template: `
     <navbar />
     <flashmessage :message="error" />
    <div class="body2">
        <div class="details">
          <div class="welcome">Campaign Information</div>
          <div v-for="(value, key) in campaignObject" :key="key">
            <b>{{ key.toUpperCase() }} :</b> {{ value }}
          </div>
          <button class="button mt-3" data-bs-toggle="modal" data-bs-target="#makeRequestModal">Make Request</button>
        </div>

        <div class="not_details">
          <h2>Requests Made</h2>
          <table>
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Influencer ID</th>
                <th>Payment Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            <tr v-if="ad_request_list.length === 0">
              <td colspan="3" class="text-center">No requests available.</td>
            </tr>
              <tr v-for="(adRequest, index) in ad_request_list" :key="index">
                <td>{{ adRequest.requirement }}</td>
                <td>{{ adRequest.influencer_id }}</td>
                <td>{{ adRequest.amount }}</td>
                <td>{{ adRequest.status }}</td>
                <td v-if="adRequest.status=='Pending'" class="table_button">
                  <button class="button" data-bs-toggle="modal" :data-bs-target="'#chatModal-' + index" >Chat</button>
                  <button class="button" @click="openeditform(adRequest)" data-bs-toggle="modal" :data-bs-target="'#editRequestModal-' + index">Edit</button>
                  <button v-if="adRequest.sender=='influencer'" @click="acceptRequest(adRequest.id)" class="button">Accept</button>
                  <button v-if="adRequest.sender=='influencer'" @click="rejectRequest(adRequest.id)" class="button">Reject</button>
                </td>
                <td v-else-if="adRequest.status=='Accepted'" class="table_button">
                  <button class="button" data-bs-toggle="modal" :data-bs-target="'#chatModal-' + index" >Chat</button>
                  <button class="button" @click="openeditform(adRequest)" data-bs-toggle="modal" :data-bs-target="'#editRequestModal-' + index">Edit</button>
                </td>
                <td v-else-if="adRequest.status=='Completed'" class="table_button">
                  <button class="button" data-bs-toggle="modal" :data-bs-target="'#chatModal-' + index" >Chat</button>
                  <button class="button" data-bs-toggle="modal" :data-bs-target="'#Payment-' + index">Make Payment</button>
                  <button class="button" v-if="!adRequest.rated" data-bs-toggle="modal" :data-bs-target="'#rateModal-' + index">Rate</button>
                </td>
                <td v-else-if="adRequest.status=='Declined'" class="table_button">
                  <button class="button" @click="deleteRequest(adRequest.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>

          
          <div v-for="(adRequest, index) in ad_request_list" :key="index" class="mb-3">
            <!-- Edit Request Modal -->
            <div class="modal fade" :id="'editRequestModal-' + index" tabindex="-1" aria-labelledby="editRequestModalLabel" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="editRequestModalLabel">Edit Ad Request</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <form @submit.prevent="editAd(adRequest.id)">
                      <div class="form-group">
                        <label for="requirement">Requirement:</label>
                        <textarea class="form-control" id="requirement" v-model="requirement" rows="3" ></textarea>
                      </div>
                      <div class="form-group">
                        <label for="paymentAmount">Payment Amount:</label>
                        <input type="number" class="form-control" id="paymentAmount" v-model="paymentAmount">
                      </div>
                      <button type="submit" class="button" data-bs-dismiss="modal">Edit Ad Request</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <!-- Chat Modal -->
            <div class="modal fade" :id="'chatModal-' + index" tabindex="-1" aria-labelledby="chatModalLabel" aria-hidden="true" >
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="chatModalLabel">Chat</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <chat :open="adRequest.chat" :id="adRequest.id" />
                  </div>
                </div>
              </div>
            </div>  
            <!-- Payment Modal -->
            <div class="modal fade" :id="'Payment-' + index" tabindex="-1" aria-labelledby="paymentModalLabel" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="paymentModalLabel">Payment</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <label for="paymethod">Payment Method</label>
                    <select id="paymethod" class="form-select mb-3">
                      <option value="credit_card">Credit Card</option>
                      <option value="paypal">PayPal</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>

                    <div id="creditCardFields">
                      <div class="mb-3">
                        <label for="cardNumber" class="form-label">Card Number</label>
                        <input type="text" class="form-control" id="cardNumber" placeholder="1234 5678 9012 3456" required>
                      </div>
                      <div class="row mb-3">
                        <div class="col">
                          <label for="expirationDate" class="form-label">Expiration Date</label>
                          <input type="month" class="form-control" id="expirationDate" required>
                        </div>
                        <div class="col">
                          <label for="cvv" class="form-label">CVV</label>
                          <input type="text" class="form-control" id="cvv" placeholder="123" required>
                        </div>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label for="amount" class="form-label">Amount</label>
                      <input type="number" class="form-control" id="amount" placeholder="0.00" required>
                    </div>

                    <button type="button" class="btn btn-primary" id="submitPayment" data-bs-dismiss="modal" @click="deleteRequest(adRequest.id)">Make Payment and Delete</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Rate Modal -->
            <div class="modal fade" :id="'rateModal-' + index" tabindex="-1" aria-labelledby="rateModalLabel" aria-hidden="true" >
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="rateModalLabel">Rate Influencer</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                    <input type="range" 
                           id="rating" 
                           v-model="rating" 
                           min="0" 
                           max="5" 
                           step="0.1">
                    <span>{{ rating }}</span><hr>
                      <button class="button mt-3" data-bs-dismiss="modal" @click="rate(adRequest.id,adRequest.influencer_id)">Give Rating</button>
                    </div>
                  </div>
                </div>
              </div>
          </div>


          <!-- Make Request Modal -->
          <div class="modal fade" id="makeRequestModal" tabindex="-1" aria-labelledby="makeRequestModalLabel" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="makeRequestModalLabel">Make Ad Request</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <form @submit.prevent="createAdRequest">
                    <div class="form-group">
                      <label for="influencer">Influencer:</label>
                      <button @click="showInfluencer = true" type="button"  class="button" data-bs-toggle="modal" data-bs-dismiss="modal" data-bs-target="#influencerModal">Select Influencer</button>
                      <span v-if="selectedInfluencer">Selected: {{ selectedInfluencer.username }}</span>
                    </div>
                    <div class="form-group">
                      <label for="requirement">Requirement:</label>
                      <textarea class="form-control" id="requirement" v-model="requirement" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                      <label for="paymentAmount">Payment Amount:</label>
                      <input type="number" class="form-control" id="paymentAmount" v-model="paymentAmount">
                    </div>
                    <button type="submit" class="button" data-bs-dismiss="modal">Create Ad Request</button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <!-- Influencer Modal -->
          <div class="modal fade" id="influencerModal" tabindex="-1" aria-labelledby="influencerModalLabel" aria-hidden="true" >
            <div class="modal-dialog modal-lg">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="influencerModalLabel">Select Influencer</h5>
                  <button type="button" class="btn-close" data-bs-toggle="modal" data-bs-dismiss="modal" data-bs-target="#makeRequestModal"></button>
                </div>
                <div class="modal-body" style="overflow:auto; ">
                    <table>
                        <thead>
                            <tr>
                              <th></th>
                                <th>Name</th>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(influencer, index) in influencer_list" :key="index">
                            <td><img :src="influencer.profile ? influencer.profile : '/static/uploads/default.png'" alt="profile photo here" class="profile-image"/></td>

                                <td>{{ influencer.username }}</td>
                                <td>{{ influencer.id }}</td>
                                <td>{{ influencer.email }}</td>
                                <td>
                                    <button class="button" @click="selectInfluencer(influencer)" data-bs-toggle="modal" data-bs-dismiss="modal" data-bs-target="#makeRequestModal">Select</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  `,
  props: {
    campaign: String,
  },
  data() {
    return {
      campaignObject: JSON.parse(this.campaign),
      influencer_list: [],
      ad_request_list: [],
      influencer_id: null,
      selectedInfluencer: {},
      requirement: "",
      paymentAmount: 0,
      rating:0,
      error: null,
    };
  },
  mounted() {
    this.fetchInfluencers();
    this.fetchad();
  },
  methods: {
    openeditform(a) {
      (this.requirement = a.requirement), (this.amount = a.amount);
      (this.influencer_id = a.influencer_id), (a.edit = true);
    },
    selectInfluencer(i) {
      this.influencer_id = i.id;
      this.selectedInfluencer = i;
    },

    async fetchad() {
      const res = await fetch("/api/getadrequests", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          role: localStorage.getItem("role"),
          campaign_id: this.campaignObject.id,
          influencer_id: this.influencer_id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        this.ad_request_list = data.map((ad) => ({
          ...ad,
          chat: false,
          edit: false,
        }));
      } else {
        this.error = data.message;
      }
    },

    async createAdRequest() {
      const res = await fetch("/api/ad_request", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          campaign_id: this.campaignObject.id,
          influencer_id: this.influencer_id,
          requirement: this.requirement,
          amount: this.paymentAmount,
          sender: "sponsor",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        this.fetchad();
        this.error = data.message;
      } else {
        this.error = data.message;
      }
    },

    async editAd(id_input) {
      console.log(id_input);
      const res = await fetch("/api/ad_request", {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          id: id_input,
          campaign_id: this.campaignObject.id,
          influencer_id: this.influencer_id,
          requirement: this.requirement,
          amount: this.paymentAmount,
        }),
      });
      console.log(id_input);
      const data = await res.json();
      if (res.ok) {
        this.fetchad();
        this.error = data.message;
      } else {
        this.error = data.message;
      }
    },

    async fetchInfluencers() {
      const res = await fetch("/api/get_influencers", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ role: localStorage.getItem("role") }),
      });
      const data = await res.json();
      if (res.ok) {
        this.influencer_list = data;
      } else {
        this.error = data.error;
      }
    },

    async acceptRequest(req_id) {
      console.log(req_id);
      const res = await fetch("/api/acceptrequest", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          id: parseInt(req_id),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        this.fetchad();
        this.error = data.message;
      } else {
        this.error = data.message;
      }
    },

    async rejectRequest(req_id) {
      const res = await fetch("/api/rejectrequest", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          id: req_id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        this.fetchad();
        this.error = data.message;
      } else {
        this.error = data.message;
      }
    },

    async deleteRequest(req_id) {
      const res = await fetch("/api/deleterequest", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          id: req_id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        this.fetchad();
        this.error = data.message;
      } else {
        this.error = data.message;
      }
    },

    async rate(req_id,i_id) {
      const res = await fetch("/api/rate", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          rating:this.rating,
          id: i_id,
          ad_id:req_id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        this.fetchad()
        this.rating=0;
        this.error = data.message;
      } else {
        this.error = data.message;
      }
    },
    
  },

  components: {
    navbar,
    chat,
    flashmessage
  },
};
