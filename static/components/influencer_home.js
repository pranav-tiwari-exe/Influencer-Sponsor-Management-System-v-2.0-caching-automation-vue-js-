import chat from "./chat.js";
import flashmessage from "./flashmessage.js";

export default {
  template: `<div class="body2">
  <flashmessage :message="error" />
  <div class="details">
      <div class="welcome">WELCOME</div>
      <div class="profile-image-container">
        <img 
          loading="lazy"
          v-if="user_details.profile" 
          :src="user_details.profile" 
          :alt="user_details.profile"  
          class="profile-image" 
        />
        <img 
          v-else 
          :src="'/static/uploads/default.png'" 
          alt="Default Profile Image" 
          class="profile-image" 
        />
        <button type="button" class="button" data-bs-toggle="modal" data-bs-target="#uploadModal">
          Upload Image
        </button>
      </div>
      
      

      <!-- Modal for Image Upload -->
      <div class="modal fade" id="uploadModal" tabindex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="uploadModalLabel">Upload Profile Image</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div v-if="previewImageUrl" class="preview-container">
                <img :src="previewImageUrl" alt="Preview"  class="profile-image"/>
              </div>
              <input class="form-control" type="file" @change="previewImage" accept="image/*" />
            </div>
            <div class="modal-footer">
              <button type="button" class="button" data-bs-dismiss="modal">Close</button>
              <button type="button" class="button" @click="confirmUpload" data-bs-dismiss="modal">Confirm Upload</button>
            </div>
          </div>
        </div>
      </div>

      <div class='text' v-for="(detail, index) in user_details" :key="index">
          <div v-if="index!='profile'"><b>{{ index.toUpperCase() }} :</b> {{ detail }} <hr></div>
      </div>
  </div>
  <div class="not_details">
      <h2>PENDING REQUESTS</h2>
      <hr>
      <table class="request-table">
          <thead>
              <tr>
                  <th>Requirement</th>
                  <th>Status</th>
                  <th>Campaign ID</th>
                  <th>Actions</th>
              </tr>
          </thead>
          <tbody>
              <tr v-if="ad_request_list.length === 0">
                <td colspan="4" class="text-center">No pending requests available.</td>
              </tr>
              <tr v-else v-for="(adRequest, index) in ad_request_list" :key="index">
                  <td>{{ adRequest.requirement }}</td>
                  <td>{{ adRequest.status }}</td>
                  <td>{{ adRequest.campaign_id }}</td>
                  <td class="table_button">
                  <button class="button" data-bs-toggle="modal" :data-bs-target="'#chatModal-' + index" >Chat</button>
                  <button class="button" v-if="adRequest.sender=='sponsor'" @click="acceptRequest(adRequest.id)">Accept</button>
                  <button class="button" v-if="adRequest.sender=='sponsor'" @click="rejectRequest(adRequest.id)">Reject</button>
                  <p v-else>This Request Was Made By You</p>
                  </td>
              </tr>
          </tbody>
      </table>
  </div>
  <div v-for="(adRequest, index) in ad_request_list" :key="index" class="mb-3">
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
          </div>
 </div>`,

  props: {
    apiPath: String,
    user_details: Object,
  },
  data() {
    return {
      ad_request_list:[],
      error:null,
      previewImageUrl: null,
      selected_file:null,
    };
  },
  mounted() {
    this.fetchad();
  },
  methods: {
    async fetchad() {
      const res = await fetch("/api/getadrequests", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          role: localStorage.getItem("role"),
          influencer_id: localStorage.getItem("id"),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        this.ad_request_list = data.map((ad) => ({ ...ad, chat: false }));
      } else {
        this.error = data.message;
      }
    },

    async acceptRequest(req_id) {
      console.log(req_id)
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
       this.fetchad()
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
       this.fetchad()
       this.error = data.message;
     } else {
       this.error = data.message;
     }
   },

   previewImage(event) {
    const file = event.target.files[0];
    this.selected_file = file;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  },

  async confirmUpload() {
    const formData = new FormData();
    formData.append('file', this.selected_file);

    const res = await fetch(`/uploadProfile/${localStorage.getItem('id')}`, {
      method: "post",
      body: formData,
    });
    const data = await res.json()
    if (res.ok) {
      this.user_details.profile = this.previewImageUrl;
      this.error = data.message;
    } else {
      this.error = data.message;
    }
  },

  },

  components: {
    chat,
    flashmessage
  },
};