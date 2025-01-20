export default {
  template: `
  <div class="f_message">
    <div class="alert alert-dismissible fade show" v-if="show && message" role="alert" >
      <strong>{{ message }}</strong>
      <button type="button" class="btn-close" @click="hide" aria-label="Close"></button>
    </div>
</div>
  `,
  props: {
    message: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      show: false,
    };
  },
  methods: {
    hide() {
      this.show = false;
    },
  },
  watch: {
    message(newMessage) {
      if (newMessage) {
        this.show = true;
      } else {
        this.show = false;
      }
    }
  },
  mounted() {
    if (this.message) {
      this.show = true;
    }
  },
};
