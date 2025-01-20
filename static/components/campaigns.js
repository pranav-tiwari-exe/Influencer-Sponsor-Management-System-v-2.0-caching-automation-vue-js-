import flashmessage from "./flashmessage.js";
import navbar from "./navbar.js";

export default {
  template: `
      <navbar />
    <div class="body">
    <flashmessage :message="error" />
      
      <h2>Your Campaigns:</h2>
      
      <!-- Campaign Table -->
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Sponsor ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(campaign, index) in campaign_list" :key="index">
            <td>{{ campaign.name }}</td>
            <td>{{ campaign.startdate }}</td>
            <td>{{ campaign.enddate }}</td>
            <td>{{ campaign.sponsor_id }}</td>
            <td class="table_button">
              <button class="button" @click="openEditForm(campaign)" data-bs-toggle="modal" :data-bs-target="'#editCampaignModal-' + index">Edit</button>
              <router-link class="button" :to="{ name: 'viewcampaign', params: { campaign: JSON.stringify(campaign) } }">View</router-link>
            </td>
          </tr>
        </tbody>
      </table>


      <div v-for="(campaign, index) in campaign_list">
      <div class="modal fade" :id="'editCampaignModal-' + index" tabindex="-1" aria-labelledby="editCampaignModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editCampaignModalLabel">Edit Campaign</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="editCampaign(campaign.id)">
              <label for="edit-name">Campaign Name:</label>
              <input type="text" id="edit-name" v-model="newCampaign.name" class="form-control" />
              <br />
              <label for="edit-startdate">Start Date:</label>
              <input type="date" id="edit-startdate" v-model="newCampaign.startdate" class="form-control" :min="today" />
              <br />
              <label for="edit-enddate">End Date:</label>
              <input type="date" id="edit-enddate" v-model="newCampaign.enddate" class="form-control" :min="newCampaign.startdate"/>
              <br />
              <label for="edit-budget">Budget:</label>
              <input type="number" id="edit-budget" v-model="newCampaign.budget" class="form-control" />
              <br />
              <label for="edit-visibility">Visibility:</label>
              <select id="edit-visibility" v-model="newCampaign.visibility" class="form-select">
                <option value="Private">Private</option>
                <option value="Public">Public</option>
              </select>
              <br />
              <label for="edit-description">Description:</label>
              <textarea id="edit-description" v-model="newCampaign.description" class="form-control"></textarea>
              <br>
              <button type="submit" class="button" data-bs-dismiss="modal">Edit Campaign</button>
            </form>
          </div>
        </div>
      </div>
    </div>
      </div>
  
      <!-- Add Campaign Button -->
      <button class="button" data-bs-toggle="modal" data-bs-target="#addCampaignModal">Add Campaign</button>
  
      <!-- Add Campaign Form -->
      <div class="modal fade" id="addCampaignModal" tabindex="-1" aria-labelledby="addCampaignModalLabel" aria-hidden="true" >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addCampaignModalLabel">Add New Campaign</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"  aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createCampaign">
              <label for="name">Campaign Name:</label>
              <input type="text" id="name" v-model="newCampaign.name" class="form-control" />
              <br />
              <label for="startdate">Start Date:</label>
              <input type="date" id="startdate" v-model="newCampaign.startdate" class="form-control" :min="today" />
              <br />
              <label for="enddate">End Date:</label>
              <input type="date" id="enddate" v-model="newCampaign.enddate" class="form-control" :min="newCampaign.startdate"/>
              <br />
              <label for="budget">Budget:</label>
              <input type="number" id="budget" v-model="newCampaign.budget" class="form-control" />
              <br />
              <label for="visibility">Visibility:</label>
              <select id="visibility" v-model="newCampaign.visibility" class="form-select">
                <option value="Private">Private</option>
                <option value="Public">Public</option>
              </select>
              <br />
              <label for="description">Description:</label>
              <textarea id="description" v-model="newCampaign.description" class="form-control"></textarea>
              <br>
              <button type="submit" class="button" data-bs-dismiss="modal">Create Campaign</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  
</div>`,

  data() {
    return {
      campaign_list: [],
      role: localStorage.getItem("role"),
      id: localStorage.getItem("id"),
      newCampaign: {
        name: "",
        startdate: "",
        enddate: "",
        budget: 0,
        visibility: "Public",
        description: "",
        edit:false,
      },
      error:null,
    };
  },
  mounted() {
    this.fetchCampaigns();
  },
  methods: {
    openEditForm(c) {
      this.newCampaign.name = c.name;
      this.newCampaign.startdate = c.startdate;
      this.newCampaign.enddate = c.enddate;
      this.newCampaign.budget = c.budget;
      this.newCampaign.visibility = c.visibility;
      this.newCampaign.description = c.description;
      c.open = true;
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
        }),
      });
      const data = await res.json();
      if (res.ok) {
        this.campaign_list = data.map(campaign => ({ ...campaign, open: false }));
      } else {
        this.error = data.error;
      }
    },

    async createCampaign() {
      const res = await fetch("/api/campaign", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          name: this.newCampaign.name,
          startdate: this.newCampaign.startdate,
          enddate: this.newCampaign.enddate,
          budget: this.newCampaign.budget,
          visibility: this.newCampaign.visibility,
          description: this.newCampaign.description,
          sponsor_id: parseInt(this.id),
          role: this.role,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        this.fetchCampaigns();
        this.newCampaign = {
          name: "",
          startdate: "",
          enddate: "",
          budget: 0,
          visibility: "Public",
          description: "",
        };
      } else {
        this.error = data.error;
      }
    },

    async editCampaign(id){
      const res = await fetch("/api/campaign", {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          name: this.newCampaign.name,
          startdate: this.newCampaign.startdate,
          enddate: this.newCampaign.enddate,
          budget: this.newCampaign.budget,
          visibility: this.newCampaign.visibility,
          description: this.newCampaign.description,
          sponsor_id: parseInt(this.id),
          role: this.role,
          id:id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(data)
        this.fetchCampaigns();
        this.newCampaign = {
          name: "",
          startdate: "",
          enddate: "",
          budget: 0,
          visibility: "Public",
          description: "",
        };
      } else {
        this.error = data.error;
      }
    },
  },
  computed: {
    today() {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0'); 
      const dd = String(today.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  },
  components: {
    navbar,
    flashmessage
  },
};
