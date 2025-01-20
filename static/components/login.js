import flashmessage from "./flashmessage.js";

export default {
  template: `
  <div class="login_body">
  <flashmessage :message="errormessage" />
        <div class="about_app">
          <p class="logo">SYNC</p>
          <p>Your ultimate platform for seamless influencer and sponsor collaboration. Whether you're an influencer looking to connect with top brands or a sponsor searching for the perfect partnership, we've got you covered. Manage campaigns, track performance, and grow your collaborations all in one place. Let’s make impactful connections together!</p>

          </div>
          <div class="login_form">
              <div class="card-body p-4">
                <h2 class="card-title text-center mb-4" v-if="!toggle">Login</h2>
                <h2 class="card-title text-center mb-4" v-if="toggle">Register</h2>
                <form @submit.prevent="login" v-if="!toggle">
                  <div class="form-group mb-3">
                    <label for="email" class="form-label">Email:</label>
                    <input type="email" id="email" v-model="cred.email" class="form-control" required />
                  </div>
                  <div class="form-group mb-3">
                    <label for="password" class="form-label">Password:</label>
                    <input type="password" id="password" v-model="cred.password" class="form-control" required/>
                  </div>
                  <button type="submit" class="button" @click="login">Login</button>
                  <p class="text-center">
                    Don't have an account? <a href="#" @click.prevent="toggle = true" class="text-decoration-none">Sign up</a>
                  </p>
                </form>
                <form @submit.prevent="register" v-else>
                  <div class="form-group mb-3">
                    <label for="email" class="form-label">Email:</label>
                    <input type="email" id="email" v-model="cred.email" class="form-control" required/>
                  </div>
                   <div class="form-group mb-3">
                    <label for="username" class="form-label">Username:</label>
                    <input type="text" id="username" v-model="cred.username" class="form-control" required/>
                  </div>
                  <div class="form-group mb-3">
                    <label for="password" class="form-label">Password:</label>
                    <input type="password" id="password" v-model="cred.password" class="form-control" min=8 required/>
                  </div>
                  <div class="form-group mb-3">
                    <label for="confirmPassword" class="form-label">Confirm Password:</label>
                    <input type="password" id="confirmPassword" v-model="confirm_pass" class="form-control" min=8 required/>
                  </div>
                  <div class="form-group mb-3">
                    <label for="role" class="form-label">Register As:</label>
                    <select id="role" v-model="cred.role" class="form-control" required>
                      <option value="">Select</option>
                      <option value="sponsor">Sponsor</option>
                      <option value="influencer">Influencer</option>
                    </select>
                  </div>
                  <div v-if="cred.role === 'sponsor'">
                    <div class="form-group mb-3">
                      <label for="type" class="form-label">Type:</label>
                      <select id="type" v-model="cred.type" class="form-control" :required="cred.role==='sponsor'">
                      <option value="">Select</option>
                      <option value="organization">Organization</option>
                      <option value="individual">Individual</option>
                      </select>
                    </div>
                    <div class="form-group mb-3">
                      <label for="address" class="form-label">Address:</label>
                      <input type="text" id="address" v-model="cred.address" class="form-control" :required="cred.role === 'sponsor'" />
                    </div>
                  </div>
                  <div v-else-if="cred.role === 'influencer'">
                    <div class="form-group mb-3">
                      <label for="category" class="form-label">Category:</label>
                      <input type="text" id="category" v-model="cred.category" class="form-control" :required="cred.role === 'influencer'" />
                    </div>
                    <div class="form-group mb-3">
                      <label for="platform" class="form-label">Platform:</label>
                      <select id="platform" v-model="cred.platform" class="form-control" :required="cred.role === 'influencer'">
                        <option disabled value="">Select a Platform</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Twitter">Twitter</option>
                        <option value="TikTok">TikTok</option>
                        <option value="Facebook">Facebook</option>
                        <option value="LinkedIn">LinkedIn</option>
                      </select>
                    </div>

                    <div class="form-group mb-3">
                      <label for="niche" class="form-label">Niche:</label>
                      <input type="text" id="niche" v-model="cred.niche" class="form-control" :required="cred.role === 'influencer'" />
                    </div>
                  </div>
                  <button type="submit" class="button">Sign up</button>
                  <p class="text-center">
                    Already have an account? <a href="#" @click.prevent="toggle = false" class="text-decoration-none">Login</a>
                  </p>
                </form>
              </div>
            </div>
        </div>

    `,
  data() {
    return {
      cred: {
        email: null,
        password: null,
        username: null,
        role: null,
        category: null,
        platform:null,
        niche: null,
        type: null,
        address: null,
      },
      confirm_pass: null,
      toggle: false,
      errormessage:"",
    };
  },
  
  methods: {

    async login() {
      const res = await fetch("/user_login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.cred),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("id", parseInt(data.id));
        localStorage.setItem("active", data.active);
        this.$router.push({ path: "/" });
      } else {
        this.errormessage=data.message
      }
    },

    async register() {
      if (this.cred.password == this.confirm_pass) {
        const res = await fetch("/create_user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.cred),
        });
        const data = await res.json();
        if (res.ok) {
          this.toggle = !this.toggle;
          this.$router.push({ path: "/" });
        } else {
          this.errormessage=data.message
        }
      } else {
        this.errormessage="Both Passwords should be same!!" 
      }
    },
  },
  components:{
    flashmessage,
  }
};
