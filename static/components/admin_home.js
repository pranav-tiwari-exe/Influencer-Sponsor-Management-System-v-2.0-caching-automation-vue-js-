import flashmessage from'./flashmessage.js'

export default {
  template: `
      <div class="body2">
        <flashmessage :message="error" />
        <div class="details">
          <div class="welcome">WELCOME</div>
          <div class='text' v-for="(detail, index) in user_details" :key="index">
              <b >{{ index.toUpperCase() }} :</b> {{ detail }} <hr>
          </div>
        </div>
        <div class="not_details">
            <h2>PENDING APPROVALS</h2>
            <table >
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Username</th>
                  <th scope="col">E-mail</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
              <tr v-if="approve_requests.length === 0">
                <td colspan="3" class="text-center">No pending requests available.</td>
              </tr>
                <tr v-for="(sponsor, index) in approve_requests" :key="sponsor.id">
                  <td>{{ sponsor.id }}</td>
                  <td>{{ sponsor.username }}</td>
                  <td>{{ sponsor.email }}</td>
                  <td class="table_button">
                    <button class="button" @click="approveSponsor(sponsor.id)">Approve</button>
                    <button class="button" @click="rejectSponsor(sponsor.id)">Reject</button>
                    <button class="button" data-bs-toggle="modal" data-bs-target="#Modal" @click="user_detail('sponsor',sponsor.id)">View</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Modal -->
<div class="modal fade" id="Modal" tabindex="-1" aria-labelledby="modallabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
                <img :src="modal.profile ? modal.profile : '/static/uploads/default.png'" alt="Profile Photo" class="profile-image" /><br>
                <div v-for="(i, index) in modal" :key="index">
                    <div v-if="index !== 'profile'">
                        <b>{{ index.toUpperCase() }}:</b> {{ i }}<br>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="button" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
</div>`,
  props: {
    apiPath: String,
    user_details: Object,
  },
  data() {
    return {
      approve_requests: [],
      modal:[],
      error: null,
    };
  },
  mounted() {
    this.fetchApproveRequests();
  },
  methods: {
    async fetchApproveRequests() {
      const res = await fetch("/api/pendingsponsorlist", {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        console.log(data)
        this.approve_requests = data;
      } else {
        this.error = data.message;
      }
    },

    async approveSponsor(sponsor_id) {
      const res = await fetch(`/approvesponsor/${sponsor_id}`, {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      this.errormessage = data.message;
      this.approve_requests = this.approve_requests.filter(
        (sponsor) => sponsor.id !== sponsor_id
      );
    },

    async rejectSponsor(sponsor_id) {
      const res = await fetch(`/deleteuser/${sponsor_id}`, {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      this.errormessage = data.message;
      this.approve_requests = this.approve_requests.filter(
        (sponsor) => sponsor.id !== sponsor_id
      );
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
  },
  components:{
    flashmessage,
  }
};
