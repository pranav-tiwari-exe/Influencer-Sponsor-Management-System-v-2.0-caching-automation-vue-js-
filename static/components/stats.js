import navbar from "./navbar.js";
import flashmessage from "./flashmessage.js";
import barchart from "./bar_chart.js";
import piechart from "./pie_chart.js";

export default {
  template: `<div>
        <navbar />
        <flashmessage :message=error />
        <div class='body'>
          <div class="sec1">
            <div class="small_section">Total User Count:<p id="num">{{stats.total_user_count}}</p></div>
            <div class="small_section">Flagged Count:<p id="num">{{stats.flagged_number}}</p></div>
            <div class="small_section">Total Transaction:<p id="num">₹{{stats.total_transaction}}</p></div>
            <div class="small_section">Monthly Transaction:<p id="num">₹{{stats.monthly_transaction}}</p></div>
          </div>
        <div class="graphs">
          <div class="graph_extra">
          <barchart v-if="stats.monthly_transaction_data.length > 0" :data="stats.monthly_transaction_data" />
          <div class="small_section">Pending Sponsor Approval Requests:<p id="num">{{stats.approval_requests}}</p></div>
        </div>
          <piechart v-if="stats.ad_request_composition.length > 0" :data="stats.ad_request_composition" />
         </div>
          <div class="user_section">
        <p class="user_section_head">Flagged Users:</p>
        <table>
          <thead>
            <tr>
              <th>Profile</th>
              <th>Username</th>
              <th>Email</th>
              <th>Flagged</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          <tr v-if="stats.flagged_users.length === 0">
            <td colspan="5" style="text-align: center;">No flagged users found.</td>
          </tr>
            <tr v-for="(user, index) in stats.flagged_users" :key="index">
              <td>
                <img :src="user.profile ? user.profile : '/static/uploads/default.png'" alt="User Profile Image" class="profile-image" >
              </td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.flagged ? 'Yes' : 'No' }}</td>
              <td class="btn_col">
                <button class="button" v-if="user.flagged" @click="flag(user.id)">Unflag</button>
                <button class="button" v-else @click="flag(user.id)">Flag</button>
                <button class="button" @click="user_detail(user.role, user.id)">View</button>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
        </div>
        <div class="modal fade" id="userDetailModal" tabindex="-1" aria-labelledby="userDetailModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="userDetailModalLabel">User  Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div v-if="modal">
                  <img :src="modal.profile ? modal.profile : '/path/to/default/image.jpg'" alt="User Profile Image" class="img-fluid">
                  <p><strong>Username:</strong> {{ modal.username }}</p>
                  <p><strong>Email:</strong> {{ modal.email }}</p>
                  <p><strong>Role:</strong> {{ modal.role }}</p>
                </div>
                <div v-else>
                  <p>Loading user details...</p>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="button" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
</div>`,

  data() {
    return {
      role: localStorage.getItem("role"),
      stats: {
        monthly_transaction_data: [], 
        ad_request_composition : [],
        flagged_users:[]
      },
      modal: [],
      error: null,
    };
  },
  mounted() {
    this.fetchStats();
  },
  methods:{

    async fetchStats() {
      const res = await fetch("/api/stats", {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        this.stats = data;
      } else {
        this.error = data.message;
      }
    },

    async flag(id) {
      if (!this.stats || !this.stats.flagged_users) {
        console.error("Stats or flagged_users is not defined.");
        return;
      }
    
      const user = this.stats.flagged_users.find(user => user.id === id);
      
      if (user) {
        user.flagged = !user.flagged;
    
        const res = await fetch("/api/flag", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify({ id: user.id, flagged: user.flagged }),
        });
    
        const data = await res.json();
        if (res.ok) {
          this.error = data.message; 
        } else {
          this.error = "Some Error Occurred!!!";
        }
      } else {
        console.error(`User  with ID ${id} not found in flagged_users.`);
        this.error = "User  not found.";
      }
    }, 

    async user_detail(type, user_id) {
      const api_profile_path = `/api/${type}detail`;
      const res = await fetch(api_profile_path, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ id: user_id }),
      });
      const data = await res.json();
      if (res.ok) {
        this.modal=data
        const modalElement = new bootstrap.Modal(document.getElementById('userDetailModal'));
        modalElement.show();
      } else {
        alert("There was an error while fetching user details");
      }
    },
  },

  components: {
    navbar,
    flashmessage,
    barchart,
    piechart,
  },
};
