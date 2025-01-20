import flashmessage from "./flashmessage.js"

export default {
    template: `
    <div class="body2">
      <flashmessage :message=error />
        <div class="details">
          <div class="welcome">WELCOME</div>
          <div class="profile-image-container">
            <img 
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
              <div v-if="user_details.profile">Change Image</div>
              <div v-else>Upload Image</div>
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
                <img :src="previewImageUrl" alt="Preview" class="profile-image" />
              </div>
              <input class="form-control mt-3" type="file" @change="previewImage" accept="image/*" />
            </div>
            <div class="modal-footer">
              <button type="button" class="button" data-bs-dismiss="modal">Close</button>
              <button type="button" class="button mt-3" @click="confirmUpload" data-bs-dismiss="modal">Confirm Upload</button>
            </div>
          </div>
        </div>
      </div>
          <div  class='text' v-for="(detail, index) in user_details" :key="index" style="">
              <div v-if="index!='profile'"><b>{{ index.toUpperCase() }} :</b> {{ detail }} <hr></div>
          </div>
          <button class="button mt-3" @click="download_campaign_csv" >Download Monthly Report</button>
        </div>
        <div class="not_details">
          <div><h2>REQUESTS</h2><hr>
          <table>
              <thead>
                <tr>
                  <th scope="col">Campaign ID</th>
                  <th scope="col">Requirements</th>
                  <th scope="col">Status</th>
                  <th scope="col">Influencer ID</th>
                  <th scope="col">-</th>
                </tr>
              </thead>
              <tbody v-for="(adRequest, index) in ad_request_list" :key="index">
              <tr v-if="ad_request_list.length === 0">
                <td colspan="4" class="text-center">No pending requests available.</td>
              </tr>
                <tr>
                  <td>{{adRequest.campaign_id}}</td>
                  <td>{{adRequest.requirement}}</td>
                  <td>{{adRequest.status}}</td>
                  <td>{{adRequest.influencer_id}}</td>
                  <td><button class="button" @click="gotoCampaign(adRequest.campaign_id)">Inspect</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      `,
    data(){
      return{
        isWaiting:false,
        error:'',
        ad_request_list:[],
        previewImageUrl: null,
        selected_file:null,
      }
    },
    props: {
      apiPath: String,
      user_details: Object, 
    },
    mounted(){
      this.fetchad()
    },
    methods:{
      async download_campaign_csv() {
        this.isWaiting = true
        const res = await fetch(`/download_campaign_csv/${localStorage.getItem('id')}`)
        const data = await res.json()
        if (res.ok) {
          const taskId = data['task-id']
          const intv = setInterval(async () => {
            const csv_res = await fetch(`/get-csv/${taskId}`)
            if (csv_res.ok) {
              this.isWaiting = false
              clearInterval(intv)
              window.location.href = `/get-csv/${taskId}`
            }
          }, 1000)
        }
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
            influencer_id: this.influencer_id,
            sponsor_id:localStorage.getItem('id')
          }),
        });
        const data = await res.json()
        if (res.ok) {
          
          this.ad_request_list = data.map(ad=>({...ad,chat:false,edit:false}))
          console.log(this.ad_request_list)
        } else {
          this.error = data.message
        }
      },

      async gotoCampaign(in_campaign_id) {
        const res = await fetch("/api/get_campaigns", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify({
            sponsor_id: localStorage.getItem('id'),
            role: localStorage.getItem("role"),
            campaign_id:in_campaign_id
          }),
        });
        const data = await res.json();
        if (res.ok) {
          this.$router.push({
            name: 'viewcampaign',
            params: { campaign: JSON.stringify(data) }
          })
        } else {
          this.error = data.error;
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
    components:{
      flashmessage,
    }
  };    