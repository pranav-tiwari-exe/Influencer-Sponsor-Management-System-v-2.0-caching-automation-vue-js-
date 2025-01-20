export default{
    template:`
    <nav class="navbar navbar-expand-lg ">
      <div class="container-fluid">
      <p class="navbar-brand">SYNC</p>

    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <img src="/static/required/menu_icon.png" alt="Menu" style="width: 30px; height: auto;">
    </button>
      <div class="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
        <ul class="navbar-nav mt-auto " >
          <li class="nav-item active" >
            <router-link to="/" style="text-decoration: none;margin:auto;"><img src="/static/required/home_icon.png" height=30vmin alt="HOME"></router-link>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </li>
          <li class="nav-item" v-if="role==='sponsor'">
            <router-link to="/yourcampaigns" ><img src="/static/required/campaign_icon.png" height=30vmin alt="YOUR CAMPAIGN"></router-link>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </li>
          <li class="nav-item" v-if="role==='influencer'">
            <router-link to="/requests"><img src="/static/required/requests_icon.png" height=30vmin alt="REQUESTS"></router-link>&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;
          </li>
          <li class="nav-item" v-if="role==='admin'">
            <router-link to="/stats"><img src="/static/required/stats_icon.png" height=30vmin alt="STATS"></router-link>&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;
          </li>
          <li class="nav-item">
            <router-link to="/find"><img src="/static/required/search_icon.png" height=30vmin alt="FIND"></router-link>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </li>
          <li class="nav-item">
            <a href="" @click="logout"><img src="/static/required/logout_icon.png" height=30vmin alt="LOGOUT"></a>
          </li>
        </ul>
      </div>
      </div>
    </nav>
    `,
    data(){
      return{
        token:localStorage.getItem("token"),
        role:localStorage.getItem("role"),
      }
    },
    methods:{
      async logout() {
        try {
          const res = await fetch("/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: this.token }),
          });
          localStorage.removeItem('token')
          localStorage.removeItem('active')
          localStorage.removeItem('id')
          localStorage.removeItem('role')
          localStorage.clear();
          this.$router.push({ path:'/', query: { logout: 'true' } });
          
        } catch (error) {
          console.error("Network error during logout:", error);
        }
      }
    }     
  } 