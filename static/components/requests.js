import chat from "./chat.js";
import flashmessage from "./flashmessage.js";
import navbar from "./navbar.js"

export default {
  template: `
    <navbar />
    <flashmessage :message="error" />
    <div class="body">  
      <h2>Pending Requests</h2>
      <hr>
      <table class="request-table">
          <thead>
              <tr>
                  <th>Requirement</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Actions</th>
              </tr>
          </thead>
          <tbody>
                  <tr v-if="ad_request_list.length === 0">
                      <td colspan="3" class="text-center">No pending requests available.</td>
                  </tr>
                  <tr  v-else v-for="(adRequest, index) in ad_request_list" :key="index">
                      <td>{{ adRequest.requirement }}</td>
                      <td>{{ adRequest.status }}</td>
                      <td>{{ adRequest.progress }}%</td>
                      <td class="table_button">
                      <button class="button" data-bs-toggle="modal" :data-bs-target="'#chatModal-' + index" >Chat</button>
                      <button class="button" @click="progressValue=adRequest.progress" data-bs-toggle="modal" :data-bs-target="'#updateModal-' + index">Update Progress</button>
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
      <!-- Update Modal -->
      <div class="modal fade" :id="'updateModal-' + index" tabindex="-1" aria-labelledby="updateModalLable" aria-hidden="true" >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="updateModalLable">Update Progress</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="slider-container">
                    <label for="progressSlider">Adjust Progress:</label>
                    <input type="range" id="progressSlider" min="adRequest.progress" v-model="progressValue" max="100" value="0" step="1" >
                    <span id="sliderValue">{{progressValue}}%</span>
                </div>
                <button class="button mt-3" @click="updateProgress(adRequest.id)" data-bs-dismiss="modal" >Update</button>
            </div>
          </div>
        </div>
      </div>

    </div>
    `,
  data() {
    return {
      ad_request_list: [],
      progressValue:0,
      error:null,
    };
  },
  mounted() {
    this.fetchad();
  },
  methods: {
    async updateProgress(input_id){
      const res = await fetch("/api/updateprogress", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          id:input_id,
          progress:this.progressValue,
        }),
      });
      const data= await res.json()
      if (res.ok){
        this.error=data.message
        this.fetchad()
      }
      else{
        this.error="There was an error updating the progress"
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
          influencer_id: localStorage.getItem("id"),
          status:"a+c"
        }),
      });
      const data = await res.json();
      if (res.ok) {
        this.ad_request_list = data.map((ad) => ({ ...ad, chat: false }));
      } else {
        this.error = data.message;
      }
    },
  },
  components:{
    chat,
    navbar,
    flashmessage
  }
};
