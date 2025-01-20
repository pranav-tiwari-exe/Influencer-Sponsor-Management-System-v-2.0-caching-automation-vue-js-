export default({
    template: `
    <div class="chat-container">
        <div v-for="(chat, index) in chat_list" :key="index" class="chat-message" :class="{ 'sender': chat.sender === role, 'receiver': chat.sender !== role }">
            <div class="message-content">
                <span>{{ chat.message }}</span>
            </div>
        </div>
        <form @submit.prevent="sendmessage" class="message-form">
            <div class="form-group">
                <textarea class="form-control" id="messageinput" v-model="message" placeholder="Enter Your Message" rows="1" required></textarea>
            </div>  
            <button type="submit" class="button">Send </button>
        </form>
    </div>`,
    data() {
        return {
            chat_list: [],
            role: localStorage.getItem('role'),
            message: null,
            error: null,
        }
    },
    props: {
        open: Boolean,
        id: Number,
    },
    mounted() {
        this.fetchchat();
    },
    methods: {
        async fetchchat() {
            const res = await fetch('/api/getchat', {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    ad_request_id: parseInt(this.id)
                }),
            });
            const data = await res.json();
            if (res.ok) {
                this.chat_list = data;
            } else {
                this.error = data.message;
            }
        },

        async sendmessage() {
            const res = await fetch('/api/sendmessage', {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    message: this.message,
                    sender: localStorage.getItem('role'),
                    ad_request_id: this.id
                })
            });
            const data = await res.json();
            if (res.ok) {
                this.fetchchat();
                this.message = null; 
            } else {
                this.error = data.message;
            }
        }
    },
});