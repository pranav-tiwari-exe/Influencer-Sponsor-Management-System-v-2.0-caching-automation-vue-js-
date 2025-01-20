import admin_home from "./admin_home.js";
import influencer_home from "./influencer_home.js";
import sponsor_home from "./sponsor_home.js";
import navbar from "./navbar.js";

export default {
  template: `<div>
    <navbar />
    <admin_home v-if="role === 'admin'" :user_details="user_details"></admin_home>
    <sponsor_home v-if="role === 'sponsor'" :user_details="user_details"></sponsor_home>
    <influencer_home v-if="role === 'influencer'" :user_details="user_details"></influencer_home>
  </div>`,
  data() {
    return {
      role: localStorage.getItem("role"),
      id: localStorage.getItem("id"),
      user_details: [],
    };
  },
  mounted() {
    this.fetchProfile();
  },
  methods: {
    async fetchProfile() {
      const api_profile_path = `/api/${this.role}detail`;
      const res = await fetch(api_profile_path, {
        method: "post",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem("token"),
        },
        body: JSON.stringify({ id: parseInt(this.id)}),
      });
      const data = await res.json();
      if (res.ok) {
        this.user_details = data;
        if (this.user_details.flagged) this.error="You have been flagged !!!! Contact the Support to take action."
      } else {
        alert("There was an error while fetching user details");
      }
    },
    
  },
  components: {
    admin_home,
    sponsor_home,
    influencer_home,
    navbar,
  },
};
